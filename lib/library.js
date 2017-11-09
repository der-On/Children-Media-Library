const fs = require('fs');
const path = require('path');
const first = require('lodash/first');
const last = require('lodash/last');
const flatten = require('lodash/flatten');
const sortBy = require('lodash/sortBy');
const flow = require('lodash/flow');
const sha1 = require('sha1');
const partialRight = require('lodash/partialRight');
const mediaExtensions = require('./mediaExtensions');

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
  return {
    id: sha1(src),
    src,
    title: albumTitle(src),
    media: files.filter(isMedia),
    cover: findAlbumCover(files)
  };
}

function albumTitle(src) {
  return (last(src.split(path.sep)) || '').replace(/_/g, ' ');
}

function findAlbumCover(files) {
  return flow(
    files.filter(isAlbumCover),
    partialRight(sortBy, fileSize),
    first
  )() || null;
}

function scan(dirs) {
  return Promise.resolve({
    updatedAt: (new Date()).toISOString(),
    albums: dirs.map(scanScr)
  });
}

function scanScr(src) {
  return {
    id: sha1(src),
    src,
    albums: findAlbums(src)
  };
}

function findAlbums(src) {
  return readdirRecursiveSync(src)
  .map(scanAlbum)
  .filter(albumContainsMedia);
}

function loadIndex() {
  return Promise.resolve(
    JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'library.json'), 'utf8'))
  );
}

module.exports.scan = scan;
module.exports.loadIndex = loadIndex;
