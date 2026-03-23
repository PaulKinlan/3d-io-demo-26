import * as THREE from 'three';

export default function createCatPosterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  // Sky background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, '#87ceeb');
  bg.addColorStop(0.55, '#d4eaf7');
  bg.addColorStop(0.6, '#f5e6d3');
  bg.addColorStop(1, '#f9ead8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Washing line
  const lineY = 220;
  ctx.strokeStyle = '#8b7355';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, lineY - 10);
  ctx.lineTo(canvas.width, lineY + 5);
  ctx.stroke();

  // Clothespin helper
  const drawPin = (x, y) => {
    ctx.fillStyle = '#c4a66a';
    ctx.fillRect(x - 4, y - 14, 8, 18);
    ctx.fillStyle = '#a88c50';
    ctx.fillRect(x - 3, y - 2, 6, 4);
  };

  // Sheet hanging on the left
  ctx.fillStyle = '#f0ebe4';
  ctx.beginPath();
  ctx.moveTo(60, lineY - 8);
  ctx.lineTo(150, lineY - 4);
  ctx.lineTo(145, lineY + 90);
  ctx.quadraticCurveTo(105, lineY + 100, 65, lineY + 85);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#d5cfc6';
  ctx.lineWidth = 1;
  ctx.stroke();
  drawPin(80, lineY - 8);
  drawPin(130, lineY - 5);

  // Towel hanging on the right
  ctx.fillStyle = '#e8b4b4';
  ctx.beginPath();
  ctx.moveTo(370, lineY + 1);
  ctx.lineTo(460, lineY + 4);
  ctx.lineTo(455, lineY + 110);
  ctx.quadraticCurveTo(415, lineY + 118, 375, lineY + 105);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#c89898';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Stripe on towel
  ctx.fillStyle = '#d49090';
  ctx.fillRect(378, lineY + 50, 74, 10);
  ctx.fillRect(378, lineY + 66, 74, 10);
  drawPin(395, lineY + 1);
  drawPin(440, lineY + 3);

  // Cat body center
  const catX = 256;
  const catPawY = lineY + 2;

  // Cat arms reaching up to line
  ctx.fillStyle = '#c8a06a';
  // Left arm
  ctx.beginPath();
  ctx.ellipse(catX - 22, catPawY + 40, 14, 45, -0.1, 0, Math.PI * 2);
  ctx.fill();
  // Right arm
  ctx.beginPath();
  ctx.ellipse(catX + 22, catPawY + 40, 14, 45, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Tabby stripes on arms
  ctx.fillStyle = '#a07840';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(catX - 34, catPawY + 18 + i * 18, 24, 5);
    ctx.fillRect(catX + 10, catPawY + 18 + i * 18, 24, 5);
  }

  // Paws gripping the line
  ctx.fillStyle = '#c8a06a';
  // Left paw
  ctx.beginPath();
  ctx.ellipse(catX - 22, catPawY - 2, 16, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Right paw
  ctx.beginPath();
  ctx.ellipse(catX + 22, catPawY - 2, 16, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Paw pads
  ctx.fillStyle = '#e8c0a0';
  ctx.beginPath();
  ctx.arc(catX - 22, catPawY - 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(catX + 22, catPawY - 2, 6, 0, Math.PI * 2);
  ctx.fill();

  // Body (dangling below)
  const bodyY = catPawY + 100;
  ctx.fillStyle = '#c8a06a';
  ctx.beginPath();
  ctx.ellipse(catX, bodyY, 48, 55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly
  ctx.fillStyle = '#e8d8c0';
  ctx.beginPath();
  ctx.ellipse(catX, bodyY + 8, 30, 38, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tabby stripes on body
  ctx.fillStyle = '#a07840';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(catX, bodyY - 25 + i * 20, 44, 5, 0.08 * (i - 1), 0, Math.PI * 2);
    ctx.fill();
  }

  // Dangling back legs
  ctx.fillStyle = '#c8a06a';
  // Left leg
  ctx.beginPath();
  ctx.ellipse(catX - 25, bodyY + 58, 16, 28, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Right leg
  ctx.beginPath();
  ctx.ellipse(catX + 25, bodyY + 58, 16, 28, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Back paws
  ctx.fillStyle = '#c8a06a';
  ctx.beginPath();
  ctx.ellipse(catX - 28, bodyY + 84, 14, 9, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(catX + 28, bodyY + 84, 14, 9, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Paw pads
  ctx.fillStyle = '#e8c0a0';
  ctx.beginPath();
  ctx.arc(catX - 28, bodyY + 84, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(catX + 28, bodyY + 84, 5, 0, Math.PI * 2);
  ctx.fill();

  // Head
  const headY = catPawY + 55;
  ctx.fillStyle = '#c8a06a';
  ctx.beginPath();
  ctx.ellipse(catX, headY, 42, 38, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = '#c8a06a';
  ctx.beginPath();
  ctx.moveTo(catX - 35, headY - 28);
  ctx.lineTo(catX - 20, headY - 55);
  ctx.lineTo(catX - 8, headY - 28);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(catX + 35, headY - 28);
  ctx.lineTo(catX + 20, headY - 55);
  ctx.lineTo(catX + 8, headY - 28);
  ctx.closePath();
  ctx.fill();

  // Inner ears
  ctx.fillStyle = '#e8a0a0';
  ctx.beginPath();
  ctx.moveTo(catX - 30, headY - 28);
  ctx.lineTo(catX - 20, headY - 48);
  ctx.lineTo(catX - 12, headY - 28);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(catX + 30, headY - 28);
  ctx.lineTo(catX + 20, headY - 48);
  ctx.lineTo(catX + 12, headY - 28);
  ctx.closePath();
  ctx.fill();

  // Head stripes
  ctx.fillStyle = '#a07840';
  ctx.beginPath();
  ctx.moveTo(catX - 5, headY - 38);
  ctx.lineTo(catX, headY - 20);
  ctx.lineTo(catX + 5, headY - 38);
  ctx.closePath();
  ctx.fill();

  // Eyes - big worried eyes
  const eyeY = headY - 2;
  // White
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(catX - 16, eyeY, 14, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(catX + 16, eyeY, 14, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Iris - looking up (worried)
  ctx.fillStyle = '#5a8c3a';
  ctx.beginPath();
  ctx.ellipse(catX - 16, eyeY - 3, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(catX + 16, eyeY - 3, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pupils - big and round (scared)
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.ellipse(catX - 16, eyeY - 2, 7, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(catX + 16, eyeY - 2, 7, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(catX - 12, eyeY - 7, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(catX + 20, eyeY - 7, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(catX - 18, eyeY + 2, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(catX + 14, eyeY + 2, 2, 0, Math.PI * 2);
  ctx.fill();

  // Worried eyebrows
  ctx.strokeStyle = '#a07840';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(catX - 28, eyeY - 20);
  ctx.quadraticCurveTo(catX - 16, eyeY - 16, catX - 5, eyeY - 22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(catX + 28, eyeY - 20);
  ctx.quadraticCurveTo(catX + 16, eyeY - 16, catX + 5, eyeY - 22);
  ctx.stroke();

  // Nose
  ctx.fillStyle = '#e88888';
  ctx.beginPath();
  ctx.moveTo(catX, eyeY + 12);
  ctx.lineTo(catX - 6, eyeY + 18);
  ctx.lineTo(catX + 6, eyeY + 18);
  ctx.closePath();
  ctx.fill();

  // Mouth - worried wobbly line
  ctx.strokeStyle = '#7a5a3a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(catX - 12, eyeY + 22);
  ctx.quadraticCurveTo(catX - 6, eyeY + 28, catX, eyeY + 22);
  ctx.quadraticCurveTo(catX + 6, eyeY + 28, catX + 12, eyeY + 22);
  ctx.stroke();

  // Whiskers
  ctx.strokeStyle = '#d8c8a8';
  ctx.lineWidth = 1.5;
  // Left
  ctx.beginPath();
  ctx.moveTo(catX - 20, eyeY + 16);
  ctx.lineTo(catX - 55, eyeY + 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(catX - 20, eyeY + 20);
  ctx.lineTo(catX - 55, eyeY + 22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(catX - 20, eyeY + 24);
  ctx.lineTo(catX - 52, eyeY + 34);
  ctx.stroke();
  // Right
  ctx.beginPath();
  ctx.moveTo(catX + 20, eyeY + 16);
  ctx.lineTo(catX + 55, eyeY + 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(catX + 20, eyeY + 20);
  ctx.lineTo(catX + 55, eyeY + 22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(catX + 20, eyeY + 24);
  ctx.lineTo(catX + 52, eyeY + 34);
  ctx.stroke();

  // Tail - curling to the side
  ctx.strokeStyle = '#c8a06a';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(catX + 40, bodyY + 40);
  ctx.quadraticCurveTo(catX + 80, bodyY + 20, catX + 75, bodyY - 10);
  ctx.quadraticCurveTo(catX + 70, bodyY - 30, catX + 55, bodyY - 25);
  ctx.stroke();
  // Tail stripe
  ctx.strokeStyle = '#a07840';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(catX + 65, bodyY + 10);
  ctx.quadraticCurveTo(catX + 76, bodyY - 5, catX + 72, bodyY - 18);
  ctx.stroke();

  // "HANG IN THERE!" text at bottom
  const textY = 660;

  // Text background band
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillRect(0, textY - 40, canvas.width, 80);

  ctx.fillStyle = '#d45a3a';
  ctx.font = '900 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HANG IN THERE!', canvas.width / 2, textY);

  // Poster border
  ctx.strokeStyle = '#e8e0d4';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
