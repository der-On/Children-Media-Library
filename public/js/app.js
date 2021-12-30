import store from './store.js';
import {
  groupLibrary
} from './utils.js';
import {
  lazyLoad,
  lazyLoadDelayed,
} from './lazyLoad.js';
import {
  IDLE_DELAY,
  HEADER_DRAG_DOWN_DISTANCE,
  HEADER_NAV_ITEM_PRESS_DURATION,
  VOLUME_STEP,
} from './constants.js';
import appView from './views/app.js';

const app = {
  view: appView,
  oninit: (vnode) => {
    vnode.state.store = store();
    vnode.state.screenSaverIsActive = false;
    vnode.state.touches = {};
    vnode.state.draggingCurrentTime = -1;

    vnode.state.handleMouseDown = function (event) {
      vnode.state.handleUserInput(event);

      vnode.state.touches = {};
      vnode.state.touches[0] = {
        clientX: event.clientX,
        clientY: event.clientY
      };

      document.addEventListener('mousemove', vnode.state.handleMouseMove);
      document.addEventListener('mouseup', vnode.state.handleMouseUp);
    };

    vnode.state.handleMouseMove = function (event) {
      event.preventDefault();
      vnode.state.handleUserInput(event);
      const diffY = event.clientY - vnode.state.touches[0].clientY;

      vnode.state.handleHeaderDrag(diffY);
    };

    vnode.state.handleMouseUp = function (event) {
      vnode.state.handleUserInput(event);
      vnode.state.touches = {};
      document.removeEventListener('mousemove', vnode.state.handleMouseMove);
      document.removeEventListener('mouseup', vnode.state.handleMouseUp);
    };

    vnode.state.handleTouchStart = function (event) {
      vnode.state.handleUserInput(event);

      vnode.state.touches = {};
      const touch = event.changedTouches[0];
      vnode.state.touches[touch.identifier] = {
        clientX: touch.clientX,
        clientY: touch.clientY
      };

      document.addEventListener('touchmove', vnode.state.handleTouchMove);
      document.addEventListener('touchend', vnode.state.handleTouchEnd);
      document.addEventListener('touchcancel', vnode.state.handleTouchEnd);
    };

    vnode.state.handleTouchMove = function (event) {
      vnode.state.handleUserInput(event);

      const touch = event.changedTouches[0];
      const diffY = touch.clientY - vnode.state.touches[touch.identifier].clientY;

      vnode.state.handleHeaderDrag(diffY);
    };

    vnode.state.handleTouchEnd = function (event) {
      vnode.state.handleUserInput(event);

      vnode.state.touches = {};
      document.removeEventListener('touchmove', vnode.state.handleTouchMove);
      document.removeEventListener('touchend', vnode.state.handleTouchEnd);
      document.removeEventListener('touchcancel', vnode.state.handleTouchEnd);
    };

    vnode.state.handleHeaderDrag = function (y) {
      const windowHeight = window.innerHeight;
      const pos = y / windowHeight;

      if (vnode.state.headerIsVisible && pos < 0) {
        if (-pos >= HEADER_DRAG_DOWN_DISTANCE) {
          vnode.state.headerIsVisible = false;
          m.redraw();
        }
      } else if (pos >= HEADER_DRAG_DOWN_DISTANCE) {
        vnode.state.headerIsVisible = true;
        m.redraw();
      }
    };

    vnode.state.handleUserInput = function (event) {
      if (!vnode.state.screenSaverIsActive) {
        clearTimeout(vnode.state.idleTimeout);
        vnode.state.idleTimeout = setTimeout(vnode.state.startScreenSaver, IDLE_DELAY);
      }
    };

    vnode.state.handleHeaderNavItemPress = function (item, event) {
      event.preventDefault();
      vnode.state.pressedHeaderNavItem = {
        id: item.id,
        pressedAt: (new Date()).getTime()
      };
    };

    vnode.state.handleHeaderNavItemRelease = function (item, event) {
      event.preventDefault();
      const now = (new Date()).getTime();
      if (
        _.get(vnode.state.pressedHeaderNavItem, 'id') === item.id &&
        now - vnode.state.pressedHeaderNavItem.pressedAt >= HEADER_NAV_ITEM_PRESS_DURATION
      ) {
        item.action();
      }

      vnode.state.pressedHeaderNavItem = null;

      return false;
    };

    vnode.state.handleHeaderNavItemCancel = function (item, event) {
      event.preventDefault();
      vnode.state.pressedHeaderNavItem = null;

      return false;
    };

    vnode.state.handleScreenSaverClick = function () {
      if (vnode.state.isShuttingDown) {
        return false;
      }

      vnode.state.resetScreenSaver();
    };

    vnode.state.shutdown = function () {
      fetch('/shutdown', {
        method: 'POST'
      })
      .then((res) => {
        if (res.ok) {
          return res.text();
        } else {
          throw new Error('Error during shutdown');
        }
      })
      .then((text) => {
        vnode.state.isShuttingDown = true;
        m.redraw();
      })
      .catch((err) => {
        console.error(err);
      });
      m.redraw();
    };

    vnode.state.reload = function () {
      window.location.reload();
    };

    vnode.state.scanLibrary = function () {
      fetch('/scan', {
        method: 'POST'
      })
      .then((res) => {
        if (res.ok) {
          return res.text();
        } else {
          throw new Error('Error during scan.');
        }
      })
      .then(() => {
        vnode.state.loadLibrary();
      })
      .catch((err) => {
        console.error(err);
      });
      m.redraw();
    };

    vnode.state.startScreenSaver = function () {
      console.log('start screen saver');
      vnode.state.screenSaverIsActive = true;
      m.redraw();
    };

    vnode.state.stopScreenSaver = function () {
      console.log('stop screen saver');
      vnode.state.screenSaverIsActive = false;
      m.redraw();
    };

    vnode.state.resetScreenSaver = function () {
      vnode.state.stopScreenSaver();
      vnode.state.idleTimeout = setTimeout(vnode.state.startScreenSaver, IDLE_DELAY);
    };

    vnode.state.openGroup = function(groupId) {
      vnode.state.store.set('openedGroup', groupId);
      lazyLoadDelayed();
    };

    vnode.state.closeGroup = function() {
      vnode.state.store.set('openedGroup', null);
      lazyLoadDelayed();
    };

    vnode.state.selectAlbum = function(albumId) {
      console.log('selectAlbum', albumId);
      vnode.state.store.set({
        selectedAlbum: albumId,
        selectedAudioTrack: 0
      });
      lazyLoadDelayed();
    };

    vnode.state.openAlbumGallery = function(albumId) {
      console.log('openAlbumGallery', albumId);
      vnode.state.store.set({
        openedAlbumGallery: albumId,
        activeGalleyImage: 0
      });
    };

    vnode.state.closeAlbumGallery = function() {
      console.log('closeAlbumGallery');
      vnode.state.store.set({
        openedAlbumGallery: null,
        activeGalleyImage: 0
      });
    };

    vnode.state.setActiveGAlleryImage = function(index) {
      vnode.state.store.set({
        activeGalleyImage: index
      });
    };

    vnode.state.play = function(albumId) {
      console.log('play', albumId);
      const playingAlbumId = vnode.state.store.get('playingAlbum');

      vnode.state.store.set({
        selectedAlbum: albumId,
        playingAlbum: albumId,
        playingTrack: playingAlbumId !== albumId
          ? vnode.state.store.get('selectedAudioTrack', 0)
          : vnode.state.store.get('playingTrack', 0),
        playing: true,
      });
      m.redraw();

      vnode.state.audioElement.play();
    };

    vnode.state.pause = function(albumId) {
      console.log('pause', albumId);
      vnode.state.store.set({
        selectedAlbum: albumId,
        playingAlbum: albumId,
        playing: false
      });
      vnode.state.audioElement.pause();
    };

    vnode.state.nextTrack = function() {
      console.log('nextTrack');
      const playingAlbumId = vnode.state.store.get('playingAlbum');
      const selectedAlbumId = vnode.state.store.get('selectedAlbum');
      const playingAlbum = vnode.state.getAlbumById(playingAlbumId);
      const selectedAlbum = vnode.state.getAlbumById(selectedAlbumId);

      if (selectedAlbum && playingAlbum && selectedAlbumId !== playingAlbumId) {
        const nextTrack = Math.min(
          vnode.state.store.get('selectedAudioTrack', 0) + 1,
          selectedAlbum.audios.length - 1
        );
        vnode.state.store.set('selectedAudioTrack', nextTrack);
      } else if (playingAlbum) {
        const nextTrack = Math.min(
          vnode.state.store.get('playingTrack', 0) + 1,
          playingAlbum.audios.length - 1
        );
        vnode.state.store.set('playingTrack', nextTrack);

        vnode.state.whenAudioLoaded()
        .then(() => {
          vnode.state.audioElement.play();
        });
      }
    };

    vnode.state.prevTrack = function() {
      console.log('prevTrack');
      const playingAlbumId = vnode.state.store.get('playingAlbum');
      const selectedAlbumId = vnode.state.store.get('selectedAlbum');
      const playingAlbum = vnode.state.getAlbumById(playingAlbumId);
      const selectedAlbum = vnode.state.getAlbumById(selectedAlbumId);
      const currentTime = vnode.state.store.get('playingCurrentTime');

      if (selectedAlbum && playingAlbum && selectedAlbumId !== playingAlbumId) {
        const prevTrack = Math.max(
          vnode.state.store.get('selectedAudioTrack', 0) - 1,
          0
        );
        vnode.state.store.set('selectedAudioTrack', prevTrack);
      } else {
        if (currentTime > 1) {
          vnode.state.audioElement.currentTime = 0;
        } else {
          const prevTrack = Math.max(
            vnode.state.store.get('playingTrack', 0) - 1,
            0
          );
          vnode.state.store.set('playingTrack', prevTrack);

          vnode.state.whenAudioLoaded()
          .then(() => {
            vnode.state.audioElement.play();
          });
        }
      }
    };

    vnode.state.showFullScreenAlbumCover = function(albumId) {
      console.log('showFullScreenAlbumCover', albumId);
      vnode.state.store.set('fullscreenAlbum', albumId);
    };

    vnode.state.hideFullScreenAlbumCover = function() {
      console.log('hideFullScreenAlbumCover');
      vnode.state.store.set('fullscreenAlbum', null);
    };

    vnode.state.getGroupById = function(groupId) {
      return _.find(_.get(vnode.state, 'library.groups', []), ['id', groupId]);
    };

    vnode.state.getAlbumById = function(albumId) {
      return _.find(_.get(vnode.state, 'library.albums', []), ['id', albumId]);
    };

    vnode.state.handleAudioTimeupdate = function (event) {
      const currentTime = vnode.state.audioElement.currentTime;
      const duration = vnode.state.audioElement.duration;

      vnode.state.store.set({
        playingCurrentTime: currentTime,
        playingDuration: duration
      });

      // skip to next track if reached end
      if (currentTime === duration) {
        const playingAlbumId = vnode.state.store.get('playingAlbum');
        const playingAlbum = vnode.state.getAlbumById(playingAlbumId);
        const nextTrack = Math.min(
          vnode.state.store.get('playingTrack', 0) + 1,
          playingAlbum.audios.length - 1
        );
        vnode.state.store.set('playingTrack', nextTrack);

        vnode.state.whenAudioLoaded()
        .then(() => {
          vnode.state.audioElement.play();
        });
      }
    };

    vnode.state.handleProgressHandleMouseDown = function (event) {
      vnode.state.touches = {
        0: {
          clientX: event.clientX,
          clientY: event.clientY
        }
      };
      document.body.addEventListener('mouseup', vnode.state.handleProgressHandleMouseUp);
      document.body.addEventListener('mousemove', vnode.state.handleProgressHandleMouseMove);
    };

    vnode.state.handleProgressHandleTouchStart = function (event) {
      vnode.state.touches = {};
      Array.from(event.changedTouches)
      .forEach((touch) => {
        vnode.state.touches[touch.identifier] = {
          clientX: touch.clientX,
          clientY: touch.clientY
        };
      });

      document.body.addEventListener('touchend', vnode.state.handleProgressHandleTouchEnd);
      document.body.addEventListener('touchcancel', vnode.state.handleProgressHandleTouchEnd);
      document.body.addEventListener('touchmove', vnode.state.handleProgressHandleTouchMove);
    };

    vnode.state.handleProgressHandleMouseMove = function (event) {
      const diffX = event.clientX - vnode.state.touches[0].clientX;
      const time = vnode.state.getCurrentTimeFromProgressDrag(diffX);
      
      vnode.state.draggingCurrentTime = time;
    };
    
    vnode.state.handleProgressHandleTouchMove = function (event) {
      const touch = event.changedTouches[0];
      const time = vnode.state.getCurrentTimeFromProgressDrag(touch.clientX);
      
      vnode.state.draggingCurrentTime = time;
    };

    vnode.state.handleProgressHandleMouseUp = function (event) {
      const time = vnode.state.getCurrentTimeFromProgressDrag(event.clientX);

      vnode.state.audioElement.currentTime = time;
      vnode.state.draggingCurrentTime = -1;
      vnode.state.touches = {};

      document.body.removeEventListener('mousemove', vnode.state.handleProgressHandleMouseMove);
      document.body.removeEventListener('mouseup', vnode.state.handleProgressHandleMouseUp);
    };

    vnode.state.handleProgressHandleTouchEnd = function (event) {
      if (event.changedTouches && event.changedTouches.length > 0) {
        const touch = event.changedTouches[0];
        const time = vnode.state.getCurrentTimeFromProgressDrag(touch.clientX);
        
        vnode.state.draggingCurrentTime = time;
        vnode.state.audioElement.currentTime = vnode.state.draggingCurrentTime;
      }
      
      vnode.state.draggingCurrentTime = -1;
      vnode.state.touches = {};

      document.body.removeEventListener('touchend', vnode.state.handleProgressHandleTouchEnd);
      document.body.removeEventListener('touchcancel', vnode.state.handleProgressHandleTouchEnd);
      document.body.removeEventListener('touchmove', vnode.state.handleProgressHandleTouchMove);
    };

    vnode.state.handleVolumeDown = function () {
      vnode.state.audioElement.volume = Math.max(vnode.state.audioElement.volume - VOLUME_STEP, 0.001);
      vnode.state.store.set('volume', vnode.state.audioElement.volume);
    };

    vnode.state.handleVolumeUp = function () {
      vnode.state.audioElement.volume = Math.min(vnode.state.audioElement.volume + VOLUME_STEP, 1);
      vnode.state.store.set('volume', vnode.state.audioElement.volume);
    };

    vnode.state.getCurrentTimeFromProgressDrag = function (x) {
      const progressElement = document.getElementById('controls__playback-progress');
      const progressBox = progressElement.getBoundingClientRect();
      const width = progressBox.right - progressBox.left;
      const duration = vnode.state.audioElement.duration;
      const pos = Math.max(x - progressBox.left, 0.01);
      const time = (pos / width) * duration;

      return time;
    };

    vnode.state.loadLibrary = function () {
      fetch('./library.json?t=' + (new Date()).getTime())
      .then(res => {
        if (!res.ok) {
          return Promise.reject(new Error('Unable to load library.'));
        }

        return res.json();
      })
      .then(library => {
        vnode.state.library = groupLibrary(library);

        m.redraw();
        lazyLoad();
      })
      .catch(console.error.bind(console));
    };

    vnode.state.whenAudioLoaded = function() {
      return new Promise((resolve, reject) => {
        const handler = () => {
          vnode.state.audioElement.removeEventListener('canplay', handler);
          resolve();
        };

        vnode.state.audioElement.addEventListener('canplay', handler);
      });
    };

    window.addEventListener('resize', m.redraw.bind(m));
    window.addEventListener('resize', lazyLoad);

    vnode.state.idleTimeout = setTimeout(vnode.state.startScreenSaver, IDLE_DELAY);
    vnode.state.loadLibrary();
  },
  oncreate: function(vnode) {
    const albumId = vnode.state.store.get('playingAlbum');
    const playing = vnode.state.store.get('playing');
    const currentTime = vnode.state.store.get('playingCurrentTime');
    vnode.state.audioElement = document.getElementById('controls__playback-audio');

    document.querySelector('.covers').addEventListener('scroll', lazyLoad);

    // restore previous play state
    vnode.state.audioElement.volume = vnode.state.store.get('volume', 1);

    if (playing) {
      vnode.state.pause(albumId);

      vnode.state.whenAudioLoaded()
      .then(() => {
        vnode.state.audioElement.currentTime = currentTime;
      });
    }
  }
};

m.mount(document.body, app);
