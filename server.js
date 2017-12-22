const server = require('./lib/server');
const bluetooth = require('./lib/bluetooth');
const config = require('./config.json');

bluetooth(config);
server(config);
