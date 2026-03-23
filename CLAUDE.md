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
5. **Always keep the `browser` demo as the default on page load** in `src/main.js` (`src="/demos/browser/"`). The browser demo acts as the wrapper that initially loads the NTP.
