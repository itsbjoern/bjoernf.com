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

const nodePath = path.join(__dirname, 'node')

const spawn = require('child_process').spawn

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

    const { createSSRContext, default: AppServer } = require(path.join(
      nodePath,
      'AppServer.js'
    ))

    try {
      const { resolveData } = createSSRContext()

      const props = { ssr: req.body }
      const RenderComponent = React.createElement(AppServer, props)

      const _prepRun = ReactDOMServer.renderToString(RenderComponent)
      const _resolvedData = await resolveData()

      const html = ReactDOMServer.renderToString(RenderComponent)

      res.json({
        markup: html,
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
  server.listen(PORT, ADDRESS, function () {
    console.log(
      'React render server listening at http://' + ADDRESS + ':' + PORT
    )
  })
}

const app = createApp()
let server = http.Server(app)
startListen(server)

if (process.env.NODE_ENV === 'development') {
  const watch = spawn('node', ['watcher.js'])

  const restart = () => {
    server.close(() => {
      server = http.Server(app)
      startListen(server)
    })
  }

  watch.stdout.on('data', restart)

  // watch.stderr.on('data', restart)

  watch.on('close', () => server.close())
}
