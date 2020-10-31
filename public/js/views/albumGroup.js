import albumGroupCoverView from './albumGroupCover.js';

export default function albumGroupView(vnode, albumGroup) {
  const className = [];
  const onclick = _.partial(vnode.state.openAlbumGroup, albumGroup.id);
  const playing = vnode.state.store.get('playing', false);
  const playingAlbumId = vnode.state.store.get('playingAlbum');
  const isPlaying = playingAlbumId ? _.findIndex(albumGroup.albums, ['id', playingAlbumId]) !== -1 : false;

  return m('.albums__album', {
    className: className.join(' '),
    key: albumGroup.src
  }, [
    albumGroupCoverView(vnode, albumGroup, {
      onclick
    }),
    m('i.icon.albums__album-icon', {
      className: isPlaying ? '' : 'is-hidden'
    }, playing ? 'play_circle_filled' : 'pause_circle_filled')
  ]);
}
