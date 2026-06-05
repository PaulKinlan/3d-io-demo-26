# Agent Guidelines

## Adding textures

1. Generate or source the image file
2. Save to `public/textures/<category>/<name>.png` (categories: `wood`, `fabric`, `posters`, `misc`)
3. Register in `src/textures/index.js` with `{ file: '/textures/<category>/<name>.png' }`
4. Apply in `src/main.js` via `loadTexture('<registry-name>', { repeat: [x, y] })`
5. Verify the scene still renders correctly

## Naming convention

Registry names use the pattern `<material>-<surface>`, e.g. `wood-floor`, `fabric-duvet`, `poster-skate`.

## Adding new monitor demos

When adding a new demo to be displayed on the 3D computer monitor:
1. Create a new directory under `demos/` (e.g., `demos/my-new-demo/`) and place the demo files there.
2. Ensure the demo functions correctly within an `iframe`.
3. Update the `navigateComputerScreen` Web MCP tool in `src/main.js`. You must append the new demo's URL path (e.g. `/demos/my-new-demo/`) to the `enum` array in `inputSchema.properties.url`. This strict `enum` ensures the LLM can only navigate the monitor to explicitly supported demo pages.

## Texture generation via LLM

Use `mcp__mcp-to-llm__prompt` with provider `google-primary` and model `gemini-3.1-pro-preview` or `gemini-3-flash-preview`.

Generated images go into `public/textures/`. Procedural generators in `src/textures/generators/` are kept as fallbacks until an image replacement exists.

## Key files

- `src/main.js` -- scene construction, all geometry and material assignments
- `src/textures/index.js` -- texture registry (single source of truth for texture sources)
- `src/lib/texture-loader.js` -- `loadTexture()` utility
- `public/textures/` -- static image assets

## Local development & debugging

- Dev server: `npm run dev` → **http://localhost:5173**.
- **Service worker gotcha**: a demo (`demos/site-generator`) registers a service worker that can intercept `http://localhost:5173/` and serve a cached *offline* page (a `<div class="offline-resources">` page, or a `neterror`). If the app won't load, unregister all SWs and clear caches for the origin, then hard-reload:
  ```js
  for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
  for (const k of await caches.keys()) await caches.delete(k);
  ```
- **Debug in a real browser, not the internal preview.** Use the **Chrome DevTools / Claude-in-Chrome MCP** against a Chrome that has html-in-canvas enabled. The bundled Claude Preview Chromium lacks the html-in-canvas API and cannot reach the dev origin, so the monitor never goes interactive there.
- The html-in-canvas API requires Chrome with the feature enabled — either an **origin-trial token** (see the blog below) or `chrome://flags` → *Experimental Web Platform features*. `index.html` ships **no** OT token, so a flag is currently required.

## Monitor rendering (html-in-canvas) — how it actually works

The 3D monitor shows a live, *interactive* web page composited into the WebGL scene via the experimental **html-in-canvas** API. Key facts (verified, non-obvious):

- **three.js is the bleeding-edge dev build (only it ships `THREE.HTMLTexture`), vendored locally** under `vendor/three/` so the app runs offline — no CDN, no import map, no `node_modules/three`. `vite.config.js` aliases the bare `three` / `three/addons/*` specifiers to `vendor/three/three.module.js` and `vendor/three/addons/`; Vite serves them in dev and Rollup bundles them in build. The vendored set is `three.module.js` (imports `./three.core.js`), `three.core.js`, and `addons/controls/OrbitControls.js`. Keep `vendor/` **out of `public/`** (Vite won't import JS modules from `public/`). To bump three, re-download the dev `build/three.module.js` + `build/three.core.js` and `examples/jsm/controls/OrbitControls.js` into `vendor/three/`.
- The WebGL canvas gets `layoutsubtree="true"` and the live DOM (`.monitor-html-subtree`) is **appended as a child of the canvas** (`src/main.js`, search `layoutsubtree`). The browser lays out and paints that subtree into the canvas.
- **`HTMLTexture` only repaints** — it does *not* forward input events and does *not* sync transforms. Repaints are driven each frame by the canvas's `onpaint`/`requestPaint` hooks (called from the `animate()` loop).
- **Interaction works via transform-sync, not event forwarding.** `updateMonitorTransform()` keeps the subtree's CSS `transform` (a `matrix3d`) aligned with where the screen is drawn in 3D. Because the live DOM physically sits at the drawn location, **native browser hit-testing routes clicks, text selection, and wheel/scroll straight into the DOM.** This is the WICG-recommended model ("update the element's `transform` so the DOM location matches the drawn location").
- Consequence: **`.monitor-html-subtree` must stay `pointer-events: auto`.** Setting it to `none` (or trying to raycast on the canvas and forward synthesized events via `postMessage`) breaks the real interaction — don't do that.
- Nesting chain for monitor content: `canvas[layoutsubtree]` → `.monitor-html-subtree` → `.monitor-html-frame` (the browser-chrome wrapper iframe, `/demos/browser/`) → `#browser-view` (the actual demo iframe).

## Resources

html-in-canvas / HTMLTexture (read these before touching monitor rendering or input):

- [Chrome blog: html-in-canvas origin trial](https://developer.chrome.com/blog/html-in-canvas-origin-trial) — how to enable it (OT token / flag), API overview
- [WICG html-in-canvas explainer/spec](https://github.com/WICG/html-in-canvas/blob/main/README.md) — the interaction/transform-sync model
- [Awesome html-in-canvas](https://github.com/GoogleChromeLabs/css-web-ui-demos/blob/main/html-in-canvas/awesome-html-in-canvas.md) — curated examples and demos
- [three.js HTMLTexture docs](https://threejs.org/docs/#api/en/textures/HTMLTexture)
- [three.js HTMLTexture example](https://threejs.org/examples/webgl_materials_texture_html.html)
- [modern-web-guidance: apply-webgl-shaders grader.ts](https://github.com/GoogleChrome/modern-web-guidance-src/blob/c6bad352b6868a4026a4dee5a949d2d149708fbe/guides/user-experience/apply-webgl-shaders/grader.ts#L5)
- [Interactive content in canvas example](https://github.com/WICG/html-in-canvas/blob/main/Examples/text-input.html)
- [WebGL with html-in-canvas example](https://github.com/WICG/html-in-canvas/blob/main/Examples/webGL.html)
