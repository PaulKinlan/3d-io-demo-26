import http from 'node:http';

async function fetchAndParseRSS(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();

    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    let count = 0;

    while ((match = itemRegex.exec(text)) !== null && count < 3) {
      const itemContent = match[1];
      const titleMatch = itemContent.match(/<title>(.*?)<\/title>/);
      const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);

      if (titleMatch && linkMatch) {
        const title = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1');
        const link = linkMatch[1];
        items.push({ title, link });
        count++;
      }
    }
    return items;
  } catch (e) {
    console.error(`Failed to fetch RSS from ${url}:`, e);
    return [];
  }
}

export function handleIslandsRequest(req, res) {
  const url = req.url;

  // Main page shell
  if (url === '/demos/islands-html/' || url === '/demos/islands-html/index.html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HTML Islands - Patching Demo</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #f9fafb;
      color: #1f2937;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0;
      min-height: 100vh;
    }
    header {
      width: 100%;
      padding: 1.5rem 2rem;
      background: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      box-sizing: border-box;
      text-align: center;
    }
    h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
    }
    .container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1000px;
      width: 100%;
      padding: 3rem 2rem;
      box-sizing: border-box;
    }
    .island {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      min-height: 200px;
      display: flex;
      flex-direction: column;
    }
    .island h2 {
      margin-top: 0;
      font-size: 1.1rem;
      color: #111827;
      border-bottom: 1px solid #f3f4f6;
      padding-bottom: 0.75rem;
      margin-bottom: 1rem;
    }
    .loading {
      color: #9ca3af;
      font-style: italic;
      margin: auto;
    }
    .island-content ul {
      padding-left: 1.2rem;
      margin: 0;
    }
    .island-content li {
      margin-bottom: 0.5rem;
    }
    .island-content h4 {
      margin: 1rem 0 0.5rem 0;
      font-size: 0.9rem;
      color: #4b5563;
    }
    .island-content a {
      color: #2563eb;
      text-decoration: none;
    }
    .island-content a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <header>
    <h1>Paul Kinlan's Blog (HTML Islands)</h1>
  </header>
  
  <div class="container" id="blog-shell">
    <div class="island" id="rss-island">
      <h2>Latest RSS Feeds</h2>
      <section>
        <?start name="rss-list"><div class="loading">Loading feeds...</div><?end>
      </section>
    </div>
    
    <div class="island" id="github-island">
      <h2>GitHub Activity</h2>
      <section>
        <?start name="github-activity"><div class="loading">Loading activity...</div><?end>
      </section>
    </div>
    
    <div class="island" id="projects-island">
      <h2>Recent Projects</h2>
      <section>
        <?start name="projects-list"><div class="loading">Loading projects...</div><?end>
      </section>
    </div>
  </div>

  <script>
    // Fetch and pipe islands to specific elements
    async function loadIsland(name, elementId) {
      const response = await fetch(\`/demos/islands-html/\${name}\`);
      const element = document.getElementById(elementId);
      if (element) {
        await response.body
          .pipeThrough(new TextDecoderStream())
          .pipeTo(element.streamAppendHTMLUnsafe());
      }
    }

    loadIsland('rss', 'rss-island');
    loadIsland('github', 'github-island');
    loadIsland('projects', 'projects-island');
  </script>
</body>
</html>`);
    res.end();
    return true;
  }

  // RSS Endpoint
  if (url === '/demos/islands-html/rss') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    Promise.all([
      fetchAndParseRSS('https://paul.kinlan.me/index.xml'),
      fetchAndParseRSS('https://aifoc.us/index.xml')
    ]).then(([paulItems, aifocusItems]) => {
      let html = `
<template for="rss-list">
  <div class="island-content">
    <h4>paul.kinlan.me</h4>
    <ul>`;

      paulItems.forEach(item => {
        html += `<li><a href="${item.link}">${item.title}</a></li>`;
      });

      html += `</ul>
    <h4>aifoc.us</h4>
    <ul>`;

      aifocusItems.forEach(item => {
        html += `<li><a href="${item.link}">${item.title}</a></li>`;
      });

      html += `</ul>
  </div>
</template>`;

      res.write(html);
      res.end();
    }).catch(err => {
      res.write('<template for="rss-list"><div class="island-content">Error loading feeds</div></template>');
      res.end();
    });
    return true;
  }

  // GitHub Endpoint
  if (url === '/demos/islands-html/github') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    setTimeout(() => {
      res.write(`
<template for="github-activity">
  <div class="island-content">
    <ul>
      <li>Pushed to <code>3d-io-demo-26</code></li>
      <li>Opened issue on <code>WICG/declarative-partial-updates</code></li>
      <li>Starred <code>three.js</code></li>
    </ul>
  </div>
</template>
`);
      res.end();
    }, 2500);
    return true;
  }

  // Projects Endpoint
  if (url === '/demos/islands-html/projects') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    setTimeout(() => {
      res.write(`
<template for="projects-list">
  <div class="island-content">
    <ul>
      <li><strong>Web MCP</strong> - Model Context Protocol for Web</li>
      <li><strong>HTML in Canvas</strong> - Native rendering</li>
      <li><strong>DPU Demos</strong> - This site!</li>
    </ul>
  </div>
</template>
`);
      res.end();
    }, 1000);
    return true;
  }

  return false;
}

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  const server = http.createServer((req, res) => {
    // Rewrite root requests to the demo path for the handler
    if (req.url === '/' || req.url === '/index.html') {
      req.url = '/demos/islands-html/';
    }

    if (!handleIslandsRequest(req, res)) {
      res.statusCode = 404;
      res.end('Not Found');
    }
  });

  const PORT = process.env.PORT || 3002;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
