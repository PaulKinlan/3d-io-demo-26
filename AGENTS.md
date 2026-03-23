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

## Resources

- [HTML in Canvas Explainer/Spec](https://github.com/WICG/html-in-canvas?tab=readme-ov-file)
- [three.js HTMLTexture Example](https://raw.githack.com/mrdoob/three.js/htmltexture/examples/webgl_materials_texture_html.html)
- [Interactive Content in Canvas Example](https://github.com/WICG/html-in-canvas/blob/main/Examples/text-input.html)
- [WebGL with HTML in Canvas Example](https://github.com/WICG/html-in-canvas/blob/main/Examples/webGL.html)
