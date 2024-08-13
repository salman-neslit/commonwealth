import Thread from 'models/Thread';
import React, { useState } from 'react';
import { CWThreadAction } from 'views/components/component_kit/new_designs/cw_thread_action';
import {
  getCommentSubscription,
  getReactionSubscription,
  handleToggleSubscription,
} from 'views/pages/discussions/helpers';

type ToggleThreadSubscribeProps = Readonly<{
  readonly thread: Thread;
  readonly isCommunityMember: boolean;
}>;

export const ToggleThreadSubscribeOld = (props: ToggleThreadSubscribeProps) => {
  const { thread, isCommunityMember } = props;

  const [isSubscribed, setIsSubscribed] = useState<boolean>(
    thread &&
      getCommentSubscription(thread)?.isActive &&
      getReactionSubscription(thread)?.isActive,
  );

  const handleToggleSubscribe = async (e) => {
    // prevent clicks from propagating to discussion row
    e.preventDefault();
    e.stopPropagation();

    if (!thread) {
      return;
    }

    await handleToggleSubscription(
      thread,
      getCommentSubscription(thread),
      getReactionSubscription(thread),
      isSubscribed,
      setIsSubscribed,
    );
  };

  return (
    <CWThreadAction
      action="subscribe"
      label="Subscribe"
      onClick={handleToggleSubscribe}
      selected={!isSubscribed}
      disabled={!isCommunityMember}
    />
  );
};
