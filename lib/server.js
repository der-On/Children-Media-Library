const path = require('path');
const Koa = require('koa');
const static = require('koa-static');
const Router = require('koa-router');
const sendFile = require('koa-sendfile');

function server(config) {
  const app = new Koa();
  const router = new Router();

  router.get('/library/:src', function (ctx, next) {
    const src = decodeURIComponent(ctx.params.src);
    console.log('GET:', src);

    return sendFile(ctx, src)
    .then(() => {
      if (!ctx.status) {
        ctx.throw(404);
      }
      next();
    });
  });

  app
  .use(static(path.join(__dirname, '..', 'public')))
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(config.port);

  console.log(`Listening on localhost:${config.port}`);
}

module.exports = server;
