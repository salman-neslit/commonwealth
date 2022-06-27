/* @jsx m */
import 'pages/projects/create_project_form.scss';

import m from 'mithril';

import app from 'state';
import QuillEditor from 'views/components/quill_editor';
import { CWText } from 'views/components/component_kit/cw_text';
import { CWTextInput } from 'views/components/component_kit/cw_text_input';
import { ButtonGroup, Button, SelectList, Icons } from 'construct-ui';
import { CWIcon } from 'views/components/component_kit/cw_icons/cw_icon';
import { notifyError } from 'controllers/app/notifications';
import { CWTextArea } from 'views/components/component_kit/cw_text_area';
import Sublayout from 'views/sublayout';
import { ChainBase } from 'shared/types';
import CoverImageUpload from './cover_image_upload';
import {
  validateTitle,
  validateShortDescription,
  validateDescription,
  validateToken,
  validateBeneficiary,
  validateCreator,
  validateFundraiseLength,
  validateCuratorFee,
  validateThreshold,
} from './helpers';

const weekInSeconds = 604800;
const nowInSeconds = new Date().getTime() / 1000;

type TokenOption = {
  name: string;
  address: string;
};

export interface ICreateProjectForm {
  // Descriptive
  title: string;
  description: any;
  shortDescription: string;
  coverImage: string;
  chainId: string;

  // Mechanical
  token: string;
  creator: string;
  beneficiary: string;
  threshold: number;
  fundraiseLength: number;
  deadline: number;
  curatorFee: number;
}

export class InformationSlide
  implements m.ClassComponent<{ form: ICreateProjectForm }>
{
  view(vnode: m.Vnode<{ form: ICreateProjectForm }>) {
    return (
      <div class="InformationSlide">
        <CWText type="h1">General Information</CWText>
        <CWText type="caption">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. iaculis donec
          sapien maecenas vel nisl faucibus ultricies.
        </CWText>
        <CWTextInput
          placeholder="Your Project Name Here"
          label="Name Your Crowdfund"
          name="Name"
          oninput={(e) => {
            console.log(e);
            vnode.attrs.form.title = e.target.value;
          }}
          inputValidationFn={(value: string) => {
            const isValid = validateTitle(value);
            if (!isValid) {
              return [
                'failure',
                `Name must be between 8-64 characters. Current count: ${value.length}`,
              ];
            }
            return ['success', ''];
          }}
        />
        <CWTextInput
          defaultValue={app.user.activeAccount.address}
          disabled={true}
          label="Creator Address (Switch active address to change)"
          name="Creator Address"
        />
        <CWTextArea
          placeholder="Write a short 2 or 3 sentence description of your project,"
          label="Short Description"
          name="Short Description"
          oninput={(e) => {
            vnode.attrs.form.shortDescription = e.target.value;
          }}
          inputValidationFn={(value: string) => {
            const isValid = validateShortDescription(value);
            if (!isValid) {
              return [
                'failure',
                `Input limit is 224 characters. Current count: ${value.length}`,
              ];
            }
            return ['success', ''];
          }}
        />
        <CoverImageUpload
          uploadStartedCallback={() => {
            m.redraw();
          }}
          uploadCompleteCallback={(files) => {
            files.forEach((f) => {
              if (!f.uploadURL) return;
              const url = f.uploadURL.replace(/\?.*/, '');
              vnode.attrs.form.coverImage = url.trim();
            });
            m.redraw();
          }}
        />
      </div>
    );
  }
}

