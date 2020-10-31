import {
  albumColor,
} from './../utils.js';
import audioView from './audio.js';
import coversView from './covers.js';
import controlsView from './controls.js';
import fullscreenAlbumCoverView from './fullscreenAlbumCover.js';
import headerView from './header.js';
import screenSaverView from './screenSaver.js';

export default function appView(vnode) {
  const screenSaverIsActive = vnode.state.screenSaverIsActive;
  const isShuttingDown = vnode.state.isShuttingDown;

  const group = vnode.state.getGroupById(vnode.state.store.get('openedGroup'));
  const album = vnode.state.getAlbumById(vnode.state.store.get('selectedAlbum'));
  let color = null;
  
  if (group) {
    color = albumColor(group);
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
    coversView(vnode, group),
    controlsView(vnode),
    fullscreenAlbumCoverView(vnode),
    headerView(vnode),
    screenSaverView(vnode)
  ]);
}
