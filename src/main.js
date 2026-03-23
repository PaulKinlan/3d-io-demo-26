import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadTexture } from './lib/texture-loader.js';

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
      </div>
    </section>
    <aside class="caption">
      The monitor renders a same-origin iframe to a hidden canvas and maps that live result
      into the 3D screen, with a fallback HUD when the experimental html-in-canvas APIs are unavailable.
    </aside>
    <section class="html-canvas-lab" aria-hidden="true">
      <canvas class="monitor-html-canvas" width="960" height="720" layoutsubtree>
        <div class="monitor-html-subtree">
          <iframe
            class="monitor-html-frame"
            src="/monitor-demos.html"
            title="Monitor demos"
            loading="eager"
          ></iframe>
        </div>
      </canvas>
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
const htmlCanvas = document.querySelector('.monitor-html-canvas');
const htmlSubtree = htmlCanvas?.querySelector('.monitor-html-subtree');
const htmlFrame = htmlCanvas?.querySelector('.monitor-html-frame');
const debugLog = document.querySelector('.monitor-debug-log');
const htmlContext = htmlCanvas.getContext('2d');
const drawMonitorElement = htmlContext && (
  (typeof htmlContext.drawElementImage === 'function' && htmlContext.drawElementImage.bind(htmlContext))
  || (typeof htmlContext.drawElement === 'function' && htmlContext.drawElement.bind(htmlContext))
);
const requestMonitorPaint = typeof htmlCanvas.requestPaint === 'function'
  ? htmlCanvas.requestPaint.bind(htmlCanvas)
  : null;
const monitorDrawApi = typeof htmlContext?.drawElementImage === 'function'
  ? 'drawElementImage'
  : (typeof htmlContext?.drawElement === 'function' ? 'drawElement' : 'unavailable');

const monitorViewport = {
  width: htmlCanvas.width,
  height: htmlCanvas.height,
};

const monitorState = {
  ready: false,
  supported: Boolean(drawMonitorElement),
  lastDraw: 0,
  paintDriven: Boolean(drawMonitorElement && requestMonitorPaint),
  paintRequested: false,
  paintEvents: 0,
  paintRequests: 0,
  drawCalls: 0,
  lastError: 'none',
  texture: null,
};

