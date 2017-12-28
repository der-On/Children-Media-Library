const path = require('path');
const mediaExtensions = require('./mediaExtensions');

function isMediaFile(src) {
  return mediaExtensions.indexOf(path.extname(src).toLowerCase().trim()) !== -1;
}

module.exports = isMediaFile;
