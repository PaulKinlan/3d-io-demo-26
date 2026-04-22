import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

// Import demo handlers
import { handleClockRequest } from './demos/patching-clock/handler.js';
import { handleUserDataRequest } from './demos/patching-user-data/handler.js';
import { handleIslandsShell } from './demos/islands-html/shell.js';
import { handleRSSRequest } from './demos/islands-html/rss.js';
import { handleGithubRequest } from './demos/islands-html/github.js';
import { handleProjectsRequest } from './demos/islands-html/projects.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });

  const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // Handle directory redirect to ensure trailing slash
    const filePath = path.join(__dirname, pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory() && !pathname.endsWith('/')) {
      res.statusCode = 301;
      res.setHeader('Location', pathname + '/');
      res.end();
      return;
    }

    // Route to specific demo handlers
    if (pathname === '/demos/patching-clock/' || pathname === '/demos/patching-clock/index.html') {
      handleClockRequest(req, res);
      return;
    }
    
    if (pathname === '/demos/patching-user-data/' || pathname === '/demos/patching-user-data/index.html') {
      handleUserDataRequest(req, res);
      return;
    }

    if (pathname === '/demos/islands-html/' || pathname === '/demos/islands-html/index.html') {
      handleIslandsShell(req, res);
      return;
    }

    if (pathname === '/demos/islands-html/rss') {
      handleRSSRequest(req, res);
      return;
    }

    if (pathname === '/demos/islands-html/github') {
      handleGithubRequest(req, res);
      return;
    }

    if (pathname === '/demos/islands-html/projects') {
      handleProjectsRequest(req, res);
      return;
    }

    // Fallback to Vite middleware for static assets and other demos
    vite.middlewares(req, res, async () => {
      // Handle HTML files manually since appType: 'custom' disables Vite's HTML serving
      let filePath = path.join(__dirname, pathname);
      if (pathname.endsWith('/')) {
        filePath = path.join(filePath, 'index.html');
      }

      if (fs.existsSync(filePath) && filePath.endsWith('.html')) {
        try {
          let template = fs.readFileSync(filePath, 'utf-8');
          template = await vite.transformIndexHtml(req.url, template);
          res.setHeader('Content-Type', 'text/html');
          res.end(template);
        } catch (e) {
          vite.ssrFixStacktrace(e);
          res.statusCode = 500;
          res.end(e.message);
        }
        return;
      }
      
      res.statusCode = 404;
      res.end('Not Found');
    });
  });

  const PORT = process.env.PORT || 5173;
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

createServer();
