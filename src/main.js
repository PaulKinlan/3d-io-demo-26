import './style.css';
import * as THREE from 'https://raw.githack.com/mrdoob/three.js/dev/build/three.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadTexture } from './lib/texture-loader.js';
import { buildRoom } from './models/room.js';
import { buildRug } from './models/rug.js';
import { buildDesk } from './models/desk.js';
import { buildBed } from './models/bed.js';
import { buildTable } from './models/table.js';
import { buildShelf } from './models/shelf.js';
import { buildDecor } from './models/decor.js';
import { buildLights } from './models/lights.js';

const app = document.querySelector('#app');
const monitorDebugEnabled = new URLSearchParams(window.location.search).has('monitorDebug');

app.innerHTML = `
  <main class="scene-shell">
    <section class="hud">
      <p class="eyebrow">Rough Direction</p>
      <h1>Childhood Bedroom</h1>
      <p>
        A warm, slightly dreamy isometric room with a corner desk, stacked clutter,
        and a CRT monitor that now embeds an in-room demos page using html-in-canvas.
      </p>
      <div class="legend">
        <span>Scroll to zoom</span>
        <span>Drag to orbit</span>
        <span>Shift-drag to pan</span>
        <span>Double-click monitor to focus</span>
        <span>Press <kbd>?</kbd> for shortcuts</span>
      </div>
    </section>
    <aside class="caption">
      The monitor renders a same-origin iframe to a hidden canvas and maps that live result
      into the 3D screen, with a fallback HUD when the experimental html-in-canvas APIs are unavailable.
    </aside>
    <div class="help-panel">
      <h2>Keyboard Shortcuts</h2>
      <ul>
        <li><kbd>C</kbd> - Focus / Unfocus Monitor</li>
        <li><kbd>B</kbd> - Focus / Unfocus Books</li>
        <li><kbd>L</kbd> - Toggle Desk Lamp</li>
        <li><kbd>D</kbd> - Toggle Night Mode</li>
        <li><kbd>?</kbd> - Toggle UI and Shortcuts</li>
      </ul>
    </div>
    <section class="html-canvas-lab" aria-hidden="true">
        <div class="monitor-html-subtree">
          <iframe
            class="monitor-html-frame"
            src="/demos/browser/index.html"
            title="Monitor demos"
            loading="eager"
          ></iframe>
        </div>
    </section>
    ${monitorDebugEnabled ? `
      <aside class="monitor-debug-panel">
        <p class="eyebrow">Monitor Debug</p>
        <pre class="monitor-debug-log"></pre>
      </aside>
    ` : ''}
  </main>
`;

document.body.classList.toggle('monitor-debug', monitorDebugEnabled);

const sceneShell = document.querySelector('.scene-shell');
const htmlSubtree = document.querySelector('.monitor-html-subtree');
const htmlFrame = document.querySelector('.monitor-html-frame');
const debugLog = document.querySelector('.monitor-debug-log');
const monitorViewport = {
  width: 960,
  height: 720,
};

let deskLampRef;
let hemiLightRef;
let keyLightRef;

const monitorState = {
  ready: false,
  supported: true,
  lastDraw: 0,
  paintDriven: true,
  paintRequested: false,
  paintEvents: 0,
  paintRequests: 0,
  drawCalls: 0,
  lastError: 'none',
  texture: null,
};

// HTMLTexture handles onpaint updates now

const syncMonitorDebug = () => {
  if (!debugLog) {
    return;
  }

  debugLog.textContent = [
    'Enable with ?monitorDebug=1',
    `draw supported: ${monitorState.supported}`,
    `ready: ${monitorState.ready}`,
    `paint requests: ${monitorState.paintRequests}`,
    `paint events: ${monitorState.paintEvents}`,
    `draw calls: ${monitorState.drawCalls}`,
    `last error: ${monitorState.lastError}`,
    `canvas bitmap: ${monitorViewport.width}x${monitorViewport.height}`,
  ].join('\n');
};

syncMonitorDebug();

const appResizeObserver = new ResizeObserver(() => {
  if (htmlSubtree) {
    htmlSubtree.style.width = `${monitorViewport.width}px`;
    htmlSubtree.style.height = `${monitorViewport.height}px`;
  }
});
appResizeObserver.observe(sceneShell);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.domElement.className = 'scene-canvas';
renderer.domElement.setAttribute('layoutsubtree', 'true');
if (htmlSubtree) {
  renderer.domElement.appendChild(htmlSubtree);
}
sceneShell.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#0f0b15');
scene.fog = new THREE.Fog('#0f0b15', 25, 50);

