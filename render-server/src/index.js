console.log('Starting server...');

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
// Import for ES-Module necessary
const nodeFetch = import('node-fetch');

const { isDevelopment, getArguments } = require('./util');
const { renderHandler } = require('./handler/render');
const { staticHandler } = require('./handler/static');

if (!global.fetch) {
  global.fetch = nodeFetch.default;
  global.Headers = nodeFetch.Headers;
}

const args = getArguments();
const ADDRESS = args.address;
const PORT = args.port;

const createApp = () => {
  const app = express();

  app.use(bodyParser.json());

  app.get('/*', async function (req, res) {
    if (
      isDevelopment &&
      (req.path.indexOf('static/') !== -1 || req.path.endsWith('.js.map'))
    ) {
      return await staticHandler(req, res);
    }
    res.set('Content-Type', 'text/html');
    return await renderHandler(req, res);
  });

  return app;
};

const app = createApp();
let server = http.Server(app);
server.listen(PORT, ADDRESS, function () {
  console.log(
    'React render server listening at http://' + ADDRESS + ':' + PORT
  );
});
