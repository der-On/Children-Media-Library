import albumCoverView from './albumCover.js';

export default function albumView(vnode, album) {
  const playing = vnode.state.store.get('playing', false);
  const selectedAlbumId = vnode.state.store.get('selectedAlbum');
  const isSelected = album.id === selectedAlbumId;
  const playingAlbumId = vnode.state.store.get('playingAlbum');
  const isPlaying = album.id && album.id === playingAlbumId;
  const className = [];
  const hasAudio = (album.audios || []).length > 1;
  const hasImages = (album.images || []).length > 1;
  const hasVideo = (album.videos || []).length > 1;
  let onclick;

  if (album.onclick) {
    onclick = album.onclick;
  }
  else if (isSelected) {
    onclick = _.partial(vnode.state.showFullScreenAlbumCover, album.id);
  } else {
    onclick = hasAudio || hasVideo
    ? _.partial(vnode.state.selectAlbum, album.id)
    : _.partial(vnode.state.openAlbumGallery, album.id);
  }

  if (isSelected) {
    className.push('is-selected');
  }
  if (isPlaying && playing) {
    className.push('is-playing');
  }

  return m('.covers__album', {
    className: className.join(' '),
    key: album.id
  }, [
    albumCoverView(vnode, album, {
      onclick
    }),
    m('i.icon.covers__album-icon', {
      className: isPlaying ? '' : 'is-hidden'
    }, playing ? 'play_circle_filled' : 'pause_circle_filled')
  ]);
}
