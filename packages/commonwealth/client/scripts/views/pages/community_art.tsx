/* @jsx m */

import m from 'mithril';
import ClassComponent from 'class_component';
import app from 'state';
import $ from 'jquery';
import { BreadcrumbsTitleTag } from '../components/breadcrumbs_title_tag';
import { CWTextInput } from '../components/component_kit/cw_text_input';
import Sublayout from '../sublayout';
import { PageLoading } from './loading';
import { CWButton } from '../components/component_kit/cw_button';

class CommunityArtPage extends ClassComponent {
  private imageUrl: string;
  private rawImg: string;

  oninit() {
    this.imageUrl = '';
    this.rawImg = '';
  }

  view() {
    if (!app.chain) {
      return (
        <PageLoading
          message="Connecting to chain"
          title={<BreadcrumbsTitleTag title="Community Art" />}
        />
      );
    }

    return (
      <Sublayout>
        <div class="CommunityArtPage">
          <CWTextInput />
          <CWButton
            label="generate"
            onclick={async () => {
              console.log('Okay..');
              try {
                const res = await $.post(`${app.serverUrl()}/generateImage`, {
                  description: 'A guy standing up on a mountain',
                  jwt: app.user.jwt,
                });
                console.log('The res', res);

                // this.rawImg = URL.createObjectURL(res.result.raw);
                this.imageUrl = res.result.imageUrl;
                m.redraw();
              } catch (e) {
                console.log(e);
              }
            }}
          />
          <div
            style={`background-image: url(${this.imageUrl}); height: 500px;`}
          ></div>
          <img src={this.rawImg} style={'height: 500px;'}></img>
        </div>
      </Sublayout>
    );
  }
}

export default CommunityArtPage;
