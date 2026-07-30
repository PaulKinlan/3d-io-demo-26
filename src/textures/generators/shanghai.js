import * as THREE from 'three';

const asTexture = (canvas) => {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

export const makeCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

// 1990s Pudong skyline painter:
// In the 1990s, the Oriental Pearl TV Tower (东方明珠, completed 1994) was the sole
// towering landmark on the Pudong riverbank, surrounded by mid-rise 90s commercial
// buildings, warehouses, and low-rise blocks along the Huangpu river.
// Jin Mao (1999), SWFC (2008), and Shanghai Tower (2015) did not exist yet.
// Coordinates are relative to a ground line `gy`, scaled by `s`.
const drawSkyline = (ctx, gy, s, color, opXPos = -120) => {
  ctx.fillStyle = color;

  // --- 1990s Pudong mid-rise and commercial buildings ---
  const blocks = [
    [-340, 75, 45], [-290, 110, 48], [-235, 65, 38], [-185, 95, 42],
    [-80, 85, 40], [-35, 120, 46], [20, 70, 36], [65, 130, 44],
    [120, 90, 40], [170, 115, 48], [230, 80, 38], [275, 105, 44],
    [325, 60, 50],
  ];
  for (const [x, h, w] of blocks) {
    ctx.fillRect(x * s, gy - h * s, w * s, h * s);
  }

  // A couple of stepped roof silhouettes typical of 90s architecture
  const steppedBlocks = [
    [-290, 110, 48, 20], [65, 130, 44, 18], [170, 115, 48, 15],
  ];
  for (const [x, h, w, sh] of steppedBlocks) {
    ctx.fillRect((x + 8) * s, gy - (h + sh) * s, (w - 16) * s, sh * s);
    // Small communication spires atop 90s rooftops
    ctx.fillRect((x + w / 2 - 1.5) * s, gy - (h + sh + 22) * s, 3 * s, 22 * s);
  }

  // --- Oriental Pearl TV Tower (东方明珠, 1994) ---
  const opX = opXPos * s;

  // Tripod inclined support legs with base spherical anchor pods
  ctx.beginPath();
  ctx.moveTo(opX - 68 * s, gy);
  ctx.lineTo(opX - 48 * s, gy);
  ctx.lineTo(opX - 10 * s, gy - 130 * s);
  ctx.lineTo(opX - 22 * s, gy - 130 * s);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(opX + 68 * s, gy);
  ctx.lineTo(opX + 48 * s, gy);
  ctx.lineTo(opX + 10 * s, gy - 130 * s);
  ctx.lineTo(opX + 22 * s, gy - 130 * s);
  ctx.closePath();
  ctx.fill();

  // Base spherical anchor pods
  ctx.beginPath();
  ctx.arc(opX - 58 * s, gy - 10 * s, 14 * s, 0, Math.PI * 2);
  ctx.arc(opX + 58 * s, gy - 10 * s, 14 * s, 0, Math.PI * 2);
  ctx.fill();

  // Central column structure
  ctx.fillRect(opX - 10 * s, gy - 340 * s, 20 * s, 340 * s);

  // Vertical cylindrical outer column supports (between lower & upper spheres)
  ctx.fillRect(opX - 26 * s, gy - 275 * s, 7 * s, 145 * s);
  ctx.fillRect(opX + 19 * s, gy - 275 * s, 7 * s, 145 * s);

  // Lower large sphere (50m diameter)
  ctx.beginPath();
  ctx.arc(opX, gy - 130 * s, 46 * s, 0, Math.PI * 2);
  ctx.fill();

  // Intermediate small decorative sphere
  ctx.beginPath();
  ctx.arc(opX, gy - 200 * s, 12 * s, 0, Math.PI * 2);
  ctx.fill();

  // Upper sphere (observation deck, 45m diameter)
  ctx.beginPath();
  ctx.arc(opX, gy - 275 * s, 32 * s, 0, Math.PI * 2);
  ctx.fill();

  // Space capsule (top small sphere, 14m diameter)
  ctx.beginPath();
  ctx.arc(opX, gy - 355 * s, 13 * s, 0, Math.PI * 2);
  ctx.fill();

  // Antenna mast & spire
  ctx.fillRect(opX - 3 * s, gy - 440 * s, 6 * s, 85 * s);
  ctx.fillRect(opX - 1.5 * s, gy - 475 * s, 3 * s, 35 * s);
  // Antenna cross-bars
  ctx.fillRect(opX - 12 * s, gy - 410 * s, 24 * s, 2.5 * s);
  ctx.fillRect(opX - 9 * s, gy - 435 * s, 18 * s, 2 * s);
};

// 1. Portrait travel poster: dusk gradient, 90s Oriental Pearl skyline, 上海 / SHANGHAI.
export function createShanghaiSkylinePosterCanvas() {
  const canvas = makeCanvas(512, 768);
  const ctx = canvas.getContext('2d');

  const sky = ctx.createLinearGradient(0, 0, 0, 620);
  sky.addColorStop(0, '#1a1440');
  sky.addColorStop(0.55, '#803468');
  sky.addColorStop(1, '#f2955c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 512, 768);

  // Sun low over the river
  ctx.fillStyle = '#ffd88a';
  ctx.beginPath();
  ctx.arc(370, 500, 48, 0, Math.PI * 2);
  ctx.fill();

  // Skyline with Oriental Pearl Tower as the sole 90s Pudong landmark
  ctx.save();
  ctx.translate(256, 0);
  drawSkyline(ctx, 600, 1.08, '#241b33', -20);
  ctx.restore();

  // Huangpu river
  const river = ctx.createLinearGradient(0, 600, 0, 768);
  river.addColorStop(0, '#3c2f56');
  river.addColorStop(1, '#191327');
  ctx.fillStyle = river;
  ctx.fillRect(0, 600, 512, 168);

  // Light reflections on the river
  ctx.fillStyle = 'rgba(255, 214, 140, 0.35)';
  for (let i = 0; i < 28; i += 1) {
    const rx = 30 + ((i * 37) % 450);
    const ry = 608 + ((i * 23) % 135);
    ctx.fillRect(rx, ry, 16 + ((i * 13) % 32), 3);
  }

  // Titles
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe9c9';
  ctx.font = '700 120px "Noto Sans SC", sans-serif';
  ctx.fillText('上海', 256, 140);
  ctx.font = '600 40px sans-serif';
  ctx.letterSpacing = '14px';
  ctx.fillText('SHANGHAI', 262, 195);
  ctx.letterSpacing = '0px';

  ctx.strokeStyle = 'rgba(255, 233, 201, 0.5)';
  ctx.lineWidth = 10;
  ctx.strokeRect(18, 18, 476, 732);

  return canvas;
}

export function createShanghaiSkylinePoster() {
  return asTexture(createShanghaiSkylinePosterCanvas());
}

// 2. Landscape Bund panorama for the side-wall frame (90s Pudong skyline across the river).
export function createBundPanoramaPosterCanvas() {
  const canvas = makeCanvas(768, 512);
  const ctx = canvas.getContext('2d');

  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#0d1b3d');
  sky.addColorStop(0.7, '#33477a');
  sky.addColorStop(1, '#c76b4e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 768, 512);

  // 90s Skyline across the Bund
  ctx.save();
  ctx.translate(384, 0);
  drawSkyline(ctx, 390, 0.82, '#101828', -60);
  ctx.restore();

  // River
  const river = ctx.createLinearGradient(0, 390, 0, 512);
  river.addColorStop(0, '#25324f');
  river.addColorStop(1, '#0d1220');
  ctx.fillStyle = river;
  ctx.fillRect(0, 390, 768, 122);
  ctx.fillStyle = 'rgba(255, 200, 120, 0.3)';
  for (let i = 0; i < 32; i += 1) {
    const rx = 15 + ((i * 47) % 735);
    const ry = 398 + ((i * 17) % 100);
    ctx.fillRect(rx, ry, 14 + ((i * 11) % 28), 3);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe9c9';
  ctx.font = '700 54px "Noto Sans SC", sans-serif';
  ctx.fillText('外滩 · 上海', 384, 70);
  ctx.font = '500 24px sans-serif';
  ctx.letterSpacing = '10px';
  ctx.fillText('THE BUND', 389, 108);
  ctx.letterSpacing = '0px';

  return canvas;
}

export function createBundPanoramaPoster() {
  return asTexture(createBundPanoramaPosterCanvas());
}

// Paint a sprite from an ASCII pixel map. `palette` maps characters to colours.
const drawSprite = (ctx, rows, palette, x, y, px) => {
  rows.forEach((row, ry) => {
    [...row].forEach((ch, rx) => {
      const color = palette[ch];
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(x + rx * px, y + ry * px, px, px);
    });
  });
};

// 3. 魂斗罗 (Contra) poster — the Subor-era classic, pixel commando style.
export function createContraPosterCanvas() {
  const canvas = makeCanvas(512, 768);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, 512, 768);

  // Jungle sunset backdrop stripes
  const bands = ['#5c1a1a', '#7d2a15', '#a04310', '#c86a1e'];
  bands.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(40, 240 + i * 34, 432, 30);
  });

  // Pixel explosion burst
  const burst = [
    '....y....',
    '..y.y.y..',
    '...ooo...',
    'y.ooroo.y',
    '..orrro..',
    'y.ooroo.y',
    '...ooo...',
    '..y.y.y..',
    '....y....',
  ];
  drawSprite(ctx, burst, { y: '#ffe066', o: '#ff8c1a', r: '#e5341a' }, 330, 430, 14);

  // Pixel commando silhouette (running pose)
  const soldier = [
    '...hh...',
    '...hh...',
    '..ssss..',
    '.svvvvg.',
    'ssvvvggg',
    '..vvvv..',
    '..pp.pp.',
    '.pp...pp',
    'bb.....b',
  ];
  drawSprite(
    ctx,
    soldier,
    { h: '#e8b088', s: '#e8b088', v: '#d0342c', g: '#3a3a3a', p: '#2255cc', b: '#222222' },
    110, 380, 20,
  );

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff2a2a';
  ctx.font = '900 110px "Noto Sans SC", sans-serif';
  ctx.fillText('魂斗罗', 256, 150);
  ctx.fillStyle = '#ffd700';
  ctx.font = '800 52px monospace';
  ctx.fillText('CONTRA', 256, 215);

  ctx.fillStyle = '#888';
  ctx.font = '500 26px monospace';
  ctx.fillText('30 LIVES: ↑↑↓↓←→←→BA', 256, 700);

  ctx.strokeStyle = '#ff2a2a';
  ctx.lineWidth = 8;
  ctx.strokeRect(16, 16, 480, 736);

  return canvas;
}

export function createContraPoster() {
  return asTexture(createContraPosterCanvas());
}

// 4. 坦克大战 (Battle City / Tank 1990) poster with the brick walls and eagle base.
export function createTankPosterCanvas() {
  const canvas = makeCanvas(512, 768);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 512, 768);

  // Battle City brick border
  const brick = (x, y) => {
    ctx.fillStyle = '#b5482a';
    ctx.fillRect(x, y, 30, 30);
    ctx.fillStyle = '#7a2c16';
    ctx.fillRect(x, y + 13, 30, 4);
    ctx.fillRect(x + 13, y, 4, 13);
    ctx.fillRect(x + 4, y + 17, 4, 13);
  };
  for (let x = 8; x < 504; x += 32) {
    brick(x, 8);
    brick(x, 730);
  }
  for (let y = 40; y < 730; y += 32) {
    brick(8, y);
    brick(474, y);
  }

  // Player tank sprite (yellow, facing up)
  const tank = [
    '.t..b..t.',
    '.t..b..t.',
    '.ttbbbtt.',
    'ttbbbbbtt',
    'ttbbybbtt',
    'ttbyyybtt',
    'ttbbbbbtt',
    '.ttbbbtt.',
    '.t.....t.',
  ];
  drawSprite(ctx, tank, { t: '#c8a018', b: '#e8c83a', y: '#f8ecb0' }, 130, 360, 28);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#e8c83a';
  ctx.font = '900 92px "Noto Sans SC", sans-serif';
  ctx.fillText('坦克大战', 256, 165);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 42px monospace';
  ctx.fillText('BATTLE CITY', 256, 230);

  ctx.fillStyle = '#999';
  ctx.font = '500 30px monospace';
  ctx.fillText('1 PLAYER  ·  2 PLAYERS', 256, 690);

  return canvas;
}

