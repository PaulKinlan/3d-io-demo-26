import * as THREE from 'three';

export default function createPosterTexture(label, primary, secondary) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 384;
  const context = canvas.getContext('2d');

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, primary);
  gradient.addColorStop(1, secondary);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = 'rgba(255, 255, 255, 0.88)';
  context.font = '700 48px sans-serif';
  context.textAlign = 'center';
  context.fillText(label, canvas.width / 2, 92);

  context.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  context.lineWidth = 8;
  context.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  context.fillStyle = 'rgba(10, 12, 16, 0.2)';
  for (let stripe = 0; stripe < 8; stripe += 1) {
    context.fillRect(36, 130 + stripe * 26, canvas.width - 72, 12);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}