const room = {
  width: 16,
  depth: 13,
  height: 8.5,
};

const timer = new THREE.Timer();
const animatedMaterials = [];
const activityLights = [];
const networkLights = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const focusTargets = new Map();
const focusableMeshes = [];
const spinTargets = [];
const registerSpinTarget = (meshes) => {
  spinTargets.push(...meshes);
};
const spinningGroups = new Set();
const tempBox = new THREE.Box3();
const tempCenter = new THREE.Vector3();
const tempSize = new THREE.Vector3();
const tempDirection = new THREE.Vector3();
const tempPosition = new THREE.Vector3();
const focusLift = new THREE.Vector3(0, 0.08, 0);
const frustumSize = 24;

const camera = new THREE.OrthographicCamera();
camera.position.set(18, 16, 18);
camera.zoom = 1.3;
camera.near = 0.1;
camera.far = 100;

const controls = new OrbitControls(camera, renderer.domElement);
const defaultControlLimits = {
  enablePan: true,
  minZoom: 0.65,
  maxZoom: 2.1,
  minPolarAngle: Math.PI / 4.2,
  maxPolarAngle: Math.PI / 2.45,
  minAzimuthAngle: -Math.PI / 2.2,
  maxAzimuthAngle: Math.PI / 1.6,
};
const focusControlLimits = {
  enablePan: true,
  minZoom: 1.2,
  maxZoom: 40,
  minPolarAngle: Math.PI / 2.8,
  maxPolarAngle: Math.PI / 1.55,
  minAzimuthAngle: -Infinity,
  maxAzimuthAngle: Infinity,
};
let activeFocusTargetId = null;
let cameraTransition = null;

const applyControlLimits = (limits) => {
  controls.enablePan = limits.enablePan;
  controls.minZoom = limits.minZoom;
  controls.maxZoom = limits.maxZoom;
  controls.minPolarAngle = limits.minPolarAngle;
  controls.maxPolarAngle = limits.maxPolarAngle;
  controls.minAzimuthAngle = limits.minAzimuthAngle;
  controls.maxAzimuthAngle = limits.maxAzimuthAngle;
};

controls.enableDamping = true;
controls.zoomSpeed = 0.75;
controls.panSpeed = 0.55;
controls.rotateSpeed = 0.6;
controls.target.set(0, 2.6, 0);
applyControlLimits(defaultControlLimits);

const defaultView = {
  position: camera.position.clone(),
  target: controls.target.clone(),
  zoom: camera.zoom,
  controlLimits: defaultControlLimits,
};

const easeInOutCubic = (value) => {
  if (value < 0.5) {
    return 4 * value * value * value;
  }

  return 1 - ((-2 * value + 2) ** 3) / 2;
};

const easeOutQuart = (value) => 1 - Math.pow(1 - value, 4);

const getBoundsForMeshes = (meshes) => {
  tempBox.makeEmpty();

  for (const mesh of meshes) {
    tempBox.expandByObject(mesh);
  }

  return tempBox;
};

const computeFocusZoom = (meshes, padding = 2.6, maxZoom = focusControlLimits.maxZoom) => {
  const bounds = getBoundsForMeshes(meshes);
  bounds.getSize(tempSize);

  const aspect = window.innerWidth / window.innerHeight;
  const framedWidth = Math.max(tempSize.x * padding, 0.75);
  const framedHeight = Math.max(tempSize.y * padding, 0.75);
  const zoomForWidth = (frustumSize * aspect) / framedWidth;
  const zoomForHeight = frustumSize / framedHeight;

  return THREE.MathUtils.clamp(
    Math.min(zoomForWidth, zoomForHeight),
    defaultControlLimits.minZoom,
    maxZoom,
  );
};

const registerFocusTarget = (id, meshes, options) => {
  const meshList = Array.isArray(meshes) ? meshes : [meshes];
  focusTargets.set(id, {
    meshes: meshList,
    getView: options.getView,
  });

  for (const mesh of meshList) {
    mesh.userData.focusTargetId = id;
    focusableMeshes.push(mesh);
  }
};

