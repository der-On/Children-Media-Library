const fs = require('fs');
const path = require('path');
const sendFile = require('koa-sendfile');
const mime = require('mime');

function parseRange(range, totalLength) {
  if (typeof range === 'undefined' || range === null || range.length === 0) {
    return null;
  }

  let array = range.split(/bytes=([0-9]*)-([0-9]*)/);
  let result = {
    start: parseInt(array[1]),
    end: parseInt(array[2])
  };

  if (isNaN(result.end) || result.end < 0) {
    result.end = totalLength - 1;
  }

  if (isNaN(result.start) || result.start < 0) {
    result.start = 0;
  }

  result.totalLength = totalLength;

  return result;
}

function endRequest(ctx, size) {
  ctx.set('Content-Range', 'bytes */' + size);
  ctx.body = null;
  ctx.status = 416;
}

function streamRange(ctx, body, range, contentType) {
  ctx.set('Content-Range', 'bytes ' + range.start + '-' + range.end + '/' + range.totalLength);
  ctx.set('Content-Length', range.end - range.start + 1);
  ctx.set('Content-Type', contentType);
  ctx.set('Accept-Ranges', 'bytes');
  ctx.set('Cache-Control', 'no-cache');
  ctx.status = 206;
  ctx.body = body;
}

function handleFileStream(ctx, range, filepath) {
  let stream = fs.createReadStream(filepath, {start: range.start, end: range.end});
  let contentType = mime.getType(filepath);
  streamRange(ctx, stream, range, contentType);
}

function streamFile(ctx, filepath) {
  const stat = fs.statSync(filepath);
  if (!stat || !stat.isFile()) {
    return;
  }

  const range = parseRange(ctx.headers.range, stat.size);

  if (range === null) {
    return sendFile(ctx, filepath);
  }

  if (range.start >= stat.size || range.end >= stat.size) {
    return endRequest(ctx, stat.size);
  }

  return handleFileStream(ctx, range, filepath, stat);
}

module.exports = streamFile;
