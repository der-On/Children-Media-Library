const app = {
  view: appView,
  oninit: (vnode) => {
    vnode.state.store = store();

    vnode.state.selectAlbum = function(albumId) {
      console.log('selectAlbum', albumId);
      vnode.state.store.set('selectedAlbum', albumId);
    };

    vnode.state.play = function(albumId) {
      console.log('play', albumId);
      vnode.state.store.set({
        playingAlbum: albumId,
        playingTrack: vnode.state.store.get('playingAlbum') !== albumId
          ? 0
          : vnode.state.store.get('playingTrack', 0),
        playing: true,
      });
      vnode.state.audioElement.play();
    };

    vnode.state.pause = function() {
      console.log('pause');
      vnode.state.store.set('playing', false);
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
      vnode.state.audioElement.play();
    };

    vnode.state.prevTrack = function() {
      console.log('prevTrack');
      const album = vnode.state.getAlbumById(vnode.state.store.get('playingAlbum'));
      if (!album) {
        return;
      }

      const prevTrack = vnode.state.store.get('playingTrack', 0) - 1;
      vnode.state.store.set('playingTrack', Math.max(prevTrack, 0));
      vnode.state.audioElement.play();
    };

    vnode.state.showFullScreenAlbumCover = function(albumId) {
      console.log('showFullScreenAlbumCover', albumId);
      vnode.state.store.set('fullscreenAlbum', albumId);
    };

    vnode.state.hideFullScreenAlbumCover = function() {
      console.log('hideFullScreenAlbumCover');
      vnode.state.store.set('fullscreenAlbum', null);
    };

    vnode.state.getAlbumById = function(albumId) {
      return _.find(_.get(vnode.state, 'library.albums', []), ['id', albumId]);
    };

    vnode.state.handleAudioTimeupdate = function (event) {
      vnode.state.store.set({
        playingCurrentTime: vnode.state.audioElement.currentTime,
        palyingDuration: vnode.state.audioElement.duration
      });
    };

    window.addEventListener('resize', m.redraw.bind(m));

    fetch('./library.json')
    .then(res => {
      if (!res.ok) {
        return Promise.reject(new Error('Unable to load library.'));
      }

      return res.json();
    })
    .then(library => {
      vnode.state.library = library;
      m.redraw();
    })
    .catch(console.error.bind(console));
  },
  oncreate: function(vnode) {
    vnode.state.audioElement = document.getElementById('controls__playback-audio');
  }
};

m.mount(document.body, app);
