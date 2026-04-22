import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Import content generators
import { getRSSContent } from './rss.js';
import { getGithubContent } from './github.js';
import { getProjectsContent } from './projects.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function handleIslandsShell(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    const filePath = path.resolve(__dirname, 'index.html');
    const template = fs.readFileSync(filePath, 'utf-8');
    res.write(template);

    // Stream islands after delays (Interleaved patching)
    setTimeout(async () => {
      const html = await getRSSContent();
      res.write(html);
      res.end();
    }, 1500);

    setTimeout(() => {
      const html = getGithubContent();
      res.write(html);
      res.end();
    }, 2500);

    setTimeout(() => {
      const html = getProjectsContent();
      res.write(html);
      res.end();
    }, 1000);

    // Do not call res.end() to keep it open like the clock!
  } catch (e) {
    console.error('Error in islands shell:', e);
    res.statusCode = 500;
    res.end('Error reading index.html');
  }
}
