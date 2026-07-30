import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function bake() {
  const vite = await createViteServer({
    root: rootDir,
    server: { port: 5199 },
  });
  await vite.listen();

  // Create a receiver server to get the baked base64 PNGs
  const receiver = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          for (const [relPath, dataUrl] of Object.entries(data)) {
            const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
            const target = path.join(rootDir, 'public', relPath);
            fs.mkdirSync(path.dirname(target), { recursive: true });
            fs.writeFileSync(target, Buffer.from(base64, 'base64'));
            console.log(`Saved ${target} (${fs.statSync(target).size} bytes)`);
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
          console.log('All textures baked successfully!');
          setTimeout(async () => {
            receiver.close();
            await vite.close();
            process.exit(0);
          }, 500);
        } catch (e) {
          console.error(e);
          res.writeHead(500);
          res.end(e.message);
        }
      });
      return;
    }
    res.writeHead(404);
    res.end();
  });

  receiver.listen(5200, () => {
    console.log('Receiver listening on port 5200');
    // Launch headless chrome to open http://localhost:5199/scripts/bake.html
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    const url = 'http://localhost:5199/scripts/bake.html';
    const cmd = `"${chromePath}" --headless --disable-gpu "${url}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error('Chrome exec error:', err);
      }
    });
  });
}

bake().catch(console.error);
