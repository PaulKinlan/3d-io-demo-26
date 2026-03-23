# Agent Guidelines

## Adding textures

1. Generate or source the image file
2. Save to `public/textures/<category>/<name>.png` (categories: `wood`, `fabric`, `posters`, `misc`)
3. Register in `src/textures/index.js` with `{ file: '/textures/<category>/<name>.png' }`
4. Apply in `src/main.js` via `loadTexture('<registry-name>', { repeat: [x, y] })`
5. Verify the scene still renders correctly

## Naming convention

Registry names use the pattern `<material>-<surface>`, e.g. `wood-floor`, `fabric-duvet`, `poster-skate`.

## Texture generation via LLM

Use `mcp__mcp-to-llm__prompt` with provider `google-primary` and model `gemini-3.1-pro-preview` or `gemini-3-flash-preview`.

Generated images go into `public/textures/`. Procedural generators in `src/textures/generators/` are kept as fallbacks until an image replacement exists.

## Key files

- `src/main.js` -- scene construction, all geometry and material assignments
- `src/textures/index.js` -- texture registry (single source of truth for texture sources)
- `src/lib/texture-loader.js` -- `loadTexture()` utility
- `public/textures/` -- static image assets
