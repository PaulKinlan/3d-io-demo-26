/*
 * Vite plugin: merge the browser chrome into every demo at build/dev time.
 *
 * Why this exists
 * ---------------
 * Previously the chrome was a separate page (`/demos/browser/`) that hosted each
 * demo in a *second* iframe (`?url=...`). That meant:
 *   - opening `/demos/<name>/` directly showed no chrome, and
 *   - every new demo had to be hand-wired to appear inside the wrapper, and
 *   - the monitor's html-in-canvas had to deal with a doubly-nested iframe.
 *
 * Now the chrome is injected straight into each demo's own HTML, in the same
 * document — no inner iframe. Because the hook below runs in BOTH dev and build,
 * there is nothing per-demo to remember: drop a folder in `demos/` and it shows
 * up with the chrome automatically. The chrome is a fixed overlay bar, so each
 * demo's own <body> layout is left completely untouched (it still works
 * standalone, exactly as before).
 *
 * Opting out: a demo that should render bare (e.g. the boot screen) includes
 *   <meta name="frame" content="none">
 * in its <head>.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const FRAME_DIR = dirname(fileURLToPath(import.meta.url));
const DEMOS_DIR = dirname(FRAME_DIR) + sep; // .../demos/

const read = (name) => readFileSync(join(FRAME_DIR, name), 'utf8');

function shouldWrap(filename, html) {
  if (!filename) return false;
  // Only demos, never the main 3D app at the project root.
  if (!filename.startsWith(DEMOS_DIR)) return false;
  // Never wrap the chrome's own assets directory.
  if (filename.startsWith(FRAME_DIR + sep)) return false;
  // Respect explicit opt-out and avoid double-wrapping.
  if (/<meta\s+name=["']frame["']\s+content=["']none["']/i.test(html)) return false;
  if (html.includes('id="browser-chrome"')) return false;
  return true;
}

export function browserChrome() {
  return {
    name: 'browser-chrome-wrap',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (!shouldWrap(ctx.filename, html)) return html;

        const css = read('frame.css');
        const barHtml = read('frame.html');
        const js = read('frame.js');

        const styleTag = `\n<style data-browser-chrome>\n${css}\n</style>\n`;
        const scriptTag = `\n<script type="module" data-browser-chrome>\n${js}\n</script>\n`;

        // Inject into the body FIRST, while the document still contains only the
        // demo's real <body> tag. (If we injected the <style> first, the regex
        // below could match a "<body>" mention inside the chrome's own
        // comments/CSS and place the bar as inert text in <head>.)
        const bodyOpen = /<body[^>]*>/i;
        let out = bodyOpen.test(html)
          ? html
              .replace(bodyOpen, (m) => `${m}\n${barHtml}\n`)
              .replace('</body>', `${scriptTag}</body>`)
          : html + barHtml + scriptTag;

        // Then add the stylesheet as the last thing in <head> so it wins over
        // any equally-specific demo rules.
        out = out.includes('</head>')
          ? out.replace('</head>', `${styleTag}</head>`)
          : styleTag + out;

        return out;
      },
    },
  };
}
