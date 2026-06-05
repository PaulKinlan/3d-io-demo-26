import * as THREE from 'three';

// A 3D mechanical-style keyboard that sits on the desk. Keycaps are individual
// meshes that physically travel down when the matching physical key is pressed,
// the Caps/Num/Scroll Lock LEDs light up from `event.getModifierState()`, and the
// legends are re-labelled to match the user's *detected* layout via the
// Keyboard Map API (`navigator.keyboard.getLayoutMap()`), falling back to US
// QWERTY where that API is unavailable (Firefox/Safari).

// --- Geometry constants (local to the keyboard group) ---
const U = 0.094;          // one key unit (width & row depth)
const GAP = 0.013;        // gap between keycaps
const CAP_H = 0.052;      // keycap height
const CHASSIS_H = 0.07;   // keyboard body height
const TRAVEL = 0.022;     // how far a key dips when pressed
const MARGIN = 0.045;     // chassis border around the key field
const ROWS = 6;
const TOTAL_U = 15;       // widest row, in key units

const BOARD_W = TOTAL_U * U;
const BOARD_D = ROWS * U;
const LED_D = U * 0.7;
const CHASSIS_W = BOARD_W + MARGIN * 2;
const CHASSIS_D = BOARD_D + LED_D + MARGIN * 2;
const CAP_REST_Y = CHASSIS_H / 2 + CAP_H / 2;

const POSITION = new THREE.Vector3(-4.5, 3.3, -3.52);

const isMac = /Mac|iPhone|iPad/.test(
  (typeof navigator !== 'undefined' && (navigator.platform || navigator.userAgent)) || ''
);
const META_LABEL = isMac ? '⌘' : 'win';

// Keys that are styled darker and never get re-labelled by the layout map.
const SPECIAL_LABELS = {
  Escape: 'esc',
  Backspace: '⌫',
  Tab: 'tab',
  CapsLock: 'caps',
  Enter: 'enter',
  ShiftLeft: 'shift',
  ShiftRight: 'shift',
  ControlLeft: 'ctrl',
  ControlRight: 'ctrl',
  AltLeft: 'alt',
  AltRight: 'alt',
  MetaLeft: META_LABEL,
  MetaRight: META_LABEL,
  ContextMenu: '≡',
  Space: '',
};
for (let i = 1; i <= 12; i++) SPECIAL_LABELS[`F${i}`] = `F${i}`;

// Default (US QWERTY) legends for the writing-system keys.
const PUNCT_LABELS = {
  Backquote: '`',
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Slash: '/',
};

const isWritingKey = (code) =>
  code.startsWith('Key') || code.startsWith('Digit') || code in PUNCT_LABELS;

const defaultLabel = (code) => {
  if (code in SPECIAL_LABELS) return SPECIAL_LABELS[code];
  if (code in PUNCT_LABELS) return PUNCT_LABELS[code];
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Key')) return code.slice(3);
  return code;
};

// Single printable letters read nicest in uppercase on a keycap.
const formatChar = (ch) => (/^[a-z]$/.test(ch) ? ch.toUpperCase() : ch);

// --- Row layout. Each entry is a code string, {code, w} for a wider key, or
// {gap} for empty space. Widths are in key units; default 1. ---
const k = (code, w = 1) => ({ code, w });
const gap = (w) => ({ gap: w });

const ROW_DEFS = [
  // Function row (left-aligned, 14.5u)
  [k('Escape'), gap(0.5),
    'F1', 'F2', 'F3', 'F4', gap(0.5),
    'F5', 'F6', 'F7', 'F8', gap(0.5),
    'F9', 'F10', 'F11', 'F12'].map((e) => (typeof e === 'string' ? k(e) : e)),
  // Number row
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6',
    'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal']
    .map((e) => k(e)).concat([k('Backspace', 2)]),
  // Top letter row
  [k('Tab', 1.5)].concat(
    ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO',
      'KeyP', 'BracketLeft', 'BracketRight'].map((e) => k(e)),
    [k('Backslash', 1.5)]),
  // Home row
  [k('CapsLock', 1.75)].concat(
    ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL',
      'Semicolon', 'Quote'].map((e) => k(e)),
    [k('Enter', 2.25)]),
  // Bottom letter row
  [k('ShiftLeft', 2.25)].concat(
    ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period',
      'Slash'].map((e) => k(e)),
    [k('ShiftRight', 2.75)]),
  // Modifier / space row
  [k('ControlLeft', 1.25), k('MetaLeft', 1.25), k('AltLeft', 1.25),
    k('Space', 6.25), k('AltRight', 1.25), k('MetaRight', 1.25),
    k('ContextMenu', 1.25), k('ControlRight', 1.25)],
];

