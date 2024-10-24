import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { SERVER_URL } from 'state/api/config';
import { userStore } from '../../ui/user';
import { ApiEndpoints, queryClient } from '../config';

interface EditGroupProps {
  groupId: string;
  communityId: string;
  address: string;
  groupName: string;
  groupDescription?: string;
  topicIds: number[];
  requirementsToFulfill: number | undefined;
  requirements?: any[];
}

const editGroup = async ({
  groupId,
  communityId,
  address,
  groupName,
  groupDescription,
  topicIds,
  requirementsToFulfill,
  requirements,
}: EditGroupProps) => {
  return await axios.put(`${SERVER_URL}/groups/${groupId}`, {
    jwt: userStore.getState().jwt,
    community_id: communityId,
    author_community_id: communityId,
    address,
    metadata: {
      name: groupName,
      description: groupDescription,
      ...(requirementsToFulfill && {
        required_requirements: requirementsToFulfill,
      }),
    },
    ...(requirements && { requirements }),
    topics: topicIds,
  });
};

const useEditGroupMutation = ({ communityId }: { communityId: string }) => {
  return useMutation({
    mutationFn: editGroup,
    onSuccess: async () => {
      const key = [ApiEndpoints.FETCH_GROUPS, communityId];
      queryClient.cancelQueries(key);
      queryClient.refetchQueries(key);
    },
  });
};

export default useEditGroupMutation;
