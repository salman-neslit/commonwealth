/* @jsx m */
import app from 'state';
import _ from 'lodash';
import m from 'mithril';

import { Account, ChainInfo } from 'models';
import { setActiveAccount } from 'controllers/app/login';
import CWCoverImageUploader from '../../../components/component_kit/cw_cover_image_uploader';
import { CWDropdown } from '../../../components/component_kit/cw_dropdown';
import { CWText } from '../../../components/component_kit/cw_text';
import { CWTextArea } from '../../../components/component_kit/cw_text_area';
import { CWTextInput } from '../../../components/component_kit/cw_text_input';
import {
  getAllEthChains,
  getUserEthChains,
  validateProjectForm,
} from '../helpers';
import { ICreateProjectForm } from '../types';
import { DefaultMenuItem } from '../../../components/component_kit/types';

export class InformationSlide
  implements m.ClassComponent<{ form: ICreateProjectForm }>
{
  view(vnode: m.Vnode<{ form: ICreateProjectForm }>) {
    if (!app) return;
    if (vnode.attrs.form.chainId !== app.activeChainId()) {
      vnode.attrs.form.chainId = app.activeChainId();
    }

    const chainAccounts = app.user.activeAccounts;
    if (!vnode.attrs.form.creator) {
      vnode.attrs.form.creator = chainAccounts[0].address;
    }

    const userEthChains = getUserEthChains(app);
    const allEthChains = getAllEthChains(app).sort((a, b) => {
      if (userEthChains.includes(a) && !userEthChains.includes(b)) return -1;
      if (userEthChains.includes(b) && !userEthChains.includes(a)) return 1;
      else return 0;
    });
    const defaultChainIdx = userEthChains
      .concat(allEthChains)
      .findIndex((c) => c.id === app.activeChainId());

    return (
      <form class="InformationSlide">
        <CWText type="h1">General Information</CWText>
        <CWText type="caption">
          Name your crowdfund, add a brief card description and upload a header
          image.
        </CWText>
        <CWTextInput
          value={vnode.attrs.form.title}
          inputValidationFn={(val: string) => validateProjectForm('title', val)}
          label="Name Your Crowdfund"
          oninput={(e) => {
            vnode.attrs.form.title = e.target.value;
          }}
          name="Name"
          placeholder="Your Project Name Here"
          required
        />
        <CWDropdown
          inputOptions={
            allEthChains.map((chain: ChainInfo) => {
              const disabled = !userEthChains.includes(chain);
              return { label: chain.name, disabled };
            }) as DefaultMenuItem[]
          }
          defaultActiveIndex={defaultChainIdx}
          label="Chain"
          onSelect={(label: string) => {
            const chain: ChainInfo = app.config.chains
              .getAll()
              .find((c: ChainInfo) => c.name === label);
            if (chain) {
              m.route.set(`/${chain.id}/new/project`);
            }
          }}
          uniqueId="chain-selector"
        />
        <CWDropdown
          inputOptions={
            chainAccounts.map((acc: Account) => {
              return { label: acc.address };
            }) as DefaultMenuItem[]
          }
          label="Creator address"
          onSelect={(label: string) => {
            const selectedAccount = chainAccounts.find(
              (a) => a.address === label
            );
            setActiveAccount(selectedAccount);
            vnode.attrs.form.creator === selectedAccount.address;
          }}
          uniqueId="creator-address-selector"
        />
        <CWTextArea
          placeholder="Write a short 2 or 3 sentence description of your project"
          label="Short Description"
          name="Short Description"
          oninput={(e) => {
            vnode.attrs.form.shortDescription = e.target.value;
          }}
          inputValidationFn={(val: string) =>
            validateProjectForm('shortDescription', val)
          }
          required
          value={vnode.attrs.form.shortDescription}
        />
        <CWCoverImageUploader
          defaultBackground={vnode.attrs.form.coverImage}
          headerText="Cover Image"
          subheaderText="Use an image that helps people connect with your crowdfund right away"
          uploadCompleteCallback={(imageURL: string) => {
            vnode.attrs.form.coverImage = imageURL;
          }}
        />
      </form>
    );
  }
}
