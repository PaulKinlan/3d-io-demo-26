import * as THREE from 'three';

export function createCDStackLabelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  // Post-it note background
  ctx.fillStyle = '#fceb77';
  ctx.fillRect(0, 0, 256, 128);
  
  // Text
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 28px "Comic Sans MS", cursive, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.rotate(-Math.PI / 32);
  ctx.fillText('Pirated', 128, 45);
  ctx.fillText('Software', 134, 85);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
