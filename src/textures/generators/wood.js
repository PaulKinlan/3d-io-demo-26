import * as THREE from 'three';

export default function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');

  context.fillStyle = '#8e5b37';
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < 32; index += 1) {
    const offset = index * 8;
    context.fillStyle = index % 2 === 0 ? '#9d6840' : '#7b4d31';
    context.fillRect(0, offset, canvas.width, 6);
  }

  for (let grain = 0; grain < 120; grain += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const length = 24 + Math.random() * 90;
    context.strokeStyle = `rgba(58, 32, 18, ${0.08 + Math.random() * 0.15})`;
    context.lineWidth = 1 + Math.random() * 2;
    context.beginPath();
    context.moveTo(x, y);
    context.bezierCurveTo(x + length * 0.25, y - 2, x + length * 0.75, y + 5, x + length, y + 1);
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}
