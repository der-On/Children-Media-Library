import groupCoverView from './groupCover.js';

function hasPlayingAlbum(group, playingAlbumId) {
  let isPlaying = _.findIndex(group.albums, ['id', playingAlbumId]) !== -1;

  // look in sub groups
  if (!isPlaying && group.groups.length) {
    for(let i = 0; i < group.groups.length; i++) {
      if (hasPlayingAlbum(group.groups[i], playingAlbumId)) {
        return true;
      }
    }
  }

  return isPlaying;
}

export default function groupView(vnode, group) {
  const className = [];
  const onclick = _.partial(vnode.state.openGroup, group.id);
  const playing = vnode.state.store.get('playing', false);
  const playingAlbumId = vnode.state.store.get('playingAlbum');
  const isPlaying = playingAlbumId && hasPlayingAlbum(group, playingAlbumId);

  return m('.covers__album', {
    className: className.join(' '),
    key: group.src
  }, [
    groupCoverView(vnode, group, {
      onclick
    }),
    m('i.icon.covers__album-icon', {
      className: isPlaying ? '' : 'is-hidden'
    }, playing ? 'play_circle_filled' : 'pause_circle_filled')
  ]);
}
