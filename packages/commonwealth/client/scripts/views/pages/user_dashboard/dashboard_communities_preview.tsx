/* @jsx jsx */


import { ClassComponent, ResultNode, render, setRoute, getRoute, getRouteParam, redraw, Component, jsx } from 'mithrilInterop';
import { Tag } from 'construct-ui';

import 'pages/user_dashboard/dashboard_communities_preview.scss';

import app from 'state';
import { ChainInfo } from 'models';
import { pluralize } from 'helpers';
import { CWCard } from '../../components/component_kit/cw_card';
import { CWCommunityAvatar } from '../../components/component_kit/cw_community_avatar';
import { CWText } from '../../components/component_kit/cw_text';
import { CWButton } from '../../components/component_kit/cw_button';

const getNewTag = (labelCount?: number) => {
  const label = !labelCount ? 'New' : `${labelCount} new`;

  return render(Tag, { label, size: 'xs', rounded: true, intent: 'primary' });
};

type CommunityPreviewCardAttrs = {
  chain: ChainInfo;
};

class CommunityPreviewCard extends ClassComponent<CommunityPreviewCardAttrs> {
  view(vnode: ResultNode<CommunityPreviewCardAttrs>) {
    const { chain } = vnode.attrs;
    const { unseenPosts } = app.user;
    const visitedChain = !!unseenPosts[chain.id];
    const updatedThreads = unseenPosts[chain.id]?.activePosts || 0;
    const monthlyThreadCount = app.recentActivity.getCommunityThreadCount(
      chain.id
    );
    const isMember = app.roles.isMember({
      account: app.user.activeAccount,
      chain: chain.id,
    });

    return (
      <CWCard
        class="CommunityPreviewCard"
        elevation="elevation-1"
        interactive
        onClick={(e) => {
          e.preventDefault();
          setRoute(`/${chain.id}`);
        }}
      >
        <div className="card-top">
          <CWCommunityAvatar community={chain} />
          <CWText type="h4" fontWeight="medium">
            {chain.name}
          </CWText>
        </div>
        <CWText class="card-subtext">{chain.description}</CWText>
        {/* if no recently active threads, hide this module altogether */}
        {!!monthlyThreadCount && (
          <>
            <CWText class="card-subtext" type="b2" fontWeight="medium">
              {`${pluralize(monthlyThreadCount, 'new thread')} this month`}
            </CWText>
            {isMember && (
              <>
                {app.isLoggedIn() && !visitedChain && getNewTag()}
                {updatedThreads > 0 && getNewTag(updatedThreads)}
              </>
            )}
          </>
        )}
      </CWCard>
    );
  }
}

export class DashboardCommunitiesPreview extends ClassComponent {
  view() {
    const sortedChains = app.config.chains
      .getAll()
      .sort((a, b) => {
        const threadCountA = app.recentActivity.getCommunityThreadCount(a.id);
        const threadCountB = app.recentActivity.getCommunityThreadCount(b.id);
        return threadCountB - threadCountA;
      })
      .map((chain) => {
        return <CommunityPreviewCard chain={chain} />;
      });

    return (
      <div className="DashboardCommunitiesPreview">
        <CWText type="h3">Active Communities</CWText>
        <div className="community-preview-cards-collection">
          {sortedChains.length > 3 ? sortedChains.slice(0, 3) : sortedChains}
        </div>
        <CWButton
          onClick={() => {
            setRoute('/communities');
            redraw();
          }}
          label="View more communities"
        />
      </div>
    );
  }
}
