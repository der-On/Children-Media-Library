import {
  GRID_GUTTER,
  CONTROLS_HEIGHT,
  COVER_WIDTH,
  COVER_HEIGHT,
} from '../constants.js';
import albumGroupsGroupView from './albumGroupsGroup.js';

export default function albumGroupsView(vnode) {
  const albumGroups = _.get(vnode.state, 'library.groups', []);
  const groups = [];
  const coversWidth = Math.floor(window.innerWidth / (COVER_WIDTH + GRID_GUTTER));
  const coversHeight = Math.floor((window.innerHeight - CONTROLS_HEIGHT) / (COVER_HEIGHT + GRID_GUTTER));
  const groupSize = (coversWidth * coversHeight);
  const numGroups = Math.ceil(albumGroups.length / groupSize);
  const groupWidth = coversWidth * (COVER_WIDTH + GRID_GUTTER);

  for(let groupNum = 0; groupNum < numGroups; groupNum++) {
    groups.push(albumGroups.slice(groupNum * groupSize, (groupNum * groupSize) + groupSize));
  }
  return m('section.albums', groups.map(_.partial(albumGroupsGroupView, vnode, groupWidth)));
}
