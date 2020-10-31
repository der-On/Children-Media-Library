export default function albumGalleryView(vnode) {
  const albumGallery = vnode.state.getAlbumById(vnode.state.store.get('openedAlbumGallery'));

  return albumGallery ? m('.gallery',
    null
  ) : null;
}
