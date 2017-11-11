function appView(vnode) {
  return m('main.main', [
    albumsView(vnode),
    controlsView(vnode)
  ]);
}

function albumsView(vnode) {
  const albums = vnode.state.store.get('library.albums') || [];
  const groups = [];
  const coversWidth = Math.floor(window.innerWidth / (144 + 12));
  const coversHeight = Math.floor((window.innerHeight - 156) / (144 + 12));
  const groupSize = coversWidth * coversHeight;
  const numGroups = Math.ceil(albums.length / groupSize);
  const groupWidth = coversWidth * (144 + 12) - 24;
  console.log({
    coversWidth, coversHeight, groupSize, numGroups
  });

  for(let groupNum = 0; groupNum < numGroups; groupNum++) {
    groups.push(albums.slice(groupNum * groupSize, (groupNum * groupSize) + groupSize));
  }
  return m('section.albums', groups.map(_.partial(albumsGroupView, vnode, groupWidth)));
}

function albumsGroupView(vnode, width, albums) {
  return m('.albums__group', {
    style: `width: ${width}px;`,
  }, albums.map(_.partial(albumsAlbumView, vnode)));
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
