# Childhood Bedroom 3D Demo

An interactive, fully procedural 3D scene of a childhood bedroom rendered with Three.js. The room features a corner desk with a glowing CRT monitor, a bed, bookshelf, side table, wall posters, and warm isometric lighting -- all built without external models or textures.

## Features

- **Interactive HTML Textures** -- fully functional iframe web applications mapped onto the 3D CRT monitor screen (play Flopity Gull, view slide decks, browse sites inside the 3D scene)
- **Procedural & Static geometry** -- objects (desk, chair, bed, bookshelf, CRT monitor, lamps, posters) are carefully constructed and pieced together in code
- **Canvas & Image textures** -- custom textures generated procedurally at runtime via the Canvas API with seamless fallbacks to static images
- **Animated CRT glow & Lights** -- the monitor screen flickers with a subtle emissive pulse and system lights blink dynamically
- **Isometric camera** -- orthographic projection with constrained orbit controls
- **Shadows and fog** -- PCF soft shadow maps and distance fog for depth
- **Responsive** -- adapts to any viewport size

## Tech stack

- [Three.js](https://threejs.org/) v0.180
- [Vite](https://vitejs.dev/) v7 (dev server and build)
- ESLint v9

## Getting started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Controls

- **Scroll** to zoom
- **Drag** to orbit
- **Shift+drag** to pan

## Project structure

```text
index.html              Entry point for the 3D scene
src/
  main.js               Scene setup, animation loop, and main orchestrator
  style.css             HUD overlay and layout styles
  models/               3D model builder components (desk, bed, shelf, etc.)
  textures/             Texture registry and procedural Canvas generators
  lib/                  Utility functions and wrappers
demos/                  Internal iframe HTML apps for the 3D computer monitor
  browser/              Chrome-like browser clone
  flappy-bird/          Flopity Gull clone
  slide-deck/           Markdown-based slide presentation framework
  new-tab/              New Tab page clone
public/                 Static assets
  textures/             Static texture images (wood, fabric, posters, etc.)
designs/                Visual direction, moodboards, and reference material
```

## License

Apache License 2.0. See [LICENSE](./LICENSE).
