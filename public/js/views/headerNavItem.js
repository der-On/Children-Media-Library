export default function headerNavItemView(vnode, item) {
  const pressHandler = _.partial(vnode.state.handleHeaderNavItemPress, item);
  const releaseHandler = _.partial(vnode.state.handleHeaderNavItemRelease, item);
  const cancelHandler = _.partial(vnode.state.handleHeaderNavItemCancel, item);
  const isActivating = _.get(vnode.state.pressedHeaderNavItem, 'id') === item.id;

  return m('button.header__nav-item', {
    class: isActivating ? 'is-activating' : '',
    onmousedown: pressHandler,
    ontouchstart: pressHandler,
    onmouseup: releaseHandler,
    ontouchend: releaseHandler,
    ontouchcancel: cancelHandler
  }, [
    m('img.header__nav-item-icon', {
      src: item.icon
    }),
    m('.header__nav-item-label', item.label || ''),
    m('.header__nav-item-loader')
  ])
}
