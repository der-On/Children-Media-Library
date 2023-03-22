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
  const dirs = [];

  function makeGroups(parentDir = null) {
    const groups = [];
    const isAlbumDir = !!_.find(library.albums, ['src', parentDir]);

    if (isAlbumDir) {
      return groups;
    }

    const subDirs = dirs.filter((dir) => {
      if (parentDir) {
        return pathParentDir(dir) === parentDir;
      } else {
        // root dir, without slash
        return dir.indexOf('/') === -1;
      }
    });

    subDirs.forEach((dirPath) => {
      const isAlbumDir = !!_.find(library.albums, ['src', dirPath]);
      if (isAlbumDir) {
        return;
      }

      const group = {
        id: dirPath,
        title: pathBasename(dirPath),
        src: dirPath,
        groups: makeGroups(dirPath),
        albums: findAlbums(dirPath),
      };
      groups.push(group);
    });

    return groups;
  }

  function collectGroups(parentGroup = null, groups = []) {
    if (!parentGroup) {
      library.rootGroups.forEach((group) => {
        groups.push(group);
        collectGroups(group, groups);
      });
    } else {
      parentGroup.groups.forEach((group) => {
        groups.push(group);
        collectGroups(group, groups);
      });
    }

    return groups;
  }

  function findAlbums(dirPath) {
    return library.albums.filter((album) => {
      return pathParentDir(album.src) === dirPath;
    });
  }

  // collect groups and albums
  // and at the same time only keep albums on top level
  // that are in the root directory
  library.rootAlbums = library.albums.filter(function (album) {
    album.cover = getLibraryPath(album.cover);
    album.images = album.images.map(getLibraryPath);
    album.videos = album.videos.map(getLibraryPath);
    album.audios = album.audios.map(getLibraryPath);

    // album is in root dir, keep it
    if (album.src.indexOf('/') === -1) {
      return true;
    }

    // collects individual directories that are not albums
    const dir = pathParentDir(album.src);
    if (dirs.indexOf(dir) === -1) {
      dirs.push(dir);
    }

    // album is not in root dir, remove it
    return false;
  });

  function createRecentGroup() {
    const recentAlbums = _.reverse(
      _.sortBy(library.albums.filter(album => {
        return !album.isPodcast;
      }), ['createdAt'])
    );
    
    const group = {
      id: 'recent',
      title: 'Recent',
      src: null,
      groups: [],
      albums: recentAlbums,
    };

    return group;
  }

  // dirs are already sorted naturally,
  // this way subdirs appear lower
  const recentGroup = createRecentGroup();
  library.rootGroups = makeGroups();
  library.groups = collectGroups();

  // finally add virtual recent group as first
  library.rootGroups.unshift(recentGroup);
  library.groups.unshift(recentGroup);
  console.log(library);
  return library;
}

export function getLibraryPath(path) {
  if (path && path.indexOf('http') !== 0 && path.indexOf('./proxy/') !== 0) {
    return './library/' + encodeURI(path);
  } else {
    return path;
  }
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

export function pathParentDir(path) {
  return path.split('/').slice(0, -1).join('/');
}
