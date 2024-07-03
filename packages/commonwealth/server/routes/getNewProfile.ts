import type {
  AddressAttributes,
  CommentAttributes,
  DB,
  ProfileTagsAttributes,
  TagsAttributes,
  ThreadAttributes,
} from '@hicommonwealth/model';
import { Profile, Tag } from '@hicommonwealth/schemas';
import type { NextFunction } from 'express';
import { Op } from 'sequelize';
import z from 'zod';
import type { TypedRequestQuery, TypedResponse } from '../types';
import { success } from '../types';

export const Errors = {
  NoIdentifierProvided: 'No profile id provided in query',
  NoProfileFound: 'No profile found',
};

type GetNewProfileReq = {
  profileId?: string;
};
type GetNewProfileResp = {
  profile: z.infer<typeof Profile>;
  totalUpvotes: number;
  addresses: AddressAttributes[];
  threads: ThreadAttributes[];
  comments: CommentAttributes[];
  commentThreads: ThreadAttributes[];
  isOwner: boolean;
  tags: z.infer<typeof Tag>[];
};

type ProfileWithTags = ProfileTagsAttributes & { Tag: TagsAttributes };

const getNewProfile = async (
  models: DB,
  req: TypedRequestQuery<GetNewProfileReq>,
  res: TypedResponse<GetNewProfileResp>,
  next: NextFunction,
) => {
  const user = await models.User.findOne({
    where: {
      // @ts-expect-error StrictNullChecks
      id: req.user.id,
    },
  });

  if (!user) return next(new Error(Errors.NoProfileFound));

  const inActiveCommunities = (
    await models.Community.findAll({
      where: {
        active: false,
      },
      attributes: ['id'],
    })
  ).map((c) => c.id);

  const addresses = await user.getAddresses({
    where: {
      community_id: {
        [Op.notIn]: inActiveCommunities,
      },
    },
  });

  // @ts-expect-error StrictNullChecks
  const addressIds = [...new Set<number>(addresses.map((a) => a.id))];

  const totalUpvotes = await models.Reaction.count({
    where: {
      address_id: {
        [Op.in]: addressIds,
      },
    },
  });

  const threads = await models.Thread.findAll({
    // @ts-expect-error StrictNullChecks
    where: {
      address_id: {
        [Op.in]: addressIds,
      },
      community_id: {
        [Op.notIn]: inActiveCommunities,
      },
    },
    include: [{ model: models.Address, as: 'Address' }],
  });

  const comments = await models.Comment.findAll({
    // @ts-expect-error StrictNullChecks
    where: {
      address_id: {
        [Op.in]: addressIds,
      },
      community_id: {
        [Op.notIn]: inActiveCommunities,
      },
    },
    include: [{ model: models.Address, as: 'Address' }],
  });

  const commentThreadIds = [
    ...new Set<number>(comments.map((c) => c.thread_id, 10)),
  ];
  const commentThreads = await models.Thread.findAll({
    // @ts-expect-error StrictNullChecks
    where: {
      id: {
        [Op.in]: commentThreadIds,
      },
      community_id: {
        [Op.notIn]: inActiveCommunities,
      },
    },
  });

  const profileTags = await models.ProfileTags.findAll({
    where: {
      user_id: user.id,
    },
    include: [
      {
        model: models.Tags,
      },
    ],
  });

  return success(res, {
    profile: user.profile,
    totalUpvotes,
    addresses: addresses.map((a) => a.toJSON()),
    threads: threads.map((t) => t.toJSON()),
    comments: comments.map((c) => c.toJSON()),
    commentThreads: commentThreads.map((c) => c.toJSON()),
    isOwner: true,
    tags: profileTags
      .map((t) => t.toJSON())
      .map((t) => (t as ProfileWithTags).Tag),
  });
};

export default getNewProfile;
