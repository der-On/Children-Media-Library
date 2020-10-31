import playbackControlsProgressView from './playbackControlsProgress.js';

export default function playbackControlsView(vnode, album) {
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
    album.audios.length > 0 && playingTrack < album.audios.length - 1 ? m('i.icon.controls__playback-icon.controls__playback-icon--next', {
      onclick: vnode.state.nextTrack
    }, 'skip_next') : null,
    isPlaying ? playbackControlsProgressView(vnode) : null
  ]);
}
