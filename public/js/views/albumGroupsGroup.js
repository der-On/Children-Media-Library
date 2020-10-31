import albumGroupView from './albumGroup.js';

export default function albumGroupsGroupView(vnode, width, albumGroups, index) {
  return m('.albums__group', {
    key: index,
    style: `width: ${width}px;`,
  }, albumGroups.map(_.partial(albumGroupView, vnode)));
}
