import React from 'react';

// TODO: remove formatCoin, only use coins.format()
import { formatCoin } from 'adapters/currency';

import 'components/proposals/vote_listing.scss';
import { CosmosVote } from 'controllers/chain/cosmos/gov/v1beta1/proposal-v1beta1';
import type { IVote } from '../../../models/interfaces';
import type { AnyProposal } from '../../../models/types';
import { VotingUnit } from '../../../models/types';
import { BinaryVote, DepositVote } from '../../../models/votes';

import Account from '../../../models/Account';
import { User } from '../../components/user/user';
import { CWText } from '../component_kit/cw_text';

const getBalance = (vote: IVote<any>) => {
  let balancesCache = {};
  let balancesCacheInitialized = {};
  let balance;

  if (balancesCache[vote.account.address]) {
    balance = balancesCache[vote.account.address];
  } else if (balancesCacheInitialized[vote.account.address]) {
    // do nothing, fetch already in progress
    balance = '--';
  } else {
    // fetch balance and store in cache
    balancesCacheInitialized = { [vote.account.address]: true };
    vote.account.balance.then((b) => {
      balance = b;
      balancesCache = {
        [vote.account.address]: formatCoin(b, true),
      };
    });
    balance = '--';
  }

  return balance;
};

type VoteListingProps = {
  proposal: AnyProposal;
  votes: Array<IVote<any>>;
};

export const VoteListing = (props: VoteListingProps) => {
  const { proposal, votes } = props;

  const balanceWeighted =
    proposal.votingUnit === VotingUnit.CoinVote ||
    proposal.votingUnit === VotingUnit.ConvictionCoinVote ||
    proposal.votingUnit === VotingUnit.PowerVote;

  // TODO: show turnout if specific votes not found
  const sortedVotes = votes;
  const VoterInfo = ({
    voter,
    shouldShowPopover = true,
  }: {
    voter: Account;
    shouldShowPopover?: boolean;
  }) => {
    return (
      <User
        userAddress={voter?.address}
        // @ts-expect-error <StrictNullChecks/>
        userCommunityId={voter?.community?.id || voter?.profile?.chain}
        // @ts-expect-error <StrictNullChecks/>
        shouldShowAsDeleted={
          voter?.address && !(voter?.community?.id || voter?.profile?.chain)
        }
        shouldLinkProfile
        shouldShowPopover={shouldShowPopover}
      />
    );
  };

  return (
    <div className="VoteListing">
      {sortedVotes.length === 0 ? (
        <CWText className="no-votes">No votes</CWText>
      ) : (
        sortedVotes.map((vote, i) => {
          let balance;

          if (balanceWeighted && !(vote instanceof CosmosVote)) {
            // fetch and display balances
            balance = getBalance(vote);
          }

          switch (true) {
            case vote instanceof CosmosVote:
              return (
                <div className="vote" key={i}>
                  <VoterInfo voter={vote.account} />
                  {balanceWeighted && balance && <CWText>{balance}</CWText>}
                </div>
              );
            case vote instanceof BinaryVote:
              return (
                <div className="vote" key={i}>
                  <VoterInfo voter={vote.account} />
                  <div className="vote-right-container">
                    <CWText
                      noWrap
                      title={(vote as any).amount && (vote as any).amount}
                    >
                      {(vote as any).amount && (vote as any).amount}
                    </CWText>
                    <CWText
                      noWrap
                      title={(vote as any).weight && `${(vote as any).weight}x`}
                    >
                      {(vote as any).weight && `${(vote as any).weight}x`}
                    </CWText>
                  </div>
                </div>
              );

            case vote instanceof DepositVote:
              return (
                <div className="vote" key={i}>
                  <VoterInfo voter={vote.account} />
                  <CWText>
                    {formatCoin((vote as DepositVote<any>).deposit, true)}
                  </CWText>
                </div>
              );

            default:
              return (
                <div className="vote" key={i}>
                  <VoterInfo voter={vote.account} />
                </div>
              );
          }
        })
      )}
    </div>
  );
};
