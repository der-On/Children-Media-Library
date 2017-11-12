function appView(vnode) {
  const fullscreenAlbum = vnode.state.getAlbumById(vnode.state.store.get('fullscreenAlbum'));

  return m('main.main', [
    audioView(vnode),
    albumsView(vnode),
    controlsView(vnode),
    fullscreenAlbum
      ? fullscreenAlbumCoverView(vnode, fullscreenAlbum)
      : null
  ]);
}

function audioView(vnode) {
  const album = vnode.state.getAlbumById(vnode.state.store.get('playingAlbum'));
  const playingTrack = vnode.state.store.get('playingTrack');

  return m('audio.audio', {
    id: 'controls__playback-audio',
    src: album ? `./library/${encodeURIComponent(album.media[playingTrack])}` : '',
    ontimeupdate: vnode.state.handleAudioTimeupdate,
    onpause: vnode.state.pause,
    onplay: album ?_.partial(vnode.state.play, album.id) : null
  });
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
  const playingTrack = vnode.state.store.get('playingTrack', 0);
  const isPlaying = album.id === playingAlbumId;

  return m('.controls__playback', [
    m('i.icon.controls__playback-icon.controls__playback-icon--play', {
      onclick: isPlaying && playing ? vnode.state.pause : _.partial(vnode.state.play, album.id)
    }, isPlaying && playing ? 'pause' : 'play_arrow'),
    playingTrack > 0 ? m('i.icon.controls__playback-icon.controls__playback-icon--prev', {
      onclick: vnode.state.prevTrack
    }, 'skip_previous') : null,
    album.media.length > 0 && playingTrack < album.media.length - 1 ? m('i.icon.controls__playback-icon.controls__playback-icon--next', {
      onclick: vnode.state.nextTrack
    }, 'skip_next') : null
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
