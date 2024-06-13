import { useFlag } from 'client/scripts/hooks/useFlag';
import { notifyInfo } from 'controllers/app/notifications';
import { useBrowserAnalyticsTrack } from 'hooks/useBrowserAnalyticsTrack';
import useBrowserWindow from 'hooks/useBrowserWindow';
import useStickyHeader from 'hooks/useStickyHeader';
import useUserLoggedIn from 'hooks/useUserLoggedIn';
import { useCommonNavigate } from 'navigation/helpers';
import 'pages/user_dashboard/index.scss';
import React, { useEffect } from 'react';
import app, { LoginState } from 'state';
import CWPageLayout from 'views/components/component_kit/new_designs/CWPageLayout';
import { MixpanelPageViewEvent } from '../../../../../shared/analytics/types';
import DashboardActivityNotification from '../../../models/DashboardActivityNotification';
import { CWText } from '../../components/component_kit/cw_text';
import {
  CWTab,
  CWTabsRow,
} from '../../components/component_kit/new_designs/CWTabs';
import { Feed } from '../../components/feed';
import { TrendingCommunitiesPreview } from './TrendingCommunitiesPreview';
import { fetchActivity } from './helpers';

export enum DashboardViews {
  ForYou = 'For You',
  Global = 'Global',
}

type UserDashboardProps = {
  type?: string;
};

const UserDashboard = (props: UserDashboardProps) => {
  const { type } = props;
  const { isLoggedIn } = useUserLoggedIn();
  const { isWindowExtraSmall } = useBrowserWindow({});
  const userOnboardingEnabled = useFlag('userOnboardingEnabled');
  useStickyHeader({
    elementId: 'dashboard-header',
    zIndex: 70,
    // To account for new authentication buttons, shown in small screen sizes
    top: !isLoggedIn && userOnboardingEnabled ? 68 : 0,
    stickyBehaviourEnabled: !!isWindowExtraSmall,
  });

  const [activePage, setActivePage] = React.useState<DashboardViews>(
    DashboardViews.Global,
  );

  useBrowserAnalyticsTrack({
    payload: {
      event: MixpanelPageViewEvent.DASHBOARD_VIEW,
    },
  });

  const navigate = useCommonNavigate();

  const [scrollElement, setScrollElement] = React.useState(null);

  const loggedIn = app.loginState === LoginState.LoggedIn;

  useEffect(() => {
    if (!type) {
      navigate(`/dashboard/${loggedIn ? 'for-you' : 'global'}`);
    } else if (type === 'for-you' && !loggedIn) {
      navigate('/dashboard/global');
    }
  }, [loggedIn, navigate, type]);

  const subpage: DashboardViews =
    type === 'global'
      ? DashboardViews.Global
      : loggedIn
      ? DashboardViews.ForYou
      : DashboardViews.Global;

  useEffect(() => {
    if (!activePage || activePage !== subpage) {
      setActivePage(subpage);
    }
  }, [activePage, subpage]);

  return (
    <CWPageLayout>
      <div className="UserDashboard" key={`${isLoggedIn}`}>
        <CWText type="h2" fontWeight="medium" className="page-header">
          Home
        </CWText>
        {/*@ts-expect-error StrictNullChecks*/}
        <div ref={setScrollElement} className="content">
          <div className="user-dashboard-activity">
            <div className="dashboard-header" id="dashboard-header">
              <CWTabsRow>
                <CWTab
                  label={DashboardViews.ForYou}
                  isSelected={activePage === DashboardViews.ForYou}
                  onClick={() => {
                    if (!loggedIn) {
                      notifyInfo(
                        'Sign in or create an account for custom activity feed',
                      );
                      return;
                    }
                    navigate('/dashboard/for-you');
                  }}
                />
                <CWTab
                  label={DashboardViews.Global}
                  isSelected={activePage === DashboardViews.Global}
                  onClick={() => {
                    navigate('/dashboard/global');
                  }}
                />
              </CWTabsRow>
            </div>
            <>
              {activePage === DashboardViews.ForYou && (
                <Feed
                  fetchData={() => fetchActivity(activePage)}
                  noFeedMessage="Join some communities to see Activity!"
                  onFetchedDataCallback={DashboardActivityNotification.fromJSON}
                  // @ts-expect-error <StrictNullChecks/>
                  customScrollParent={scrollElement}
                />
              )}
              {activePage === DashboardViews.Global && (
                <Feed
                  fetchData={() => fetchActivity(activePage)}
                  noFeedMessage="No Activity"
                  onFetchedDataCallback={DashboardActivityNotification.fromJSON}
                  // @ts-expect-error <StrictNullChecks/>
                  customScrollParent={scrollElement}
                />
              )}
            </>
          </div>
          <TrendingCommunitiesPreview />
        </div>
      </div>
    </CWPageLayout>
  );
};

export default UserDashboard;
