import { dispose } from '@hicommonwealth/core';
import {
  NotificationCategories,
  NotificationDataAndCategory,
  ProposalType,
  SnapshotEventType,
} from '@hicommonwealth/shared';
import chai from 'chai';
import chaiHttp from 'chai-http';
import jwt from 'jsonwebtoken';
import { TestServer, testServer } from 'server-test';
import { afterAll, beforeAll, describe, test } from 'vitest';
import { config } from '../../server/config';
import emitNotifications from '../../server/util/emitNotifications';
import { JoinCommunityArgs } from '../util/modelUtils';

chai.use(chaiHttp);
const { expect } = chai;

describe('emitNotifications tests', () => {
  const chain = 'ethereum';
  const chain2 = 'alex';
  // The createThread util uses the chainId parameter to determine
  // author_chain, which is required for authorship lookup.
  // Therefore, a valid chain MUST be included alongside
  // communityId, unlike in non-test thread creation
  let thread, comment;
  const title = 'test title';
  const commentBody = 'test';
  const kind = 'discussion';

  let userJWT;
  let userId;
  let userAddress;
  let userAddressId;
  let userJWT2;
  let userId2;
  let userAddress2;
  let userAddressId2;

  let server: TestServer;

  beforeAll(async () => {
    server = await testServer();

    // creates 2 ethereum users
    const firstUser = await server.seeder.createAndVerifyAddress(
      { chain },
      'Alice',
    );
    userId = firstUser.user_id;
    userAddress = firstUser.address;
    userAddressId = firstUser.address_id;
    userJWT = jwt.sign(
      { id: userId, email: firstUser.email },
      config.AUTH.JWT_SECRET,
    );
    expect(userId).to.not.be.null;
    expect(userAddress).to.not.be.null;
    expect(userAddressId).to.not.be.null;
    expect(userJWT).to.not.be.null;

    const secondUser = await server.seeder.createAndVerifyAddress(
      { chain },
      'Alice',
    );
    userId2 = secondUser.user_id;
    userAddress2 = secondUser.address;
    userAddressId2 = secondUser.address_id;
    userJWT2 = jwt.sign(
      { id: userId2, email: secondUser.email },
      config.AUTH.JWT_SECRET,
    );
    expect(userId2).to.not.be.null;
    expect(userAddress2).to.not.be.null;
    expect(userAddressId2).to.not.be.null;
    expect(userJWT2).to.not.be.null;

    // make second user join alex community
    const communityArgs: JoinCommunityArgs = {
      jwt: userJWT2,
      address_id: userAddressId2,
      address: userAddress2,
      chain: chain2,
      originChain: chain,
    };
    const res = await server.seeder.joinCommunity(communityArgs);
    expect(res).to.equal(true);

    // sets user-2 to be admin of the alex community
    const isAdmin = await server.seeder.updateRole({
      address_id: userAddressId2,
      chainOrCommObj: { chain_id: chain },
      role: 'admin',
    });
    expect(isAdmin).to.not.be.null;

    // create a thread manually to bypass emitNotifications in-route
    // @ts-expect-error StrictNullChecks
    thread = await server.models.Thread.create({
      community_id: chain,
      address_id: userAddressId2,
      title,
      plaintext: '',
      kind,
    });

    // @ts-expect-error StrictNullChecks
    comment = await server.models.Comment.create({
      thread_id: thread.id,
      address_id: userAddressId2,
      text: commentBody,
      community_id: chain,
    });

    //reaction = await server.models.Reaction.create({
    // @ts-expect-error StrictNullChecks
    await server.models.Reaction.create({
      community_id: chain,
      thread_id: thread.id,
      address_id: userAddressId,
      reaction: 'like',
    });
  });

  afterAll(async () => {
    await dispose()();
  });

  describe('Forum Notifications', () => {
    test('should generate a notification and notification reads for a new thread', async () => {
      const subscription = await server.models.Subscription.create({
        subscriber_id: userId,
        category_id: NotificationCategories.NewThread,
        community_id: chain,
      });

      const notification_data = {
        created_at: new Date(),
        thread_id: thread.id,
        root_type: ProposalType.Thread,
        root_title: title,
        comment_text: '',
        community_id: chain,
        author_address: userAddress2,
        author_community_id: chain,
      };

      await emitNotifications(server.models, {
        categoryId: NotificationCategories.NewThread,
        data: notification_data,
      });

      const notif = await server.models.Notification.findOne({
        where: {
          community_id: chain,
          category_id: NotificationCategories.NewThread,
          thread_id: thread.id,
        },
      });
      expect(notif).to.not.be.null;
      // @ts-expect-error StrictNullChecks
      expect(notif.thread_id).to.equal(thread.id);
      // @ts-expect-error StrictNullChecks
      expect(notif.toJSON().notification_data).to.deep.equal(
        JSON.stringify(notification_data),
      );

      const notifRead = await server.models.NotificationsRead.findOne({
        where: {
          subscription_id: subscription.id,
          // @ts-expect-error StrictNullChecks
          notification_id: notif.id,
          user_id: userId,
          is_read: false,
        },
      });
      expect(notifRead).to.not.be.null;

      //verify max_notif_id in thread is updated
      const updatedThread = await server.models.Thread.findOne({
        where: {
          id: thread.id,
        },
      });
      // @ts-expect-error StrictNullChecks
      expect(updatedThread.max_notif_id).to.equal(notif.id);
    });

    test('should generate a notification and notification reads for a thread comment', async () => {
      const subscription = await server.models.Subscription.create({
        subscriber_id: userId,
        category_id: NotificationCategories.NewComment,
        community_id: chain,
        thread_id: thread.id,
      });

      const notifData = {
        created_at: new Date(),
        thread_id: thread.id,
        root_type: ProposalType.Thread,
        root_title: title,
        comment_id: comment.id,
        comment_text: commentBody,
        community_id: chain,
        author_address: userAddress2,
        author_community_id: chain,
      };
      await emitNotifications(server.models, {
        categoryId: NotificationCategories.NewComment,
        data: notifData,
      });

      const notif = await server.models.Notification.findOne({
        where: {
          community_id: chain,
          category_id: NotificationCategories.NewComment,
        },
      });
      expect(notif).to.not.be.null;
      // @ts-expect-error StrictNullChecks
      expect(notif.thread_id).to.equal(thread.id);
      // @ts-expect-error StrictNullChecks
      expect(notif.toJSON().notification_data).to.deep.equal(
        JSON.stringify(notifData),
      );

      const notifRead = await server.models.NotificationsRead.findOne({
        where: {
          subscription_id: subscription.id,
          // @ts-expect-error StrictNullChecks
          notification_id: notif.id,
          user_id: userId,
          is_read: false,
        },
      });
      expect(notifRead).to.not.be.null;

      //verify max_notif_id in thread model is updated
      const updatedThread = await server.models.Thread.findOne({
        where: {
          id: thread.id,
        },
      });
      // @ts-expect-error StrictNullChecks
      expect(updatedThread.max_notif_id).to.equal(notif.id);
    });

    test('should generate a notification and notification reads for a new thread reaction', async () => {
      let updatedThread = await server.models.Thread.findOne({
        where: {
          id: thread.id,
        },
      });
      // @ts-expect-error StrictNullChecks
      const before_thread_max_notif_id = updatedThread.max_notif_id;
      const subscription = await server.models.Subscription.create({
        subscriber_id: userId,
        category_id: NotificationCategories.NewReaction,
        community_id: chain,
        thread_id: thread.id,
      });

      const notification_data = {
        created_at: new Date(),
        thread_id: thread.id,
        root_type: ProposalType.Thread,
        root_title: title,
        community_id: chain,
        author_address: userAddress,
        author_community_id: chain,
      };
      await emitNotifications(server.models, {
        categoryId: NotificationCategories.NewReaction,
        data: notification_data,
      });

      const notif = await server.models.Notification.findOne({
        where: {
          community_id: chain,
          category_id: NotificationCategories.NewReaction,
          thread_id: thread.id,
        },
      });
      expect(notif).to.not.be.null;
      // @ts-expect-error StrictNullChecks
      expect(notif.thread_id).to.equal(thread.id);
      // @ts-expect-error StrictNullChecks
      expect(notif.toJSON().notification_data).to.deep.equal(
        JSON.stringify(notification_data),
      );

      const notifRead = await server.models.NotificationsRead.findOne({
        where: {
          subscription_id: subscription.id,
          // @ts-expect-error StrictNullChecks
          notification_id: notif.id,
          user_id: userId,
          is_read: false,
        },
      });
      expect(notifRead).to.not.be.null;

      // verify max_notif_id in thread is not updated on new reaction
      // currently updating only on new thread and new comment
      updatedThread = await server.models.Thread.findOne({
        where: {
          id: thread.id,
        },
      });
      // @ts-expect-error StrictNullChecks
      expect(updatedThread.max_notif_id).to.equal(before_thread_max_notif_id);
    });

    test('should generate a notification and notification read for a new mention', async () => {
      const subscription = await server.models.Subscription.create({
        subscriber_id: userId,
        category_id: NotificationCategories.NewMention,
      });

      const notification_data: NotificationDataAndCategory = {
        categoryId: NotificationCategories.NewMention,
        data: {
          created_at: new Date(),
          thread_id: thread.id,
          root_type: ProposalType.Thread,
          root_title: title,
          community_id: chain,
          author_address: userAddress,
          author_community_id: chain,
          mentioned_user_id: userId,
          comment_text: '',
        },
      };
      await emitNotifications(server.models, notification_data);

      const notif = await server.models.Notification.findOne({
        where: {
          category_id: NotificationCategories.NewMention,
        },
      });
      expect(notif).to.not.be.null;
      // @ts-expect-error StrictNullChecks
      expect(JSON.parse(notif.notification_data).thread_id).to.equal(thread.id);

      const notifRead = await server.models.NotificationsRead.findOne({
        where: {
          subscription_id: subscription.id,
          // @ts-expect-error StrictNullChecks
          notification_id: notif.id,
          user_id: userId,
          is_read: false,
        },
      });
      expect(notifRead).to.not.be.null;
    });

    test('should generate a notification and notification read for a new collaboration', async () => {
      const subscription = await server.models.Subscription.create({
        subscriber_id: userId,
        category_id: NotificationCategories.NewCollaboration,
      });

      const notification_data: NotificationDataAndCategory = {
        categoryId: NotificationCategories.NewCollaboration,
        data: {
          created_at: new Date(),
          thread_id: thread.id,
          root_type: ProposalType.Thread,
          root_title: title,
          community_id: chain,
          author_address: userAddress,
          author_community_id: chain,
          comment_text: '',
          collaborator_user_id: userId,
        },
      };
      await emitNotifications(server.models, notification_data);

      const notif = await server.models.Notification.findOne({
        where: {
          category_id: NotificationCategories.NewCollaboration,
        },
      });
      expect(notif).to.not.be.null;
      // @ts-expect-error StrictNullChecks
      expect(JSON.parse(notif.notification_data).thread_id).to.equal(thread.id);

      const notifRead = await server.models.NotificationsRead.findOne({
        where: {
          subscription_id: subscription.id,
          // @ts-expect-error StrictNullChecks
          notification_id: notif.id,
          user_id: userId,
          is_read: false,
        },
      });
      expect(notifRead).to.not.be.null;
    });
  });

  describe('Snapshot Notifications', () => {
    test('should generate a notification for a new snapshot proposal', async () => {
      const space = 'plutusclub.eth';
      const subscription = await server.models.Subscription.create({
        subscriber_id: userId,
        category_id: NotificationCategories.SnapshotProposal,
        snapshot_id: space,
      });

      const snapshotNotificationData = {
        eventType: SnapshotEventType.Created,
        space,
        id: '0x8b65f5c841816e9fbe54da3fb79ab7abf3444ddc4ca228f97e8c347a53695a98',
        title: 'Drop confirm',
        body: '',
        choices: ['Yes', 'No'],
        start: String(1680610125),
        expire: String(1680869325),
      };

      // const eventType: SnapshotEventType = SnapshotEventType.Created;
      const notififcation_data: NotificationDataAndCategory = {
        categoryId: NotificationCategories.SnapshotProposal,
        data: {
          ...snapshotNotificationData,
        },
      };

      await emitNotifications(server.models, notififcation_data);

      const notif = await server.models.Notification.findOne({
        where: {
          category_id: NotificationCategories.SnapshotProposal,
        },
      });

      expect(notif).to.exist;

      const notifRead = await server.models.NotificationsRead.findOne({
        where: {
          subscription_id: subscription.id,
          // @ts-expect-error StrictNullChecks
          notification_id: notif.id,
          user_id: userId,
        },
      });

      expect(notifRead).to.exist;
    });
  });
});
