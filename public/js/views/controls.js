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
  const volume = vnode.state.store.get('volume', 1) || 1;
  const currentTrack = isPlaying ? playingTrack : selectedAudioTrack;
  let tracks = [];
  let hasAudio = false;
  let hasVideo = false;

  if (selectedAlbum) {
    hasAudio = selectedAlbum.audios.length > 0;
    hasVideo = selectedAlbum.videos.length > 0;

    if (hasAudio) {
      tracks = selectedAlbum.audios;
    } else if (hasVideo) {
      tracks = selectedAlbum.videos;
    }
  }

  return m('section.controls',
    selectedAlbum && (hasAudio || hasVideo) ? [
        m('.controls__album', albumCoverView(vnode, selectedAlbum, {
          onclick: _.partial(vnode.state.showFullScreenAlbumCover, selectedAlbum.id)
        })),
        m('.controls__album-track', [
          `${selectedAlbum.artist} - ${selectedAlbum.title}`, m('br'),
          `${currentTrack + 1} / ${tracks.length}`, ': ',
          tracks[currentTrack]
          ? `${pathBasename(tracks[currentTrack], pathExtname(tracks[currentTrack]))}`
          : null
        ]),
        m('.controls__duration', [
          formatTime(currentTime),
          ' / ',
          formatTime(duration)
        ]),
        m('.controls__volume', [
          m('i.icon.controls__volume-icon.controls__volume-icon--down', {
            onclick: vnode.state.handleVolumeDown,
          }, 'volume_down'),
          m('.controls__volume-bar', 
            m('.controls__volume-bar-indicator', {
              style: {width: (volume * 100) + '%'}
            })
          ),
          m('i.icon.controls__volume-icon.controls__volume-icon--up', {
            onclick: vnode.state.handleVolumeUp,
          }, 'volume_up'),
        ]),
        playbackControlsView(vnode, selectedAlbum)
    ] : null
  );
}
