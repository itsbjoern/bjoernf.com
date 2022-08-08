const path = require('path')
const fs = require('fs')

const distPath = path.join(__dirname, '..', '..', 'dist')

const staticHandler = async (req, res) => {
  const split = req.path.split('/')
  const file = split[split.length - 1]
  const filePath = path.resolve(distPath, 'browser', file)

  if (file.endsWith('.css')) {
    res.set('Content-Type', 'text/css')
  }
  if (file.endsWith('.js')) {
    res.set('Content-Type', 'application/javascript')
  }

  if (!fs.existsSync(filePath)) {
    res.status(404)
    res.send(Buffer.from('<h2>Error 404</h2>'))
    return
  }

  const staticFile = fs.readFileSync(filePath)
  res.send(Buffer.from(staticFile))
}

module.exports = { staticHandler }
