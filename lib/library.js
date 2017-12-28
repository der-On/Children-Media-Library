const fs = require('fs');
const path = require('path');
const first = require('lodash/first');
const last = require('lodash/last');
const flatten = require('lodash/flatten');
const sortBy = require('lodash/sortBy');
const flow = require('lodash/flow');
const property = require('lodash/property');
const partialRight = require('lodash/partialRight');
const throttle = require('lodash/throttle');
const find = require('lodash/find');
const sha1 = require('sha1');
const natsort = require('natsort');
const pSeries = require('es6-promise-series');
const promisify = require('es6-promisify');
const streamToPromise = require('stream-to-promise');
const fetch = require('node-fetch');
const mb = require('musicbrainz');
const isMediaFile = require('./isMediaFile');
const config = require('../config.json');

const mbSearchReleases = promisify(mb.searchReleases, mb);
const coversToDownload = [];

function downloadCoverFromCoverArtArchive(album) {
  return mbSearchReleases(album.title, {artist: album.artist})
  .then(releases => {
    const release = first(releases) || null;
    if (!release) {
      return Promise.reject(new Error(`Unable to find album "${album.artist} - ${album.title}" on musicbrainz.`));
    }

    return fetch(`https://coverartarchive.org/release/${release.id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  })
  .then(res => {
    if (!res.ok) {
      return Promise.reject(new Error(`Unable to find cover art for album "${album.artist} - ${album.title}" on coverartarchive.org`));
    }
    return res.json();
  })
  .then(json => {
    if (!json) {
      return Promise.reject(new Error(`Unable to find cover art for album "${album.artist} - ${album.title}" on coverartarchive.org`));
    }

    let image = find(json.images, ['front', true]) || first(json.images);
    if (!image) {
      return Promise.reject(new Error(`Unable to find cover art for album "${album.artist} - ${album.title}" on coverartarchive.org`));
    }

    return fetch(image.image);
  })
  .then(res => {
    if (!res.ok) {
      return Promise.reject(new Error(`Unable to download cover art for album "${album.artist} - ${album.title}" from coverartarchive.org`));
    }

    return streamToPromise(
      res.body
      .pipe(fs.createWriteStream(album.cover))
    );
  });
}

function downloadCoverFromLastFm(album) {
  return fetch(`http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${config.lastFmApiKey}&artist=${album.artist}&album=${album.title}&format=json`)
  .then(res => {
    if (!res.ok) {
      return Promise.reject(new Error(`Unable to find album "${album.artist} - ${album.title}" on musicbrainz`));
    }

    return res.json();
  })
  .then(json => {
    if (json.error) {
      return Promise.reject(new Error(`Unable to find album "${album.artist} - ${album.title}" on last.fm`));
    }

    const image = find(json.album.image, ['size', '']);

    if (!image || !image['#text']) {
      return Promise.reject(new Error(`Unable to find cover art for album "${album.artist} - ${album.title}" on last.fm`));
    }

    return fetch(image['#text']);
  })
  .then(res => {
    if (!res.ok) {
      return Promise.reject(new Error(`Unable to download cover art for album "${album.artist} - ${album.title}" from last.fm`));
    }

    return streamToPromise(
      res.body
      .pipe(fs.createWriteStream(album.cover))
    );
  });
}

function downloadCoverFromDiscogs(album) {
  return fetch(`https://api.discogs.com/database/search?title=${encodeURIComponent(`${album.artist} - ${album.title}`)}&type=release`)
  .then(res => {
    if (!res.ok) {
      return Promise.reject(new Error(`Unable to find album "${album.artist} - ${album.title}" on discogs`));
    }

    return res.json();
  })
  .then(json => {
    console.log(json);
    if (json.error) {
      return Promise.reject(new Error(`Unable to find album "${album.artist} - ${album.title}" on discogs`));
    }

    const image = find(json.album.image, ['size', '']);

    if (!image || !image['#text']) {
      return Promise.reject(new Error(`Unable to find cover art for album "${album.artist} - ${album.title}" on discogs`));
    }

    return fetch(image['#text']);
  })
  .then(res => {
    if (!res.ok) {
      return Promise.reject(new Error(`Unable to download cover art for album "${album.artist} - ${album.title}" from discogs`));
    }

    return streamToPromise(
      res.body
      .pipe(fs.createWriteStream(album.cover))
    );
  });
}

function downloadCover(album) {
  console.log(`Trying to download cover art for "${album.artist} - ${album.title}" from coverartarchive.org`);

  return downloadCoverFromCoverArtArchive(album)
  .catch(err => {
    console.log(err.message);
    console.log(`Trying to download cover art for "${album.artist} - ${album.title}" from discogs.com`);
    return downloadCoverFromDiscogs(album);
  })
  .catch(err => {
    console.log(err.message);
    console.log(`Trying to download cover art for "${album.artist} - ${album.title}" from last.fm`);
    return downloadCoverFromLastFm(album);
  })
  .catch(err => {
    console.log(err.message);
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
  dirs.sort(natsort());

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

function isAlbumCover(src) {
  return src.toLowerCase().search(/(.*)(\.jpg|\.png)/) !== -1;
}

function fileSize(file) {
  return fs.statSync(file).size;
}

function scanAlbum(src) {
  const files = fs.readdirSync(src).map(prefixPath(src));
  files.sort(natsort());
  const cover = findAlbumCover(files);
  const album = {
    id: sha1(src),
    src,
    artist: albumArtist(src),
    title: albumTitle(src),
    media: files.filter(isMediaFile),
    cover: cover || path.join(src, 'cover.jpg')
  };

  // push cover download to queue
  if (!cover && albumContainsMedia(album)) {
    coversToDownload.push(album);
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
  })
  .then(albums => {
    // download covers in the backgroud
    pSeries(coversToDownload.map(flow(downloadCover)));

    // resolve with albums
    return Promise.resolve(albums);
  });
}

function scanSrc(src) {
  return findAlbums(src);
}

function findAlbums(src) {
  return Promise
  .resolve(readdirRecursiveSync(src))
  .then(dirs => {
    // remove hidden directories and MACOSX dirs
    dirs = dirs.filter(dir => {
      return dir.indexOf('.') === -1 && dir.indexOf('__MACOSX') === -1;
    });
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
