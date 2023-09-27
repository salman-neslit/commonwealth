import React from 'react';
import { BravoVote } from '../../../../controllers/chain/ethereum/compound/proposal';
import {
  BaseCompoundVotingResultProps,
  BaseVotingResultProps,
} from './BaseVotingResultTypes';
import { VotingResult } from './VotingResult';

export const CompoundYesNoResult = ({
  votes,
  proposal,
}: BaseCompoundVotingResultProps) => {
  return (
    <VotingResult
      abstainVotes={votes.filter((v) => v.choice === BravoVote.ABSTAIN)}
      yesVotes={votes.filter((v) => v.choice === BravoVote.YES)}
      noVotes={votes.filter((v) => v.choice === BravoVote.NO)}
      proposal={proposal}
    />
  );
};