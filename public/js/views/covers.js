import {
  GRID_GUTTER,
  CONTROLS_HEIGHT,
  COVER_WIDTH,
  COVER_HEIGHT,
} from '../constants.js';
import coversGroupView from './coversGroup.js';

export default function coversView(vnode, group = null) {
  const items = group
    ? [closeGroup(vnode, group)].concat(group.groups).concat(group.albums)
    : _.get(vnode.state, 'library.rootGroups', []).concat(_.get(vnode.state, 'library.rootAlbums', []));
  const groups = [];
  const groupsWidth = Math.floor(window.innerWidth / (COVER_WIDTH + GRID_GUTTER));
  const groupsHeight = Math.floor((window.innerHeight - CONTROLS_HEIGHT) / (COVER_HEIGHT + GRID_GUTTER));
  const groupSize = (groupsWidth * groupsHeight);
  const numGroups = Math.ceil(items.length / groupSize);
  const groupWidth = groupsWidth * (COVER_WIDTH + GRID_GUTTER);

  for(let groupNum = 0; groupNum < numGroups; groupNum++) {
    groups.push(items.slice(groupNum * groupSize, (groupNum * groupSize) + groupSize));
  }
  return m('section.covers', groups.map(_.partial(coversGroupView, vnode, groupWidth)));
}

function closeGroup(vnode, group) {
  const idParts = group.id.split('/');
  const hasParent = idParts.length > 1;
  return {
    title: null,
    onclick: () => {
      hasParent
      ? vnode.state.openGroup(idParts.slice(0, -1).join('/'))
      : vnode.state.closeGroup();
    },
    cover: './images/back_icon.png'
  };
}