const syncMonitorDebug = () => {
  if (!debugLog) {
    return;
  }

  debugLog.textContent = [
    'Enable with ?monitorDebug=1',
    `draw api: ${monitorDrawApi}`,
    `draw supported: ${monitorState.supported}`,
    `paint event support: ${'onpaint' in htmlCanvas}`,
    `requestPaint support: ${Boolean(requestMonitorPaint)}`,
    `paint-driven mode: ${monitorState.paintDriven}`,
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
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.domElement.className = 'scene-canvas';
sceneShell.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#0f0b15');
scene.fog = new THREE.Fog('#0f0b15', 25, 50);

const room = {
  width: 16,
  depth: 13,
  height: 8.5,
};

const clock = new THREE.Clock();
const animatedMaterials = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const focusTargets = new Map();
const focusableMeshes = [];
const tempBox = new THREE.Box3();
const tempCenter = new THREE.Vector3();
const tempSize = new THREE.Vector3();
const tempDirection = new THREE.Vector3();
const tempPosition = new THREE.Vector3();
const focusLift = new THREE.Vector3(0, 0.08, 0);
const frustumSize = 24;

const camera = new THREE.OrthographicCamera();
camera.position.set(18, 16, 18);
camera.zoom = 0.95;
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
  maxZoom: 8,
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
  applyControlLimits(controlLimits);
  cameraTransition = {
    startedAt: performance.now(),
    duration: 850,
    fromPosition: camera.position.clone(),
    fromTarget: controls.target.clone(),
    fromZoom: camera.zoom,
    toPosition: position.clone(),
    toTarget: target.clone(),
    toZoom: zoom,
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

const updateCameraTransition = () => {
  if (!cameraTransition) {
    return;
  }

  const elapsed = performance.now() - cameraTransition.startedAt;
  const progress = Math.min(elapsed / cameraTransition.duration, 1);
  const eased = easeInOutCubic(progress);

  camera.position.lerpVectors(cameraTransition.fromPosition, cameraTransition.toPosition, eased);
  controls.target.lerpVectors(cameraTransition.fromTarget, cameraTransition.toTarget, eased);
  camera.zoom = THREE.MathUtils.lerp(cameraTransition.fromZoom, cameraTransition.toZoom, eased);
  camera.updateProjectionMatrix();

  if (progress === 1) {
    cameraTransition = null;
  }
};

controls.addEventListener('start', () => {
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
  htmlContext.fillText('Open /monitor-demos.html to view the iframe content directly.', 72, 234);

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

const drawMonitorSurface = (time = performance.now()) => {
  if (!htmlContext) {
    return;
  }

  if (!monitorState.supported) {
    if (!monitorState.ready) {
      renderMonitorFallback(time);
    }
    return;
  }

  htmlContext.clearRect(0, 0, monitorViewport.width, monitorViewport.height);
  monitorState.drawCalls += 1;

  try {
    drawMonitorElement(htmlSubtree, 0, 0, monitorViewport.width, monitorViewport.height);
    monitorState.lastError = 'none';
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    monitorState.lastError = message || 'unknown draw error';

    if (message.includes('initial snapshot')) {
      syncMonitorDebug();
      return;
    }

    monitorState.supported = false;
    monitorState.paintDriven = false;
    renderMonitorFallback(time);
    return;
  }

  updateMonitorTexture(time);
};

const handleMonitorPaint = () => {
  monitorState.paintEvents += 1;
  drawMonitorSurface();
};

if (monitorState.paintDriven) {
  htmlCanvas.addEventListener('paint', handleMonitorPaint);
}

const renderMonitorSurface = (time) => {
  if (time - monitorState.lastDraw < 1000 / 24) {
    return;
  }

  if (monitorState.paintDriven) {
    if (monitorState.paintRequested) {
      return;
    }

    monitorState.paintRequested = true;
    monitorState.paintRequests += 1;
    syncMonitorDebug();
    requestMonitorPaint();
    return;
  }

  drawMonitorSurface(time);
};

const buildRoom = () => {
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: '#b3835d',
    map: loadTexture('wood-floor', { repeat: [4, 3] }),
    roughness: 0.95,
  });

  addMesh(
    new THREE.BoxGeometry(room.width, 0.4, room.depth),
    floorMaterial,
    {
      position: new THREE.Vector3(0, -0.2, 0),
      castShadow: false,
    },
  );

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: '#d1b6a7',
    roughness: 1,
  });

  addMesh(
    new THREE.BoxGeometry(0.35, room.height, room.depth),
    wallMaterial,
    {
      position: new THREE.Vector3(-room.width / 2, room.height / 2 - 0.1, 0),
      castShadow: false,
    },
  );

  addMesh(
    new THREE.BoxGeometry(room.width, room.height, 0.35),
    wallMaterial,
    {
      position: new THREE.Vector3(0, room.height / 2 - 0.1, -room.depth / 2),
      castShadow: false,
    },
  );

  const trimMaterial = new THREE.MeshStandardMaterial({
    color: '#f0dfd2',
    roughness: 0.9,
  });

  addMesh(
    new THREE.BoxGeometry(0.45, 0.5, room.depth),
    trimMaterial,
    {
      position: new THREE.Vector3(-room.width / 2 + 0.05, 0.25, 0),
      castShadow: false,
    },
  );

  addMesh(
    new THREE.BoxGeometry(room.width, 0.5, 0.45),
    trimMaterial,
    {
      position: new THREE.Vector3(0, 0.25, -room.depth / 2 + 0.05),
      castShadow: false,
    },
  );
};

const buildRug = () => {
  const rugMaterial = new THREE.MeshStandardMaterial({
    color: '#6b4a58',
    roughness: 1,
  });

  addMesh(
    new THREE.BoxGeometry(6.8, 0.08, 4.4),
    rugMaterial,
    {
      position: new THREE.Vector3(0.6, 0.06, 0.9),
      castShadow: false,
    },
  );

  addMesh(
    new THREE.BoxGeometry(6.4, 0.05, 4.0),
    new THREE.MeshStandardMaterial({
      color: '#c38d6b',
      roughness: 1,
    }),
    {
      position: new THREE.Vector3(0.6, 0.11, 0.9),
      castShadow: false,
    },
  );
};

const buildDesk = () => {
  const deskGroup = new THREE.Group();
  scene.add(deskGroup);

  const woodMaterial = new THREE.MeshStandardMaterial({
    color: '#6a4328',
    roughness: 0.8,
  });
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: '#48505d',
    metalness: 0.45,
    roughness: 0.5,
  });
  const plasticMaterial = new THREE.MeshStandardMaterial({
    color: '#b4a99b',
    roughness: 0.82,
  });
  const invisibleMonitorFrontMaterial = new THREE.MeshStandardMaterial({
    color: '#b4a99b',
    roughness: 0.82,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.24, 2.2), woodMaterial);
  deskTop.position.set(-4.9, 3.15, -4.25);
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  deskGroup.add(deskTop);

  const legOffsets = [
    [-1.9, 1.5, -0.9],
    [1.9, 1.5, -0.9],
    [-1.9, 1.5, 0.9],
    [1.9, 1.5, 0.9],
  ];

  for (const [x, y, z] of legOffsets) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3, 0.18), metalMaterial);
    leg.position.set(deskTop.position.x + x, y, deskTop.position.z + z);
    leg.castShadow = true;
    leg.receiveShadow = true;
    deskGroup.add(leg);
  }

  const drawer = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.25, 1.7), woodMaterial);
  drawer.position.set(-6.15, 2.4, -4.2);
  drawer.castShadow = true;
  drawer.receiveShadow = true;
  deskGroup.add(drawer);

  const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.16, 1), new THREE.MeshStandardMaterial({
    color: '#85606e',
    roughness: 0.9,
  }));
  chairSeat.position.set(-3.85, 1.28, -2.3);
  chairSeat.castShadow = true;
  chairSeat.receiveShadow = true;
  deskGroup.add(chairSeat);

  const chairBack = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.05, 0.16), chairSeat.material);
  chairBack.position.set(-3.85, 1.86, -2.73);
  chairBack.castShadow = true;
  chairBack.receiveShadow = true;
  deskGroup.add(chairBack);

  const chairStem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.12, 16), metalMaterial);
  chairStem.position.set(-3.85, 0.68, -2.3);
  chairStem.castShadow = true;
  chairStem.receiveShadow = true;
  deskGroup.add(chairStem);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.8, 0.12, 20), metalMaterial);
  base.position.set(-3.85, 0.06, -2.3);
  base.castShadow = true;
  base.receiveShadow = true;
  deskGroup.add(base);

  const monitorShell = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 1.05, 1.18),
    [
      plasticMaterial,
      plasticMaterial,
      plasticMaterial,
      plasticMaterial,
      invisibleMonitorFrontMaterial,
      plasticMaterial,
    ],
  );
  monitorShell.position.set(-5.1, 4.05, -4.45);
  monitorShell.castShadow = true;
  monitorShell.receiveShadow = true;
  deskGroup.add(monitorShell);

  const frontFrameShape = new THREE.Shape();
  frontFrameShape.moveTo(-0.62, -0.48);
  frontFrameShape.lineTo(0.62, -0.48);
  frontFrameShape.lineTo(0.62, 0.48);
  frontFrameShape.lineTo(-0.62, 0.48);
  frontFrameShape.lineTo(-0.62, -0.48);

  const frontFrameHole = new THREE.Path();
  frontFrameHole.moveTo(-0.5, -0.39);
  frontFrameHole.lineTo(-0.5, 0.39);
  frontFrameHole.lineTo(0.5, 0.39);
  frontFrameHole.lineTo(0.5, -0.39);
  frontFrameHole.lineTo(-0.5, -0.39);
  frontFrameShape.holes.push(frontFrameHole);

  const frontFrame = new THREE.Mesh(
    new THREE.ShapeGeometry(frontFrameShape),
    new THREE.MeshStandardMaterial({
      color: '#b4a99b',
      roughness: 0.82,
      side: THREE.DoubleSide,
    }),
  );
  frontFrame.position.set(-5.1, 4.08, -3.81);
  frontFrame.renderOrder = 3;
  deskGroup.add(frontFrame);

  monitorState.texture = new THREE.CanvasTexture(htmlCanvas);
  monitorState.texture.colorSpace = THREE.SRGBColorSpace;
  monitorState.texture.minFilter = THREE.LinearFilter;
  monitorState.texture.magFilter = THREE.LinearFilter;

  const screenMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    map: monitorState.texture,
    emissive: '#2cbf95',
    emissiveIntensity: 0.72,
    roughness: 0.16,
    metalness: 0.08,
  });
  animatedMaterials.push(screenMaterial);

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.72), screenMaterial);
  screen.position.set(-5.1, 4.08, -3.855);
  screen.material.side = THREE.DoubleSide;
  screen.renderOrder = 2;
  deskGroup.add(screen);

  const bezel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.98, 0.78),
    new THREE.MeshStandardMaterial({
      color: '#2a2a2f',
      roughness: 0.78,
      metalness: 0.12,
    }),
  );
  bezel.position.set(-5.1, 4.08, -3.86);
  bezel.material.side = THREE.DoubleSide;
  bezel.renderOrder = 1;
  deskGroup.add(bezel);

  if (monitorDebugEnabled) {
    const monitorGuide = new THREE.Mesh(
      new THREE.PlaneGeometry(1.08, 0.88),
      new THREE.MeshBasicMaterial({
        color: '#80ffd9',
        wireframe: true,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      }),
    );
    monitorGuide.position.set(-5.1, 4.08, -3.79);
    deskGroup.add(monitorGuide);

    const monitorNormal = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(-5.1, 4.08, -3.79),
      0.38,
      0xffb36b,
      0.1,
      0.06,
    );
    deskGroup.add(monitorNormal);
  }

  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.45, 16), plasticMaterial);
  stand.position.set(-5.1, 3.3, -4.45);
  stand.castShadow = true;
  stand.receiveShadow = true;
  deskGroup.add(stand);

  registerFocusTarget('monitor', [monitorShell, frontFrame, screen, stand], {
    getView: () => {
      screen.updateWorldMatrix(true, false);
      screen.getWorldPosition(tempCenter);
      screen.getWorldDirection(tempDirection);
      tempPosition.copy(defaultView.position).sub(tempCenter);

      if (tempDirection.dot(tempPosition) < 0) {
        tempDirection.negate();
      }

      return {
        target: tempCenter.clone(),
        position: tempCenter.clone()
          .add(tempDirection.multiplyScalar(3.1))
          .add(focusLift),
        zoom: computeFocusZoom([monitorShell, screen, stand], 2.1),
        controlLimits: focusControlLimits,
      };
    },
  });

  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 0.62), plasticMaterial);
  keyboard.position.set(-4.5, 3.3, -3.52);
  keyboard.castShadow = true;
  keyboard.receiveShadow = true;
  deskGroup.add(keyboard);

  const mouseMaterial = new THREE.MeshStandardMaterial({
    color: '#a89888',
    roughness: 0.75,
  });
  const mouseBody = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.35), mouseMaterial);
  mouseBody.position.set(-3.95, 3.31, -3.55);
  mouseBody.castShadow = true;
  mouseBody.receiveShadow = true;
  deskGroup.add(mouseBody);

  const mouseSeam = new THREE.Mesh(
    new THREE.BoxGeometry(0.005, 0.085, 0.18),
    new THREE.MeshStandardMaterial({ color: '#7a6e62', roughness: 0.9 }),
  );
  mouseSeam.position.set(-3.95, 3.315, -3.46);
  deskGroup.add(mouseSeam);

  const scrollWheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8),
    new THREE.MeshStandardMaterial({ color: '#6a6058', roughness: 0.6 }),
  );
  scrollWheel.position.set(-3.95, 3.36, -3.48);
  scrollWheel.rotation.z = Math.PI / 2;
  deskGroup.add(scrollWheel);

  const towerMaterial = new THREE.MeshStandardMaterial({
    color: '#c8beb4',
    roughness: 0.8,
  });
  const towerX = -3.6;
  const towerZ = -4.6;
  const towerW = 0.7;
  const towerH = 1.6;
  const towerD = 1.4;
  const towerY = towerH / 2 + 0.02;

  const towerCase = new THREE.Mesh(new THREE.BoxGeometry(towerW, towerH, towerD), towerMaterial);
  towerCase.position.set(towerX, towerY, towerZ);
  towerCase.castShadow = true;
  towerCase.receiveShadow = true;
  deskGroup.add(towerCase);

  const driveBayMaterial = new THREE.MeshStandardMaterial({ color: '#a09888', roughness: 0.9 });
  const driveBay1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.02), driveBayMaterial);
  driveBay1.position.set(towerX, towerY + 0.55, towerZ + towerD / 2 + 0.01);
  deskGroup.add(driveBay1);

  const driveBay2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.02), driveBayMaterial);
  driveBay2.position.set(towerX, towerY + 0.35, towerZ + towerD / 2 + 0.01);
  deskGroup.add(driveBay2);

  const powerBtn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.02, 12),
    new THREE.MeshStandardMaterial({ color: '#e8e0d0', roughness: 0.5 }),
  );
  powerBtn.position.set(towerX + 0.15, towerY + 0.55, towerZ + towerD / 2 + 0.015);
  powerBtn.rotation.x = Math.PI / 2;
  deskGroup.add(powerBtn);

  const powerLed = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.04, 0.02),
    new THREE.MeshStandardMaterial({
      color: '#44ff44',
      emissive: '#22cc22',
      emissiveIntensity: 0.8,
    }),
  );
  powerLed.position.set(towerX + 0.15, towerY + 0.42, towerZ + towerD / 2 + 0.015);
  deskGroup.add(powerLed);

  const grilleMaterial = new THREE.MeshStandardMaterial({ color: '#8a8070', roughness: 1 });
  for (let i = 0; i < 6; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.02, 0.02), grilleMaterial);
    slat.position.set(towerX, towerY - 0.35 + i * 0.07, towerZ + towerD / 2 + 0.01);
    deskGroup.add(slat);
  }

  const cableMaterial = new THREE.MeshStandardMaterial({ color: '#3a3a3a', roughness: 0.9 });
  const cableRadius = 0.035;
  const cableSegments = 20;

  const monitorCable = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(towerX, towerY + 0.5, towerZ - towerD / 2),
      new THREE.Vector3(towerX, towerY + 0.6, towerZ - towerD / 2 - 0.3),
      new THREE.Vector3(towerX - 0.5, 2.8, -5.2),
      new THREE.Vector3(-5.0, 3.0, -5.1),
      new THREE.Vector3(-5.1, 3.5, -4.45 - 0.6),
    ]),
    cableSegments, cableRadius, 6,
  );
  const monitorCableMesh = new THREE.Mesh(monitorCable, cableMaterial);
  monitorCableMesh.castShadow = true;
  deskGroup.add(monitorCableMesh);

  const kbCable = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(towerX, towerY + 0.3, towerZ - towerD / 2),
      new THREE.Vector3(towerX, towerY + 0.4, towerZ - towerD / 2 - 0.2),
      new THREE.Vector3(towerX - 0.3, 2.6, -5.0),
      new THREE.Vector3(-4.5, 3.0, -4.8),
      new THREE.Vector3(-4.5, 3.18, -4.2),
      new THREE.Vector3(-4.5, 3.28, -3.82),
    ]),
    cableSegments, cableRadius, 6,
  );
  const kbCableMesh = new THREE.Mesh(kbCable, cableMaterial);
  kbCableMesh.castShadow = true;
  deskGroup.add(kbCableMesh);

  const mouseCable = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.95, 3.31, -3.72),
      new THREE.Vector3(-4.1, 3.29, -3.9),
      new THREE.Vector3(-4.3, 3.27, -4.0),
      new THREE.Vector3(-4.5, 3.22, -4.1),
    ]),
    12, cableRadius * 0.7, 6,
  );
  const mouseCableMesh = new THREE.Mesh(mouseCable, cableMaterial);
  deskGroup.add(mouseCableMesh);

  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.2, 12), metalMaterial);
  lampStem.position.set(-6.25, 3.75, -3.6);
  lampStem.castShadow = true;
  lampStem.receiveShadow = true;
  deskGroup.add(lampStem);

  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.7, 18), new THREE.MeshStandardMaterial({
    color: '#f3d7a8',
    emissive: '#cb7e2f',
    emissiveIntensity: 0.3,
    roughness: 0.7,
  }));
  lampShade.position.set(-6.25, 4.35, -3.6);
  lampShade.rotation.z = Math.PI;
  lampShade.castShadow = true;
  lampShade.receiveShadow = true;
  deskGroup.add(lampShade);
};

