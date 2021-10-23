const fs = require('fs')
const path = require('path')

let timeout = null

function watch(dir, config) {
  fs.watch(
    dir,
    {
      persistent: true,
      recursive: true,
    },
    function (event, filename) {
      if (timeout != null) {
        clearTimeout(timeout)
      }
      if (filename) {
        timeout = setTimeout(() => {
          console.log('filename changed: ' + filename) //to stdout
          timeout = null
        }, 150)
      }
    }
  )
}

watch(path.join(__dirname, '..', 'web', 'dist')) //<- watching the ./watchme/ directory