export function createTankPoster() {
  return asTexture(createTankPosterCanvas());
}

// 5. 乒乓 ping pong poster — national sport, red & gold.
export function createPingPongPosterCanvas() {
  const canvas = makeCanvas(512, 768);
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, 0, 768);
  bg.addColorStop(0, '#c8102e');
  bg.addColorStop(1, '#7d0a1e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 768);

  // Paddle: red rubber face, wooden handle
  ctx.save();
  ctx.translate(256, 430);
  ctx.rotate(-0.4);
  ctx.fillStyle = '#d2a56b';
  ctx.fillRect(-26, 100, 52, 150);
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 150, 165, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e5341a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 138, 153, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Ball with motion streaks
  ctx.fillStyle = '#fff8e8';
  ctx.beginPath();
  ctx.arc(400, 250, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 248, 232, 0.5)';
  ctx.lineWidth = 6;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(340 - i * 30, 238 + i * 10);
    ctx.lineTo(372 - i * 24, 244 + i * 8);
    ctx.stroke();
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.font = '900 130px "Noto Sans SC", sans-serif';
  ctx.fillText('乒乓', 256, 160);
  ctx.fillStyle = '#fff2cc';
  ctx.font = '600 34px sans-serif';
  ctx.letterSpacing = '8px';
  ctx.fillText('PING PONG', 260, 215);
  ctx.letterSpacing = '0px';

  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 10;
  ctx.strokeRect(18, 18, 476, 732);

  return canvas;
}

