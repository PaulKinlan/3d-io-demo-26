import * as THREE from 'three';
import { loadTexture } from '../lib/texture-loader.js';

export const buildDecor = ({ scene, addMesh }) => {
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