const startCameraTransition = ({ position, target, zoom, controlLimits, id = null }) => {
  // Save current limits so we can expand them to encompass the tween targets.
  // This prevents OrbitControls from aggressively clamping our tween to target bounds
  // before the camera has actually animated there.
  const startLimits = {
    enablePan: controls.enablePan,
    minZoom: controls.minZoom,
    maxZoom: controls.maxZoom,
    minPolarAngle: controls.minPolarAngle,
    maxPolarAngle: controls.maxPolarAngle,
    minAzimuthAngle: controls.minAzimuthAngle,
    maxAzimuthAngle: controls.maxAzimuthAngle,
  };

  controls.enablePan = controlLimits.enablePan;
  controls.minZoom = Math.min(startLimits.minZoom, controlLimits.minZoom);
  controls.maxZoom = Math.max(startLimits.maxZoom, controlLimits.maxZoom);
  controls.minPolarAngle = Math.min(startLimits.minPolarAngle, controlLimits.minPolarAngle);
  controls.maxPolarAngle = Math.max(startLimits.maxPolarAngle, controlLimits.maxPolarAngle);
  controls.minAzimuthAngle = Math.min(startLimits.minAzimuthAngle, controlLimits.minAzimuthAngle);
  controls.maxAzimuthAngle = Math.max(startLimits.maxAzimuthAngle, controlLimits.maxAzimuthAngle);

  cameraTransition = {
    startedAt: performance.now(),
    duration: 850,
    fromPosition: camera.position.clone(),
    fromTarget: controls.target.clone(),
    fromZoom: camera.zoom,
    toPosition: position.clone(),
    toTarget: target.clone(),
    toZoom: zoom,
    targetControlLimits: controlLimits,
  };
  activeFocusTargetId = id;
};

const focusTarget = (id) => {
  const target = focusTargets.get(id);

  if (!target) {
    return;
  }

  const view = target.getView();
  startCameraTransition({ ...view, id });
};

const resetCameraFocus = () => {
  startCameraTransition(defaultView);
};

const getFocusTargetId = (object) => {
  let current = object;

  while (current) {
    if (current.userData.focusTargetId) {
      return current.userData.focusTargetId;
    }

    current = current.parent;
  }

  return null;
};

const handleSceneDoubleClick = (event) => {
  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const hit = raycaster.intersectObjects(focusableMeshes, false)
    .map(({ object }) => getFocusTargetId(object))
    .find(Boolean);

  if (hit) {
    if (hit === activeFocusTargetId) {
      resetCameraFocus();
      return;
    }

    focusTarget(hit);
    return;
  }

  if (activeFocusTargetId) {
    resetCameraFocus();
  }
};

let pointerDownPos = { x: 0, y: 0 };

const hideInstructions = () => {
  const hud = document.querySelector('.hud');
  if (hud && !hud.classList.contains('hidden')) {
    hud.classList.add('hidden');
  }
  const caption = document.querySelector('.caption');
  if (caption && !caption.classList.contains('hidden')) {
    caption.classList.add('hidden');
  }
  const helpPanel = document.querySelector('.help-panel');
  if (helpPanel && helpPanel.classList.contains('active')) {
    helpPanel.classList.remove('active');
  }
};

renderer.domElement.addEventListener('pointerdown', (event) => {
  pointerDownPos = { x: event.clientX, y: event.clientY };
  hideInstructions();
});

renderer.domElement.addEventListener('wheel', hideInstructions, { passive: true });
const handleSceneClick = (event) => {
  console.log('handleSceneClick triggered');
  const dist = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
  console.log('Click distance:', dist);
  if (dist > 5) return;

  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  // Check for monitor click
  console.log('monitorState.screenMesh exists:', !!monitorState.screenMesh);
  if (monitorState.screenMesh) {
    const monitorHit = raycaster.intersectObject(monitorState.screenMesh);
    console.log('Monitor hit count:', monitorHit.length);
    if (monitorHit.length > 0) {
      const hit = monitorHit[0];
      console.log('Hit UV:', hit.uv);
      if (hit.uv) {
        const x = hit.uv.x * 960;
        const y = (1 - hit.uv.y) * 720;
        const iframe = document.querySelector('.monitor-html-frame');
        if (iframe) {
          console.log('Parent: Sent click to iframe', x, y);
          iframe.contentWindow.postMessage({ type: 'click', x, y }, '*');
        } else {
          console.log('Parent: Iframe not found!');
        }
      }
    }
  }

  const hit = raycaster.intersectObjects(spinTargets, false).find((h) => h.object.userData.spinGroup);

  if (hit) {
    const group = hit.object.userData.spinGroup;
    if (!group.userData.isSpinning) {
      group.userData.isSpinning = true;
      group.userData.spinProgress = 0;
      spinningGroups.add(group);
    }
  }
};
renderer.domElement.addEventListener('click', handleSceneClick);

