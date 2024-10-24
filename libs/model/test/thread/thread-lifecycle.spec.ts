import sinon from 'sinon';
import { contractHelpers } from '../../src/services/commonProtocol';
const getNamespaceBalanceStub = sinon.stub(
  contractHelpers,
  'getNamespaceBalance',
);

import {
  Actor,
  InvalidActor,
  InvalidInput,
  InvalidState,
  command,
  dispose,
} from '@hicommonwealth/core';
import type { AddressAttributes } from '@hicommonwealth/model';
import { Community, PermissionEnum, Thread } from '@hicommonwealth/schemas';
import {
  CANVAS_TOPIC,
  getTestSigner,
  sign,
  toCanvasSignedDataApiArgs,
} from '@hicommonwealth/shared';
import { Chance } from 'chance';
import { afterEach } from 'node:test';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  CreateComment,
  CreateCommentErrors,
  CreateCommentReaction,
  DeleteComment,
  MAX_COMMENT_DEPTH,
  UpdateComment,
} from '../../src/comment';
import { models } from '../../src/database';
import { BannedActor, NonMember, RejectedMember } from '../../src/middleware';
import { seed, seedRecord } from '../../src/tester';
import {
  CreateThread,
  CreateThreadReaction,
  CreateThreadReactionErrors,
  UpdateThread,
  UpdateThreadErrors,
} from '../../src/thread';
import { getCommentDepth } from '../../src/utils/getCommentDepth';

const chance = Chance();

