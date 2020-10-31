import {
  pathBasename,
  pathExtname,
  formatTime,
} from '../utils.js';
import albumCoverView from './albumCover.js';
import playbackControlsView from './playbackControls.js';

export default function controlsView(vnode) {
  const selectedAlbum = vnode.state.getAlbumById(vnode.state.store.get('selectedAlbum'));
  const playingAlbumId = vnode.state.store.get('playingAlbum');
  const isPlaying = selectedAlbum && playingAlbumId === selectedAlbum.id;
  const playingTrack = vnode.state.store.get('playingTrack');
  const selectedAudioTrack = vnode.state.store.get('selectedAudioTrack', 0);
  const currentTime = vnode.state.store.get('playingCurrentTime', 0) || 0;
  const duration = vnode.state.store.get('playingDuration', 0) || 0;
  const currentTrack = isPlaying ? playingTrack : selectedAudioTrack;

  return m('section.controls',
    selectedAlbum ? [
        m('.controls__album', albumCoverView(vnode, selectedAlbum, {
          onclick: _.partial(vnode.state.showFullScreenAlbumCover, selectedAlbum.id)
        })),
        m('.controls__album-track', [
          `${selectedAlbum.artist} - ${selectedAlbum.title}`, m('br'),
          `${currentTrack + 1} / ${selectedAlbum.audios.length}`, ': ',
          selectedAlbum.audios[currentTrack]
          ? `${pathBasename(selectedAlbum.audios[currentTrack], pathExtname(selectedAlbum.audios[currentTrack]))}`
          : null
        ]),
        m('.controls__duration', [
          formatTime(currentTime),
          ' / ',
          formatTime(duration)
        ]),
        playbackControlsView(vnode, selectedAlbum)
    ] : null
  );
}
