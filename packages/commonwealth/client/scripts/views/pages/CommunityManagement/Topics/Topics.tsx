import React, { useState } from 'react';

import CWFormSteps from 'views/components/component_kit/new_designs/CWFormSteps';
import CWPageLayout from 'views/components/component_kit/new_designs/CWPageLayout';
import StakeIntegration from 'views/pages/CommunityManagement/StakeIntegration';

import TopicDetails from './TopicDetails';
import WVConsent from './WVConsent';
import WVERC20Details from './WVERC20Details';
import WVMethodSelection from './WVMethodSelection';
import { CreateTopicStep, getCreateTopicSteps } from './utils';

import './Topics.scss';

export const Topics = () => {
  const [createCommunityStep, setCreateCommunityStep] = useState(
    CreateTopicStep.TopicDetails,
  );

  const topicName = 'todo';

  const getCurrentStep = () => {
    switch (createCommunityStep) {
      case CreateTopicStep.TopicDetails:
        return <TopicDetails onStepChange={setCreateCommunityStep} />;
      case CreateTopicStep.WVConsent:
        return (
          <WVConsent
            onStepChange={setCreateCommunityStep}
            topicName={topicName}
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
