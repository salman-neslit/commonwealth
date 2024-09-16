import React, { useState } from 'react';

import CWFormSteps from 'views/components/component_kit/new_designs/CWFormSteps';
import CWPageLayout from 'views/components/component_kit/new_designs/CWPageLayout';
import StakeIntegration from 'views/pages/CommunityManagement/StakeIntegration';

import TopicDetails from './TopicDetails';
import WVConsent from './WVConsent';
import WVERC20Details from './WVERC20Details';
import WVMethodSelection from './WVMethodSelection';
import { CreateTopicStep, getCreateTopicSteps } from './utils';

import { notifyError } from 'controllers/app/notifications';
import useAppStatus from 'hooks/useAppStatus';
import { useCommonNavigate } from 'navigation/helpers';
import { useCreateTopicMutation } from 'state/api/topics';

import './Topics.scss';

export interface TopicForm {
  name: string;
  description?: string;
  featuredInSidebar?: boolean;
}

export const Topics = () => {
  const [topicFormData, setTopicFormData] = useState<TopicForm | null>(null);
  const [createCommunityStep, setCreateCommunityStep] = useState(
    CreateTopicStep.TopicDetails,
  );

  const navigate = useCommonNavigate();
  const { isAddedToHomeScreen } = useAppStatus();
  const { mutateAsync: createTopic } = useCreateTopicMutation();

  const handleSetTopicFormData = (data: Partial<TopicForm>) => {
    setTopicFormData((prevState) => ({ ...prevState, ...data }));
  };

  const handleCreateTopic = async () => {
    if (!topicFormData) {
      return;
    }

    try {
      await createTopic({
        name: topicFormData.name,
        description: topicFormData.description,
        featuredInSidebar: topicFormData.featuredInSidebar || false,
        featuredInNewPost: false,
        defaultOffchainTemplate: '',
        isPWA: isAddedToHomeScreen,
      });
      navigate(`/discussions/${encodeURI(topicFormData.name.trim())}`);
    } catch (err) {
      notifyError('Failed to create topic');
      console.error(err);
    }
  };

  const getCurrentStep = () => {
    switch (createCommunityStep) {
      case CreateTopicStep.TopicDetails:
        return (
          <TopicDetails
            onStepChange={setCreateCommunityStep}
            onSetTopicFormData={handleSetTopicFormData}
            topicFormData={topicFormData}
          />
        );
      case CreateTopicStep.WVConsent:
        return (
          <WVConsent
            onStepChange={setCreateCommunityStep}
            onCreateTopic={handleCreateTopic}
          />
        );
      case CreateTopicStep.WVMethodSelection:
        return <WVMethodSelection onStepChange={setCreateCommunityStep} />;
      case CreateTopicStep.WVERC20Details:
        return <WVERC20Details onStepChange={setCreateCommunityStep} />;
      case CreateTopicStep.WVStake:
        return (
          <StakeIntegration
            isTopicFlow
            onTopicFlowStepChange={setCreateCommunityStep}
          />
        );
    }
  };

  return (
    <CWPageLayout>
      <div className="Topics">
        <CWFormSteps steps={getCreateTopicSteps(createCommunityStep)} />

        {getCurrentStep()}
      </div>
    </CWPageLayout>
  );
};

export default Topics;