const updateCameraTransition = () => {
  if (!cameraTransition) {
    return;
  }

  const elapsed = performance.now() - cameraTransition.startedAt;
  const progress = Math.min(elapsed / cameraTransition.duration, 1);
  const eased = easeInOutCubic(progress);

  camera.position.lerpVectors(cameraTransition.fromPosition, cameraTransition.toPosition, eased);
  controls.target.lerpVectors(cameraTransition.fromTarget, cameraTransition.toTarget, eased);
  
  // Use logarithmic interpolation to provide a perceptually smooth constant-rate zoom 
  const logZoom = THREE.MathUtils.lerp(
    Math.log(cameraTransition.fromZoom),
    Math.log(cameraTransition.toZoom),
    eased
  );
  camera.zoom = Math.exp(logZoom);
  camera.updateProjectionMatrix();

  if (progress === 1) {
    applyControlLimits(cameraTransition.targetControlLimits);
    cameraTransition = null;
  }
};

controls.addEventListener('start', () => {
  hideInstructions();
  if (cameraTransition && cameraTransition.targetControlLimits) {
    applyControlLimits(cameraTransition.targetControlLimits);
  }
  cameraTransition = null;
});
renderer.domElement.addEventListener('dblclick', handleSceneDoubleClick);

const addMesh = (geometry, material, options = {}) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;

  if (options.position) {
    mesh.position.copy(options.position);
  }

  if (options.rotation) {
    mesh.rotation.set(options.rotation.x, options.rotation.y, options.rotation.z);
  }

  if (options.scale) {
    mesh.scale.copy(options.scale);
  }

  scene.add(mesh);
  return mesh;
};

const drawMonitorFallback = () => {
  if (!htmlContext) {
    return;
  }

  htmlContext.save();
  htmlContext.fillStyle = '#0c1118';
  htmlContext.fillRect(0, 0, monitorViewport.width, monitorViewport.height);

  const gradient = htmlContext.createLinearGradient(0, 0, monitorViewport.width, monitorViewport.height);
  gradient.addColorStop(0, '#18283c');
  gradient.addColorStop(1, '#091117');
  htmlContext.fillStyle = gradient;
  htmlContext.fillRect(24, 24, monitorViewport.width - 48, monitorViewport.height - 48);

  htmlContext.strokeStyle = 'rgba(125, 255, 210, 0.45)';
  htmlContext.lineWidth = 4;
  htmlContext.strokeRect(24, 24, monitorViewport.width - 48, monitorViewport.height - 48);

  htmlContext.fillStyle = '#89ffd8';
  htmlContext.font = '700 56px system-ui';
  htmlContext.fillText('html-in-canvas', 72, 116);

  htmlContext.fillStyle = 'rgba(232, 246, 255, 0.9)';
  htmlContext.font = '500 30px system-ui';
  htmlContext.fillText('Experimental API unavailable in this browser.', 72, 188);
  htmlContext.fillText('Open /demos/browser/ to view the iframe content directly.', 72, 234);

  const cards = [
    { x: 72, y: 292, label: 'Pie Chart', value: 'Canvas / SVG blend' },
    { x: 332, y: 292, label: 'Complex Text', value: 'RTL + gradient type' },
    { x: 592, y: 292, label: 'WebGL', value: 'Shader-driven orb' },
  ];

  htmlContext.font = '600 28px system-ui';
  cards.forEach((card, index) => {
    htmlContext.fillStyle = 'rgba(14, 26, 34, 0.9)';
    htmlContext.fillRect(card.x, card.y, 220, 230);
    htmlContext.strokeStyle = 'rgba(137, 255, 216, 0.2)';
    htmlContext.strokeRect(card.x, card.y, 220, 230);
    htmlContext.fillStyle = ['#ffb36b', '#7dc6ff', '#8effcb'][index];
    htmlContext.fillText(card.label, card.x + 20, card.y + 48);
    htmlContext.fillStyle = 'rgba(232, 246, 255, 0.84)';
    htmlContext.font = '500 22px system-ui';
    htmlContext.fillText(card.value, card.x + 20, card.y + 90);
    htmlContext.font = '600 28px system-ui';
  });

  htmlContext.restore();
};

