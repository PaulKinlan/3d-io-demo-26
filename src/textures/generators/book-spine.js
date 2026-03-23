import * as THREE from 'three';

export default function createBookSpineTexture(title, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 512;
  const context = canvas.getContext('2d');

  // Background color
  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Add spine shading/texture
  context.fillStyle = 'rgba(0, 0, 0, 0.15)';
  context.fillRect(0, 0, 8, canvas.height);
  context.fillRect(canvas.width - 8, 0, 8, canvas.height);

  // Top/bottom spine detailing
  context.fillStyle = 'rgba(0, 0, 0, 0.3)';
  context.fillRect(0, 10, canvas.width, 4);
  context.fillRect(0, canvas.height - 14, canvas.width, 4);

  // Darker line
  context.fillStyle = 'rgba(255, 255, 255, 0.2)';
  context.fillRect(0, 14, canvas.width, 2);
  context.fillRect(0, canvas.height - 18, canvas.width, 2);

  // Draw the text
  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(-Math.PI / 2);
  
  context.fillStyle = '#ffffff';
  context.shadowColor = 'rgba(0, 0, 0, 0.6)';
  context.shadowBlur = 4;
  context.font = 'bold 32px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  context.fillText(title, 0, 0);
  context.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}
