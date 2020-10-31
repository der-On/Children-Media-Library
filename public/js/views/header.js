import headerNavItemView from './headerNavItem.js';

export default function headerView(vnode) {
  return m('header.header', {
    className: vnode.state.headerIsVisible ? 'is-visible' : ''
  }, [
    m('nav.header__nav', [
      {
        id: 'shutdown',
        icon: '/images/shutdown_icon.png',
        label: 'shutdown',
        action: vnode.state.shutdown
      },
      {
        id: 'reload',
        icon: '/images/reload_icon.png',
        label: 'reload',
        action: vnode.state.reload
      },
      {
        id: 'scan',
        icon: '/images/search_icon.png',
        label: 'scan library',
        action: vnode.state.scanLibrary
      }
    ].map(_.partial(headerNavItemView, vnode)))
  ]);
}