export class FundraisingSlide
  implements m.ClassComponent<{ form: ICreateProjectForm }>
{
  private tokenName = 'WETH';

  view(vnode: m.Vnode<{ form: ICreateProjectForm }>) {
    return (
      <div class="FundraisingSlide">
        <CWText type="h1">Fundraising and Length</CWText>
        <CWText type="caption">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. iaculis donec
          sapien maecenas vel nisl faucibus ultricies.
        </CWText>
        <SelectList
          items={[
            {
              name: 'WETH',
              address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            },
            {
              name: 'DAI',
              address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            },
            {
              name: 'USDC',
              address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            },
            {
              name: 'RAI',
              address: '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919',
            },
          ]}
          itemRender={(token: TokenOption) => {
            return (
              <div value={token.address} style="cursor: pointer">
                <CWText type="body1">{token.name}</CWText>
              </div>
            );
          }}
          filterable={false}
          label="Raise In"
          name="Raise In"
          onSelect={(token: TokenOption) => {
            this.tokenName = token.name;
            vnode.attrs.form.token = token.address;
          }}
          style="width: 441px;"
          trigger={
            <Button
              align="left"
              compact={true}
              iconRight={Icons.CHEVRON_DOWN}
              style="width: 100%; margin: 16px 0;"
              label={`Raise token: ${this.tokenName}`}
            />
          }
        />
        <SelectList
          items={['1 week', '2 weeks', '3 weeks', '4 weeks']}
          itemRender={(i: string) => {
            console.log(i);
            return (
              <div value={i} style="cursor: pointer">
                <CWText type="body1">{i}</CWText>
              </div>
            );
          }}
          filterable={false}
          label="Fundraising Period"
          name="Fundraising Period"
          onSelect={(length: string) => {
            const lengthInSeconds = +length.split(' ')[0] * weekInSeconds;
            vnode.attrs.form.fundraiseLength = lengthInSeconds;
          }}
          style="width: 441px;"
          trigger={
            <Button
              align="left"
              compact={true}
              iconRight={Icons.CHEVRON_DOWN}
              style="width: 100%; margin: 16px 0;"
              label={`Fundraise period: ${
                vnode.attrs.form?.fundraiseLength / weekInSeconds
              } week`}
            />
          }
        />
        <CWTextInput
          placeholder="Address"
          label="Beneficiary Address"
          name="Beneficiary Address"
          inputValidationFn={(value: string) => {
            const isValid = validateBeneficiary(value);
            if (!isValid) {
              return ['failure', 'Invalid address'];
            }
            return ['success', ''];
          }}
          oninput={(e) => {
            vnode.attrs.form.beneficiary = e.target.value;
          }}
        />
        <CWTextInput
          placeholder="Set Quantity"
          label="Curator Fee (%)"
          name="Curator Fee"
          oninput={(e) => {
            // Convert to 10000 to capture decimal points
            vnode.attrs.form.curatorFee = Math.round(e.target.value * 100);
            console.log(vnode.attrs.form.curatorFee);
          }}
          inputValidationFn={(value: string) => {
            const isValidCuratorFee = validateCuratorFee(value);
            if (!isValidCuratorFee) {
              return [
                'failure',
                'Input must be valid percentage between 0 and 100',
              ];
            }
            return ['success', ''];
          }}
        />
      </div>
    );
  }
}

export class DescriptionSlide
  implements m.ClassComponent<{ form: ICreateProjectForm }>
{
  view(vnode: m.Vnode<{ form: ICreateProjectForm }>) {
    return (
      <div class="DescriptionSlide">
        <CWText type="h1">General Information</CWText>
        <CWText type="caption">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. iaculis donec
          sapien maecenas vel nisl faucibus ultricies.
        </CWText>
        {m(QuillEditor, {
          oncreateBind: (state) => {
            vnode.attrs.form.description = state.editor;
          },
          editorNamespace: 'project-description',
          disableRichText: true,
          placeholder:
            'Write a full-length description of your project proposal,',
        })}
      </div>
    );
  }
}

export default class CreateProjectForm implements m.ClassComponent {
  private form: ICreateProjectForm;
  private stage: 'information' | 'fundraising' | 'description';

