import { ChainType } from '@hicommonwealth/shared';
import { notifyError, notifySuccess } from 'controllers/app/notifications';
import 'pages/AdminPanel.scss';
import React, { useState } from 'react';
import {
  useGetCommunityByIdQuery,
  useUpdateCommunityMutation,
} from 'state/api/communities';
import { useFetchNodesQuery } from 'state/api/nodes';
import { useDebounce } from 'usehooks-ts';
import {
  CWDropdown,
  DropdownItemType,
} from '../../components/component_kit/cw_dropdown';
import { CWText } from '../../components/component_kit/cw_text';
import { CWButton } from '../../components/component_kit/new_designs/CWButton';
import { CWTextInput } from '../../components/component_kit/new_designs/CWTextInput';
import { openConfirmation } from '../../modals/confirmation_modal';
import { alphabetizeChains } from './utils';

const ConnectChainToCommunityTask = () => {
  const [communityId, setCommunityId] = useState<string>('');

  const [chainNameAndId, setChainNameAndId] = useState<DropdownItemType>({
    label: '',
    value: 0,
  });

  const { mutateAsync: updateCommunity } = useUpdateCommunityMutation({
    communityId: communityId,
  });

  const { data: chainNodes } = useFetchNodesQuery();

  const chains = alphabetizeChains(chainNodes);

  const debouncedCommunityLookupId = useDebounce<string | undefined>(
    communityId,
    500,
  );

  const { data: communityLookupData, isLoading: isLoadingCommunityLookupData } =
    useGetCommunityByIdQuery({
      id: debouncedCommunityLookupId || '',
      enabled: !!debouncedCommunityLookupId,
    });

  const chainNotCommunity = communityLookupData?.type === ChainType.Chain;

  const buttonEnabled =
    !isLoadingCommunityLookupData &&
    !chainNotCommunity &&
    chainNameAndId.label.length > 0;

  const setCommunityIdInput = (e) => {
    setCommunityId(e?.target?.value?.trim() || '');
  };

  const communityNotFound =
    !isLoadingCommunityLookupData &&
    (!communityLookupData ||
      Object.keys(communityLookupData || {})?.length === 0);

  const communityIdInputError = (() => {
    if (communityNotFound) return 'Community not found';
    if (chainNotCommunity) return 'This is a chain';
    return '';
  })();

  const update = async () => {
    if (Object.keys(communityLookupData || {}).length > 0) {
      try {
        await updateCommunity({
          communityId: communityId,
          chainNodeId: chainNameAndId?.value.toString(),
        });
        setCommunityIdInput('');
        setChainNameAndId({ label: '', value: 0 });
        notifySuccess('Chain connected to community');
      } catch (error) {
        notifyError('Error connecting chain to community');
        console.error(error);
      }
    }
  };
  const openConfirmationModal = () => {
    openConfirmation({
      title: 'Connect Chain to Community',
      description: `Are you sure you want to connect ${communityLookupData?.name} to ${chainNameAndId.label}?`,
      buttons: [
        {
          label: 'Update',
          buttonType: 'primary',
          buttonHeight: 'sm',
          onClick: update,
        },
        {
          label: 'Cancel',
          buttonType: 'secondary',
          buttonHeight: 'sm',
        },
      ],
    });
  };

  return (
    <div className="TaskGroup">
      <CWText type="h4">Connect Chain to Community</CWText>
      <CWText type="caption">Connects a specific chain to a community</CWText>
      <div className="TaskRow">
        <CWTextInput
          label="Community Id"
          value={communityId}
          onInput={setCommunityIdInput}
          customError={communityIdInputError}
          placeholder="Enter a community id"
        />
        <CWDropdown
          label="Select chain"
          options={chains}
          onSelect={(item) => {
            setChainNameAndId(item);
          }}
        />
        <CWButton
          label="Connect"
          className="TaskButton"
          disabled={!buttonEnabled}
          onClick={openConfirmationModal}
        />
      </div>
    </div>
  );
};

export default ConnectChainToCommunityTask;
