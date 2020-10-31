import {
  albumColor,
} from '../utils.js';

export default function albumCoverView(vnode, album, args = {}) {
  const backgroundImage = `url("${album.cover}")`;
  let title = '';

  if (album.artist && album.title) {
    title = `${album.artist} - ${album.title}`
  } else if(album.title) {
    title = album.title;
  };
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
