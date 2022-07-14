import coverView from './cover.js';

function isInView(vnode, width, index) {
  if (!vnode.state.coversEl) {
    return true;
  }
  const scrollLeft = vnode.state.coversEl.scrollLeft;
  const left = width * index;
  const right = left + width;
  const viewWidth = window.innerWidth;
  
  return !(
    left > scrollLeft + viewWidth ||
    right < scrollLeft
  );
}

export default function coversGroupView(vnode, width, items, index) {
  return m('.covers__group', {
    key: index,
    style: `width: ${width}px;`,
  }, isInView(vnode, width, index) ? items.map(_.partial(coverView, vnode)) : null);
}
