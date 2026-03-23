import * as THREE from 'three';

export function createCDTexture(labelStr, backgroundColor = '#e8e8e8', textColor = '#222') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = canvas.width / 2;

  // CD Base
  ctx.fillStyle = backgroundColor;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // inner metallic ring
  ctx.fillStyle = '#b0b5ba';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.33, 0, Math.PI * 2);
  ctx.fill();

  // inner hole (CD hole is transparent/black)
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Text label
  ctx.save();
  ctx.translate(cx, cy);
  // Slant the text slightly for realism
  ctx.rotate(-Math.PI / 8); 
  ctx.fillStyle = textColor;
  
  if (labelStr === 'Photoshop') {
    ctx.font = 'bold 54px Arial, sans-serif';
    ctx.fillStyle = '#0a3066';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Adobe', 0, -r * 0.65);
    ctx.fillText(labelStr, 0, -r * 0.45);
    
    // Some lines to make it look like a printed CD
    ctx.strokeStyle = '#0a3066';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, Math.PI, Math.PI * 2);
    ctx.stroke();
  } else if (labelStr) {
    ctx.font = 'bold 44px "Comic Sans MS", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Split text if it's "Pirated Software"
    if (labelStr === 'Pirated Software') {
      ctx.fillText('Pirated', 0, -r * 0.6);
      ctx.fillText('Software', 0, -r * 0.4);
    } else {
      ctx.fillText(labelStr, 0, -r * 0.5);
    }
    
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for(let i=0; i<3; i++) {
        ctx.moveTo(-r * 0.5, -r * (0.35 - i*0.1));
        ctx.lineTo(r * 0.5, -r * (0.35 - i*0.1));
    }
    ctx.stroke();
  }
  ctx.restore();

  // lines to make it look like a CD-r
  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.96, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
