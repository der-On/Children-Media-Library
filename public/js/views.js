function appView(vnode) {
  const screenSaverIsActive = vnode.state.screenSaverIsActive;
  const isShuttingDown = vnode.state.isShuttingDown;

  const albumGroup = vnode.state.getAlbumGroupById(vnode.state.store.get('openedAlbumGroup'));
  const album = vnode.state.getAlbumById(vnode.state.store.get('selectedAlbum'));
  let color = null;
  if (albumGroup) {
    color = albumColor(albumGroup);
  } else if (album) {
    color = albumColor(album);
  }
  return m('main.main', {
    class: screenSaverIsActive || isShuttingDown ? 'has-screen-saver' : '',
    onmousedown: vnode.state.handleMouseDown,
    onmousemove: vnode.state.handleMouseMove,
    ontouchstart: vnode.state.handleTouchStart,
    onclick: vnode.state.handleUserInput,
    onkeydown: vnode.state.handleUserInput,
    onmousewheel: vnode.state.handleUserInput,
    style: color ? `background-color: ${color};` : null
  }, [
    audioView(vnode),
    // albumsView(vnode),
    albumGroup
    ? albumsView(vnode, albumGroup)
    : albumGroupsView(vnode),
    controlsView(vnode),
    fullscreenAlbumCoverView(vnode),
    headerView(vnode),
    screenSaverView(vnode)
  ]);
}

function audioView(vnode) {
  const album = vnode.state.getAlbumById(vnode.state.store.get('playingAlbum'));
  const playingTrack = vnode.state.store.get('playingTrack');

  return m('audio.audio', {
    id: 'controls__playback-audio',
    src: album ? `./library/${album.media[playingTrack]}` : '',
    ontimeupdate: vnode.state.handleAudioTimeupdate,
    onpause: vnode.state.handleAudioPause,
    onplay: vnode.state.handleAudioPlay,
    preload: 'auto'
  });
}

function albumGroupsView(vnode) {
  const albumGroups = _.get(vnode.state, 'library.groups', []);
  const groups = [];
  const coversWidth = Math.floor(window.innerWidth / (COVER_WIDTH + GRID_GUTTER));
  const coversHeight = Math.floor((window.innerHeight - CONTROLS_HEIGHT) / (COVER_HEIGHT + GRID_GUTTER));
  const groupSize = (coversWidth * coversHeight);
  const numGroups = Math.ceil(albumGroups.length / groupSize);
  const groupWidth = coversWidth * (COVER_WIDTH + GRID_GUTTER);

  for(let groupNum = 0; groupNum < numGroups; groupNum++) {
    groups.push(albumGroups.slice(groupNum * groupSize, (groupNum * groupSize) + groupSize));
  }
  return m('section.albums', groups.map(_.partial(albumGroupsGroupView, vnode, groupWidth)));
}

function albumGroupsGroupView(vnode, width, albumGroups, index) {
  return m('.albums__group', {
    key: index,
    style: `width: ${width}px;`,
  }, albumGroups.map(_.partial(albumGroupView, vnode)));
}

function albumGroupView(vnode, albumGroup) {
  const className = [];
  const onclick = _.partial(vnode.state.openAlbumGroup, albumGroup.id);

  return m('.albums__album', {
    className: className.join(' '),
    key: albumGroup.src
  }, [
    albumGroupCoverView(vnode, albumGroup, {
      onclick
    })
  ]);
}

function albumGroupCoverView(vnode, albumGroup, args = {}) {
  const backgroundImages = albumGroup.albums
  .slice(0, 4)
  .map(function (album) {
    return `url("${album.cover}")`;
  });
  return m('figure.album__group-cover.lazy-load', _.assign({
    style: `background-color: ${albumColor(albumGroup, 50, 60)}; background-image: ${backgroundImages.join(', ')};`,
    'data-loaded': 'false',
    title: `${albumGroup.title}`
  }, args));
}