const updateMonitorTexture = (time) => {
  monitorState.lastDraw = time;
  monitorState.ready = true;
  monitorState.paintRequested = false;
  monitorState.texture.needsUpdate = true;
  syncMonitorDebug();
};

const renderMonitorFallback = (time = performance.now()) => {
  drawMonitorFallback();
  updateMonitorTexture(time);
};

window.addEventListener('keydown', (e) => {
  console.log('Key pressed:', e.key);
  
  if (e.code === 'Space') {
    const iframe = document.querySelector('.monitor-html-frame');
    if (iframe) {
      console.log('Parent: Sent spacebar to iframe');
      iframe.contentWindow.postMessage({ type: 'keydown', code: 'Space' }, '*');
    }
  }

  if (e.key.toLowerCase() === 'c') {
    if (typeof activeFocusTargetId !== 'undefined' && activeFocusTargetId === 'monitor') {
      if (typeof resetCameraFocus === 'function') resetCameraFocus();
    } else {
      if (typeof focusTarget === 'function') focusTarget('monitor');
    }
  }
  if (e.key.toLowerCase() === 'b') {
    if (typeof activeFocusTargetId !== 'undefined' && activeFocusTargetId === 'books') {
      if (typeof resetCameraFocus === 'function') resetCameraFocus();
    } else {
      if (typeof focusTarget === 'function') focusTarget('books');
    }
  }
  if (e.key.toLowerCase() === 'l') {
    console.log('Pressing L - Toggle Lamp');
    if (typeof toggleLamp === 'function') toggleLamp();
  }
  if (e.key.toLowerCase() === 'd') {
    console.log('Pressing D - Toggle NightMode');
    if (typeof toggleNightMode === 'function') toggleNightMode();
  }
  if (e.key === '?') {
    console.log('Pressing ? - Toggle Help');
    const panel = document.querySelector('.help-panel');
    if (panel) {
      panel.classList.toggle('active');
    }
    const hud = document.querySelector('.hud');
    if (hud) hud.classList.toggle('hidden');
    const caption = document.querySelector('.caption');
    if (caption) caption.classList.toggle('hidden');
  }
});







const resize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;

  camera.left = (-frustumSize * aspect) / 2;
  camera.right = (frustumSize * aspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
};

htmlFrame.addEventListener('load', () => {
  monitorState.ready = false;
  monitorState.lastDraw = 0;
  monitorState.paintRequested = false;
  monitorState.lastError = 'none';
  syncMonitorDebug();

  try {
    htmlFrame.contentWindow.addEventListener('keydown', (e) => {
       window.dispatchEvent(new KeyboardEvent('keydown', {
          key: e.key,
          keyCode: e.keyCode,
          code: e.code,
          ctrlKey: e.ctrlKey,
          altKey: e.altKey,
          shiftKey: e.shiftKey,
          metaKey: e.metaKey
       }));
    });
  } catch (e) {
     console.warn('Forward overlays trigger restrictions:', e);
  }

  console.log('Monitor frame loaded. State:', monitorState);
  
  if (!monitorState.supported) {
    console.log('Monitor not supported, rendering fallback.');
    renderMonitorFallback();
    return;
  }

  console.log('Monitor supported. Paint driven:', monitorState.paintDriven);
});

const context = {
  THREE,
  scene,
  room,
  addMesh,
  loadTexture,
  registerFocusTarget,
  focusControlLimits,
  focusLift,
  computeFocusZoom,
  monitorState,
  htmlSubtree,
  animatedMaterials,
  activityLights,
  networkLights,
  defaultView,
  registerSpinTarget
};

buildRoom(context);
buildRug(context);
buildDesk(context);
buildBed(context);
buildTable(context);
buildShelf(context);
buildDecor(context);

