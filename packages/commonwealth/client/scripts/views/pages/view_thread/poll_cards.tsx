import React, { useState } from 'react';

import type { Poll, Thread } from 'models';

import moment from 'moment';

import 'pages/view_thread/poll_cards.scss';

import app from 'state';
import { CWButton } from '../../components/component_kit/cw_button';
import { CWContentPageCard } from '../../components/component_kit/cw_content_page';
import { PollCard } from '../../components/poll_card';
import { OffchainVotingModal } from '../../modals/offchain_voting_modal';
import { PollEditorModal } from '../../modals/poll_editor_modal';
import { getPollTimestamp, handlePollVote } from './helpers';
import { Modal } from '../../components/component_kit/cw_modal';

type ThreadPollEditorCardProps = {
  thread: Thread;
  threadAlreadyHasPolling: boolean;
  onPollCreate: () => void;
};

export const ThreadPollEditorCard = ({
  thread,
  threadAlreadyHasPolling,
  onPollCreate,
}: ThreadPollEditorCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <CWContentPageCard
        header={`Add ${
          threadAlreadyHasPolling ? 'an' : 'another'
        } offchain poll to this
        thread?`}
        content={
          <div className="PollEditorCard">
            <CWButton
              buttonType="mini-black"
              label="Create poll"
              onClick={(e) => {
                e.preventDefault();
                setIsModalOpen(true);
              }}
            />
          </div>
        }
      />
      <Modal
        content={
          <PollEditorModal
            thread={thread}
            onModalClose={() => setIsModalOpen(false)}
            onPollCreate={onPollCreate}
          />
        }
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
      />
    </>
  );
};

type ThreadPollCardProps = {
  poll: Poll;
  onVote: () => void;
};

export const ThreadPollCard = ({ poll, onVote }: ThreadPollCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <PollCard
        multiSelect={false}
        pollEnded={poll.endsAt && poll.endsAt?.isBefore(moment().utc())}
        hasVoted={
          app.user.activeAccount &&
          !!poll.getUserVote(
            app.user.activeAccount?.chain?.id,
            app.user.activeAccount?.address
          )
        }
        disableVoteButton={!app.user.activeAccount}
        votedFor={
          poll.getUserVote(
            app.user.activeAccount?.chain?.id,
            app.user.activeAccount?.address
          )?.option
        }
        proposalTitle={poll.prompt}
        timeRemaining={getPollTimestamp(
          poll,
          poll.endsAt && poll.endsAt?.isBefore(moment().utc())
        )}
        totalVoteCount={poll.votes?.length}
        voteInformation={poll.options.map((option) => {
          return {
            label: option,
            value: option,
            voteCount: poll.votes.filter((v) => v.option === option).length,
          };
        })}
        incrementalVoteCast={1}
        isPreview={false}
        tooltipErrorMessage={
          app.user.activeAccount
            ? null
            : 'You must join this community to vote.'
        }
        onVoteCast={(option, isSelected) => {
          handlePollVote(poll, option, isSelected, onVote);
        }}
        onResultsClick={(e) => {
          e.preventDefault();
          if (poll.votes.length > 0) {
            setIsModalOpen(true);
          }
        }}
      />
      <Modal
        content={
          <OffchainVotingModal
            votes={poll.votes}
            onModalClose={() => setIsModalOpen(false)}
          />
        }
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
      />
    </>
  );
};
