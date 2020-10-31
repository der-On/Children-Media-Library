export function encodePath(path) {
  return encodeURIComponent(path)
  .replace(/'/g, '&apos;')
  .replace(/,/g,'&comma;');
}

function _albumColor(album, saturation = 20, lightness = 50) {
  return strToColor(album.artist + album.title, saturation, lightness);
}

export function strToColor(str, saturation = 20, lightness = 50) {
  const h = hashCode(str) % 360;
  return `hsl(${h}, ${saturation}%, ${lightness}%)`;
}

export const albumColor = _.memoize(_albumColor, function (album, saturation, lightness) {
  return album.id + saturation + lightness;
});

export function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time > 0 ? Math.floor(time - (minutes * 60)) : 0;

  return _.padEnd('0', 2, minutes) + ':' + _.padEnd('0', 2, seconds);
}

export function hashCode(str) {
  var hash = 0;
  if (str.length == 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash<<5)-hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

export function groupLibrary(library) {
  library.groups = [];
  const groupsByPath = {};
  library.albums.forEach(function (album) {
    album.cover = './library/' + encodeURI(album.cover);
    const pathParts = album.src.split('/');

    if (pathParts.length > 1) {
      var dirPath = pathParts.slice(0, -1).join('/');
      if (!groupsByPath[dirPath]) {
        var group = {
          id: dirPath,
          title: dirPath,
          src: dirPath,
          albums: [album]
        };
        library.groups.push(group);
        groupsByPath[dirPath] = group;
      } else {
        groupsByPath[dirPath].albums.push(album);
      }
    }
  });

  return library;
}

export function pathExtname(path) {
  const ext = _.last(path.split('.'));
  return ext ? '.' + ext : null;
}

export function pathBasename(path, ext = null) {
  const basename = _.last(path.split('/'));
  if (ext && basename.indexOf(ext) === basename.length - ext.length) {
    return basename.substr(0, basename.length - ext.length);
  }
  return basename;
}
