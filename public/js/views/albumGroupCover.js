import {
  albumColor,
  pathBasename,
} from '../utils.js';

export default function albumGroupCoverView(vnode, albumGroup, args = {}) {
  const title = pathBasename(albumGroup.title) || '';
  const backgroundImages = albumGroup.albums
  .slice(0, 4)
  .map(function (album) {
    return `url("${album.cover}")`;
  });
  return m('figure.album__group-cover', _.assign({
    style: `background-color: ${albumColor(albumGroup, 50, 60)};`,
    title: title
  }, args), [
    m('figcaption.album__group-cover-caption', title),
    m('.album__group-cover-images.lazy-load', {
      style: `background-image: ${backgroundImages.join(', ')};`,
      'data-loaded': 'false',
    })
  ]);
}
