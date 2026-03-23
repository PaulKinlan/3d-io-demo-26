import * as THREE from 'three';

export const buildBed = ({ addMesh }) => {
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

  const legGeometry = new THREE.BoxGeometry(0.2, 0.4, 0.2);
  const legPositions = [
    [4.45 - 1.5, 0.2, -2.2 - 2.9],
    [4.45 + 1.5, 0.2, -2.2 - 2.9],
    [4.45 - 1.5, 0.2, -2.2 + 2.9],
    [4.45 + 1.5, 0.2, -2.2 + 2.9],
  ];

  legPositions.forEach(([x, y, z]) => {
    addMesh(legGeometry, frameMaterial, {
      position: new THREE.Vector3(x, y, z),
    });
  });
};
