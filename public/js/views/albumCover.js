import {
  albumColor,
} from '../utils.js';

export default function albumCoverView(vnode, album, args = {}) {
  let title = '';

  if (album.artist && album.title) {
    title = `${album.artist} - ${album.title}`
  } else if(album.title) {
    title = album.title;
  };

  if (album.images) {
    const backgroundImages = album.images
    .slice(0, 4)
    .map(function (image) {
      return `url("${image}")`;
    });
    return m('figure.album__group-cover', _.assign({
      style: `background-color: ${albumColor(album, 50, 60)};`,
      title: title
    }, args), [
      m('figcaption.album__group-cover-caption', title),
      m('.album__group-cover-images.lazy-load', {
        style: `background-image: ${backgroundImages.join(', ')};`,
        'data-loaded': 'false',
      })
    ]);
  } else {
    const backgroundImage = `url("${album.cover}")`;
    return m('figure.album__cover', _.assign({
      style: `background-color: ${albumColor(album, 50, 60)};`,
      title: title,
    }, args), [
      m('figcaption.album__cover-caption', title),
      m('.album__cover-image.lazy-load', {
        style: `background-image: ${backgroundImage};`,
        'data-loaded': 'false',
      })
    ]);
  }
}
