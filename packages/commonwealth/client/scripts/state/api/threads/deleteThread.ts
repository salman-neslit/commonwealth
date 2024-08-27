import { toCanvasSignedDataApiArgs } from '@hicommonwealth/shared';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { signDeleteThread } from 'controllers/server/sessions';
import { ThreadStage } from 'models/types';
import { SERVER_URL } from 'state/api/config';
import { useAuthModalStore } from '../../ui/modals';
import { userStore } from '../../ui/user';
import { updateCommunityThreadCount } from '../communities/getCommuityById';
import { removeThreadFromAllCaches } from './helpers/cache';

interface DeleteThreadProps {
  communityId: string;
  threadId: number;
  address: string;
}

const deleteThread = async ({
  communityId,
  threadId,
  address,
}: DeleteThreadProps) => {
  const canvasSignedData = await signDeleteThread(address, {
    thread_id: threadId,
  });

  return await axios.delete(`${SERVER_URL}/threads/${threadId}`, {
    data: {
      author_community_id: communityId,
      community_id: communityId,
      address: address,
      jwt: userStore.getState().jwt,
      ...toCanvasSignedDataApiArgs(canvasSignedData),
    },
  });
};

interface UseDeleteThreadMutationProps {
  communityId: string;
  threadId: number;
  currentStage: ThreadStage;
}

const useDeleteThreadMutation = ({
  communityId,
  threadId,
  currentStage,
}: UseDeleteThreadMutationProps) => {
  const { checkForSessionKeyRevalidationErrors } = useAuthModalStore();

  return useMutation({
    mutationFn: deleteThread,
    onSuccess: async (response) => {
      removeThreadFromAllCaches(communityId, threadId);

      // decrement communities thread count
      if (communityId) {
        updateCommunityThreadCount(
          communityId,
          'decrement',
          currentStage === ThreadStage.Voting,
        );
      }

      return response.data;
    },
    onError: (error) => checkForSessionKeyRevalidationErrors(error),
  });
};

export default useDeleteThreadMutation;
