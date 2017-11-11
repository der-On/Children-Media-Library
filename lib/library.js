const fs = require('fs');
const path = require('path');
const first = require('lodash/first');
const last = require('lodash/last');
const flatten = require('lodash/flatten');
const sortBy = require('lodash/sortBy');
const flow = require('lodash/flow');
const sha1 = require('sha1');
const partialRight = require('lodash/partialRight');
const throttle = require('lodash/throttle');
const find = require('lodash/find');
const pSeries = require('es6-promise-series');
const fetch = require('node-fetch');
const mb = require('musicbrainz');
const mediaExtensions = require('./mediaExtensions');

function downloadCover(album) {
  console.log(`Downloading Cover art for "${album.artist} - ${album.title}" ...`);
  mb.searchReleases(album.title, { artist: album.artist}, (err, releases) => {
    if (err) {
      console.error(err);
      return;
    }

    const release = first(releases) || null;

    if (!release) {
      console.log(`Unable to find album "${album.artist} - ${album.title}" on musicbrainz.`);
      return;
    }

    fetch(`https://coverartarchive.org/release/${release.id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then(res => {
      if (!res.ok) {
        return Promise.reject(new Error(`Unable to find cover art for album "${album.artist} - ${album.title}".`));
        return;
      }
      return res.json();
    })
    .then(json => {
      if (!json) {
        return Promise.reject(new Error(`Unable to find cover art for album "${album.artist} - ${album.title}".`));
      }

      let image = find(json.images, ['front', true]) || first(json.images);
      if (!image) {
        return Promise.reject(new Error(`Unable to find cover art for album "${album.artist} - ${album.title}".`));
      }

      return fetch(image.image);
    })
    .then(res => {
      if (!res.ok) {
        return Promise.reject(new Error(`Unable to download cover art for album "${album.artist} - ${album.title}".`));
      }

      res.body.pipe(fs.createWriteStream(album.cover));
    })
    .catch(console.error.bind(console));
  });
}

function humanizeFilename(file) {
  return file.replace(/_/g, ' ').trim();
}

function readdirRecursiveSync(src) {
  const dirs = fs
  .readdirSync(src)
  .map(prefixPath(src))
  .filter(isDir);

  return flatten(
    dirs.concat(dirs.map(readdirRecursiveSync))
  );
}

const prefixPath = (prefix) => (src) => {
  return path.join(prefix, src);
}

function albumContainsMedia(album) {
  return album.media.length > 0;
}

function isDir(src) {
  return fs.statSync(src).isDirectory();
}

function isMedia(src) {
  return mediaExtensions.indexOf(path.extname(src).toLowerCase().trim()) !== -1;
}

function isAlbumCover(src) {
  return src.toLowerCase().search(/(.*)(\.jpg|\.png)/) !== -1;
}

function fileSize(file) {
  return fs.statSync(file).size;
}

function scanAlbum(src) {
  const files = fs.readdirSync(src).map(prefixPath(src));
  const cover = findAlbumCover(files);
  const album = {
    id: sha1(src),
    src,
    artist: albumArtist(src),
    title: albumTitle(src),
    media: files.filter(isMedia),
    cover: cover || path.join(src, 'cover.jpg')
  };

  // async download cover
  if (!cover && albumContainsMedia(album)) {
    downloadCover(album);
  }

  return Promise.resolve(album);
}

function albumTitle(src) {
  let title = flow(
    last,
    humanizeFilename
  )(src.split(path.sep)) || '';

  if (title.indexOf(' - ') > 3) {
    title = last(title.split(' - '));
  }

  return title.trim();
}

function albumArtist(src) {
  const parts = src.split(path.sep);
  let artist;
  let title = flow(
    last,
    humanizeFilename
  )(parts) || '';

  if (title.indexOf(' - ') > 3) {
    artist = first(title.split(' - '));
  } else {
    parts.pop()
    artist = humanizeFilename(parts.pop());
  }

  return artist.trim();
}

function findAlbumCover(files) {
  return flow(
    partialRight(sortBy, fileSize),
    first
  )(files.filter(isAlbumCover)) || null;
}

function scan(dirs) {
  return Promise
  .all(dirs.map(scanSrc))
  .then(albums => {
    return Promise.resolve({
      updatedAt: (new Date()).toISOString(),
      albums: flatten(albums)
    });
  });
}

function scanSrc(src) {
  return findAlbums(src);
}

function findAlbums(src) {
  return Promise
  .resolve(readdirRecursiveSync(src))
  .then(dirs => {
    return pSeries(dirs.map(flow(scanAlbum)));
  })
  .then(albums => {
    return Promise.resolve(albums.filter(albumContainsMedia));
  });
}

function loadIndex() {
  return Promise.resolve(
    JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'library.json'), 'utf8'))
  );
}

module.exports.scan = scan;
module.exports.loadIndex = loadIndex;
