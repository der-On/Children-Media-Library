import {
  albumColor,
} from './../utils.js';
import audioView from './audio.js';
import albumsView from './albums.js';
import albumGroupsView from './albumGroups.js';
import controlsView from './controls.js';
import fullscreenAlbumCoverView from './fullscreenAlbumCover.js';
import headerView from './header.js';
import screenSaverView from './screenSaver.js';

export default function appView(vnode) {
  const screenSaverIsActive = vnode.state.screenSaverIsActive;
  const isShuttingDown = vnode.state.isShuttingDown;

  const albumGroup = vnode.state.getAlbumGroupById(vnode.state.store.get('openedAlbumGroup'));
  const album = vnode.state.getAlbumById(vnode.state.store.get('selectedAlbum'));
  let color = null;
  
  if (albumGroup) {
    color = albumColor(albumGroup);
  } else if (album) {
    color = albumColor(album);
  }
  return m('main.main', {
    class: (screenSaverIsActive || isShuttingDown) ? 'has-screen-saver' : '',
    onmousedown: vnode.state.handleMouseDown,
    onmousemove: vnode.state.handleUserInput,
    ontouchstart: vnode.state.handleTouchStart,
    onclick: vnode.state.handleUserInput,
    onkeydown: vnode.state.handleUserInput,
    onmousewheel: vnode.state.handleUserInput,
    style: color ? `background-color: ${color};` : null
  }, [
    audioView(vnode),
    albumGroup
    ? albumsView(vnode, albumGroup)
    : albumGroupsView(vnode),
    controlsView(vnode),
    fullscreenAlbumCoverView(vnode),
    headerView(vnode),
    screenSaverView(vnode)
  ]);
}
