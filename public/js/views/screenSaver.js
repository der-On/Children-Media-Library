export default function screenSaverView(vnode) {
  return m('.screen-saver', {
    onclick: vnode.state.handleScreenSaverClick
  });
}
