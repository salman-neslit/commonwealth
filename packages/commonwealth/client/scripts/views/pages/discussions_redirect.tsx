/* @jsx m */

import m from 'mithril';
import { ClassComponent, ResultNode, render, setRoute, redraw } from 'mithrilInterop';

import app from 'state';
import { navigateToSubpage } from 'app';
import { PageLoading } from './loading';

class DiscussionsRedirect extends ClassComponent {
  view() {
    if (app.chain) {
      if (app.chain.meta.defaultOverview) {
        navigateToSubpage('/overview');
      } else {
        navigateToSubpage('/discussions');
      }
    } else {
      return <PageLoading />;
    }
  }
}

export default DiscussionsRedirect;