function fullscreenAlbumCoverView(vnode) {
  const album = vnode.state.getAlbumById(vnode.state.store.get('selectedAlbum'));
  const fullscreenAlbumId = vnode.state.store.get('fullscreenAlbum');

  return album ? m('figure.album__cover.album__cover--fullscreen', {
    className: fullscreenAlbumId !== album.id ? 'is-hidden' : '',
    style: `background-image: url("${album.cover}")`,
    onclick: vnode.state.hideFullScreenAlbumCover,
    title: `${album.artist} - ${album.title}`
  }) : null;
}

function closeAlbumGroupAlbum(vnode) {
  return {
    title: null,
    onclick: vnode.state.closeAlbumGroup,
    cover: './images/back_icon.png'
  };
}

function albumsView(vnode, albumGroup = null) {
  const albums = albumGroup
    ? [closeAlbumGroupAlbum(vnode)].concat(albumGroup.albums)
    : _.get(vnode.state, 'library.albums', []);
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

  if (album.onclick) {
    onclick = album.onclick;
  }
  else if (!isPlaying && isSelected) {
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
  const currentTime = vnode.state.store.get('playingCurrentTime', 0) || 0;
  const duration = vnode.state.store.get('playingDuration', 0) || 0;

  return m('section.controls',
    album ? [
        m('.controls__album', albumCoverView(vnode, album, {
          onclick: _.partial(vnode.state.showFullScreenAlbumCover, album.id)
        })),
        m('.controls__album-track', [
          `${album.artist} - ${album.title}`, m('br'),
          `${playingTrack + 1} / ${album.media.length}`
        ]),
        m('.controls__duration', [
          formatTime(currentTime),
          ' / ',
          formatTime(duration)
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
      onclick: _.partial(isPlaying && playing ? vnode.state.pause : vnode.state.play, album.id)
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
  const draggingCurrentTime  = vnode.state.draggingCurrentTime;
  const currentTime = vnode.state.store.get('playingCurrentTime', 0) || 0;
  const duration = vnode.state.audioElement.duration || 0;
  const progress = duration != 0
    ? (draggingCurrentTime !== -1 ? draggingCurrentTime : currentTime) / duration
    : 0;

  return m('.controls__playback-progress', {
    id: 'controls__playback-progress'
  }, [
    m('.controls__playback-progress-bar', {
      style: `width: ${progress * 100}%`
    }),
    m('.controls__playback-progress-handle', {
      style: `left: ${progress * 100}%`,
      onmousedown: vnode.state.handleProgressHandleMouseDown,
      ontouchstart: vnode.state.handleProgressHandleTouchStart
    })
  ]);
}

function albumCoverView(vnode, album, args = {}) {
  const backgroundImage = `url("${album.cover}")`;
  return m('figure.album__cover.lazy-load', _.assign({
    style: `background-color: ${albumColor(album, 50, 60)}; background-image: ${backgroundImage};`,
    'data-loaded': 'false',
    title: `${album.artist} - ${album.title}`
  }, args));
}

function fullscreenAlbumCoverView(vnode) {
  const album = vnode.state.getAlbumById(vnode.state.store.get('selectedAlbum'));
  const fullscreenAlbumId = vnode.state.store.get('fullscreenAlbum');

  return album ? m('figure.album__cover.album__cover--fullscreen', {
    className: fullscreenAlbumId !== album.id ? 'is-hidden' : '',
    style: `background-image: url("${album.cover}")`,
    onclick: vnode.state.hideFullScreenAlbumCover,
    title: `${album.artist} - ${album.title}`
  }) : null;
}

function headerView(vnode) {
  return m('header.header', {
    className: vnode.state.headerIsVisible ? 'is-visible' : ''
  }, [
    m('nav.header__nav', [
      {
        id: 'shutdown',
        icon: '/images/shutdown_icon.png',
        label: 'shutdown',
        action: vnode.state.shutdown
      }
    ].map(_.partial(headerNavItemView, vnode)))
  ]);
}

function headerNavItemView(vnode, item) {
  return m('button.header__nav-item', {
    onclick: _.partial(vnode.state.handleHeaderNavItemClick, item)
  }, [
    m('img.header__nav-item-icon', {
      src: item.icon
    }),
    m('.header__nav-item-label', item.label || '')
  ])
}

function screenSaverView(vnode) {
  return m('.screen-saver', {
    onclick: vnode.state.handleScreenSaverClick
  });
}
