import coverView from './cover.js';

export default function coversGroupView(vnode, width, items, index) {
  return m('.covers__group', {
    key: index,
    style: `width: ${width}px;`,
  }, items.map(_.partial(coverView, vnode)));
}