// --- Canvas-texture legend rendering ---
function makeLabelTexture(label) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);
  if (label) {
    const size = label.length > 2 ? 40 : label.length === 2 ? 60 : 74;
    ctx.fillStyle = '#2b2b30';
    ctx.font = `600 ${size}px -apple-system, "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 64, 70);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export const buildKeyboard = ({ scene, registerFrameUpdate }) => {
  const group = new THREE.Group();
  group.position.copy(POSITION);
  scene.add(group);

  // Chassis
  const chassisMat = new THREE.MeshStandardMaterial({ color: '#34343a', roughness: 0.7, metalness: 0.15 });
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(CHASSIS_W, CHASSIS_H, CHASSIS_D), chassisMat);
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  group.add(chassis);

  const keycaps = [];       // { mesh, pressed }
  const capByCode = new Map();

  const keysBackZ = -CHASSIS_D / 2 + MARGIN + LED_D; // front edge of the LED strip
  const xLeft = -BOARD_W / 2;

  ROW_DEFS.forEach((row, rowIndex) => {
    const rowZ = keysBackZ + U / 2 + rowIndex * U;
    let cursor = xLeft;

    for (const item of row) {
      if (item.gap) {
        cursor += item.gap * U;
        continue;
      }
      const { code, w } = item;
      const keyW = w * U;
      const centerX = cursor + keyW / 2;
      cursor += keyW;

      const special = code in SPECIAL_LABELS;
      const capMat = new THREE.MeshStandardMaterial({
        color: special ? '#d2cdc4' : '#ece8e0',
        roughness: 0.55,
        metalness: 0.05,
        emissive: '#3aa0ff',
        emissiveIntensity: 0,
      });
      const cap = new THREE.Mesh(
        new THREE.BoxGeometry(keyW - GAP, CAP_H, U - GAP),
        capMat,
      );
      cap.position.set(centerX, CAP_REST_Y, rowZ);
      cap.castShadow = true;
      cap.receiveShadow = true;
      group.add(cap);

      // Legend plane sitting flat on top of the keycap.
      const labelMat = new THREE.MeshStandardMaterial({
        map: makeLabelTexture(defaultLabel(code)),
        transparent: true,
        roughness: 0.6,
      });
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry((keyW - GAP) * 0.82, (U - GAP) * 0.82),
        labelMat,
      );
      label.rotation.x = -Math.PI / 2;
      label.position.y = CAP_H / 2 + 0.001;
      cap.add(label);

      const entry = {
        mesh: cap,
        pressed: false,
        releaseAt: Infinity,
        setLabel(text) {
          labelMat.map.dispose();
          labelMat.map = makeLabelTexture(text);
          labelMat.needsUpdate = true;
        },
      };
      keycaps.push(entry);
      capByCode.set(code, entry);
    }
  });

  // --- Lock LEDs (top-right of the chassis) ---
  const ledZ = -CHASSIS_D / 2 + MARGIN + LED_D / 2;
  const makeLed = (labelText, x) => {
    const ledGroup = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: '#2f5f33',
      emissive: '#46ff5a',
      emissiveIntensity: 0,
      roughness: 0.4,
    });
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.012, 0.022), mat);
    led.position.set(x, CHASSIS_H / 2, ledZ);
    ledGroup.add(led);

    const labelMat = new THREE.MeshBasicMaterial({
      map: makeLabelTexture(labelText),
      transparent: true,
    });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.025), labelMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(x, CHASSIS_H / 2 + 0.001, ledZ + 0.03);
    ledGroup.add(plane);

    group.add(ledGroup);
    return mat;
  };
  const numLed = makeLed('num', BOARD_W / 2 - 0.18);
  const capsLed = makeLed('caps', BOARD_W / 2 - 0.1);
  const scrollLed = makeLed('scrl', BOARD_W / 2 - 0.02);

  // --- Detected layout / language info plate on the front lip ---
  const infoMat = new THREE.MeshBasicMaterial({ transparent: true });
  const drawInfo = (text) => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 64;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 512, 64);
    ctx.fillStyle = '#9aa4b0';
    ctx.font = '600 34px -apple-system, "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 36);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    if (infoMat.map) infoMat.map.dispose();
    infoMat.map = tex;
    infoMat.needsUpdate = true;
  };
  const infoPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.045), infoMat);
  infoPlate.rotation.x = -Math.PI / 2;
  infoPlate.position.set(0, CHASSIS_H / 2 + 0.001, CHASSIS_D / 2 - MARGIN / 2);
  group.add(infoPlate);
  drawInfo(`${navigator.language || 'en'} · QWERTY`);

  // --- Live input wiring ---
  // `now` tracks the latest frame time so event handlers (which fire outside the
  // render loop) can schedule auto-releases.
  let now = 0;
  const press = (code, synthetic) => {
    const cap = capByCode.get(code);
    if (!cap) return;
    cap.pressed = true;
    // main.js forwards iframe keydowns as *synthetic* events with no matching
    // keyup, so those become momentary taps; real (trusted) keys hold until keyup.
    cap.releaseAt = synthetic ? now + 0.14 : Infinity;
  };
  const release = (code) => {
    const cap = capByCode.get(code);
    if (cap) { cap.pressed = false; cap.releaseAt = Infinity; }
  };
  const syncLocks = (event) => {
    // Synthetic forwarded events don't carry real lock state — ignore them.
    if (!event.isTrusted || !event.getModifierState) return;
    numLed.emissiveIntensity = event.getModifierState('NumLock') ? 1 : 0;
    capsLed.emissiveIntensity = event.getModifierState('CapsLock') ? 1 : 0;
    scrollLed.emissiveIntensity = event.getModifierState('ScrollLock') ? 1 : 0;
  };
  window.addEventListener('keydown', (e) => { press(e.code, !e.isTrusted); syncLocks(e); }, true);
  window.addEventListener('keyup', (e) => { release(e.code); syncLocks(e); }, true);
  // Releasing focus shouldn't leave keys stuck down.
  window.addEventListener('blur', () => {
    for (const cap of keycaps) { cap.pressed = false; cap.releaseAt = Infinity; }
  });

  // --- Detect real layout + relabel writing-system keys ---
  const detectLayoutName = (map) => {
    const q = map.get('KeyQ');
    if (q === 'a') return 'AZERTY';
    if (q === "'") return 'Dvorak';
    if (q === 'й') return 'ЙЦУКЕН';
    if (q === 'q') return map.get('KeyF') === 'e' ? 'Colemak' : 'QWERTY';
    return q ? `${q.toUpperCase()}…` : 'Unknown';
  };

  (async () => {
    let layoutName = 'QWERTY';
    if (navigator.keyboard?.getLayoutMap) {
      try {
        const map = await navigator.keyboard.getLayoutMap();
        layoutName = detectLayoutName(map);
        for (const [code, cap] of capByCode) {
          if (!isWritingKey(code)) continue;
          const ch = map.get(code);
          if (ch) cap.setLabel(formatChar(ch));
        }
      } catch {
        // Keyboard Map API not available — keep the QWERTY fallback legends.
      }
    }
    drawInfo(`${navigator.language || 'en'} · ${layoutName}`);
  })();

  // --- Per-frame keycap travel + press glow ---
  registerFrameUpdate((elapsed) => {
    now = elapsed;
    for (const cap of keycaps) {
      if (cap.pressed && now >= cap.releaseAt) cap.pressed = false;
      const targetY = cap.pressed ? CAP_REST_Y - TRAVEL : CAP_REST_Y;
      cap.mesh.position.y += (targetY - cap.mesh.position.y) * 0.4;
      const targetGlow = cap.pressed ? 0.55 : 0;
      const mat = cap.mesh.material;
      mat.emissiveIntensity += (targetGlow - mat.emissiveIntensity) * 0.4;
    }
  });

  return group;
};
