# Childhood Bedroom 3D Demo

An interactive, fully procedural 3D scene of a childhood bedroom rendered with Three.js. The room features a corner desk with a glowing CRT monitor, a bed, bookshelf, side table, wall posters, and warm isometric lighting -- all built without external models or textures.

## Features

- **Procedural geometry** -- every object (desk, chair, bed, bookshelf, CRT monitor, lamps, posters) is constructed from Three.js primitives
- **Canvas-generated textures** -- wood grain and poster art created at runtime via the Canvas API
- **Animated CRT glow** -- the monitor screen flickers with a subtle emissive pulse
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

```
index.html          Entry point
src/
  main.js           Scene setup, geometry, lighting, animation loop
  style.css         HUD overlay and layout styles
designs/            Visual direction, moodboards, and reference material
```