const lights = buildLights(context);
hemiLightRef = lights.hemiLight;
keyLightRef = lights.keyLight;
deskLampRef = lights.deskLamp;
resize();

window.addEventListener('resize', resize);

const updateMonitorTransform = () => {
  if (!monitorState.screenMesh || !htmlSubtree) return;

  const mesh = monitorState.screenMesh;
  const element = htmlSubtree;

  mesh.updateWorldMatrix(true, false);
  const mvp = new THREE.Matrix4();
  mvp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  mvp.multiply(mesh.matrixWorld);

  const E_W = monitorViewport.width;
  const E_H = monitorViewport.height;
  const M_W = 0.92;
  const M_H = 0.72;

  const localMatrix = new THREE.Matrix4().set(
    M_W / E_W, 0, 0, -M_W / 2,
    0, -M_H / E_H, 0, M_H / 2,
    0, 0, 1, 0,
    0, 0, 0, 1
  );

  const rect = renderer.domElement.getBoundingClientRect();
  const C_W = rect.width;
  const C_H = rect.height;
  const labRect = document.querySelector('.html-canvas-lab').getBoundingClientRect();

  const viewportMatrix = new THREE.Matrix4().set(
    C_W / 2, 0, 0, C_W / 2 + rect.left - labRect.left,
    0, -C_H / 2, 0, C_H / 2 + rect.top - labRect.top,
    0, 0, 1, 0,
    0, 0, 0, 1
  );

  const fullMatrix = new THREE.Matrix4()
    .multiplyMatrices(viewportMatrix, mvp)
    .multiply(localMatrix);

  const elements = fullMatrix.elements;
  const cssTransform = `matrix3d(
    ${elements[0]}, ${elements[1]}, ${elements[2]}, ${elements[3]},
    ${elements[4]}, ${elements[5]}, ${elements[6]}, ${elements[7]},
    ${elements[8]}, ${elements[9]}, ${elements[10]}, ${elements[11]},
    ${elements[12]}, ${elements[13]}, ${elements[14]}, ${elements[15]}
  )`;

  element.style.transform = cssTransform;
};

const animate = (time = 0) => {
  timer.update(time);
  const elapsed = timer.getElapsed();
  
  if (renderer.domElement.onpaint) {
    console.log('Parent: Calling renderer.domElement.onpaint()');
    renderer.domElement.onpaint();
  }
  
  if (renderer.domElement.requestPaint) {
    console.log('Parent: Calling renderer.domElement.requestPaint()');
    renderer.domElement.requestPaint();
  }

  if (monitorState.sync) {
    monitorState.sync();
  }

  const flicker = 0.7 + Math.sin(elapsed * 8.5) * 0.08 + Math.sin(elapsed * 19) * 0.03;

  for (const material of animatedMaterials) {
    material.emissiveIntensity = flicker;
  }

  // Disk activity light flicker (random bursts)
  const activityIntensity = Math.random() > 0.8 ? 0.8 + Math.random() * 0.4 : 0.0;
  for (const material of activityLights) {
    material.emissiveIntensity = activityIntensity;
  }

  // Network lights flicker (fast blinking and solid variants)
  if (networkLights.length >= 2) {
    const yellowIntensity = Math.random() > 0.5 ? 0.8 : 0.1;
    const greenIntensity = Math.random() > 0.1 ? 0.8 : 0.0;
    networkLights[0].emissiveIntensity = yellowIntensity;
    networkLights[1].emissiveIntensity = greenIntensity;
  }

  for (const group of spinningGroups) {
    // Increment progress (0 to 1 range), ~1.2s at 60fps
    group.userData.spinProgress += 0.014;
    if (group.userData.spinProgress >= 1) {
      group.userData.spinProgress = 0;
      group.userData.isSpinning = false;
      spinningGroups.delete(group);
      group.rotation.y = 0;
    } else {
      // 2 full spins starting very fast and easing to a stop
      group.rotation.y = easeOutQuart(group.userData.spinProgress) * Math.PI * 4;
    }
  }

  updateCameraTransition();
  
  // Scale rotate rotation sensitivity depending on orthographic zoom
  controls.rotateSpeed = 0.6 / Math.max(0.1, camera.zoom);
  controls.update();
  
  try {
    renderer.render(scene, camera);
  } catch (e) {
    if (e.message && e.message.includes('No cached paint record')) {
      // Suppress startup race condition where texElementImage2D executes before first paint snapshot
    } else {
      throw e;
    }
  }

  // Update HTML overlay transform after render guarantees camera matrices are fully up-to-date
  updateMonitorTransform();

  window.requestAnimationFrame(animate);
};