export function createPingPongPoster() {
  return asTexture(createPingPongPosterCanvas());
}

// Vector heart — the ❤ glyph renders as a tofu box in some canvas font stacks,
// so draw it as a path. `size` is roughly the heart's width.
const drawHeart = (ctx, x, y, size, color) => {
  const s = size / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.9);
  ctx.bezierCurveTo(x - s * 1.4, y - s * 0.2, x - s * 0.7, y - s * 1.1, x, y - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.7, y - s * 1.1, x + s * 1.4, y - s * 0.2, x, y + s * 0.9);
  ctx.fill();
};

// 6. "I ❤ 上海" duvet top — red base, central motif, decorated exclusively with hearts (no stars).
export function createShanghaiBedsheetCanvas() {
  const canvas = makeCanvas(512, 512);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#c8102e';
  ctx.fillRect(0, 0, 512, 512);

  // Big central motif — the duvet's top-face UVs run the canvas x-axis down the
  // bed's length, which reads naturally from the room's isometric camera.
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff2cc';
  ctx.font = '800 70px sans-serif';
  ctx.fillText('I', 130, 250);
  drawHeart(ctx, 216, 250, 90, '#ffd700');
  ctx.fillStyle = '#fff2cc';
  ctx.font = '800 84px "Noto Sans SC", sans-serif';
  ctx.fillText('上海', 372, 252);

  // Scatter cute gold and cream hearts around the border (all stars removed).
  const spots = [
    [60, 60], [160, 80], [260, 55], [360, 80], [455, 60],
    [50, 165], [462, 165], [50, 335], [462, 335],
    [60, 452], [160, 435], [260, 458], [360, 435], [455, 452],
    // Inner accent hearts
    [105, 115], [405, 115], [105, 385], [405, 385],
  ];
  spots.forEach(([x, y], i) => {
    if (i % 2 === 0) {
      drawHeart(ctx, x, y, 32, '#ffd700');
    } else {
      drawHeart(ctx, x, y, 28, 'rgba(255, 242, 204, 0.9)');
    }
  });

  ctx.textBaseline = 'alphabetic';
  return canvas;
}

