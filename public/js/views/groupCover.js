import {
  albumColor,
  pathBasename,
} from '../utils.js';

export default function groupCoverView(vnode, group, args = {}) {
  const title = group.title || '';

  const backgroundImages = group.albums
  .slice(0, 4)
  .map(function (album) {
    return `url("${album.cover}")`;
  });
  return m('figure.album__group-cover', _.assign({
    style: `background-color: ${albumColor(group, 50, 60)};`,
    title: title
  }, args), [
    m('figcaption.album__group-cover-caption', title),
    m('.album__group-cover-images.lazy-load', {
      style: `background-image: ${backgroundImages.join(', ')};`,
      'data-loaded': 'false',
    })
  ]);
}
