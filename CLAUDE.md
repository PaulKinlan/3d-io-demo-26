# Childhood Bedroom 3D Demo

Interactive Three.js scene of a childhood bedroom with isometric camera, procedural geometry, and warm lighting. Built with Vite v7.

## Commands

- `npm run dev` -- start Vite dev server
- `npm run build` -- production build to `dist/`
- `npm run lint` -- ESLint

## Architecture

- `src/main.js` -- scene setup, geometry builders, lighting, animation loop
- `src/style.css` -- HUD overlay and layout
- `src/lib/texture-loader.js` -- unified texture loading (`loadTexture()`)
- `src/textures/index.js` -- texture registry (maps names to generators or file paths)
- `src/textures/generators/` -- procedural Canvas texture modules
- `public/textures/` -- static texture image files served at `/textures/...`

## Texture system

Textures are loaded via `loadTexture(name, options?)` from `src/lib/texture-loader.js`.

The registry in `src/textures/index.js` maps each texture name to either:
- `{ generator: fn }` -- a procedural Canvas texture function (current default)
- `{ file: '/textures/path.png' }` -- a static image file in `public/textures/`

To swap a procedural texture for an image file, change the registry entry from `generator` to `file`.

### Adding a new texture

1. Generate or obtain the image file
2. Save it to `public/textures/` (e.g. `public/textures/fabric/duvet.png`)
3. Add a registry entry in `src/textures/index.js`: `'fabric-duvet': { file: '/textures/fabric/duvet.png' }`
4. Use it in `main.js`: `loadTexture('fabric-duvet', { repeat: [2, 2] })`

### Texture requirements

- **Formats**: PNG (when transparency needed), JPG (opaque textures)
- **Sizes**: 512x512 or 1024x1024 recommended
- **Tiling**: textures used with `repeat` must be seamless/tileable
- **Color space**: SRGB (handled automatically by the loader)

## Generating textures with the LLM

Use `mcp__mcp-to-llm__prompt` to generate texture images during Claude Code sessions.

Available models:
- `gemini-3.1-pro-preview` (provider: `google-primary`) -- best for detailed textures
- `gemini-3-flash-preview` (provider: `google-primary`) -- faster, good for iteration

Workflow:
1. Prompt the model to generate a texture image
2. Save the result to `public/textures/`
3. Register it in `src/textures/index.js`
4. Apply via `loadTexture()` in `main.js`

### Surfaces that still use flat colors (candidates for textures)

| Surface | Location in main.js | Current color |
|---------|-------------------|---------------|
| Walls | `buildRoom()` | `#d1b6a7` |
| Rug (outer) | `buildRug()` | `#6b4a58` |
| Rug (inner) | `buildRug()` | `#c38d6b` |
| Bed duvet | `buildBed()` | `#587091` |
| Desk surface | `buildDesk()` | `#6a4328` |
| Bed frame | `buildBed()` | `#7c5540` |
| Bookshelf | `buildShelf()` | `#6f4a31` |

## Scene conventions

- Orthographic camera, isometric angle
- Room dimensions: 16 wide, 13 deep, 8.5 tall
- Origin is roughly center of floor
- `addMesh(geometry, material, options)` helper for adding meshes with shadow defaults
- Materials use `MeshStandardMaterial` throughout
- CRT monitor screen has animated emissive flicker via `animatedMaterials` array

## Managing Demos

New demos that run inside the 3D monitor should be managed as follows:

1. Create a new directory for the demo in `demos/` (e.g., `demos/my-new-demo/`)
2. Make sure the demo works standalone as a standard HTML page.
3. Register the demo in the Vite config (`vite.config.js`) under `build.rollupOptions.input` so it's built properly.
4. Add a link to the new demo inside the New Tab Page (NTP) located at `demos/new-tab/index.html`.
5. **Add the demo URL to the Web MCP `navigateComputerScreen` tool** in `src/main.js` — append the new path (e.g., `"/demos/my-new-demo/"`) to the `enum` array in the `navigateComputerScreen` tool's `inputSchema`. This lets Claude navigate to the demo via the Web MCP API.
6. **Always keep the `browser` demo as the default on page load** in `src/main.js` (`src="/demos/browser/"`). The browser demo acts as the wrapper that initially loads the NTP.

## Web MCP Integration

The project exposes interactive controls to Claude via the browser-native Web MCP API (`window.navigator.modelContext`). The `setupMCP()` function in `src/main.js` registers the following tools:

