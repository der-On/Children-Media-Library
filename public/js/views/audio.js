export default function audioView(vnode) {
  const album = vnode.state.getAlbumById(vnode.state.store.get('playingAlbum'));
  const playingTrack = vnode.state.store.get('playingTrack');

  return m('audio.audio', {
    id: 'controls__playback-audio',
    src: album ? `./library/${album.audios[playingTrack]}` : '',
    ontimeupdate: vnode.state.handleAudioTimeupdate,
    preload: 'auto'
  });
}
