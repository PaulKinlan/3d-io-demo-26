import createWoodTexture from './generators/wood.js';
import createPosterTexture from './generators/poster.js';
import createCatPosterTexture from './generators/poster-cat.js';

/**
 * Texture registry. Each entry maps a name to either:
 *   { generator: () => THREE.Texture }  -- procedural Canvas texture
 *   { file: '/textures/path.png' }      -- static image file in public/textures/
 *
 * When a static image is available, switch the entry from generator to file.
 */
export const textures = {
  'wood-floor': { generator: createWoodTexture },
  'poster-skate': { generator: () => createPosterTexture('SKATE', '#d97b53', '#5d2f3f') },
  'poster-pixel': { generator: () => createPosterTexture('PIXEL', '#4a6ea8', '#101924') },
  'poster-cat': { generator: createCatPosterTexture },
  'poster-kitten-washing-line': { file: '/textures/posters/kitten-washing-line.png' },
  'misc-keyboard': { file: '/textures/misc/keyboard.png' },
};
