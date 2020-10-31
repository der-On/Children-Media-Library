const Gallery = {
  oncreate: (vnode) => {
    vnode.state.splide = new Splide(vnode.dom, {
      type: 'loop',
      lazyLoad: 'nearby',
      preloadPages: 2
    }).mount();
  },
  view: (vnode) => {
    const images = vnode.attrs.images;
    return m('.gallery.splide',
      m('.splide__track',
        m('.splide__list', images.map(imageView))
      ),
      m('button.gallery__close', {
        onclick: vnode.attrs.onclose,
        title: 'Close',
      }, m('img.gallery__close-icon', {
        src: 'images/close_icon.png',
        alt: 'Close'
      }))
    );
  }
};

function imageView(image) {
  return m('li.splide__slide.gallery__item',
    m('img.gallery__image', {
      'data-splide-lazy': image
    })
  );
}

export default Gallery;
