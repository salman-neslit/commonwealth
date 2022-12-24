/* @jsx jsx */


import { ClassComponent, ResultNode, render, setRoute, getRoute, getRouteParam, redraw, Component, jsx } from 'mithrilInterop';

import 'modals/preview_modal.scss';

import { QuillFormattedText } from 'views/components/quill/quill_formatted_text';
import { MarkdownFormattedText } from 'views/components/quill/markdown_formatted_text';
import { ModalExitButton } from 'views/components/component_kit/cw_modal';
import { CWText } from '../components/component_kit/cw_text';

class PreviewModalEmptyState extends ClassComponent {
  view() {
    return (
      <div className="empty-state-container">
        <CWText type="h5" fontWeight="semiBold" class="empty-text">
          Nothing to preview
        </CWText>
      </div>
    );
  }
}

type PreviewModalAttrs = {
  doc: string;
  title: string;
};

export class PreviewModal extends ClassComponent<PreviewModalAttrs> {
  view(vnode: ResultNode<PreviewModalAttrs>) {
    const { title } = vnode.attrs;

    return (
      <div className="PreviewModal">
        <div className="compact-modal-title">
          <h3>{title ? `Preview: ${title}` : 'Preview'}</h3>
          <ModalExitButton />
        </div>
        <div className="compact-modal-body">
          {(() => {
            try {
              const doc = JSON.parse(vnode.attrs.doc);
              if (!doc.ops) throw new Error();
              if (doc.ops.length === 1 && doc.ops[0].insert === '\n') {
                return <PreviewModalEmptyState />;
              }
              return render(QuillFormattedText, { doc });
            } catch (e) {
              if (vnode.attrs.doc.trim() === '') {
                return <PreviewModalEmptyState />;
              }
              return <MarkdownFormattedText doc={vnode.attrs.doc} />;
            }
          })()}
        </div>
      </div>
    );
  }
}
