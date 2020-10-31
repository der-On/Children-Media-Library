import groupView from './group.js';
import albumView from './album.js';

export default function coverView(vnode, item) {
  const isGroup = _.has(item, 'albums');
  
  return isGroup
  ? groupView(vnode, item)
  : albumView(vnode, item);
}
