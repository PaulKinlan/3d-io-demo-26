import * as THREE from 'three';

export const buildLights = ({ scene }) => {
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


  const deskLamp = new THREE.PointLight('#ffb36b', 2.8, 8, 2);
  deskLamp.position.set(-6.15, 4.2, -3.2);
  scene.add(deskLamp);

  return { hemiLight, keyLight, deskLamp };
};
