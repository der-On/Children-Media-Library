import Gallery from '../components/Gallery.js';

export default function albumGalleryView(vnode) {
  const albumGallery = vnode.state.getAlbumById(vnode.state.store.get('openedAlbumGallery'));
  const activeImage = vnode.state.store.get('activeGalleryImage', 0);

  return albumGallery
  ? m(Gallery, {
    images: albumGallery.images,
    activeImage: activeImage,
    onclose: vnode.state.closeAlbumGallery
  })
  : null;
}
