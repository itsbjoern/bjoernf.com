import path, { dirname } from 'path';
import fs from 'fs';
import { render } from 'preact-render-to-string';
import { h } from 'preact';
import { ServerStyleSheet } from 'styled-components';
import { fileURLToPath } from 'url';

import { isDevelopment } from '../util.js';
import { hydrateIndex } from '../hydrate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distPath = path.join(__dirname, '..', '..', 'dist');
const appServerPath = path.join(distPath, 'node', 'AppServer.mjs');

let AppServer = null;
import(appServerPath).then((AS) => {
  AppServer = AS;
});

const indexFilePath = path.join(distPath, 'browser', 'index.html');
let indexFile = fs.readFileSync(indexFilePath, { encoding: 'utf-8' });

const reloadInDev = () => {
  if (isDevelopment) {
    import(appServerPath).then((AS) => {
      AppServer = AS;
    });

    indexFile = fs.readFileSync(indexFilePath, { encoding: 'utf-8' });
  }
};

const renderHandler = async (req, res) => {
  reloadInDev();

  const AppServerElement = AppServer.default;
  const createSSRContext = AppServer.createSSRContext;
  try {
    const { resolveData } = createSSRContext();

    const RenderComponent = h(AppServerElement, {
      ssr: {
        url: req.originalUrl,
        host: process.env.API_CONNECTION_WEBHOST,
      },
    });

    const _prepRun = render(RenderComponent);
    const resolvedData = await resolveData();

    const renderedApp = render(RenderComponent);
    const html = hydrateIndex(indexFile, req, renderedApp, resolvedData);

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (e) {
    console.log(e);
    res.status(200);
    res.send(Buffer.from(indexFile));
  }
};

export { renderHandler };
