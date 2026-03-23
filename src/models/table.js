import * as THREE from 'three';

export const buildTable = ({ scene }) => {
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
