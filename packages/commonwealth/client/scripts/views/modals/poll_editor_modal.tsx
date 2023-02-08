/* @jsx m */

import ClassComponent from 'class_component';
import { SelectList } from 'construct-ui';
import { notifyError, notifySuccess } from 'controllers/app/notifications';
import { pluralize } from 'helpers';
import $ from 'jquery';
import m from 'mithril';

import 'modals/poll_editor_modal.scss';
import type { Thread } from 'models';
import moment from 'moment';
import app from 'state';
import _ from 'underscore';

import { getNextPollEndingTime } from 'utils';
import { CWButton } from '../components/component_kit/cw_button';
import { CWCheckbox } from '../components/component_kit/cw_checkbox';
import { CWLabel } from '../components/component_kit/cw_label';
import { ModalExitButton } from '../components/component_kit/cw_modal';
import { CWText } from '../components/component_kit/cw_text';
import { CWTextInput } from '../components/component_kit/cw_text_input';

type PollEditorAttrs = {
  thread: Thread;
};

const getPollDurationCopy = (
  customDuration: string,
  customDurationEnabled: boolean
) => {
  if (customDurationEnabled && customDuration === 'Infinite') {
    return 'This poll will never expire.';
  } else if (customDurationEnabled && customDuration !== 'Infinite') {
    return `If started now, this poll will stay open until ${moment()
      .add(customDuration.split(' ')[0], 'days')
      .local()
      .format('lll')}.`;
  } else {
    return `By default, polls run for at least 5 days, ending on the 1st
        and 15th of each month. If started now, this poll would stay open until
        ${getNextPollEndingTime(moment()).local().format('lll')}. Override?`;
  }
};

export class PollEditorModal extends ClassComponent<PollEditorAttrs> {
  private customDuration: string;
  private customDurationEnabled: boolean;
  private options: Array<string>;
  private prompt: string;

  view(vnode: m.Vnode<PollEditorAttrs>) {
    const { thread } = vnode.attrs;
    const { customDurationEnabled, customDuration } = this;

    // reset options when initializing
    if (!this.options || this.options.length === 0) {
      this.options = ['', ''];
    }

    return (
      <div class="PollEditorModal">
        <div class="compact-modal-title">
          <h3>Create Poll</h3>
          <ModalExitButton />
        </div>
        <div class="compact-modal-body">
          <CWTextInput
            label="Question"
            placeholder="Do you support this proposal?"
            defaultValue={this.prompt}
            oninput={(e) => {
              this.prompt = (e.target as HTMLInputElement).value;
            }}
          />
          <div class="options-and-label-container">
            <CWLabel label="Options" />
            <div class="options-container">
              {this.options?.map((_choice: string, index: number) => (
                <CWTextInput
                  placeholder={`${index + 1}.`}
                  defaultValue={this.options[index]}
                  oninput={(e) => {
                    this.options[index] = (e.target as HTMLInputElement).value;
                  }}
                />
              ))}
            </div>
            <div class="buttons-row">
              <CWButton
                label="Remove choice"
                buttonType="secondary-red"
                disabled={this.options.length <= 2}
                onclick={() => {
                  this.options.pop();
                }}
              />
              <CWButton
                label="Add choice"
                disabled={this.options.length >= 6}
                onclick={() => {
                  this.options.push('');
                }}
              />
            </div>
          </div>
          <div class="duration-row">
            <CWText type="caption" className="poll-duration-text">
              {getPollDurationCopy(customDuration, customDurationEnabled)}
            </CWText>
            <div class="duration-row-actions">
              <CWCheckbox
                label="Custom duration"
                checked={this.customDurationEnabled}
                onchange={() => {
                  this.customDurationEnabled = !this.customDurationEnabled;
                  this.customDuration = 'Infinite';
                }}
                value=""
              />
              {m(SelectList, {
                filterable: false,
                items: ['Infinite'].concat(
                  _.range(1, 31).map((n) => pluralize(Number(n), 'day'))
                ),
                itemRender: (n) => <div class="duration-item">{n}</div>,
                onSelect: (e) => {
                  this.customDuration = e as string;
                },
                trigger: (
                  <CWButton
                    disabled={!customDurationEnabled}
                    iconLeft="chevronDown"
                    label={this.customDuration || 'Infinite'}
                  />
                ),
              })}
            </div>
          </div>
          <div class="buttons-row">
            <CWButton
              label="Cancel"
              buttonType="secondary-blue"
              onclick={(e) => {
                $(e.target).trigger('modalexit');
              }}
            />
            <CWButton
              label="Save changes"
              onclick={async (e) => {
                if (!this.prompt) {
                  notifyError('Must set poll prompt');
                  return;
                }

                if (
                  !this.options?.length ||
                  !this.options[0]?.length ||
                  !this.options[1]?.length
                ) {
                  notifyError('Must set poll options');
                  return;
                }

                if (this.options.length !== [...new Set(this.options)].length) {
                  notifyError('Poll options must be unique');
                  return;
                }

                try {
                  await app.polls.setPolling({
                    threadId: thread.id,
                    prompt: this.prompt,
                    options: this.options,
                    customDuration: this.customDuration,
                    address: app.user.activeAddressAccount.address,
                    authorChain: app.user.activeAddressAccount.chain.id,
                  });
                  notifySuccess('Poll creation succeeded');
                } catch (err) {
                  console.error(err);
                }

                $(e.target).trigger('modalexit');
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}