const buildBed = () => {
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: '#7c5540',
    roughness: 0.82,
  });
  const duvetMaterial = new THREE.MeshStandardMaterial({
    color: '#587091',
    roughness: 1,
  });
  const pillowMaterial = new THREE.MeshStandardMaterial({
    color: '#e8d8c8',
    roughness: 1,
  });

  addMesh(
    new THREE.BoxGeometry(3.2, 0.6, 6),
    frameMaterial,
    {
      position: new THREE.Vector3(4.45, 0.7, -2.2),
    },
  );

  addMesh(
    new THREE.BoxGeometry(2.9, 0.85, 5.7),
    duvetMaterial,
    {
      position: new THREE.Vector3(4.45, 1.15, -2.2),
    },
  );

  addMesh(
    new THREE.BoxGeometry(2.6, 0.35, 1.2),
    pillowMaterial,
    {
      position: new THREE.Vector3(4.45, 1.55, -4.25),
    },
  );
};

const buildTable = () => {
  const tableGroup = new THREE.Group();
  scene.add(tableGroup);

  const woodMaterial = new THREE.MeshStandardMaterial({
    color: '#805437',
    roughness: 0.84,
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: '#c7b29c',
    roughness: 0.78,
  });
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: '#505967',
    metalness: 0.38,
    roughness: 0.52,
  });

  const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.16, 1.15), woodMaterial);
  top.position.set(6.45, 1.72, 1.45);
  top.castShadow = true;
  top.receiveShadow = true;
  tableGroup.add(top);

  const legOffsets = [
    [-0.58, 0.78, -0.4],
    [0.58, 0.78, -0.4],
    [-0.58, 0.78, 0.4],
    [0.58, 0.78, 0.4],
  ];

  for (const [x, y, z] of legOffsets) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.55, 0.12), woodMaterial);
    leg.position.set(top.position.x + x, y, top.position.z + z);
    leg.castShadow = true;
    leg.receiveShadow = true;
    tableGroup.add(leg);
  }

  const lowerShelf = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.1, 0.88), woodMaterial);
  lowerShelf.position.set(6.45, 0.72, 1.45);
  lowerShelf.castShadow = true;
  lowerShelf.receiveShadow = true;
  tableGroup.add(lowerShelf);

  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.08, 18), metalMaterial);
  lampBase.position.set(6.1, 1.86, 1.2);
  lampBase.castShadow = true;
  lampBase.receiveShadow = true;
  tableGroup.add(lampBase);

  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.5, 12), metalMaterial);
  lampStem.position.set(6.1, 2.14, 1.2);
  lampStem.castShadow = true;
  lampStem.receiveShadow = true;
  tableGroup.add(lampStem);

  const lampShade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.18, 0.32, 18),
    new THREE.MeshStandardMaterial({
      color: '#f0c998',
      emissive: '#7d4a1e',
      emissiveIntensity: 0.18,
      roughness: 0.74,
    }),
  );
  lampShade.position.set(6.1, 2.48, 1.2);
  lampShade.castShadow = true;
  lampShade.receiveShadow = true;
  tableGroup.add(lampShade);

  const book = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.09, 0.72), accentMaterial);
  book.position.set(6.7, 1.86, 1.58);
  book.rotation.y = Math.PI / 8;
  book.castShadow = true;
  book.receiveShadow = true;
  tableGroup.add(book);
};