describe('Thread lifecycle', () => {
  let community: z.infer<typeof Community>,
    thread: z.infer<typeof Thread>,
    archived,
    read_only,
    comment;
  const roles = ['admin', 'member', 'nonmember', 'banned', 'rejected'] as const;
  const addresses = {} as Record<(typeof roles)[number], AddressAttributes>;
  const actors = {} as Record<(typeof roles)[number], Actor>;
  const vote_weight = 200;

  const body = chance.paragraph();
  const title = chance.sentence();
  const stage = 'stage';
  const payload = {
    community_id: '',
    topic_id: 0,
    kind: 'discussion' as const,
    title,
    body,
    stage,
    url: 'http://blah',
    canvas_msg_id: '',
    canvas_signed_data: '',
    read_only: false,
  };

  beforeAll(async () => {
    const signerInfo = await Promise.all(
      roles.map(async () => {
        const signer = getTestSigner();
        const did = await signer.getDid();
        await signer.newSession(CANVAS_TOPIC);
        return {
          signer,
          did,
          address: signer.getAddressFromDid(did),
        };
      }),
    );

    const threadGroupId = 123456;
    const commentGroupId = 654321;
    const [node] = await seed('ChainNode', { eth_chain_id: 1 });
    const users = await seedRecord('User', roles, (role) => ({
      profile: { name: role },
      isAdmin: role === 'admin',
    }));
    const [_community] = await seed('Community', {
      chain_node_id: node!.id!,
      active: true,
      profile_count: 1,
      Addresses: roles.map((role, index) => {
        return {
          address: signerInfo[index].address,
          user_id: users[role].id,
          role: role === 'admin' ? 'admin' : 'member',
          is_banned: role === 'banned',
        };
      }),
      groups: [{ id: threadGroupId }, { id: commentGroupId }],
      topics: [{ group_ids: [threadGroupId, commentGroupId] }],
      CommunityStakes: [
        {
          stake_id: 1,
          stake_token: 'stake',
          stake_enabled: true,
          vote_weight,
        },
      ],
      custom_stages: ['one', 'two'],
    });
    await seed('GroupPermission', {
      group_id: threadGroupId,
      allowed_actions: [
        PermissionEnum.CREATE_THREAD,
        PermissionEnum.CREATE_THREAD_REACTION,
        PermissionEnum.CREATE_COMMENT_REACTION,
      ],
    });
    await seed('GroupPermission', {
      group_id: commentGroupId,
      allowed_actions: [PermissionEnum.CREATE_COMMENT],
    });

    community = _community!;
    roles.forEach((role) => {
      const user = users[role];
      const address = community!.Addresses!.find((a) => a.user_id === user.id);
      actors[role] = {
        user: {
          id: user.id,
          email: user.profile.email!,
        },
        address: address!.address,
      };
      addresses[role] = address!;
    });

    await models.Membership.bulkCreate([
      {
        group_id: threadGroupId,
        address_id: addresses['member'].id!,
        last_checked: new Date(),
      },
      {
        group_id: commentGroupId,
        address_id: addresses['member'].id!,
        last_checked: new Date(),
      },
      {
        group_id: threadGroupId,
        address_id: addresses['rejected'].id!,
        reject_reason: [
          {
            message: 'User Balance of 0 below threshold 1',
            requirement: {
              data: {
                source: {
                  source_type: 'eth_native',
                  evm_chain_id: 1,
                },
                threshold: '1',
              },
              rule: 'threshold',
            },
          },
        ],
        last_checked: new Date(),
      },
    ]);

    const [archived_thread] = await seed('Thread', {
      community_id: community?.id,
      address_id: community?.Addresses?.at(0)?.id,
      topic_id: community?.topics?.at(0)?.id,
      archived_at: new Date(),
      pinned: false,
      read_only: false,
    });
    archived = archived_thread;

    const [read_only_thread] = await seed('Thread', {
      community_id: community?.id,
      address_id: community?.Addresses?.at(0)?.id,
      topic_id: community?.topics?.at(0)?.id,
      pinned: false,
      read_only: true,
    });
    read_only = read_only_thread;

    payload.community_id = community!.id!;
    payload.topic_id = community!.topics!.at(0)!.id!;
  });

  afterAll(async () => {
    await dispose()();
  });

  describe('create', () => {
    const authorizationTests = {
      admin: undefined,
      member: undefined,
      nonmember: NonMember,
      banned: BannedActor,
      rejected: RejectedMember,
    } as Record<(typeof roles)[number], any>;

    roles.forEach((role) => {
      if (!authorizationTests[role]) {
        it(`should create thread as ${role}`, async () => {
          const did = `did:pkh:eip155:1:${actors[role].address}`;
          const signedArgs = toCanvasSignedDataApiArgs(
            await sign(
              did,
              'thread',
              {
                community: payload.community_id,
                title: payload.title,
                body: payload.body,
                link: payload.url,
                topic: payload.topic_id,
              },
              async () => [1, []] as [number, string[]],
            ),
          );

          const _thread = await command(CreateThread(), {
            actor: actors[role],
            payload: { ...payload, ...signedArgs },
          });
          expect(_thread?.title).to.equal(title);
          expect(_thread?.body).to.equal(body);
          expect(_thread?.stage).to.equal(stage);
          // capture as admin author for other tests
          if (!thread) thread = _thread!;
        });
      } else {
        it(`should reject create thread as ${role}`, async () => {
          await expect(
            command(CreateThread(), {
              actor: actors[role],
              payload,
            }),
          ).rejects.toThrowError(authorizationTests[role]);
        });
      }
    });
  });

  describe('updates', () => {
    it('should patch content', async () => {
      const body = {
        title: 'hello',
        body: 'wasup',
        canvas_msg_id: '',
        canvas_signed_data: '',
      };
      const updated = await command(UpdateThread(), {
        actor: actors.admin,
        payload: {
          thread_id: thread.id!,
          ...body,
        },
      });
      expect(updated).to.contain(body);
    });

    it('should add collaborators', async () => {
      const body = {
        collaborators: {
          toAdd: [
            addresses.member.id!,
            addresses.rejected.id!,
            addresses.banned.id!,
          ],
          toRemove: [],
        },
      };
      const updated = await command(UpdateThread(), {
        actor: actors.admin,
        payload: {
          thread_id: thread.id!,
          ...body,
        },
      });
      expect(updated?.collaborators?.length).to.eq(3);
    });

    it('should remove collaborator', async () => {
      const body = {
        collaborators: {
          toRemove: [addresses.banned.id!],
        },
      };
      const updated = await command(UpdateThread(), {
        actor: actors.admin,
        payload: {
          thread_id: thread.id!,
          ...body,
        },
      });
      expect(updated?.collaborators?.length).to.eq(2);
    });

    it('should fail when thread not found by discord_meta', async () => {
      await expect(
        command(UpdateThread(), {
          actor: actors.member,
          payload: {
            thread_id: thread.id!,
            discord_meta: {
              message_id: '',
              channel_id: '',
              user: { id: '', username: '' },
            },
          },
        }),
      ).rejects.toThrowError(UpdateThreadErrors.ThreadNotFound);
    });

    it('should fail when collaborators overlap', async () => {
      await expect(
        command(UpdateThread(), {
          actor: actors.member,
          payload: {
            thread_id: thread.id!,
            collaborators: {
              toAdd: [addresses.banned.id!],
              toRemove: [addresses.banned.id!],
            },
          },
        }),
      ).rejects.toThrowError(UpdateThreadErrors.CollaboratorsOverlap);
    });

    it('should fail when not admin or author', async () => {
      await expect(
        command(UpdateThread(), {
          actor: actors.member,
          payload: {
            thread_id: thread.id!,
            collaborators: {
              toRemove: [addresses.banned.id!],
            },
          },
        }),
      ).rejects.toThrowError('Must be super admin or author');
    });

    it('should fail when collaborator not found', async () => {
      await expect(
        command(UpdateThread(), {
          actor: actors.admin,
          payload: {
            thread_id: thread.id!,
            collaborators: {
              toAdd: [999999999],
            },
          },
        }),
      ).rejects.toThrowError(UpdateThreadErrors.MissingCollaborators);
    });

    it('should patch admin or moderator attributes', async () => {
      const body = {
        pinned: true,
        spam: true,
      };
      const updated = await command(UpdateThread(), {
        actor: actors.admin,
        payload: {
          thread_id: thread.id!,
          ...body,
        },
      });
      expect(updated?.pinned).to.eq(true);
      expect(updated?.marked_as_spam_at).toBeDefined;
    });

    it('should fail when collaborator actor non admin/moderator', async () => {
      await expect(
        command(UpdateThread(), {
          actor: actors.rejected,
          payload: {
            thread_id: thread.id!,
            pinned: false,
            spam: false,
          },
        }),
      ).rejects.toThrowError('Must be admin or moderator');
    });

    it('should patch admin or moderator or owner attributes', async () => {
      const body = {
        locked: false,
        archived: false,
        stage: community.custom_stages.at(0),
        topic_id: thread.topic_id!,
      };
      const updated = await command(UpdateThread(), {
        actor: actors.admin,
        payload: {
          thread_id: thread.id!,
          ...body,
        },
      });
      expect(updated?.locked_at).toBeUndefined;
      expect(updated?.archived_at).toBeUndefined;
      expect(updated?.stage).to.eq(community.custom_stages.at(0));
      expect(updated?.topic_id).to.eq(thread.topic_id);
    });

    it('should fail when invalid stage is sent', async () => {
      await expect(
        command(UpdateThread(), {
          actor: actors.admin,
          payload: {
            thread_id: thread.id!,
            stage: 'invalid',
          },
        }),
      ).rejects.toThrowError(UpdateThreadErrors.InvalidStage);
    });

    it('should fail when collaborator actor non admin/moderator/owner', async () => {
      await expect(
        command(UpdateThread(), {
          actor: actors.rejected,
          payload: {
            thread_id: thread.id!,
            locked: true,
            archived: true,
          },
        }),
      ).rejects.toThrowError('Must be admin, moderator, or author');
    });
  });

  describe('comments', () => {
    it('should create a thread comment as member of group with permissions', async () => {
      const text = 'hello';
      comment = await command(CreateComment(), {
        actor: actors.member,
        payload: {
          parent_msg_id: thread!.canvas_msg_id,
          thread_id: thread.id!,
          text,
        },
      });
      expect(comment).to.include({
        thread_id: thread!.id,
        text,
        community_id: thread!.community_id,
      });
    });

    it('should throw error when thread not found', async () => {
      await expect(
        command(CreateComment(), {
          actor: actors.member,
          payload: {
            parent_msg_id: thread.canvas_msg_id,
            thread_id: thread.id! + 5,
            text: 'hi',
          },
        }),
      ).rejects.toThrowError(InvalidInput);
    });

    it('should throw error when actor is not member of group with permission', async () => {
      await expect(
        command(CreateComment(), {
          actor: actors.nonmember,
          payload: {
            parent_msg_id: thread.canvas_msg_id,
            thread_id: thread.id!,
            text: 'hi',
          },
        }),
      ).rejects.toThrowError(NonMember);
    });

    it('should throw an error when thread is archived', async () => {
      await expect(
        command(CreateComment(), {
          actor: actors.member,
          payload: {
            parent_msg_id: thread!.canvas_msg_id,
            thread_id: archived!.id,
            text: 'hi',
          },
        }),
      ).rejects.toThrowError(CreateCommentErrors.ThreadArchived);
    });

    it('should throw an error when thread is read only', async () => {
      await expect(
        command(CreateComment(), {
          actor: actors.member,
          payload: {
            parent_msg_id: thread!.canvas_msg_id,
            thread_id: read_only!.id,
            text: 'hi',
          },
        }),
      ).rejects.toThrowError(CreateCommentErrors.CantCommentOnReadOnly);
    });

    it('should throw error when parent not found', async () => {
      await expect(
        command(CreateComment(), {
          actor: actors.member,
          payload: {
            parent_msg_id: thread.canvas_msg_id,
            thread_id: thread.id!,
            parent_id: 1234567890,
            text: 'hi',
          },
        }),
      ).rejects.toThrowError(InvalidState);
    });

    it('should throw error when nesting is too deep', async () => {
      let parent_id = undefined,
        comment;
      for (let i = 0; i <= MAX_COMMENT_DEPTH; i++) {
        comment = await command(CreateComment(), {
          actor: actors.member,
          payload: {
            parent_msg_id: thread.canvas_msg_id,
            thread_id: thread.id!,
            parent_id,
            text: `level${i}`,
          },
        });
        parent_id = comment!.id;
        expect(parent_id).toBeDefined();
        const [exceeded, depth] = await getCommentDepth(
          comment as any,
          MAX_COMMENT_DEPTH,
        );
        expect(exceeded).to.be.false;
        expect(depth).toBe(i);
      }
      await expect(
        command(CreateComment(), {
          actor: actors.member,
          payload: {
            parent_msg_id: thread.canvas_msg_id,
            thread_id: thread.id!,
            parent_id,
            text: 'hi',
          },
        }),
      ).rejects.toThrowError(CreateCommentErrors.NestingTooDeep);
    });

    it('should update comment', async () => {
      const text = 'hello updated';
      const updated = await command(UpdateComment(), {
        actor: actors.member,
        payload: {
          comment_id: comment!.id,
          text,
        },
      });
      expect(updated).to.include({
        thread_id: thread!.id,
        text,
        community_id: thread!.community_id,
      });
    });

    it('should throw not found when trying to update', async () => {
      await expect(
        command(UpdateComment(), {
          actor: actors.member,
          payload: {
            comment_id: 1234567890,
            text: 'hi',
          },
        }),
      ).rejects.toThrowError(InvalidInput);
    });

    it('should delete a comment as author', async () => {
      const text = 'to be deleted';
      const tbd = await command(CreateComment(), {
        actor: actors.member,
        payload: {
          thread_id: thread.id!,
          text,
        },
      });
      expect(tbd).to.include({
        thread_id: thread!.id,
        text,
        community_id: thread!.community_id,
      });
      const deleted = await command(DeleteComment(), {
        actor: actors.member,
        payload: { comment_id: tbd!.id! },
      });
      expect(deleted).to.include({ comment_id: tbd!.id! });
    });

    it('should delete a comment as admin', async () => {
      const text = 'to be deleted';
      const tbd = await command(CreateComment(), {
        actor: actors.member,
        payload: {
          thread_id: thread.id!,
          text,
        },
      });
      expect(tbd).to.include({
        thread_id: thread!.id,
        text,
        community_id: thread!.community_id,
      });
      const deleted = await command(DeleteComment(), {
        actor: actors.admin,
        payload: { comment_id: tbd!.id! },
      });
      expect(deleted).to.include({ comment_id: tbd!.id! });
    });

    it('should throw delete when user is not author', async () => {
      await expect(
        command(DeleteComment(), {
          actor: actors.rejected,
          payload: {
            comment_id: comment!.id,
          },
        }),
      ).rejects.toThrowError(InvalidActor);
    });
  });

  describe('thread reaction', () => {
    afterEach(() => {
      getNamespaceBalanceStub.restore();
    });

    it('should create a thread reaction as a member of a group with permissions', async () => {
      getNamespaceBalanceStub.resolves({ [actors.member.address!]: '50' });
      const reaction = await command(CreateThreadReaction(), {
        actor: actors.member,
        payload: {
          thread_msg_id: thread.canvas_msg_id,
          thread_id: thread.id!,
          reaction: 'like',
        },
      });
      expect(reaction).to.include({
        thread_id: thread!.id,
        reaction: 'like',
        community_id: thread!.community_id,
      });
    });

    it('should throw error when actor does not have stake', async () => {
      getNamespaceBalanceStub.resolves({ [actors.member.address!]: '0' });
      await expect(
        command(CreateThreadReaction(), {
          actor: actors.member,
          payload: {
            thread_msg_id: thread!.canvas_msg_id,
            thread_id: thread.id!,
            reaction: 'like',
          },
        }),
      ).rejects.toThrowError(InvalidState);
    });

    it('should throw error when thread not found', async () => {
      await expect(
        command(CreateThreadReaction(), {
          actor: actors.member,
          payload: {
            thread_msg_id: thread.canvas_msg_id,
            thread_id: thread.id! + 5,
            reaction: 'like',
          },
        }),
      ).rejects.toThrowError(InvalidInput);
    });

    it('should throw error when actor is not member of group with permission', async () => {
      await expect(
        command(CreateThreadReaction(), {
          actor: actors.nonmember,
          payload: {
            thread_msg_id: thread.canvas_msg_id,
            thread_id: thread.id!,
            reaction: 'like',
          },
        }),
      ).rejects.toThrowError(NonMember);
    });

    it('should throw an error when thread is archived', async () => {
      await expect(
        command(CreateThreadReaction(), {
          actor: actors.member,
          payload: {
            thread_msg_id: thread!.canvas_msg_id,
            thread_id: archived!.id,
            reaction: 'like',
          },
        }),
      ).rejects.toThrowError(CreateThreadReactionErrors.ThreadArchived);
    });

    it('should set thread reaction vote weight and thread vote sum correctly', async () => {
      getNamespaceBalanceStub.resolves({ [actors.admin.address!]: '50' });
      const reaction = await command(CreateThreadReaction(), {
        actor: actors.admin,
        payload: {
          thread_msg_id: thread!.canvas_msg_id,
          thread_id: read_only!.id,
          reaction: 'like',
        },
      });
      const expectedWeight = 50 * vote_weight;
      expect(reaction?.calculated_voting_weight).to.eq(expectedWeight);
      const t = await models.Thread.findByPk(thread!.id);
      expect(t!.reaction_weights_sum).to.eq(expectedWeight);
    });
  });

  describe('comment reaction', () => {
    afterEach(() => {
      getNamespaceBalanceStub.restore();
    });

    it('should create a comment reaction as a member of a group with permissions', async () => {
      getNamespaceBalanceStub.resolves({ [actors.member.address!]: '50' });
      const reaction = await command(CreateCommentReaction(), {
        actor: actors.member,
        payload: {
          comment_msg_id: comment!.canvas_msg_id || '',
          comment_id: comment!.id,
          reaction: 'like',
        },
      });
      expect(reaction).to.include({
        comment_id: comment!.id,
        reaction: 'like',
        community_id: thread!.community_id,
      });
    });

    it('should set comment reaction vote weight and comment vote sum correctly', async () => {
      getNamespaceBalanceStub.resolves({ [actors.admin.address!]: '50' });
      const reaction = await command(CreateCommentReaction(), {
        actor: actors.admin,
        payload: {
          comment_msg_id: comment!.canvas_msg_id || '',
          comment_id: comment!.id,
          reaction: 'like',
        },
      });
      const expectedWeight = 50 * vote_weight;
      expect(reaction?.calculated_voting_weight).to.eq(expectedWeight);
      const c = await models.Comment.findByPk(comment!.id);
      expect(c!.reaction_weights_sum).to.eq(expectedWeight * 2); // *2 to account for first member reaction
    });

    it('should throw error when comment not found', async () => {
      await expect(
        command(CreateCommentReaction(), {
          actor: actors.member,
          payload: {
            comment_msg_id: comment!.canvas_msg_id || '',
            comment_id: 99999999,
            reaction: 'like',
          },
        }),
      ).rejects.toThrowError(InvalidInput);
    });

    it('should throw error when actor does not have stake', async () => {
      getNamespaceBalanceStub.resolves({ [actors.member.address!]: '0' });
      await expect(
        command(CreateCommentReaction(), {
          actor: actors.member,
          payload: {
            comment_msg_id: comment!.canvas_msg_id || '',
            comment_id: comment!.id,
            reaction: 'like',
          },
        }),
      ).rejects.toThrowError(InvalidState);
    });

    it('should throw error when actor is not member of group with permission', async () => {
      await expect(
        command(CreateCommentReaction(), {
          actor: actors.nonmember,
          payload: {
            comment_msg_id: comment!.canvas_msg_id || '',
            comment_id: comment!.id,
            reaction: 'like',
          },
        }),
      ).rejects.toThrowError(NonMember);
    });
  });

  // @rbennettcw do we have contest validation tests to include here?
});