export function createShanghaiBedsheet() {
  return asTexture(createShanghaiBedsheetCanvas());
}

// 7. Matching pillow top — gold base with 上海 and small hearts.
export function createShanghaiPillowCanvas() {
  const canvas = makeCanvas(512, 512);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffd88a';
  ctx.fillRect(0, 0, 512, 512);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#c8102e';
  ctx.font = '800 120px "Noto Sans SC", sans-serif';
  ctx.fillText('上海', 256, 256);

  const spots = [[100, 100], [412, 100], [100, 412], [412, 412]];
  spots.forEach(([x, y]) => {
    drawHeart(ctx, x, y, 44, '#c8102e');
  });

  ctx.textBaseline = 'alphabetic';
  return canvas;
}

export function createShanghaiPillow() {
  return asTexture(createShanghaiPillowCanvas());
}

// 8. 咪咪虾条 (Mimi Shrimp Strips) — iconic 1990s Chinese childhood snack packet.
export function createMimiSnackTextureCanvas() {
  const canvas = makeCanvas(512, 512);
  const ctx = canvas.getContext('2d');

  // Background: Sunny snack yellow with subtle glossy foil gradient
  const bg = ctx.createLinearGradient(0, 0, 512, 512);
  bg.addColorStop(0, '#ffd83b');
  bg.addColorStop(0.3, '#ffca18');
  bg.addColorStop(0.7, '#ffbe0b');
  bg.addColorStop(1, '#ffa500');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 512);

  // Foil diagonal highlights / sheen
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.beginPath();
  ctx.moveTo(0, 120);
  ctx.lineTo(260, 0);
  ctx.lineTo(340, 0);
  ctx.lineTo(0, 200);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(80, 512);
  ctx.lineTo(512, 80);
  ctx.lineTo(512, 160);
  ctx.lineTo(160, 512);
  ctx.fill();
  ctx.restore();

  // Top crimped seal band
  ctx.fillStyle = '#c8102e';
  ctx.fillRect(0, 0, 512, 42);
  // Crimp serrations/ridges
  for (let x = 0; x < 512; x += 8) {
    ctx.fillStyle = x % 16 === 0 ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x, 0, 4, 42);
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '4px';
  ctx.fillText('MIMI · 经典休闲食品', 256, 28);
  ctx.letterSpacing = '0px';

  // Bottom crimped seal band
  ctx.fillStyle = '#c8102e';
  ctx.fillRect(0, 470, 512, 42);
  for (let x = 0; x < 512; x += 8) {
    ctx.fillStyle = x % 16 === 0 ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x, 470, 4, 42);
  }

  // Top brand banner: Red ribbon badge with "咪咪"
  ctx.fillStyle = '#c8102e';
  ctx.beginPath();
  ctx.roundRect(110, 58, 292, 70, [16, 16, 24, 24]);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Chinese brand name: "咪咪"
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 52px "Noto Sans SC", sans-serif';
  ctx.fillText('咪 咪', 256, 112);

  // English cursive / retro logo: "Mimi"
  ctx.fillStyle = '#1565c0';
  ctx.font = 'italic 900 36px sans-serif';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeText('Mimi', 256, 168);
  ctx.fillText('Mimi', 256, 168);

  // Main product title: "虾 条" (Giant bold red with white stroke and drop shadow)
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.font = '900 84px "Noto Sans SC", sans-serif';
  ctx.fillText('虾 条', 260, 260); // Drop shadow

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 12;
  ctx.lineJoin = 'round';
  ctx.strokeText('虾 条', 256, 254);
  ctx.fillStyle = '#d32f2f';
  ctx.fillText('虾 条', 256, 254);
  ctx.restore();

  // English subtitle: "PRAWN CRACKERS"
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0d47a1';
  ctx.font = '800 22px sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('PRAWN CRACKERS', 256, 292);
  ctx.letterSpacing = '0px';

  // Mascot Illustration: Cute cartoon Mimi cat on the left
  ctx.save();
  ctx.translate(125, 375);
  // Cat face (white circle)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Cat ears
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(-38, -25);
  ctx.lineTo(-48, -62);
  ctx.lineTo(-18, -44);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ff8da1';
  ctx.beginPath();
  ctx.moveTo(-36, -28);
  ctx.lineTo(-44, -54);
  ctx.lineTo(-22, -42);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(38, -25);
  ctx.lineTo(48, -62);
  ctx.lineTo(18, -44);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ff8da1';
  ctx.beginPath();
  ctx.moveTo(36, -28);
  ctx.lineTo(44, -54);
  ctx.lineTo(22, -42);
  ctx.closePath();
  ctx.fill();

  // Sailor hat
  ctx.fillStyle = '#1565c0';
  ctx.beginPath();
  ctx.ellipse(0, -42, 28, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -42, 14, Math.PI, Math.PI * 2);
  ctx.fill();

  // Eyes (cute smiling arcs)
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(-18, -4, 8, Math.PI * 0.8, Math.PI * 2.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(18, -4, 8, Math.PI * 0.8, Math.PI * 2.2);
  ctx.stroke();

  // Nose and mouth
  ctx.fillStyle = '#ff4081';
  ctx.beginPath();
  ctx.arc(0, 8, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-7, 16, 7, 0, Math.PI * 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(7, 16, 7, 0.1 * Math.PI, Math.PI);
  ctx.stroke();

  // Whiskers
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-28, 6);
  ctx.lineTo(-52, 2);
  ctx.moveTo(-28, 14);
  ctx.lineTo(-50, 18);
  ctx.moveTo(28, 6);
  ctx.lineTo(52, 2);
  ctx.moveTo(28, 14);
  ctx.lineTo(50, 18);
  ctx.stroke();
  ctx.restore();

  // Crunchy fried shrimp strips illustration on the right
  const drawShrimpStick = (sx, sy, angle, len) => {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);
    ctx.fillStyle = '#e67e00';
    ctx.beginPath();
    ctx.roundRect(-len / 2, -10, len, 20, [8, 8, 8, 8]);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(-len / 2 + 3, -7, len - 6, 14, [6, 6, 6, 6]);
    ctx.fill();
    // Crunchy ridges
    ctx.fillStyle = '#fff0b3';
    for (let rx = -len / 2 + 12; rx < len / 2 - 10; rx += 14) {
      ctx.fillRect(rx, -4, 5, 8);
    }
    ctx.restore();
  };
  drawShrimpStick(340, 350, -0.35, 110);
  drawShrimpStick(390, 395, 0.25, 100);
  drawShrimpStick(320, 420, -0.15, 95);

  // Nostalgic 90s badge stamps
  ctx.save();
  ctx.translate(430, 165);
  ctx.rotate(0.2);
  ctx.fillStyle = '#c8102e';
  ctx.beginPath();
  ctx.arc(0, 0, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd700';
  ctx.font = '800 16px "Noto Sans SC", sans-serif';
  ctx.fillText('经典', 0, -10);
  ctx.fillText('香脆', 0, 10);
  ctx.restore();

  // Net weight & price tag details
  ctx.textAlign = 'left';
  ctx.fillStyle = '#333333';
  ctx.font = '700 18px "Noto Sans SC", sans-serif';
  ctx.fillText('净含量: 20克', 220, 450);

  // Border outline
  ctx.strokeStyle = '#e65100';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 506, 506);

  return canvas;
}

export function createMimiSnackTexture() {
  return asTexture(createMimiSnackTextureCanvas());
}
