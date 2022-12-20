import m from 'mithril';
import { ClassComponent, ResultNode, render, setRoute, redraw } from 'mithrilInterop';

const GeometricPatternSection: m.Component<{}, {}> = {
  view: (vnode) => {
    return render(
      'section',
      {
        class:
          'bg-geometric-pattern bg-cover bg-full pt-20 pb-5 relative h-1/4',
      },
      vnode.children
    );
  },
};

export default GeometricPatternSection;
