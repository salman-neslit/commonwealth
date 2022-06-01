/* @jsx m */

import 'pages/projects/project_card.scss';

import m from 'mithril';
import _ from 'lodash';
import { slugify } from 'utils';
import { CWText } from 'views/components/component_kit/cw_text';
import { AnonymousUser } from 'views/components/widgets/user';
import { Project } from 'models';
import { Tag } from 'construct-ui';
import { CWIcon } from 'views/components/component_kit/cw_icons/cw_icon';
import { weiToTokens } from 'helpers';
import BN from 'bn.js';
import app from 'state';
import moment from 'moment';

enum ProjectRole {
  Curator = 'curator',
  Backer = 'backer',
  Author = 'author',
}

class DummyChainIcon
  implements m.ClassComponent<{ chain; onclick; size: number }>
{
  view(vnode) {
    const iconUrl = 'https://commonwealth.im/static/img/protocols/edg.png';
    const size = vnode.attrs.size;
    return (
      <div class="DummyChainIcon">
        <img
          class="chain-icon"
          style={`width: ${size}px; height: ${size}px;`}
          src={iconUrl}
          onclick={onclick}
        />
      </div>
    );
  }
}

class ProjectHeaderPanel
  implements
    m.ClassComponent<{
      iconSize?: number;
      coverImage: string;
      userRole?: ProjectRole;
      supportAmount?: BN;
    }>
{
  view(vnode) {
    const iconSize = vnode.attrs.iconSize || 32;
    const { coverImage, userRole, supportAmount } = vnode.attrs;
    const isSupporter = userRole !== ProjectRole.Author;
    return (
      <div
        class="ProjectHeaderPanel"
        style={`background-image: url("${coverImage}");`}
      >
        {userRole && (
          <div class={`user-role-banner ${userRole}`}>
            <div class="banner-left">
              <CWText type="caption" fontWeight="uppercase">
                {_.capitalize(userRole)}
              </CWText>
              {isSupporter && (
                <CWIcon iconName={userRole} iconSize="small"></CWIcon>
              )}
            </div>
            <div class="banner-right">
              <CWText type="caption" fontWeight="uppercase">
                {' '}
                {weiToTokens(supportAmount.toString(), 18)} ETH
              </CWText>
            </div>
          </div>
        )}
        {iconSize && (
          <DummyChainIcon chain={null} onclick={null} size={iconSize} />
        )}
      </div>
    );
  }
}

export class ProjectCompletionBar
  implements
    m.ClassComponent<{
      completionPercent: number;
      projectStatus?: 'succeeded' | 'failed';
    }>
{
  view(vnode) {
    const { completionPercent, projectStatus } = vnode.attrs;
    return (
      <div class="ProjectCompletionBar">
        <div
          class={`completed-percentage ${projectStatus}`}
          style={`width: ${completionPercent * 400}px`}
        />
      </div>
    );
  }
}

interface ProjectInfoAttrs {
  project: Project;
  avatarSize: number;
}
class ProjectInfoPanel implements m.ClassComponent<ProjectInfoAttrs> {
  view(vnode: m.Vnode<ProjectInfoAttrs>) {
    const { project, avatarSize } = vnode.attrs;

    return (
      <div class="ProjectInfoPanel">
        <div class="funding-data">
          <Tag
            intent="none"
            label={
              <>
                <CWIcon iconName="clock" iconSize="small" />
                <CWText type="caption" fontWeight="medium">
                  <div class="project-deadline">
                    {`${project.deadline.fromNow(true)}`}
                  </div>
                </CWText>
              </>
            }
          />
          <div class="funding-state">
            <CWText type="h5" fontWeight="bold">
              {weiToTokens(project.fundingAmount.toString(), 18)} ETH
            </CWText>
            <CWText type="h5">
              of {weiToTokens(project.threshold.toString(), 18)} ETH
            </CWText>
          </div>
        </div>
        <div class="description">
          <CWText type="h5">{project.title}</CWText>
          <CWText type="caption">
            {project.shortDescription || project.description}
          </CWText>
        </div>
        <div class="beneficiary-data">
          {m(AnonymousUser, {
            avatarSize,
            distinguishingKey: '123',
          })}
        </div>
      </div>
    );
  }
}

export enum ProjectCardSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

interface ProjectCardAttrs {
  project: Project;
  size: ProjectCardSize;
}

export default class ProjectCard implements m.ClassComponent<ProjectCardAttrs> {
  view(vnode: m.Vnode<ProjectCardAttrs>) {
    const { project, size } = vnode.attrs;

    const projectStatus = project.deadline.isBefore(moment())
      ? project.fundingAmount.gt(project.threshold)
        ? 'succeeded'
        : 'failed'
      : null;

    const onclick = () => {
      console.log(`project/${project.id}-${slugify(project.title)}`);
      m.route.set(`project/${project.id}-${slugify(project.title)}`);
    };

    // const ProjectCardMedium = (
    //   <div class="ProjectCard medium" onclick={onclick}>
    //     <ProjectHeaderPanel />
    //     <ProjectCompletionBar completionPercent={project.completionPercent} />
    //     <ProjectInfoPanel project={project} avatarSize={16} iconSize={24} />
    //   </div>
    // );

    // const ProjectCardSmall = (
    //   <div class="ProjectCard small" onclick={onclick}>
    //     <div class="top-panel">
    //       <CWText type="h3">{project.title}</CWText>
    //       {/* TODO: Implement label in kit */}
    //     </div>
    //     <div class={`.project-status.${projectStatus}`}>
    //       {capitalize(projectStatus)}
    //     </div>
    //     <div class="bottom-panel">
    //       <DummyChainIcon chain={null} onclick={null} size={12} />
    //       <div class="project-token-name">{project.token}</div>
    //     </div>
    //   </div>
    // );

    const { activeAccount } = app.user;
    let userRole: ProjectRole;
    let supportAmount: BN;
    if (activeAccount) {
      const addressInfo: [string, string] = [
        activeAccount.address,
        activeAccount.chain.id,
      ];
      userRole = project.isAuthor(...addressInfo)
        ? ProjectRole.Author
        : project.isCurator(...addressInfo)
        ? ProjectRole.Curator
        : project.isBacker(...addressInfo)
        ? ProjectRole.Backer
        : null;
      supportAmount =
        userRole === ProjectRole.Curator
          ? project.getCuratedAmount(...addressInfo)
          : userRole === ProjectRole.Backer
          ? project.getBackedAmount(...addressInfo)
          : null;
    }

    return (
      <div class="ProjectCard large" onclick={onclick}>
        <ProjectHeaderPanel
          iconSize={32}
          coverImage={project.coverImage}
          userRole={userRole}
          supportAmount={supportAmount}
          projectStatus={projectStatus}
        />
        <ProjectCompletionBar completionPercent={project.completionPercent} />
        <ProjectInfoPanel project={project} avatarSize={16} />
      </div>
    );
  }
}
