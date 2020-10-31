export default function fullscreenAlbumCoverView(vnode) {
  const album = vnode.state.getAlbumById(vnode.state.store.get('selectedAlbum'));
  const fullscreenAlbumId = vnode.state.store.get('fullscreenAlbum');

  return album ? m('figure.album__cover.album__cover--fullscreen', {
    className: fullscreenAlbumId !== album.id ? 'is-hidden' : '',
    onclick: vnode.state.hideFullScreenAlbumCover,
    title: `${album.artist} - ${album.title}`
  }, [
    m('.album__cover-image', {
      style: `background-image: url("${album.cover}")`
    })
  ]) : null;
}