const buildShelf = () => {
  const shelfMaterial = new THREE.MeshStandardMaterial({
    color: '#6f4a31',
    roughness: 0.8,
  });

  addMesh(
    new THREE.BoxGeometry(2.9, 4.2, 0.8),
    shelfMaterial,
    {
      position: new THREE.Vector3(6.1, 2.1, 3.2),
    },
  );

  const colors = ['#dd8e69', '#7aa0cf', '#f2d36d', '#9fc39f', '#c792c7'];
  for (let row = 0; row < 4; row += 1) {
    for (let book = 0; book < 7; book += 1) {
      addMesh(
        new THREE.BoxGeometry(0.24, 0.88, 0.44),
        new THREE.MeshStandardMaterial({
          color: colors[(row + book) % colors.length],
          roughness: 0.92,
        }),
        {
          position: new THREE.Vector3(
            5.1 + book * 0.28,
            0.95 + row * 0.95,
            3.22,
          ),
        },
      );
    }
  }
};

const buildDecor = () => {
  const posterA = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 3.2),
    new THREE.MeshStandardMaterial({
      map: loadTexture('poster-skate'),
      roughness: 1,
    }),
  );
  posterA.position.set(-7.8, 4.8, -0.9);
  posterA.rotation.y = Math.PI / 2;
  scene.add(posterA);

  const posterB = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 2.8),
    new THREE.MeshStandardMaterial({
      map: loadTexture('poster-pixel'),
      roughness: 1,
    }),
  );
  posterB.position.set(1.8, 4.5, -6.28);
  scene.add(posterB);

  const posterCat = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 3.0),
    new THREE.MeshStandardMaterial({
      map: loadTexture('poster-cat'),
      roughness: 1,
    }),
  );
  posterCat.position.set(-4.2, 4.6, -6.28);
  scene.add(posterCat);

  const posterKitten = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 1.8),
    new THREE.MeshStandardMaterial({
      map: loadTexture('poster-kitten-washing-line'),
      roughness: 1,
    }),
  );
  posterKitten.position.set(-7.8, 4.5, -3.8);
  posterKitten.rotation.y = Math.PI / 2;
  scene.add(posterKitten);

  addMesh(
    new THREE.BoxGeometry(2.8, 2.2, 0.18),
    new THREE.MeshStandardMaterial({
      color: '#efe6da',
      roughness: 0.9,
    }),
    {
      position: new THREE.Vector3(-1.1, 5, -6.22),
      castShadow: false,
    },
  );

  addMesh(
    new THREE.PlaneGeometry(2.35, 1.75),
    new THREE.MeshStandardMaterial({
      color: '#9dc7f6',
      emissive: '#5d7fa1',
      emissiveIntensity: 0.14,
      roughness: 1,
    }),
    {
      position: new THREE.Vector3(-1.1, 5, -6.1),
      castShadow: false,
    },
  );
};

