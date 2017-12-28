const path = require('path');
const fs = require('fs');
const Koa = require('koa');
const static = require('koa-static');
const stream = require('koa-stream');
const Router = require('koa-router');
const sendFile = require('koa-sendfile');
const isMediaFile = require('./isMediaFile');

function decodePath(_path) {
  return decodeURIComponent(_path)
  .replace(/\&comma\;/g, ',')
  .replace(/\&apos\;/g, "'")
}

function server(config) {
  const app = new Koa();
  const router = new Router();

  app
  .use(async (ctx) => {
    if (ctx.path.indexOf('/library/') !== -1) {
      const src = decodePath(ctx.path.replace('/library/', ''));
      console.log('GET:', src);
      stream.file(ctx, src, { root: '/' });
    } else if (ctx.path === '/') {
      stream.file(ctx, path.join(__dirname, '../public/index.html'), { root: '/' });
    } else {
      stream.file(ctx, path.join(__dirname, '../public', ctx.path), { root: '/' });
    }
  })
  .listen(config.port);

  console.log(`Listening on localhost:${config.port}`);
}

module.exports = server;
