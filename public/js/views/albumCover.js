import {
  albumColor,
} from '../utils.js';

export default function albumCoverView(vnode, album, args = {}) {
  let title = '';
  const hasAudio = (album.audios || []).length > 0;
  const hasImages = (album.images || []).length > 0;
  const hasVideos = (album.videos || []).length > 0;

  if (album.artist && album.title) {
    title = `${album.artist} - ${album.title}`
  } else if(album.title) {
    title = album.title;
  };

  if (!hasAudio && hasImages) {
    const backgroundImages = album.images
    .slice(0, 4)
    .map(function (image) {
      return `url("${image}?w=70&h=70")`;
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
    const backgroundImage = `url("${album.cover}?w=140&h=140")`;
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