| Tool | Description |
|------|-------------|
| `toggleDeskLamp` | Toggle the desk lamp on/off |
| `toggleNightMode` | Toggle room ceiling lights on/off |
| `focusMonitor` | Zoom camera to focus on the computer monitor |
| `focusBooks` | Zoom camera to focus on the bookshelf |
| `resetCameraFocus` | Reset camera to default room view |
| `spinChair` | Spin the desk chair around |
| `navigateComputerScreen` | Navigate the monitor iframe to a demo (URL must be in the enum list) |

When adding a new demo, the `navigateComputerScreen` enum must be updated (step 5 above) or Claude won't be able to navigate to it.

## Monitor rendering (html-in-canvas)

The 3D monitor displays a **live, interactive web page** composited into the WebGL scene using the experimental **html-in-canvas** API. This is the most non-obvious part of the codebase — read this before changing monitor rendering, input handling, or `pointer-events`.

How it works:

- **three.js is the experimental dev build (with `HTMLTexture`), vendored locally** in `vendor/three/` (`three.module.js` + `three.core.js` + `addons/controls/OrbitControls.js`) so the project runs fully offline. There is **no `node_modules/three`**. `vite.config.js` aliases the bare `three` / `three/addons/*` specifiers to those local files — Vite serves them in dev and Rollup bundles them in build (single shared instance). No CDN / import map. To update three, re-download the dev build into `vendor/three/` (keep `three.module.js` + `three.core.js` together). `vendor/` must **not** live in `public/` — Vite refuses to import JS modules from `public/`.
- The WebGL canvas is marked `layoutsubtree="true"` and the live DOM (`.monitor-html-subtree`) is **appended as a child of the canvas** (`src/main.js`, search `layoutsubtree`). The browser lays out and paints that subtree into the canvas texture.
- `THREE.HTMLTexture` **only repaints** the texture (driven each frame by the canvas `onpaint`/`requestPaint` hooks in `animate()`). It does **not** forward input events and does **not** manage transforms.
- **Interaction works through transform-sync, not event forwarding.** `updateMonitorTransform()` keeps the subtree's CSS `transform` (`matrix3d`) aligned with where the screen is drawn in 3D, so the live DOM physically sits at the drawn location. Native browser hit-testing then routes **clicks, text selection, and wheel/scroll directly into the DOM** (the WICG-recommended model).
- Therefore **`.monitor-html-subtree` must stay `pointer-events: auto`**. Do **not** set it to `none`, and do **not** raycast on the canvas to forward synthesized click/scroll events via `postMessage` — that fights the real interaction model and breaks it.
- Monitor content nesting: `canvas[layoutsubtree]` → `.monitor-html-subtree` → `.monitor-html-frame` (browser-chrome wrapper, `/demos/browser/`) → `#browser-view` (the demo iframe).

Requirements & gotchas:

- Needs **Chrome with html-in-canvas enabled** — an origin-trial token *or* `chrome://flags` → *Experimental Web Platform features*. `index.html` ships no OT token, so a flag is currently required. The internal Claude Preview Chromium does **not** support it — debug with the **Chrome DevTools / Claude-in-Chrome MCP** instead.
- `npm run dev` serves on **http://localhost:5173**. A demo (`demos/site-generator`) registers a **service worker** that can serve a cached offline page over the origin — if you get an `offline-resources`/`neterror` page, unregister service workers + clear caches, then hard-reload.

### Reference docs (don't re-discover these)

- Chrome blog — html-in-canvas origin trial: https://developer.chrome.com/blog/html-in-canvas-origin-trial
- WICG html-in-canvas explainer/spec: https://github.com/WICG/html-in-canvas/blob/main/README.md
- Awesome html-in-canvas: https://github.com/GoogleChromeLabs/css-web-ui-demos/blob/main/html-in-canvas/awesome-html-in-canvas.md
- three.js HTMLTexture docs: https://threejs.org/docs/#api/en/textures/HTMLTexture
- three.js HTMLTexture example: https://threejs.org/examples/webgl_materials_texture_html.html
- modern-web-guidance, apply-webgl-shaders grader.ts: https://github.com/GoogleChrome/modern-web-guidance-src/blob/c6bad352b6868a4026a4dee5a949d2d149708fbe/guides/user-experience/apply-webgl-shaders/grader.ts#L5
