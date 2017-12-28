const path = require('path');
const fs = require('fs');
const Koa = require('koa');
const static = require('koa-static');
const Router = require('koa-router');
const sendFile = require('koa-sendfile');
const isMediaFile = require('./isMediaFile');
const streamFile = require('./streamFile');

function decodePath(_path) {
  return decodeURIComponent(_path)
  .replace(/\&comma\;/g, ',')
  .replace(/\&apos\;/g, "'")
}

function server(config) {
  const app = new Koa();
  const router = new Router();

  app
  .use(static(path.join(__dirname, '../public'), {
    defer: true
  }))
  .use(async (ctx, next) => {
    if (ctx.path.indexOf('/library/') !== -1) {
      const src = decodePath(ctx.path.replace('/library/', ''));
      console.log('GET:', src);

      isMediaFile(src)
        ? streamFile(ctx, src)
        : await sendFile(ctx, src);
    } else {
      await next();
    }
  })
  .listen(config.port);

  console.log(`Listening on localhost:${config.port}`);
}

module.exports = server;
