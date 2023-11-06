import { TopicAttributes } from '../../models/topic';
import { ServerControllers } from '../../routing/router';
import { TypedResponse, success } from '../../types';
import { Request } from 'express';

type GetTopicsResponse = TopicAttributes[];

export const getTopicsHandler = async (
  controllers: ServerControllers,
  req: Request,
  res: TypedResponse<GetTopicsResponse>
) => {
  const { chain: community } = req;

  const topics = await controllers.topics.getTopics({ community });

  return success(res, topics);
};
