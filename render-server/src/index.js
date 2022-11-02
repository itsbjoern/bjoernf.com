console.log('Starting server...');

import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import path, { dirname } from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import moduleAlias from 'module-alias';
import fetch, { Headers } from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { isDevelopment, getArguments } from './util.js';
import { renderHandler } from './handler/render.js';
import { staticHandler } from './handler/static.js';

// Import for ES-Module necessary
if (!global.fetch) {
  global.fetch = fetch;
  global.Headers = Headers;
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
      (req.path.indexOf('assets/') !== -1 || req.path.endsWith('.js.map'))
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
