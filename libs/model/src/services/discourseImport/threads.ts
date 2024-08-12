import {
  CWAddressWithDiscourseId,
  CWTopicWithDiscourseId,
  CWUserWithDiscourseId,
  models,
} from '@hicommonwealth/model';
import { Thread } from '@hicommonwealth/schemas';
import moment from 'moment';
import { Op, QueryTypes, Sequelize, Transaction } from 'sequelize';
import { z } from 'zod';

export type CWThreadWithDiscourseId = z.infer<typeof Thread> & {
  discourseTopicId: number;
  created: boolean;
};

// Discourse Topic == CW Thread
type DiscourseTopic = {
  id: number;
  title: string;
  cooked: string;
  raw: any;
  pinned_globally: any;
  category_id: any;
  user_id: any;
  views: number;
  like_count: number;
  created_at: string;
  updated_at: string;
};

class DiscourseQueries {
  static fetchTopics = async (session: Sequelize) => {
    return session.query<DiscourseTopic>(
      `
        select *,
        (select cooked from posts where topic_id=topics.id and post_number=1),
        (select raw from posts where topic_id=topics.id and post_number=1)
        FROM topics
        where deleted_at is null
        and user_id > 0
    `,
      { raw: true, type: QueryTypes.SELECT },
    );
  };

  static fetchGeneralCategoryId = async (
    session: Sequelize,
  ): Promise<number> => {
    const [result] = await session.query<{
      id: number;
    }>(
      `
    SELECT id FROM categories WHERE name = 'General';
  `,
      { type: QueryTypes.SELECT },
    );
    return result?.id || 0;
  };
}

class CWQueries {
  static bulkCreateThreads = async (
    entries: {
      discourseTopic: DiscourseTopic;
      communityId: string;
      cwTopicId: number;
      addressId: number;
    }[],
    { transaction }: { transaction: Transaction | null },
  ) => {
    const threadsToCreate: Array<z.infer<typeof Thread>> = entries.map(
      ({ discourseTopic, communityId, cwTopicId, addressId }) => ({
        address_id: addressId,
        title: formatDiscourseContent(discourseTopic.title),
        body: formatDiscourseContent(discourseTopic.cooked),
        created_at: moment(discourseTopic.created_at).toDate(),
        updated_at: moment(discourseTopic.updated_at).toDate(),
        community_id: communityId,
        pinned: discourseTopic.pinned_globally,
        kind: 'discussion',
        topic_id: cwTopicId,
        plaintext: discourseTopic.raw.replace(/'/g, "''"),
        stage: 'discussion',
        view_count: discourseTopic.views,
        reaction_count: discourseTopic.like_count,
        reaction_weights_sum: 0,
        comment_count: 0,
        max_notif_id: 0,
      }),
    );

    const existingThreads = await models.Thread.findAll({
      where: {
        [Op.or]: threadsToCreate.map((a) => ({
          title: a.title,
          community_id: a.community_id,
        })),
      },
    });

    const filteredThreadsToCreate = threadsToCreate.filter(
      (t) =>
        !existingThreads.find(
          (et) => t.title === et.title && t.community_id === et.community_id,
        ),
    );

    const createdThreads = await models.Thread.bulkCreate(
      filteredThreadsToCreate,
      {
        transaction,
      },
    );

    return [
      ...existingThreads.map((a) => ({
        ...a.get({ plain: true }),
        created: false,
      })),
      ...createdThreads.map((a) => ({
        ...a.get({ plain: true }),
        created: true,
      })),
    ].map((thread) => ({
      ...thread,
      discourseTopicId: entries.find(
        (e) =>
          thread.title === formatDiscourseContent(e.discourseTopic.title) &&
          thread.community_id === e.communityId &&
          moment(thread.created_at).isSame(e.discourseTopic.created_at),
      )!.discourseTopic.id,
    }));
  };
}

const formatDiscourseContent = (str: string) =>
  encodeURIComponent(str.replace(/'/g, "''"));

export const createAllThreadsInCW = async (
  discourseConnection: Sequelize,
  {
    users,
    addresses,
    topics,
    communityId,
  }: {
    users: Array<CWUserWithDiscourseId>;
    addresses: Array<CWAddressWithDiscourseId>;
    topics: Array<CWTopicWithDiscourseId>;
    communityId: string;
  },
  { transaction }: { transaction: Transaction | null },
): Promise<Array<CWThreadWithDiscourseId>> => {
  const discourseThreads = await DiscourseQueries.fetchTopics(
    discourseConnection,
  );
  const generalCwTopic = await models.Topic.findOne({
    where: {
      name: 'General',
      community_id: communityId,
    },
    transaction,
  });

  const generalDiscourseCategoryId =
    await DiscourseQueries.fetchGeneralCategoryId(discourseConnection);

  const entries = discourseThreads
    .map((discourseThread) => {
      // append user
      const user = users.find(
        ({ discourseUserId }) => discourseUserId === discourseThread.user_id,
      );
      return {
        ...discourseThread,
        user,
      };
    })
    .filter((discourseThread) => {
      // filter out threads where the cw user doesn't exist
      return !!discourseThread.user;
    })
    .map((discourseThread) => {
      const { category_id: discourseThreadCategoryId } = discourseThread;

      // get thread's associated cw topic
      let cwTopicId = generalCwTopic!.id!; // general by default
      if (discourseThreadCategoryId) {
        // find cw topic that matches the discourse category
        const cwTopic = topics.find(
          ({ discourseCategoryId: discourseCategoryId }) =>
            discourseCategoryId === discourseThreadCategoryId,
        );
        if (
          cwTopic &&
          (!generalDiscourseCategoryId ||
            cwTopic.discourseCategoryId !== generalDiscourseCategoryId)
        ) {
          cwTopicId = cwTopic.id!;
        }
      }

      // find address for user
      const address = addresses.find(
        (a) =>
          a.community_id === communityId &&
          a.user_id === discourseThread.user!.id,
      );
      if (!address) {
        throw new Error(
          `could not find address for user ${discourseThread.user!.id}`,
        );
      }

      return {
        discourseTopic: discourseThread,
        communityId,
        cwTopicId,
        addressId: address.id!,
      };
    });

  return CWQueries.bulkCreateThreads(entries, { transaction });
};