function appView(vnode) {
  return m('main.main', [
    albumsView(vnode),
    controlsView(vnode)
  ]);
}

function albumsView(vnode) {
  const albums = vnode.state.store.get('library.albums') || [];
  return m('section.albums', albums.map(_.partial(albumsAlbumView, vnode)));
}

function albumsGroupView(vnode, albums) {
  return m('.albums__group', albums.map(_.partial(albumView, vnode)));
}

function albumsAlbumView(vnode, album) {
  return m('.albums__album', {
    onclick: _.partial(vnode.state.handleAlbumClick, album)
  }, albumCoverView(vnode, album));
}

function controlsView(vnode) {
  const album = vnode.state.store.get('selectedAlbum');

  return m('section.controls', [
    album ? [
        m('.controls__album', albumCoverView(vnode, album)),
        m('.controls__album-title', `${album.artist} - ${album.title}`)
    ] : null
  ]);
}

function albumCoverView(vnode, album) {
  return m('figure.album__cover', {
    style: `background-image: url('./library/${encodeURIComponent(album.cover)}')`,
    title: `${album.artist} - ${album.title}`
  });
}
