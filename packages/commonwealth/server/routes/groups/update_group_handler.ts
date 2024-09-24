import { AppError } from '@hicommonwealth/core';
import { GroupAttributes } from '@hicommonwealth/model';
import { GroupMetadata } from '@hicommonwealth/schemas';
import { Requirement } from '@hicommonwealth/shared';
import z from 'zod';
import { ServerControllers } from '../../routing/router';
import { success, type TypedRequest, type TypedResponse } from '../../types';

type UpdateGroupParams = { id: string };
type UpdateGroupBody = {
  metadata: z.infer<typeof GroupMetadata>;
  requirements: Requirement[];
  topics?: number[];
};
type UpdateGroupResponse = GroupAttributes;

export const updateGroupHandler = async (
  controllers: ServerControllers,
  // @ts-expect-error StrictNullChecks
  req: TypedRequest<UpdateGroupBody, null, UpdateGroupParams>,
  res: TypedResponse<UpdateGroupResponse>,
) => {
  const { user, address } = req;

  const schema = z.object({
    params: z.object({
      id: z.coerce.number(),
    }),
    body: z.object({
      metadata: z
        .object({
          name: z.string(),
          description: z.string(),
          required_requirements: z.number().optional(),
        })
        .optional(),
      requirements: z.array(z.any()).min(1), // validated in controller
      topics: z.array(z.number()).optional(),
      allowList: z.array(z.number()).default([]),
    }),
  });
  const validationResult = schema.safeParse(req);
  if (validationResult.success === false) {
    throw new AppError(JSON.stringify(validationResult.error));
  }
  const {
    params: { id: groupId },
    body: { metadata, requirements, topics, allowList },
  } = validationResult.data;

  const [group, analyticsOptions] = await controllers.groups.updateGroup({
    // @ts-expect-error StrictNullChecks
    user,
    // @ts-expect-error StrictNullChecks
    address,
    groupId,
    metadata: metadata as Required<typeof metadata>,
    requirements,
    topics,
    allowList,
  });

  // TODO: to be moved to output middleware like in create group
  // // refresh memberships in background if requirements or
  // // required requirements updated
  // if (
  //   requirements?.length > 0 ||
  //   group.metadata.required_requirements !==
  //     oldGroupMetadata.required_requirements
  // ) {
  //   controllers.groups
  //     .refreshCommunityMemberships({
  //       communityId: group.community_id,
  //       groupId: group.id,
  //     })
  //     .catch(console.error);
  // }

  controllers.analytics.track(analyticsOptions, req).catch(console.error);

  return success(res, group);
};
