function appView(vnode) {
  const fullscreenAlbum = vnode.state.getAlbumById(vnode.state.store.get('fullscreenAlbum'));

  return m('main.main', [
    albumsView(vnode),
    controlsView(vnode),
    fullscreenAlbum
      ? fullscreenAlbumCoverView(vnode, fullscreenAlbum)
      : null
  ]);
}

function albumsView(vnode) {
  const albums = _.get(vnode.state, 'library.albums', []);
  const groups = [];
  const coversWidth = Math.floor(window.innerWidth / (COVER_WIDTH + (GRID_GUTTER * 2.5)));
  const coversHeight = Math.floor((window.innerHeight - 156) / (COVER_HEIGHT + (GRID_GUTTER * 2.5)));
  const groupSize = (coversWidth * coversHeight) - coversHeight;
  const numGroups = Math.ceil(albums.length / groupSize);
  const groupWidth = coversWidth * (COVER_WIDTH + GRID_GUTTER) - (GRID_GUTTER * 2);

  for(let groupNum = 0; groupNum < numGroups; groupNum++) {
    groups.push(albums.slice(groupNum * groupSize, (groupNum * groupSize) + groupSize));
  }
  return m('section.albums', groups.map(_.partial(albumsGroupView, vnode, groupWidth)));
}

function albumsGroupView(vnode, width, albums, index) {
  return m('.albums__group', {
    key: index,
    style: `width: ${width}px;`,
  }, albums.map(_.partial(albumsAlbumView, vnode)));
}

function albumsAlbumView(vnode, album) {
  const playing = vnode.state.store.get('playing', false);
  const selectedAlbumId = vnode.state.store.get('selectedAlbum');
  const isSelected = album.id === selectedAlbumId;
  const playingAlbumId = vnode.state.store.get('playingAlbum');
  const isPlaying = album.id === playingAlbumId;
  let onclick;

  if (!isPlaying && isSelected) {
    onclick = _.partial(vnode.state.play, album.id);
  } else if (isPlaying) {
    onclick = playing ? vnode.state.pause : _.partial(vnode.state.play, album.id);
  } else if (!isSelected) {
    onclick = _.partial(vnode.state.selectAlbum, album.id);
  }
  return m('.albums__album', {
    className: isSelected ? 'is-selected' : '',
    key: album.id
  }, albumCoverView(vnode, album, {
    onclick
  }));
}

function controlsView(vnode) {
  const album = vnode.state.getAlbumById(vnode.state.store.get('selectedAlbum'));

  return m('section.controls',
    album ? [
        m('.controls__album', albumCoverView(vnode, album, {
          onclick: _.partial(vnode.state.showFullScreenAlbumCover, album.id)
        })),
        m('.controls__album-title', `${album.artist} - ${album.title}`),
        playbackControlsView(vnode, album)
    ] : null
  );
}

function playbackControlsView(vnode, album) {
  const playing = vnode.state.store.get('playing', false);
  const playingAlbumId = vnode.state.store.get('playingAlbum');
  const isPlaying = album.id === playingAlbumId;

  return m('.controls__playback', [
    isPlaying && playing ? 'playing' : null
  ]);
}

function albumCoverView(vnode, album, args = {}) {
  return m('figure.album__cover', _.assign({
    style: `background-image: url('./library/${encodeURIComponent(album.cover)}')`,
    title: `${album.artist} - ${album.title}`
  }, args));
}

function fullscreenAlbumCoverView(vnode, album) {
  return m('figure.album__cover.album__cover--fullscreen', {
    style: `background-image: url('./library/${encodeURIComponent(album.cover)}')`,
    onclick: vnode.state.hideFullScreenAlbumCover,
    title: `${album.artist} - ${album.title}`
  });
}
