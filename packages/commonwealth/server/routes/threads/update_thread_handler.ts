import { TypedRequest, TypedResponse, success } from '../../types';
import { ServerControllers } from '../../routing/router';
import { ThreadAttributes } from '../../models/thread';
import { AppError } from '../../../../common-common/src/errors';

export const Errors = {
  InvalidThreadID: 'Invalid thread ID',
  MissingText: 'Must provide text',
};

type UpdateThreadRequestBody = {
  body?: string;
  title?: string;
  kind?: string;
  stage?: string;
  url?: string;
  bot_meta?: any;
};
type UpdateThreadResponse = ThreadAttributes;

export const updateThreadHandler = async (
  controllers: ServerControllers,
  req: TypedRequest<UpdateThreadRequestBody, null, { id: string }>,
  res: TypedResponse<UpdateThreadResponse>
) => {
  const { user, address, chain } = req;
  const { id } = req.params;
  const { body, title, stage, url, bot_meta } = req.body;

  const threadId = parseInt(id, 10) || 0;

  if (!body || !body.trim()) {
    throw new AppError(Errors.MissingText);
  }

  const [updatedThread, notificationOptions] =
    await controllers.threads.updateThread({
      user,
      address,
      chain,
      threadId,
      title,
      body,
      stage,
      url,
      botMeta: bot_meta,
    });

  for (const n of notificationOptions) {
    controllers.notifications.emit(n).catch(console.error);
  }

  return success(res, updatedThread);
};
