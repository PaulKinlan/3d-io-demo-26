// Service Worker for Site Generator Demo
// Intercepts navigation and image requests, generates content via Chrome's Prompt API

const SCOPE_PATH = '/demos/site-generator/';
const BROWSE_PREFIX = SCOPE_PATH + 'browse/';
const IMAGE_PREFIX = SCOPE_PATH + 'image/';

// Cache the AI session for reuse
let aiSession = null;

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function getAISession() {
  if (aiSession) return aiSession;
  if (!self.ai || !self.ai.languageModel) {
    throw new Error('Prompt API not available');
  }
  aiSession = await self.ai.languageModel.create({
    systemPrompt: `You are a web page generator. You generate realistic, well-structured HTML pages for any URL requested. Follow these rules strictly:

1. Return ONLY the raw HTML content - no markdown code fences, no explanation, no commentary.
2. Start your response with <!DOCTYPE html> and end with </html>.
3. All CSS must be embedded in a <style> tag in the <head>.
4. All JavaScript must be embedded in <script> tags.
5. Do NOT reference any external stylesheets, scripts, or resources.
6. For any images, use inline SVG elements directly in the HTML (not <img> tags with src).
7. Make the page look realistic and visually appealing with proper layout and styling.
8. Match the expected design and branding of the requested site as closely as possible.
9. Include realistic placeholder text content appropriate for the site.
10. Make the page responsive and accessible.
11. Keep the page self-contained - everything inline.`
  });
  return aiSession;
}

// Generate an HTML page for a given URL
async function generatePage(url) {
  try {
    const session = await getAISession();
    const response = await session.prompt(
      `Generate a complete HTML page for the URL: ${url}

The page should look like a realistic version of what you'd expect at that URL. Include appropriate branding, layout, navigation, and content. All images must be inline SVG elements. Make it visually polished with CSS.`
    );

    // Clean up response - strip markdown code fences if present
    let html = response.trim();
    if (html.startsWith('```html')) {
      html = html.slice(7);
    } else if (html.startsWith('```')) {
      html = html.slice(3);
    }
    if (html.endsWith('```')) {
      html = html.slice(0, -3);
    }
    return html.trim();
  } catch (e) {
    // If session is destroyed/expired, reset and retry once
    if (aiSession) {
      aiSession = null;
      try {
        const session = await getAISession();
        const response = await session.prompt(
          `Generate a complete HTML page for: ${url}. All images must be inline SVGs. Return only raw HTML.`
        );
        let html = response.trim();
        if (html.startsWith('```html')) html = html.slice(7);
        else if (html.startsWith('```')) html = html.slice(3);
        if (html.endsWith('```')) html = html.slice(0, -3);
        return html.trim();
      } catch (retryError) {
        return generateFallbackPage(url, retryError.message);
      }
    }
    return generateFallbackPage(url, e.message);
  }
}

// Generate an SVG image based on a description
async function generateImage(description) {
  try {
    const session = await getAISession();
    const response = await session.prompt(
      `Generate an SVG image for: "${description}". Return ONLY the raw SVG markup starting with <svg and ending with </svg>. Make it visually appealing with appropriate colors and shapes. Keep it reasonably simple but recognizable.`
    );
    let svg = response.trim();
    // Extract SVG if wrapped in code fences
    if (svg.includes('<svg')) {
      svg = svg.substring(svg.indexOf('<svg'));
      const endIdx = svg.lastIndexOf('</svg>');
      if (endIdx !== -1) svg = svg.substring(0, endIdx + 6);
    }
    return svg;
  } catch {
    return generateFallbackSVG(description);
  }
}

function generateFallbackPage(url, errorMsg) {
  const safeUrl = escapeHtml(url);
  const safeError = escapeHtml(errorMsg);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Generator - Error</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: #1a1a2e; color: #e0e0e0;
      text-align: center; padding: 20px;
    }
    .container { max-width: 500px; }
    h1 { font-size: 24px; margin-bottom: 16px; color: #e94560; }
    p { font-size: 14px; line-height: 1.6; margin-bottom: 12px; color: #a0a0b0; }
    code { background: #16213e; padding: 2px 8px; border-radius: 4px; font-size: 13px; }
    .hint { margin-top: 20px; padding: 16px; background: #16213e; border-radius: 8px; border-left: 3px solid #e94560; text-align: left; }
    .hint strong { color: #e94560; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Chrome Prompt API Required</h1>
    <p>Could not generate page for <code>${safeUrl}</code></p>
    <p>Error: <code>${safeError}</code></p>
    <div class="hint">
      <p><strong>Requirements:</strong></p>
      <p>This demo requires Chrome with the built-in Prompt API enabled:</p>
      <p>1. Use Chrome 138+ (or Chrome Canary/Dev)</p>
      <p>2. Enable <code>chrome://flags/#prompt-api-for-gemini-nano</code></p>
      <p>3. Ensure the Gemini Nano model has been downloaded</p>
    </div>
  </div>
</body>
</html>`;
}

function generateFallbackSVG(description) {
  const colors = ['#e94560', '#0f3460', '#533483', '#16213e', '#1a1a2e'];
  const color = colors[Math.abs(hashCode(description)) % colors.length];
  const safeDescription = escapeHtml(description.slice(0, 30));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <rect width="200" height="200" fill="${color}" rx="8"/>
    <text x="100" y="105" text-anchor="middle" fill="white" font-family="sans-serif" font-size="14">${safeDescription}</text>
  </svg>`;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

// Install event
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch event - intercept browse and image requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const path = url.pathname;

  // Handle page generation requests
  if (path.startsWith(BROWSE_PREFIX)) {
    let targetUrl;
    try {
      targetUrl = decodeURIComponent(path.slice(BROWSE_PREFIX.length));
    } catch {
      event.respondWith(
        new Response('Bad Request: invalid URL encoding', { status: 400 })
      );
      return;
    }
    event.respondWith(
      generatePage(targetUrl).then(
        (html) => new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Generated-By': 'site-generator-sw',
          },
        })
      )
    );
    return;
  }

  // Handle image generation requests
  if (path.startsWith(IMAGE_PREFIX)) {
    let description;
    try {
      description = decodeURIComponent(path.slice(IMAGE_PREFIX.length));
    } catch {
      event.respondWith(
        new Response('Bad Request: invalid image description encoding', {
          status: 400,
        })
      );
      return;
    }
    event.respondWith(
      generateImage(description).then(
        (svg) => new Response(svg, {
          headers: {
            'Content-Type': 'image/svg+xml',
            'X-Generated-By': 'site-generator-sw',
          },
        })
      )
    );
    return;
  }
});
