import * as THREE from 'three';

export const buildRug = ({ addMesh }) => {
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
