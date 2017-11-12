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
        playing: true
      });
    };

    vnode.state.pause = function() {
      console.log('pause');
      vnode.state.store.set('playing', false);
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
  }
};

m.mount(document.body, app);
