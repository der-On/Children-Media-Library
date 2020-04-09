const idleDelay = 5 * 60 * 1000; // 5 min

const app = {
  view: appView,
  oninit: (vnode) => {
    vnode.state.store = store();
    vnode.state.screenSaverIsActive = false;
    vnode.state.idleTimeout = setTimeout(vnode.state.startScreenSaver, idleDelay);
    vnode.state.touches = {};

    vnode.state.handleUserInput = function (event) {
      if (!vnode.state.screenSaverIsActive) {
        clearTimeout(vnode.state.idleTimeout);
        vnode.state.idleTimeout = setTimeout(vnode.state.startScreenSaver, idleDelay);
      }
    };

    vnode.state.startScreenSaver = function () {
      console.log('start screen saver');
      vnode.state.shandleProgressHandleTouchStartcreenSaverIsActive = true;
      m.redraw();
    };

    vnode.state.stopScreenSaver = function () {
      console.log('stop screen saver');
      vnode.state.screenSaverIsActive = false;
    };

    vnode.state.resetScreenSaver = function () {
      vnode.state.stopScreenSaver();
      vnode.state.idleTimeout = setTimeout(vnode.state.startScreenSaver, idleDelay);
    };

    vnode.state.openAlbumGroup = function(albumGroupId) {
      vnode.state.store.set('openedAlbumGroup', albumGroupId);
      lazyLoadDelayed();
    };

    vnode.state.closeAlbumGroup = function() {
      vnode.state.store.set('openedAlbumGroup', null);
      lazyLoadDelayed();
    };

    vnode.state.selectAlbum = function(albumId) {
      console.log('selectAlbum', albumId);
      vnode.state.store.set('selectedAlbum', albumId);
      lazyLoadDelayed();
    };

    vnode.state.play = function(albumId) {
      console.log('play', albumId);
      vnode.state.store.set({
        selectedAlbum: albumId,
        playingAlbum: albumId,
        playingTrack: vnode.state.store.get('playingAlbum') !== albumId
          ? 0
          : vnode.state.store.get('playingTrack', 0),
        playing: true,
      });
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
      const album = vnode.state.getAlbumById(vnode.state.store.get('playingAlbum'));
      if (!album) {
        return;
      }

      const nextTrack = vnode.state.store.get('playingTrack', 0) + 1;
      vnode.state.store.set('playingTrack', Math.min(nextTrack, album.media.length - 1));

      vnode.state.whenAudioLoaded()
      .then(() => {
        vnode.state.audioElement.play();
      });
    };

    vnode.state.prevTrack = function() {
      console.log('prevTrack');
      const album = vnode.state.getAlbumById(vnode.state.store.get('playingAlbum'));
      const currentTime = vnode.state.store.get('playingCurrentTime');
      if (!album) {
        return;
      }

      if (currentTime > 1) {
        vnode.state.audioElement.currentTime = 0;
      } else {
        const prevTrack = vnode.state.store.get('playingTrack', 0) - 1;
        vnode.state.store.set('playingTrack', Math.max(prevTrack, 0));

        vnode.state.whenAudioLoaded()
        .then(() => {
          vnode.state.audioElement.play();
        });
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

    vnode.state.getAlbumGroupById = function(albumGroupId) {
      return _.find(_.get(vnode.state, 'library.groups', []), ['id', albumGroupId]);
    };

    vnode.state.getAlbumById = function(albumId) {
      return _.find(_.get(vnode.state, 'library.albums', []), ['id', albumId]);
    };

    vnode.state.handleAudioPause = function (event) {
      const albumId = vnode.state.store.get('playingAlbum');
      if (albumId) {
        vnode.state.pause(albumId);
      }
    };

    vnode.state.handleAudioPlay = function (event) {
      const albumId = vnode.state.store.get('playingAlbum');
      if (albumId) {
        vnode.state.play(albumId);
      }
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
        vnode.state.nextTrack();
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
      const touch = vnode.state.touches[0];
      const diffX = event.clientX - touch.clientX;
      vnode.state.updateCurrentTimeFromProgressDrag(diffX);
    };

    vnode.state.handleProgressHandleTouchMove = function (event) {
      const touch = event.changedTouches[0];
      const diffX = touch.clientX - vnode.state.touches[touch.identifier].clientX;

      vnode.state.updateCurrentTimeFromProgressDrag(diffX);
    };

    vnode.state.handleProgressHandleMouseUp = function (event) {
      const touch = event.changedTouches[0];
      const diffX = touch.clientX - vnode.state.touches[touch.identifier].clientX;

      document.body.removeEventListener('mousemove', vnode.state.handleProgressHandleMouseMove);
      document.body.removeEventListener('mouseup', vnode.state.handleProgressHandleMouseUp);
      vnode.state.updateCurrentTimeFromProgressDrag(diffX);

      vnode.state.touches = {};
    };

    vnode.state.handleProgressHandleTouchEnd = function (event) {
      if (event.changedTouches && event.changedTouches.length > 0) {
        const touch = event.changedTouches[0];
        const diffX = touch.clientX - vnode.state.touches[touch.identifier].clientX;
        vnode.state.updateCurrentTimeFromProgressDrag(diffX);
      }

      vnode.state.touches = {};

      document.body.removeEventListener('touchend', vnode.state.handleProgressHandleTouchEnd);
      document.body.removeEventListener('touchcancel', vnode.state.handleProgressHandleTouchEnd);
      document.body.removeEventListener('touchmove', vnode.state.handleProgressHandleTouchMove);
    };

    vnode.state.updateCurrentTimeFromProgressDrag = function (x) {
      const progressElement = document.getElementById('controls__playback-progress');
      const progressBox = progressElement.getBoundingClientRect();
      const width = progressBox.right - progressBox.left;
      const duration = vnode.state.audioElement.duration;
      const pos = Math.max(x, 0.01);
      const time = (pos / width) * duration;

      vnode.state.audioElement.currentTime = time;
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

    fetch('./library.json?t=' + (new Date()).getTime())
    .then(res => {
      if (!res.ok) {
        return Promise.reject(new Error('Unable to load library.'));
      }

      return res.json();
    })
    .then(library => {
      // vnode.state.library = library;
      vnode.state.library = groupLibrary(library);
      m.redraw();
      lazyLoad();
    })
    .catch(console.error.bind(console));
  },
  oncreate: function(vnode) {
    const albumId = vnode.state.store.get('playingAlbum');
    const playing = vnode.state.store.get('playing');
    const currentTime = vnode.state.store.get('playingCurrentTime');
    vnode.state.audioElement = document.getElementById('controls__playback-audio');

    document.querySelector('.albums').addEventListener('scroll', lazyLoad);

    // restore previous play state
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
