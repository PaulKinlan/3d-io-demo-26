import * as THREE from 'three';
import { loadTexture } from '../lib/texture-loader.js';

export const buildDecor = ({ scene, addMesh }) => {
  const posterA = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 3.2),
    new THREE.MeshStandardMaterial({
      map: loadTexture('poster-rc10'),
      roughness: 1,
    }),
  );
  posterA.position.set(-7.8, 4.8, -0.9);
  posterA.rotation.y = Math.PI / 2;
  posterA.name = 'posterA';
  scene.add(posterA);

  const posterB = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 2.8),
    new THREE.MeshStandardMaterial({
      map: loadTexture('poster-doom'),
      roughness: 1,
    }),
  );
  posterB.position.set(1.8, 4.5, -6.28);
  posterB.name = 'posterB';
  scene.add(posterB);

  const posterCat = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 3.0),
    new THREE.MeshStandardMaterial({
      map: loadTexture('poster-cat'),
      roughness: 1,
    }),
  );
  posterCat.position.set(-4.2, 4.6, -6.28);
  posterCat.name = 'posterCat';
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
  posterKitten.name = 'posterKitten';
  scene.add(posterKitten);

  const posterC = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 3.0),
    new THREE.MeshStandardMaterial({
      map: loadTexture('poster-skate'), // Default poster
      roughness: 1,
    }),
  );
  posterC.position.set(5.0, 4.6, -6.28); // Back wall, right side
  posterC.name = 'posterC';
  scene.add(posterC);

  const woodMaterial = new THREE.MeshStandardMaterial({ color: '#d2b48c', roughness: 0.8 });
  const gripMaterial = new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.9 });
  const ballMaterial = new THREE.MeshStandardMaterial({ color: '#8b0000', roughness: 0.6 });

  // Re-use a group for the bat so the blade, label, and handle stay perfectly aligned.
  const batGroup = new THREE.Group();
  batGroup.name = 'cricketBatGroup';
  batGroup.position.set(-1.5, 0, -4.0);
  batGroup.rotation.z = 0.2; // Lean left towards desk
  batGroup.scale.set(0, 0, 0);
  batGroup.visible = false;
  scene.add(batGroup);

  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.2, 0.05), woodMaterial);
  blade.position.set(0, 0.6, 0);
  blade.castShadow = true;
  blade.name = 'cricketBlade';
  batGroup.add(blade);

  // Create MRF Label
  const mrfCanvas = document.createElement('canvas');
  mrfCanvas.width = 128;
  mrfCanvas.height = 384;
  const ctx = mrfCanvas.getContext('2d');
  ctx.fillStyle = '#e32636'; // MRF Red
  ctx.fillRect(0, 0, 128, 384);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.translate(64, 192);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('MRF', 0, 0);
  
  const mrfTexture = new THREE.CanvasTexture(mrfCanvas);
  mrfTexture.colorSpace = THREE.SRGBColorSpace;
  
  const mrfLabel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, 0.6),
    new THREE.MeshStandardMaterial({ map: mrfTexture, roughness: 0.7 })
  );
  mrfLabel.position.set(0, 0.6, 0.026);
  mrfLabel.name = 'cricketLabel';
  batGroup.add(mrfLabel);

  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 12), gripMaterial);
  handle.position.set(0, 1.5, 0);
  handle.castShadow = true;
  handle.name = 'cricketHandle';
  batGroup.add(handle);

  // Ball sits on the floor separately so it doesn't lean with the bat
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), ballMaterial);
  ball.position.set(-1.0, 0.15, -3.8); // On floor near bat
  ball.scale.set(2.5, 2.5, 2.5);
  ball.castShadow = true;
  ball.name = 'cricketBall';
  ball.visible = false;
  scene.add(ball);

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

  // --- Shanghai version props ---

  // Small canvas label helper for the game cartridges (黄卡 / yellow carts).
  const makeCartLabelTexture = (title, subtitle) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e8c83a'; // cartridge yellow
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 20, 104, 88);
    ctx.strokeStyle = '#c8102e';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 20, 104, 88);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c8102e';
    ctx.font = '900 30px "Noto Sans SC", sans-serif';
    ctx.fillText(title, 64, 62);
    ctx.fillStyle = '#333333';
    ctx.font = '700 14px monospace';
    ctx.fillText(subtitle, 64, 92);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  const cartYellowMaterial = new THREE.MeshStandardMaterial({ color: '#e8c83a', roughness: 0.6 });
  const buildCartridge = (title, subtitle) => {
    const cart = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.42), cartYellowMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    cart.add(body);
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(0.28, 0.3),
      new THREE.MeshStandardMaterial({ map: makeCartLabelTexture(title, subtitle), roughness: 0.8 }),
    );
    label.rotation.x = -Math.PI / 2;
    label.position.set(0, 0.036, 0.02);
    cart.add(label);
    return cart;
  };

  // Subor 小霸王 learning machine — the keyboard-shaped Famicom clone that
  // defined '90s Chinese childhood gaming. Sits on the right side of the desk,
  // in the spot the CD stack occupies (the Shanghai toggle swaps them).
  const suborGroup = new THREE.Group();
  suborGroup.name = 'suborGroup';
  suborGroup.position.set(-3.55, 3.27, -4.55);
  suborGroup.rotation.y = 0.2;
  suborGroup.scale.set(0, 0, 0);
  suborGroup.visible = false;
  scene.add(suborGroup);

  const suborBodyMaterial = new THREE.MeshStandardMaterial({ color: '#ddd6c8', roughness: 0.7 });
  const suborDarkMaterial = new THREE.MeshStandardMaterial({ color: '#4a4a52', roughness: 0.8 });
  const suborRedMaterial = new THREE.MeshStandardMaterial({ color: '#c8102e', roughness: 0.6 });

  // Wedge-shaped keyboard body
  const suborBody = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.1, 0.5), suborBodyMaterial);
  suborBody.position.set(0, 0.05, 0.05);
  suborBody.rotation.x = 0.06;
  suborBody.castShadow = true;
  suborBody.receiveShadow = true;
  suborGroup.add(suborBody);

  // Key block (dark keys)
  const suborKeys = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.3), suborDarkMaterial);
  suborKeys.position.set(0, 0.11, 0.09);
  suborKeys.rotation.x = 0.06;
  suborGroup.add(suborKeys);

  // Raised cartridge slot housing at the back
  const suborSlot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.2), suborBodyMaterial);
  suborSlot.position.set(0, 0.14, -0.22);
  suborSlot.castShadow = true;
  suborGroup.add(suborSlot);

  // 小霸王 badge
  const badgeCanvas = document.createElement('canvas');
  badgeCanvas.width = 256;
  badgeCanvas.height = 64;
  const badgeCtx = badgeCanvas.getContext('2d');
  badgeCtx.fillStyle = '#ddd6c8';
  badgeCtx.fillRect(0, 0, 256, 64);
  badgeCtx.textAlign = 'center';
  badgeCtx.fillStyle = '#c8102e';
  badgeCtx.font = '900 40px "Noto Sans SC", sans-serif';
  badgeCtx.fillText('小霸王', 100, 46);
  badgeCtx.fillStyle = '#333333';
  badgeCtx.font = '700 22px sans-serif';
  badgeCtx.fillText('SUBOR', 205, 42);
  const badgeTexture = new THREE.CanvasTexture(badgeCanvas);
  badgeTexture.colorSpace = THREE.SRGBColorSpace;
  const suborBadge = new THREE.Mesh(
    new THREE.PlaneGeometry(0.44, 0.11),
    new THREE.MeshStandardMaterial({ map: badgeTexture, roughness: 0.8 }),
  );
  suborBadge.rotation.x = -Math.PI / 2 + 0.06;
  suborBadge.position.set(-0.22, 0.105, 0.28);
  suborGroup.add(suborBadge);

  // Red power/reset buttons
  for (const [bx, bz] of [[0.32, 0.28], [0.42, 0.28]]) {
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 10), suborRedMaterial);
    btn.position.set(bx, 0.105, bz);
    suborGroup.add(btn);
  }

  // Contra cart inserted in the slot, Tank Battle cart lying beside the console
  const contraCart = buildCartridge('魂斗罗', 'CONTRA');
  contraCart.position.set(0, 0.22, -0.22);
  contraCart.rotation.x = -0.12;
  suborGroup.add(contraCart);

  const tankCart = buildCartridge('坦克大战', 'BATTLE CITY');
  tankCart.position.set(0.62, 0.035, 0.15);
  tankCart.rotation.y = -0.5;
  suborGroup.add(tankCart);

  // Gamepad in front of the console with a curled cable
  const gamepad = new THREE.Group();
  gamepad.position.set(0.05, 0.02, 0.55);
  gamepad.rotation.y = -0.3;
  suborGroup.add(gamepad);

  const padBody = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.05, 0.18), suborDarkMaterial);
  padBody.castShadow = true;
  gamepad.add(padBody);
  const dpadV = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.09), suborBodyMaterial);
  dpadV.position.set(-0.11, 0.03, 0);
  gamepad.add(dpadV);
  const dpadH = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.03), suborBodyMaterial);
  dpadH.position.set(-0.11, 0.03, 0);
  gamepad.add(dpadH);
  for (const [bx] of [[0.06], [0.12]]) {
    const abBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 10), suborRedMaterial);
    abBtn.position.set(bx, 0.03, 0.02);
    gamepad.add(abBtn);
  }
  const padCable = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.05, 0.03, 0.46),
        new THREE.Vector3(-0.08, 0.03, 0.42),
        new THREE.Vector3(-0.12, 0.05, 0.34),
        new THREE.Vector3(-0.02, 0.05, 0.3),
      ]),
      10, 0.012, 6,
    ),
    new THREE.MeshStandardMaterial({ color: '#3a3a3a', roughness: 0.9 }),
  );
  suborGroup.add(padCable);

  // Ping pong paddle + ball on the floor (table tennis is the national sport —
  // the Shanghai counterpart to the cricket bat).
  const pingpongGroup = new THREE.Group();
  pingpongGroup.name = 'pingpongGroup';
  pingpongGroup.position.set(-1.5, 0.04, -4.0);
  pingpongGroup.rotation.y = 0.6;
  pingpongGroup.scale.set(0, 0, 0);
  pingpongGroup.visible = false;
  scene.add(pingpongGroup);

  const paddleFace = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.05, 24),
    [
      new THREE.MeshStandardMaterial({ color: '#d2a56b', roughness: 0.7 }), // edge (plywood)
      new THREE.MeshStandardMaterial({ color: '#e5341a', roughness: 0.85 }), // top rubber (red)
      new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.85 }), // bottom rubber (black)
    ],
  );
  paddleFace.scale.set(1, 1, 1.12);
  paddleFace.castShadow = true;
  paddleFace.receiveShadow = true;
  pingpongGroup.add(paddleFace);

  const paddleHandle = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.06, 0.4),
    new THREE.MeshStandardMaterial({ color: '#d2a56b', roughness: 0.7 }),
  );
  paddleHandle.position.set(0, 0, 0.52);
  paddleHandle.castShadow = true;
  pingpongGroup.add(paddleHandle);

  const pingpongBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 16),
    new THREE.MeshStandardMaterial({ color: '#fff8e8', roughness: 0.4 }),
  );
  pingpongBall.position.set(-1.0, 0.1, -3.5);
  pingpongBall.castShadow = true;
  pingpongBall.name = 'pingpongBall';
  pingpongBall.visible = false;
  scene.add(pingpongBall);

  // --- End Shanghai props ---

  // RC10 Car Model on the floor
  const rcGroup = new THREE.Group();
  rcGroup.position.set(-6, 0, 1); // Left side of the room
  rcGroup.rotation.y = Math.PI / 6; // Angled nicely
  rcGroup.scale.set(0.4, 0.4, 0.4); // RC cars are 1/10th scale

  const addRCPart = (mesh) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    rcGroup.add(mesh);
  };

  // Gold Pan Chassis
  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.1, 0.8), 
    new THREE.MeshStandardMaterial({color: '#deb85a', metalness: 0.6, roughness: 0.3})
  );
  chassis.position.set(0, 0.1, 0);
  addRCPart(chassis);
  
  // White Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.35, 0.5), 
    new THREE.MeshStandardMaterial({color: '#ffffff', roughness: 0.4})
  );
  body.position.set(-0.2, 0.32, 0);
  addRCPart(body);

  // Rear Wing
  const wing = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.05, 0.7), 
    new THREE.MeshStandardMaterial({color: '#ffffff'})
  );
  wing.position.set(0.7, 0.6, 0);
  addRCPart(wing);

  // Wing Struts
  const strutMat = new THREE.MeshStandardMaterial({color: '#222222'});
  const strutL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.05), strutMat);
  strutL.position.set(0.65, 0.45, 0.2);
  addRCPart(strutL);
  const strutR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.05), strutMat);
  strutR.position.set(0.65, 0.45, -0.2);
  addRCPart(strutR);
  
  // Wheels
  const tireMat = new THREE.MeshStandardMaterial({color: '#222222', roughness: 0.9});
  const rimMat = new THREE.MeshStandardMaterial({color: '#f0f0f0'});
  const createWheel = (x, y, z, rad, width) => {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, width, 16), tireMat);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.6, rad * 0.6, width + 0.02, 16), rimMat);
    tire.rotation.x = Math.PI / 2;
    rim.rotation.x = Math.PI / 2;
    tire.position.set(x, y, z);
    rim.position.set(x, y, z);
    addRCPart(tire);
    addRCPart(rim);
  };
  createWheel(-0.7, 0.25, 0.45, 0.25, 0.15); // Front L
  createWheel(-0.7, 0.25, -0.45, 0.25, 0.15); // Front R
  createWheel(0.6, 0.3, 0.5, 0.3, 0.25); // Rear L
  createWheel(0.6, 0.3, -0.5, 0.3, 0.25); // Rear R

  scene.add(rcGroup);
};