const toggleLamp = () => {
  if (deskLampRef) {
    deskLampRef.visible = !deskLampRef.visible;
    console.log('Lamp toggled:', deskLampRef.visible);
  }
};

const toggleNightMode = () => {
  if (hemiLightRef && keyLightRef) {
    const active = !hemiLightRef.visible;
    hemiLightRef.visible = active;
    keyLightRef.visible = active;
    console.log('Night mode toggled:', !active);
  }
};

const setupMCP = () => {
  if (typeof window === 'undefined' || !window.navigator || !window.navigator.modelContext) {
    return;
  }

  window.navigator.modelContext.registerTool({
    execute: () => { toggleLamp(); },
    name: "toggleDeskLamp",
    description: "Toggles the desk lamp on or off.",
    inputSchema: { type: "object", properties: {} }
  });

  window.navigator.modelContext.registerTool({
    execute: () => { toggleNightMode(); },
    name: "toggleNightMode",
    description: "Toggles the room's night mode ceiling lights on or off.",
    inputSchema: { type: "object", properties: {} }
  });

  window.navigator.modelContext.registerTool({
    execute: () => { focusTarget('monitor'); },
    name: "focusMonitor",
    description: "Zooms the camera in to focus on the computer monitor.",
    inputSchema: { type: "object", properties: {} }
  });

  window.navigator.modelContext.registerTool({
    execute: () => { focusTarget('books'); },
    name: "focusBooks",
    description: "Zooms the camera in to focus on the bookshelf.",
    inputSchema: { type: "object", properties: {} }
  });

  window.navigator.modelContext.registerTool({
    execute: () => { resetCameraFocus(); },
    name: "resetCameraFocus",
    description: "Zooms the camera out to the default room view, resetting any focus.",
    inputSchema: { type: "object", properties: {} }
  });

  window.navigator.modelContext.registerTool({
    execute: () => {
      const chairPart = spinTargets.find(mesh => mesh.userData.spinGroup);
      if (chairPart) {
        const group = chairPart.userData.spinGroup;
        if (!group.userData.isSpinning) {
          group.userData.isSpinning = true;
          group.userData.spinProgress = 0;
          spinningGroups.add(group);
        }
      }
    },
    name: "spinChair",
    description: "Spins the desk chair around.",
    inputSchema: { type: "object", properties: {} }
  });

  window.navigator.modelContext.registerTool({
    execute: ({ url }) => {
      const iframe = document.querySelector('.monitor-html-frame');
      if (iframe) {
        // Wrap the URL in the browser wrapper to ensure the bar is shown,
        // unless navigating to the browser wrapper itself.
        if (url === "/demos/browser/") {
          iframe.src = url;
        } else {
          iframe.src = `/demos/browser/?url=${encodeURIComponent(url)}`;
        }
      }
    },
    name: "navigateComputerScreen",
    description: "Navigates the computer monitor's iframe to one of the available demos.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          enum: [
            "/demos/browser/",
            "/demos/flappy-bird/",
            "/demos/maltavista/",
            "/demos/new-tab/",
            "/demos/slide-deck/",
            "/demos/wahoo/",
            "/demos/meo-towns/",
            "/demos/wahoo-wail/",
            "/demos/site-generator/"
          ],
          description: "The URL of the demo to navigate to."
        }
      },
      required: ["url"]
    }
  });
};

setupMCP();

// Listen for frame updates from iframes to force texture updates
window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'frame') {
    if (monitorState.texture) {
      console.log('Parent: Received frame message, refreshing texture');
      monitorState.texture.needsUpdate = true;
      
      const element = document.querySelector('.monitor-html-frame');
      if (element) {
        // Try to call requestPaint on the iframe itself to force layoutsubtree capture
        if (element.requestPaint) {
          console.log('Parent: Calling iframe.requestPaint()');
          element.requestPaint();
        }
        
        // Force style trigger as a fallback
        element.style.opacity = element.style.opacity === '0.999' ? '1' : '0.999';
      }
    }
  }
});

animate();
