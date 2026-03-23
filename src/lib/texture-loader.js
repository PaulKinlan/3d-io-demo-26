import * as THREE from 'three';
import { textures } from '../textures/index.js';

const fileLoader = new THREE.TextureLoader();

/**
 * Load a texture by registry name or file path.
 *
 * Looks up the name in the texture registry first. If the entry has a
 * `generator`, it calls the function. If it has a `file`, it loads via
 * TextureLoader. If the name isn't in the registry, it's treated as a
 * direct file path under public/textures/.
 *
 * @param {string} name - Registry name or file path (e.g. 'wood-floor' or 'wood/oak.png')
 * @param {object} [options]
 * @param {number[]} [options.repeat] - [x, y] repeat values
 * @param {number} [options.wrapS] - THREE wrapping constant (defaults to RepeatWrapping when repeat is set)
 * @param {number} [options.wrapT] - THREE wrapping constant (defaults to RepeatWrapping when repeat is set)
 * @param {string} [options.colorSpace] - THREE color space (defaults to SRGBColorSpace)
 * @returns {THREE.Texture}
 */
export function loadTexture(name, options = {}) {
  const entry = textures[name];
  let texture;

  if (entry?.generator) {
    texture = entry.generator();
  } else if (entry?.file) {
    texture = fileLoader.load(entry.file);
    texture.colorSpace = THREE.SRGBColorSpace;
  } else {
    // Treat as a direct file path
    const path = name.startsWith('/') ? name : `/textures/${name}`;
    texture = fileLoader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
  }

  if (options.repeat) {
    texture.wrapS = options.wrapS ?? THREE.RepeatWrapping;
    texture.wrapT = options.wrapT ?? THREE.RepeatWrapping;
    texture.repeat.set(options.repeat[0], options.repeat[1]);
  }

  if (options.wrapS !== undefined && !options.repeat) {
    texture.wrapS = options.wrapS;
  }
  if (options.wrapT !== undefined && !options.repeat) {
    texture.wrapT = options.wrapT;
  }

  if (options.colorSpace) {
    texture.colorSpace = options.colorSpace;
  }

  return texture;
}
