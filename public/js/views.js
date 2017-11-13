function appView(vnode) {
  const album = vnode.state.getAlbumById(vnode.state.store.get('selectedAlbum'));

  return m('main.main', {
    style: album ? `background-color: ${albumColor(album)};` : null
  }, [
    audioView(vnode),
    albumsView(vnode),
    controlsView(vnode),
    fullscreenAlbumCoverView(vnode)
  ]);
}

function audioView(vnode) {
  const album = vnode.state.getAlbumById(vnode.state.store.get('playingAlbum'));
  const playingTrack = vnode.state.store.get('playingTrack');

  return m('audio.audio', {
    id: 'controls__playback-audio',
    src: album ? `./library/${encodeURIComponent(album.media[playingTrack])}` : '',
    ontimeupdate: vnode.state.handleAudioTimeupdate,
    onpause: vnode.state.handleAudioPause,
    onplay: vnode.state.handleAudioPlay,
    preload: 'auto'
  });
}

function albumsView(vnode) {
  const albums = _.get(vnode.state, 'library.albums', []);
  const groups = [];
  const coversWidth = Math.floor(window.innerWidth / (COVER_WIDTH + GRID_GUTTER));
  const coversHeight = Math.floor((window.innerHeight - CONTROLS_HEIGHT) / (COVER_HEIGHT + GRID_GUTTER));
  const groupSize = (coversWidth * coversHeight);
  const numGroups = Math.ceil(albums.length / groupSize);
  const groupWidth = coversWidth * (COVER_WIDTH + GRID_GUTTER);

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
  const className = [];
  let onclick;

  if (!isPlaying && isSelected) {
    onclick = _.partial(vnode.state.play, album.id);
  } else if (isPlaying && !isSelected) {
    onclick = _.partial(vnode.state.selectAlbum, album.id);
  } else if (isPlaying) {
    onclick = _.partial(playing ? vnode.state.pause : vnode.state.play, album.id);
  } else if (!isSelected) {
    onclick = _.partial(vnode.state.selectAlbum, album.id);
  }

  if (isSelected) {
    className.push('is-selected');
  }
  if (isPlaying && playing) {
    className.push('is-playing');
  }

  return m('.albums__album', {
    className: className.join(' '),
    key: album.id
  }, [
    albumCoverView(vnode, album, {
      onclick
    }),
    m('i.icon.albums__album-icon', {
      className: isPlaying && playing ? '' : 'is-hidden'
    },'play_circle_filled')
  ]);
}

function controlsView(vnode) {
  const album = vnode.state.getAlbumById(vnode.state.store.get('selectedAlbum'));
  const playingTrack = vnode.state.store.get('playingTrack');

  return m('section.controls',
    album ? [
        m('.controls__album', albumCoverView(vnode, album, {
          onclick: _.partial(vnode.state.showFullScreenAlbumCover, album.id)
        })),
        m('.controls__album-track', [
          `${album.artist} - ${album.title}`, m('br'),
          `${playingTrack + 1} / ${album.media.length}`
        ]),
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
      onclick: isPlaying && _.partial(playing ? vnode.state.pause : vnode.state.play, album.id)
    }, isPlaying && playing ? 'pause' : 'play_arrow'),
    m('i.icon.controls__playback-icon.controls__playback-icon--prev', {
      onclick: vnode.state.prevTrack
    }, 'skip_previous'),
    album.media.length > 0 && playingTrack < album.media.length - 1 ? m('i.icon.controls__playback-icon.controls__playback-icon--next', {
      onclick: vnode.state.nextTrack
    }, 'skip_next') : null,
    isPlaying ? playbackControlsProgressView(vnode) : null
  ]);
}

function playbackControlsProgressView(vnode) {
  const currentTime = vnode.state.store.get('playingCurrentTime', 0);
  const duration = vnode.state.store.get('playingDuration', 0);
  const progress = currentTime / duration;

  return m('.controls__playback-progress', {
    id: 'controls__playback-progress'
  }, [
    m('.controls__playback-progress-bar', {
      style: `width: ${progress * 100}%`
    }),
    m('.controls__playback-progress-handle', {
      style: `left: ${progress * 100}%`,
      onmousedown: vnode.state.handleProgressHandleMouseDown
    })
  ]);
}

function albumCoverView(vnode, album, args = {}) {
  return m('figure.album__cover', _.assign({
    style: `background-color: ${albumColor(album)}; background-image: url('./library/${encodeURIComponent(album.cover)}');`,
    title: `${album.artist} - ${album.title}`
  }, args));
}

function fullscreenAlbumCoverView(vnode) {
  const album = vnode.state.getAlbumById(vnode.state.store.get('selectedAlbum'));
  const fullscreenAlbumId = vnode.state.store.get('fullscreenAlbum');

  return album ? m('figure.album__cover.album__cover--fullscreen', {
    className: fullscreenAlbumId !== album.id ? 'is-hidden' : '',
    style: `background-image: url('./library/${encodeURIComponent(album.cover)}')`,
    onclick: vnode.state.hideFullScreenAlbumCover,
    title: `${album.artist} - ${album.title}`
  }) : null;
}

function albumColor(album) {
  return strToColor(album.artist + album.title);
}

function strToColor(str) {
  const h = hashCode(str) % 360;
  return `hsl(${h}, 22%, 48%)`;
}

strToColor = _.memoize(strToColor);

function hashCode(str) {
  var hash = 0;
  if (str.length == 0) return hash;
  for (i = 0; i < str.length; i++) {
    char = str.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
