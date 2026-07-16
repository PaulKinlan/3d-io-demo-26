import * as THREE from 'three';

const asTexture = (canvas) => {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const makeCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

// Shared skyline painter: Oriental Pearl Tower, Shanghai Tower, Jin Mao,
// SWFC ("bottle opener") silhouettes above the Huangpu river.
// Coordinates are relative to a ground line `gy`, scaled by `s`.
const drawSkyline = (ctx, gy, s, color) => {
  ctx.fillStyle = color;

  // --- Background filler blocks (Pudong towers) ---
  const blocks = [
    [-330, 90, 40], [-280, 130, 46], [110, 120, 42], [170, 90, 36],
    [230, 150, 44], [290, 110, 40], [340, 70, 50],
  ];
  for (const [x, h, w] of blocks) {
    ctx.fillRect(x * s, gy - h * s, w * s, h * s);
  }

  // --- Oriental Pearl Tower (1994) at x ≈ -180 ---
  const opX = -180 * s;
  // Tripod legs
  ctx.beginPath();
  ctx.moveTo(opX - 60 * s, gy);
  ctx.lineTo(opX, gy - 120 * s);
  ctx.lineTo(opX - 44 * s, gy);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(opX + 60 * s, gy);
  ctx.lineTo(opX, gy - 120 * s);
  ctx.lineTo(opX + 44 * s, gy);
  ctx.fill();
  // Central column
  ctx.fillRect(opX - 9 * s, gy - 330 * s, 18 * s, 330 * s);
  // Lower big sphere
  ctx.beginPath();
  ctx.arc(opX, gy - 120 * s, 42 * s, 0, Math.PI * 2);
  ctx.fill();
  // Upper sphere
  ctx.beginPath();
  ctx.arc(opX, gy - 260 * s, 30 * s, 0, Math.PI * 2);
  ctx.fill();
  // Top small sphere + antenna
  ctx.beginPath();
  ctx.arc(opX, gy - 340 * s, 12 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(opX - 2.5 * s, gy - 420 * s, 5 * s, 85 * s);

  // --- Shanghai Tower (2015) at x ≈ 30 — smooth taper with a spire ---
  const stX = 30 * s;
  ctx.beginPath();
  ctx.moveTo(stX - 52 * s, gy);
  ctx.bezierCurveTo(stX - 44 * s, gy - 230 * s, stX - 26 * s, gy - 380 * s, stX - 8 * s, gy - 455 * s);
  ctx.lineTo(stX + 16 * s, gy - 455 * s);
  ctx.bezierCurveTo(stX + 30 * s, gy - 340 * s, stX + 44 * s, gy - 180 * s, stX + 52 * s, gy);
  ctx.fill();
  ctx.fillRect(stX - 1 * s, gy - 480 * s, 6 * s, 30 * s);

  // --- Jin Mao Tower (1999) at x ≈ -70 — stepped pagoda tiers ---
  const jmX = -70 * s;
  const tiers = [
    [46, 0, 150], [40, 150, 90], [34, 240, 70], [28, 310, 50], [20, 360, 34],
  ];
  for (const [hw, from, h] of tiers) {
    ctx.fillRect(jmX - hw * s, gy - (from + h) * s, hw * 2 * s, h * s);
  }
  ctx.fillRect(jmX - 3 * s, gy - 430 * s, 6 * s, 40 * s);

  // --- SWFC "bottle opener" (2008) at x ≈ 120 ---
  const wfX = 120 * s;
  ctx.beginPath();
  ctx.moveTo(wfX - 40 * s, gy);
  ctx.lineTo(wfX - 16 * s, gy - 420 * s);
  ctx.lineTo(wfX + 16 * s, gy - 420 * s);
  ctx.lineTo(wfX + 40 * s, gy);
  ctx.fill();
  // The trapezoid aperture near the top (cut out with destination-out-ish overdraw
  // is complex; draw sky-coloured hole instead via save/globalCompositeOperation)
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.moveTo(wfX - 12 * s, gy - 400 * s);
  ctx.lineTo(wfX + 12 * s, gy - 400 * s);
  ctx.lineTo(wfX + 8 * s, gy - 330 * s);
  ctx.lineTo(wfX - 8 * s, gy - 330 * s);
  ctx.fill();
  ctx.restore();
};

// Portrait travel poster: dusk gradient, skyline, 上海 / SHANGHAI.
export function createShanghaiSkylinePoster() {
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
  ctx.arc(380, 520, 46, 0, Math.PI * 2);
  ctx.fill();

  // Skyline (translated so x=0 is canvas centre)
  ctx.save();
  ctx.translate(256, 0);
  drawSkyline(ctx, 600, 1.05, '#241b33');
  ctx.restore();

  // Huangpu river
  const river = ctx.createLinearGradient(0, 600, 0, 768);
  river.addColorStop(0, '#3c2f56');
  river.addColorStop(1, '#191327');
  ctx.fillStyle = river;
  ctx.fillRect(0, 600, 512, 168);
  // Light reflections
  ctx.fillStyle = 'rgba(255, 214, 140, 0.35)';
  for (let i = 0; i < 26; i += 1) {
    const rx = 40 + Math.random() * 432;
    const ry = 612 + Math.random() * 130;
    ctx.fillRect(rx, ry, 14 + Math.random() * 30, 3);
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

  return asTexture(canvas);
}

// Landscape Bund panorama for the side-wall frame.
export function createBundPanoramaPoster() {
  const canvas = makeCanvas(768, 512);
  const ctx = canvas.getContext('2d');

  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#0d1b3d');
  sky.addColorStop(0.7, '#33477a');
  sky.addColorStop(1, '#c76b4e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 768, 512);

  ctx.save();
  ctx.translate(384, 0);
  drawSkyline(ctx, 390, 0.78, '#101828');
  ctx.restore();

  // River
  const river = ctx.createLinearGradient(0, 390, 0, 512);
  river.addColorStop(0, '#25324f');
  river.addColorStop(1, '#0d1220');
  ctx.fillStyle = river;
  ctx.fillRect(0, 390, 768, 122);
  ctx.fillStyle = 'rgba(255, 200, 120, 0.3)';
  for (let i = 0; i < 30; i += 1) {
    ctx.fillRect(20 + Math.random() * 728, 400 + Math.random() * 100, 12 + Math.random() * 26, 3);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe9c9';
  ctx.font = '700 54px "Noto Sans SC", sans-serif';
  ctx.fillText('外滩 · 上海', 384, 70);
  ctx.font = '500 24px sans-serif';
  ctx.letterSpacing = '10px';
  ctx.fillText('THE BUND', 389, 108);
  ctx.letterSpacing = '0px';

  return asTexture(canvas);
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

// 魂斗罗 (Contra) poster — the Subor-era classic, pixel commando style.
export function createContraPoster() {
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

  return asTexture(canvas);
}

// 坦克大战 (Battle City / Tank 1990) poster with the brick walls and eagle base.
export function createTankPoster() {
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

  return asTexture(canvas);
}

// 乒乓 ping pong poster — national sport, red & gold.
export function createPingPongPoster() {
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

  return asTexture(canvas);
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

// Vector five-point star (same tofu-glyph concern as the heart).
const drawStar = (ctx, x, y, size, color) => {
  const outer = size / 2;
  const inner = outer * 0.42;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
};

// "I ❤ 上海" duvet top — red base, alternating rows of hearts and characters.
export function createShanghaiBedsheet() {
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

  // Scatter small gold hearts and stars around the border
  const spots = [
    [60, 60], [160, 90], [280, 55], [390, 85], [470, 60],
    [50, 170], [460, 180], [55, 330], [465, 340],
    [70, 450], [180, 425], [300, 460], [410, 430], [480, 470],
  ];
  spots.forEach(([x, y], i) => {
    if (i % 2) drawStar(ctx, x, y, 34, '#ffd700');
    else drawHeart(ctx, x, y, 34, 'rgba(255, 242, 204, 0.85)');
  });

  ctx.textBaseline = 'alphabetic';
  return asTexture(canvas);
}

// Matching pillow top — gold base with 上海 and small hearts.
export function createShanghaiPillow() {
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
  return asTexture(canvas);
}
