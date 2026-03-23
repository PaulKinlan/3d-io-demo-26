import * as THREE from 'three';

export default function createGraffitiTexture(imagePath) {
  const canvas = document.createElement('canvas');
  // Initial size
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  // Ensure the texture can gracefully handle size changes
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    console.log('Graffiti texture image loaded:', img.width, img.height);
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];
        
        // Calculate luminance
        const luma = r * 0.299 + g * 0.587 + b * 0.114;
        
        // Only modify if it's mostly white-ish so we don't mess up pure transparent pixels if any
        let newAlpha = 255 - luma;
        // Make edge sharper: anything above luma 200 becomes fully transparent, below becomes black
        if (luma > 200) {
           newAlpha = 0;
        } else {
           // map luma 0-200 to alpha 255-0
           newAlpha = 255 - (luma * (255/200));
        }
        
        // Force black spray paint
        data[i] = 10;
        data[i+1] = 10;
        data[i+2] = 10;
        data[i+3] = Math.min(a, newAlpha); // Don't make already transparent pixels opaque
      }
      ctx.putImageData(imageData, 0, 0);
    } catch (e) {
      console.warn('Canvas pixel manipulation failed', e);
    }
    
    texture.needsUpdate = true;
  };
  
  // Set transparent black while loading
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0,0, canvas.width, canvas.height);
  
  img.src = imagePath;
  
  return texture;
}
