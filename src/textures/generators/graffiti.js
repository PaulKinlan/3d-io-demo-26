import * as THREE from 'three';

export default function createGraffitiTexture(imagePath) {
  const texture = new THREE.Texture();
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    console.log('Graffiti texture image loaded:', img.width, img.height);
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
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
        
        let newAlpha = 255 - luma;
        // Make edge sharper: anything above luma 200 becomes fully transparent, below becomes black
        if (luma > 200) {
           newAlpha = 0;
        } else {
           newAlpha = 255 - (luma * (255/200));
        }
        
        // Force black spray paint
        data[i] = 10;
        data[i+1] = 10;
        data[i+2] = 10;
        data[i+3] = Math.min(a, newAlpha);
      }
      ctx.putImageData(imageData, 0, 0);
    } catch (e) {
      console.warn('Canvas pixel manipulation failed', e);
    }
    
    texture.image = canvas;
    texture.needsUpdate = true;
  };
  
  img.src = imagePath;
  return texture;
}
