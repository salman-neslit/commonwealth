import $ from 'jquery';
import React from 'react';


import app from 'state';
import { User } from 'views/components/user/user';
import AddressInfo from '../../../models/AddressInfo';
import type ChainInfo from '../../../models/ChainInfo';
import type CommentModel from '../../../models/CommentModel';
import Thread from '../../../models/Thread';
import { CWText } from '../component_kit/cw_text';

const MAX_VISIBLE_REACTING_ACCOUNTS = 10;

type ReactorProps = {
  reactors: string[];
};

type Post = Thread | CommentModel<any>;

export const getDisplayedReactorsForPopup = ({
  reactors = [],
}: ReactorProps) => {
  const slicedReactors = reactors
    .slice(0, MAX_VISIBLE_REACTING_ACCOUNTS)
    .map((rxn) => {
      return (
        <div
          key={rxn + '#' + (app.chain?.id || app.chain)}
          style={{ display: 'flex', width: '120px' }}
        >
          <CWText noWrap>
            <User
              user={new AddressInfo(null, rxn, app.chain.id, null)}
              linkify
            />
          </CWText>
        </div>
      );
    });

  if (slicedReactors.length > MAX_VISIBLE_REACTING_ACCOUNTS) {
    const diff = slicedReactors.length - MAX_VISIBLE_REACTING_ACCOUNTS;

    slicedReactors.push(<CWText key="final">{`and ${diff} more`}</CWText>);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {slicedReactors}
    </div>
  );
};

export const fetchReactionsByPost = async (post: Post) => {
  let thread_id, proposal_id, comment_id;

  if (post instanceof Thread) {
    thread_id = (post as Thread).id;
  } else {
    comment_id = (post as CommentModel<any>).id;
  }

  const { result = [] } = await $.get(`${app.serverUrl()}/bulkReactions`, {
    thread_id,
    comment_id,
    proposal_id,
  });

  return result;
};

export const onReactionClick = (
  e: React.MouseEvent<HTMLDivElement>,
  hasReacted: boolean,
  dislike: (userAddress: string) => void,
  like: (chain: ChainInfo, chainId: string, userAddress: string) => void
) => {
  const { address: userAddress, chain } = app.user.activeAccount;

  // if it's a community use the app.user.activeAccount.chain.id instead of author chain
  const chainId = app.activeChainId();

  if (hasReacted) {
    dislike(userAddress);
  } else {
    like(chain, chainId, userAddress);
  }
};
