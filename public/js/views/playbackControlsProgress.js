export default function playbackControlsProgressView(vnode) {
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
