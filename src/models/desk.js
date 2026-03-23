import * as THREE from 'three';
import { loadTexture } from '../lib/texture-loader.js';

export const buildDesk = ({
  scene,
  htmlSubtree,
  monitorState,
  animatedMaterials,
  activityLights,
  networkLights,
  registerFocusTarget,
  computeFocusZoom,
  focusControlLimits,
  focusLift,
  defaultView,
  registerSpinTarget
}) => {
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

  const chairGroup = new THREE.Group();
  chairGroup.position.set(-3.85, 0, -2.3);
  deskGroup.add(chairGroup);

  const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.16, 1), new THREE.MeshStandardMaterial({
    color: '#85606e',
    roughness: 0.9,
  }));
  chairSeat.position.set(0, 1.28, 0);
  chairSeat.castShadow = true;
  chairSeat.receiveShadow = true;
  chairGroup.add(chairSeat);

  const chairBack = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.05, 0.16), chairSeat.material);
  chairBack.position.set(0, 1.86, -0.43);
  chairBack.castShadow = true;
  chairBack.receiveShadow = true;
  chairGroup.add(chairBack);

  const chairStem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.12, 16), metalMaterial);
  chairStem.position.set(0, 0.68, 0);
  chairStem.castShadow = true;
  chairStem.receiveShadow = true;
  chairGroup.add(chairStem);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.8, 0.12, 20), metalMaterial);
  base.position.set(0, 0.06, 0);
  base.castShadow = true;
  base.receiveShadow = true;
  chairGroup.add(base);

  const chairParts = [chairSeat, chairBack, chairStem, base];
  for (const part of chairParts) {
    part.userData.spinGroup = chairGroup;
  }
  if (typeof registerSpinTarget === 'function') {
    registerSpinTarget(chairParts);
  }

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
  frontFrameShape.moveTo(-0.675, -0.525);
  frontFrameShape.lineTo(0.675, -0.525);
  frontFrameShape.lineTo(0.675, 0.525);
  frontFrameShape.lineTo(-0.675, 0.525);
  frontFrameShape.lineTo(-0.675, -0.525);

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
  frontFrame.position.set(-5.1, 4.05, -3.86);
  frontFrame.renderOrder = 3;
  deskGroup.add(frontFrame);

  monitorState.texture = new THREE.HTMLTexture(htmlSubtree);
  monitorState.texture.colorSpace = THREE.SRGBColorSpace;

  const screenMaterial = new THREE.MeshStandardMaterial({
    color: '#111111',
    map: monitorState.texture,
    emissiveMap: monitorState.texture,
    emissive: '#ffffff',
    emissiveIntensity: 1.2,
    roughness: 0.16,
    metalness: 0.08,
  });
  animatedMaterials.push(screenMaterial);

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.72), screenMaterial);
  screen.position.set(-5.1, 4.05, -3.86);
  screen.material.side = THREE.DoubleSide;
  screen.renderOrder = 2;
  deskGroup.add(screen);
  monitorState.screenMesh = screen; // Store for transform sync

  const bezel = new THREE.Mesh(
    new THREE.PlaneGeometry(1.02, 0.8),
    new THREE.MeshStandardMaterial({
      color: '#2a2a2f',
      roughness: 0.78,
      metalness: 0.12,
    }),
  );
  bezel.position.set(-5.1, 4.05, -3.865);
  bezel.material.side = THREE.DoubleSide;
  bezel.renderOrder = 1;
  deskGroup.add(bezel);

  const monitorDebugEnabled = new URLSearchParams(window.location.search).has('monitorDebug');
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
    monitorGuide.position.set(-5.1, 4.05, -3.85);
    deskGroup.add(monitorGuide);

    const monitorNormal = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(-5.1, 4.05, -3.85),
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

  const tempCenter = new THREE.Vector3();
  const tempDirection = new THREE.Vector3();
  const tempPosition = new THREE.Vector3();

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
        zoom: computeFocusZoom([frontFrame], 1.15),
        controlLimits: focusControlLimits,
      };
    },
  });

  const keyboardMaterial = new THREE.MeshStandardMaterial({
    map: loadTexture('misc-keyboard', { repeat: [1, 1] }),
    roughness: 0.82,
  });
  const keyboardMaterials = [
    plasticMaterial,  // right
    plasticMaterial,  // left
    keyboardMaterial, // top
    plasticMaterial,  // bottom
    plasticMaterial,  // front
    plasticMaterial,  // back
  ];
  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 0.44), keyboardMaterials);
  keyboard.position.set(-4.5, 3.3, -3.52);
  keyboard.castShadow = true;
  keyboard.receiveShadow = true;
  deskGroup.add(keyboard);

  const mouseMaterial = new THREE.MeshStandardMaterial({
    color: '#a89888',
    roughness: 0.75,
  });
  const mouseBody = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.35), mouseMaterial);
  mouseBody.position.set(-3.1, 3.31, -3.55);
  mouseBody.castShadow = true;
  mouseBody.receiveShadow = true;
  deskGroup.add(mouseBody);

  const mouseSeam = new THREE.Mesh(
    new THREE.BoxGeometry(0.005, 0.085, 0.18),
    new THREE.MeshStandardMaterial({ color: '#7a6e62', roughness: 0.9 }),
  );
  mouseSeam.position.set(-3.1, 3.315, -3.64);
  deskGroup.add(mouseSeam);

  const scrollWheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8),
    new THREE.MeshStandardMaterial({ color: '#6a6058', roughness: 0.6 }),
  );
  scrollWheel.position.set(-3.1, 3.36, -3.62);
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
  activityLights.push(powerLed.material);

  const netLedYellow = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.03, 0.02),
    new THREE.MeshStandardMaterial({
      color: '#d4cc15',
      emissive: '#d4cc15',
      emissiveIntensity: 0.8,
    }),
  );
  netLedYellow.position.set(towerX + 0.1, towerY + 0.4, towerZ - towerD / 2 - 0.01);
  deskGroup.add(netLedYellow);
  networkLights.push(netLedYellow.material);

  const netLedGreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.03, 0.02),
    new THREE.MeshStandardMaterial({
      color: '#15d435',
      emissive: '#15d435',
      emissiveIntensity: 0.8,
    }),
  );
  netLedGreen.position.set(towerX + 0.15, towerY + 0.4, towerZ - towerD / 2 - 0.01);
  deskGroup.add(netLedGreen);
  networkLights.push(netLedGreen.material);

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
      new THREE.Vector3(-3.1, 3.31, -3.72),
      new THREE.Vector3(-3.25, 3.29, -3.9),
      new THREE.Vector3(-3.45, 3.27, -4.0),
      new THREE.Vector3(-4.5, 3.22, -4.1),
    ]),
    12, cableRadius * 0.7, 6,
  );
  const mouseCableMesh = new THREE.Mesh(mouseCable, cableMaterial);
  deskGroup.add(mouseCableMesh);

  // --- CD Stack and loose CDs ---
  const cdRadius = 0.16;
  const cdGeometry = new THREE.CylinderGeometry(cdRadius, cdRadius, 0.005, 32);
  const cdMaterialPhotoshop = new THREE.MeshStandardMaterial({
    map: loadTexture('cd-photoshop'),
    roughness: 0.3,
    metalness: 0.8,
  });
  const cdMaterialPirated = new THREE.MeshStandardMaterial({
    map: loadTexture('cd-pirated'),
    roughness: 0.4,
    metalness: 0.6,
  });
  const cdMaterialBlank = new THREE.MeshStandardMaterial({
    map: loadTexture('cd-blank'),
    roughness: 0.3,
    metalness: 0.8,
  });
  const cdBottomMaterial = new THREE.MeshStandardMaterial({
    color: '#a0a0ff',
    roughness: 0.1,
    metalness: 1.0,
  });
  const cdEdgeMaterial = new THREE.MeshStandardMaterial({
    color: '#c0c0c0',
    roughness: 0.4,
    metalness: 0.8,
  });
  const getCDMaterials = (topMat) => [cdEdgeMaterial, topMat, cdBottomMaterial];

  const stackHeight = 0.16;
  const stackGeometry = new THREE.CylinderGeometry(cdRadius, cdRadius, stackHeight, 32);
  const stackEdgeMaterial = new THREE.MeshStandardMaterial({
    color: '#d0d0d0',
    roughness: 0.6,
    metalness: 0.4,
  });
  const cdStack = new THREE.Mesh(stackGeometry, [
    stackEdgeMaterial, 
    cdMaterialBlank, 
    cdBottomMaterial
  ]);
  cdStack.position.set(-4.0, 3.27 + stackHeight / 2, -4.8); 
  cdStack.castShadow = true;
  cdStack.receiveShadow = true;
  deskGroup.add(cdStack);

  const cdLabelGeometry = new THREE.PlaneGeometry(0.24, 0.12);
  const cdLabelMaterial = new THREE.MeshStandardMaterial({
    map: loadTexture('cd-stack-label'),
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  const cdLabel = new THREE.Mesh(cdLabelGeometry, cdLabelMaterial);
  cdLabel.position.set(-4.0, 3.27 + stackHeight + 0.002, -4.8);
  cdLabel.rotation.x = -Math.PI / 2;
  cdLabel.rotation.z = Math.PI / 6;
  deskGroup.add(cdLabel);

  const cd1 = new THREE.Mesh(cdGeometry, getCDMaterials(cdMaterialPhotoshop));
  cd1.position.set(-3.5, 3.27 + 0.0025, -4.2);
  cd1.rotation.y = Math.PI / 3;
  cd1.castShadow = true;
  cd1.receiveShadow = true;
  deskGroup.add(cd1);

  const cd2 = new THREE.Mesh(cdGeometry, getCDMaterials(cdMaterialPirated));
  cd2.position.set(-4.2, 3.27 + 0.0025, -3.95);
  cd2.rotation.y = -Math.PI / 8;
  cd2.castShadow = true;
  cd2.receiveShadow = true;
  deskGroup.add(cd2);

  // --- End CDs ---

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
