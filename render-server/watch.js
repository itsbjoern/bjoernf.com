const chokidar = require('chokidar');
const path = require('path')
const spawn = require('child_process').spawn

let serverProcess = null
let timeout = null

const reloadServer = () => {
  if (serverProcess) {
    serverProcess.stdin.pause()
    serverProcess.kill()
  }

  serverProcess = spawn('node', [path.join(__dirname, 'src', 'index.js')])
  serverProcess.stdout.on('data', (c) => {
    console.log(c.toString())
  })
  serverProcess.stderr.on('data', (c) => {
    console.log(c.toString())
  })
}

reloadServer()

const watch = () => {
  chokidar.watch('src').on('all', (event, filename) => {
    if (timeout != null) {
      clearTimeout(timeout)
    }
    if (filename) {
      timeout = setTimeout(() => {
        console.log('filename changed: ' + filename) //to stdout
        timeout = null

        reloadServer()
      }, 150)
    }
  })
}

watch()