const buildLights = () => {
  const hemiLight = new THREE.HemisphereLight('#ffcfa8', '#34253b', 1.6);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight('#ffd19d', 1.85);
  keyLight.position.set(8, 14, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 40;
  keyLight.shadow.camera.left = -18;
  keyLight.shadow.camera.right = 18;
  keyLight.shadow.camera.top = 18;
  keyLight.shadow.camera.bottom = -18;
  scene.add(keyLight);

  const monitorGlow = new THREE.PointLight('#7affd2', 4, 7, 2);
  monitorGlow.position.set(-5.1, 4, -3.4);
  scene.add(monitorGlow);

  const deskLamp = new THREE.PointLight('#ffb36b', 2.8, 8, 2);
  deskLamp.position.set(-6.15, 4.2, -3.2);
  scene.add(deskLamp);
};

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

  if (!monitorState.supported) {
    renderMonitorFallback();
    return;
  }

  if (monitorState.paintDriven) {
    requestMonitorPaint();
  }
});

buildRoom();
buildRug();
buildDesk();
buildBed();
buildTable();
buildShelf();
buildDecor();
buildLights();
resize();

window.addEventListener('resize', resize);

const animate = (time = 0) => {
  const elapsed = clock.getElapsedTime();
  const flicker = 0.7 + Math.sin(elapsed * 8.5) * 0.08 + Math.sin(elapsed * 19) * 0.03;

  renderMonitorSurface(time);

  for (const material of animatedMaterials) {
    material.emissiveIntensity = flicker;
  }

  updateCameraTransition();
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
};

animate();
