const path = require('path');
const fs = require('fs');
const render = require('preact-render-to-string');
const { h } = require('preact');
const { ServerStyleSheet } = require('styled-components');

const { isDevelopment } = require('../util');
const { hydrateIndex } = require('../hydrate');

const distPath = path.join(__dirname, '..', '..', 'dist');
const appServerPath = path.join(distPath, 'node', 'AppServer.js');
let AppServer = require(appServerPath);

const indexFilePath = path.join(distPath, 'browser', 'index.html');
let indexFile = fs.readFileSync(indexFilePath, { encoding: 'utf-8' });

const reloadInDev = () => {
  if (isDevelopment) {
    delete require.cache[
      Object.keys(require.cache).find((k) => k.endsWith('AppServer.js'))
    ];
    AppServer = null;

    AppServer = require(appServerPath);
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
        url: req.path,
        host: process.env.API_CONNECTION_WEBHOST,
      },
    });

    const sheet = new ServerStyleSheet();
    const _prepRun = render(RenderComponent);
    const resolvedData = await resolveData();
    const renderedApp = render(sheet.collectStyles(RenderComponent));
    const styleTags = sheet.getStyleTags();
    sheet.seal();
    console.log('here', styleTags);
    res.send(
      Buffer.from(
        hydrateIndex(indexFile, req, renderedApp, resolvedData, styleTags)
      )
    );
  } catch (e) {
    console.log(e);
    res.status(200);
    res.send(Buffer.from(indexFile));
  }
};

module.exports = { renderHandler };
