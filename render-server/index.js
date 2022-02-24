/* eslint-disable no-undef */
var argv = require('yargs')
  .option('p', {
    alias: 'port',
    description: "Specify the server's port",
    default: 9009,
  })
  .option('a', {
    alias: 'address',
    description: "Specify the server's address",
    default: '0.0.0.0',
  })
  .help('h')
  .alias('h', 'help')
  .strict().argv

const path = require('path')
const React = require('react')
const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const ReactDOMServer = require('react-dom/server')


const spawn = require('child_process').spawn
const nodePath = path.join(__dirname, 'dist')
const appServerPath = path.join(
  nodePath,
  'static',
  'js',
  'AppServer.js'
)
let distLoad = null
try {
  let distLoad = require(appServerPath)
} catch (e) {}

// Ensure support for loading files that contain ES6+7 & JSX
require('@babel/core')

const ADDRESS = argv.address
const PORT = argv.port

// Internal network only, we don't really care about certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const createApp = () => {
  const app = express()

  app.use(bodyParser.json())

  app.get('/', function (req, res) {
    res.end('React render server')
  })

  app.post('/render', async function (req, res) {
    if (!global.fetch) {
      const nodeFetch = await import('node-fetch')
      global.fetch = nodeFetch.default
      global.Headers = nodeFetch.Headers
    }
    if (process.env.NODE_ENV === 'development') {
      delete require.cache[Object.keys(require.cache).find(k => k.endsWith('AppServer.js'))]
      distLoad = null
    }

    if (!distLoad) {
      distLoad = require(appServerPath)
    }

    const AppServer = distLoad.default
    const createSSRContext = distLoad.createSSRContext
    try {
      const { resolveData } = createSSRContext()

      const props = { ssr: req.body }
      const RenderComponent = React.createElement(AppServer, props)

      const _prepRun = ReactDOMServer.renderToString(RenderComponent)
      const resolvedData = await resolveData()

      const extraScript = `
      window.__RESOLVED_DATA = JSON.parse(atob("${btoa(JSON.stringify(resolvedData))}"));
      `;

      const html = ReactDOMServer.renderToString(RenderComponent)

      res.json({
        markup: html,
        extraScript
      })
    } catch (e) {
      console.log(e)
      res.json({
        error: e,
      })
    }
  })

  return app
}

const startListen = (server) => {
  delete require.cache[Object.keys(require.cache).find(k => k.endsWith('AppServer.js'))]
  distLoad = require(appServerPath)

  server.listen(PORT, ADDRESS, function () {
    console.log(
      'React render server listening at http://' + ADDRESS + ':' + PORT
    )
  })
}

const app = createApp()
let server = http.Server(app)
startListen(server)

// if (process.env.NODE_ENV === 'development') {
//   const watch = spawn('node', ['watcher.js'])

//   const restart = () => {
//     server.close(() => {
//       server = http.Server(app)
//       startListen(server)
//     })
//   }

//   watch.stdout.on('data', restart)

//   // watch.stderr.on('data', restart)

//   watch.on('close', () => server.close())
// }
