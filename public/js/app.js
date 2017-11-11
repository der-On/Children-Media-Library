const app = {
  view: appView,
  oninit: (vnode) => {
    vnode.state.store = store();

    vnode.state.handleAlbumClick = function(album) {
      vnode.state.store.set('selectedAlbum', album);
    };

    fetch('./library.json')
    .then(res => {
      if (!res.ok) {
        return Promise.reject(new Error('Unable to load library.'));
      }

      return res.json();
    })
    .then(library => {
      vnode.state.store.set('library', library);
    })
    .catch(console.error.bind(console));
  }
};

m.mount(document.body, app);
