import chokidar from 'chokidar';
import path, { dirname } from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serverProcess = null;
let buildProcess = null;
let timeout = null;

const reloadServer = () => {
  if (serverProcess) {
    serverProcess.stdin.pause();
    serverProcess.kill();
  }

  serverProcess = spawn('node', [path.join(__dirname, 'src', 'index.js')]);
  serverProcess.stdout.on('data', (c) => {
    console.log(c.toString());
  });
  serverProcess.stderr.on('data', (c) => {
    console.log(c.toString());
  });
};

const watch = () => {
  chokidar
    .watch('(src|dist)/**', { usePolling: true })
    .on('all', (event, filename) => {
      if (timeout != null) {
        clearTimeout(timeout);
      }
      if (filename) {
        timeout = setTimeout(() => {
          console.log('filename changed: ' + filename); //to stdout
          timeout = null;

          reloadServer();
        }, 150);
      }
    });
};

watch();
