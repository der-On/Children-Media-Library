export function lazyLoad() {
  const viewHeight = window.innerHeight;
  const viewWidth = window.innerWidth;
  Array.from(document.querySelectorAll('.lazy-load[data-loaded="false"]'))
  .forEach((el) => {
    const bounds = el.getBoundingClientRect();

    if (!(
      bounds.left > viewWidth ||
      bounds.right < 0 ||
      bounds.top > viewHeight ||
      bounds.bottom < 0
    )) {
      el.setAttribute('data-loaded', 'true');
    }
  });
  
  m.redraw();
}

export const lazyLoadDelayed = () => {
  _.delay(lazyLoad, 100);
}
