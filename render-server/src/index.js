console.log('Starting server...');

require('dotenv').config();
const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const moduleAlias = require('module-alias');

const { isDevelopment, getArguments } = require('./util');
if (isDevelopment) {
  moduleAlias.addAliases({
    react: path.join(__dirname, '..', 'node_modules', 'react'),
    'react-dom': path.join(__dirname, '..', 'node_modules', 'react-dom'),
    'styled-components': path.join(
      __dirname,
      '..',
      'node_modules',
      'styled-components'
    ),
  });
}
const { renderHandler } = require('./handler/render');
const { staticHandler } = require('./handler/static');

// Import for ES-Module necessary
if (!global.fetch) {
  const nodeFetch = import('node-fetch').then(({ default: fetch, Headers }) => {
    global.fetch = fetch;
    global.Headers = Headers;
  });
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
