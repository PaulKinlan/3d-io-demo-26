import * as THREE from 'three';
import { loadTexture } from '../lib/texture-loader.js';

export const buildRoom = ({ room, addMesh }) => {
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
