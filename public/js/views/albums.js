import {
  GRID_GUTTER,
  CONTROLS_HEIGHT,
  COVER_WIDTH,
  COVER_HEIGHT,
} from '../constants.js';
import albumsGroupView from './albumsGroup.js';

export default function albumsView(vnode, albumGroup = null) {
  const albums = albumGroup
    ? [closeAlbumGroupAlbum(vnode)].concat(albumGroup.albums)
    : _.get(vnode.state, 'library.albums', []);
  const groups = [];
  const coversWidth = Math.floor(window.innerWidth / (COVER_WIDTH + GRID_GUTTER));
  const coversHeight = Math.floor((window.innerHeight - CONTROLS_HEIGHT) / (COVER_HEIGHT + GRID_GUTTER));
  const groupSize = (coversWidth * coversHeight);
  const numGroups = Math.ceil(albums.length / groupSize);
  const groupWidth = coversWidth * (COVER_WIDTH + GRID_GUTTER);

  for(let groupNum = 0; groupNum < numGroups; groupNum++) {
    groups.push(albums.slice(groupNum * groupSize, (groupNum * groupSize) + groupSize));
  }
  return m('section.albums', groups.map(_.partial(albumsGroupView, vnode, groupWidth)));
}

function closeAlbumGroupAlbum(vnode) {
  return {
    title: null,
    onclick: vnode.state.closeAlbumGroup,
    cover: './images/back_icon.png'
  };
}