  view() {
    // Create project form must be scoped to an Ethereum page
    if (
      !app?.user?.activeAccount ||
      !app.activeChainId() ||
      app.user.activeAccount.chainBase !== ChainBase.Ethereum
    ) {
      m.route.set(`/projects/explore`);
    }

    if (!this.stage) {
      this.stage = 'information';
    }
    if (!this.form) {
      this.form = {
        title: '',
        // WETH hard-coded as default raise token, but can be overwritten
        token: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        creator: app.user.activeAccount.address,
        beneficiary: '',
        description: '',
        shortDescription: '',
        coverImage: '',
        curatorFee: 0,
        threshold: 0,
        fundraiseLength: weekInSeconds,
        deadline: nowInSeconds + weekInSeconds,
        chainId: app.activeChainId(),
      };
    }
    return (
      <Sublayout
        title="Create project"
        hideSearch={true}
        hideSidebar={true}
        showNewProposalButton={false}
        alwaysShowTitle={true}
      >
        <div class="CreateProjectForm">
          <div class="form-panel">
            <CWText type="h5" weight="medium">
              Project Creation
            </CWText>
            {this.stage === 'information' && (
              <InformationSlide form={this.form} />
            )}
            {this.stage === 'fundraising' && (
              <FundraisingSlide form={this.form} />
            )}
            {this.stage === 'description' && (
              <DescriptionSlide form={this.form} />
            )}
          </div>
          {m(
            ButtonGroup,
            {
              class: 'NavigationButtons',
              outlined: true,
            },
            [
              m(Button, {
                disabled: this.stage === 'information',
                label: [
                  m(CWIcon, { iconName: 'arrowLeft' }),
                  m('span', 'Previous Page'),
                ],
                onclick: (e) => {
                  e.preventDefault();
                  if (this.stage === 'fundraising') {
                    this.stage = 'information';
                  } else if (this.stage === 'description') {
                    this.stage = 'fundraising';
                  }
                },
              }),
              this.stage !== 'description' &&
                m(Button, {
                  label: [
                    m('span', 'Next Page'),
                    m(CWIcon, { iconName: 'arrowRight' }),
                  ],
                  onclick: (e) => {
                    e.preventDefault();
                    if (this.stage === 'information') {
                      this.stage = 'fundraising';
                    } else if (this.stage === 'fundraising') {
                      this.stage = 'description';
                    }
                  },
                }),
              this.stage === 'description' &&
                m(Button, {
                  label: 'Submit',
                  onclick: async (e) => {
                    e.preventDefault();
                    const {
                      title,
                      shortDescription,
                      description,
                      coverImage,
                      token,
                      threshold,
                      creator,
                      beneficiary,
                      fundraiseLength,
                      curatorFee,
                    } = this.form;
                    const isValidTitle = validateTitle(title);
                    const isValidDescription = validateDescription(description);
                    const isValidShortDescription =
                      validateShortDescription(shortDescription);
                    const isValidCoverImage = coverImage?.length > 0;
                    const isValidToken = validateToken(token);
                    const isValidBeneficiary = validateBeneficiary(beneficiary);
                    const isValidCreator = validateCreator(creator);
                    const isValidFundraiseLength =
                      validateFundraiseLength(fundraiseLength);
                    const isValidCuratorFee = validateCuratorFee(curatorFee);
                    const isValidThreshold = validateThreshold(threshold);
                    if (
                      !isValidTitle ||
                      !isValidDescription ||
                      !isValidShortDescription ||
                      !isValidCoverImage ||
                      !isValidToken ||
                      !isValidBeneficiary ||
                      !isValidCreator ||
                      !isValidCuratorFee ||
                      !isValidFundraiseLength ||
                      !isValidThreshold
                    ) {
                      notifyError('Invalid form. Please check inputs.');
                    }
                    this.form.description = this.form.description.getText();
                    this.form.deadline = nowInSeconds + weekInSeconds;
                    const newProject = await app.projects.createProject(
                      this.form
                    );
                    m.route.set(`/project/${newProject.id}`);
                  },
                }),
            ]
          )}
        </div>
      </Sublayout>
    );
  }
}
