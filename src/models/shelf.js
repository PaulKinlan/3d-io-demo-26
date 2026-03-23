import * as THREE from 'three';
import createBookSpineTexture from '../textures/generators/book-spine.js';

export const buildShelf = ({ scene, addMesh, registerFocusTarget, computeFocusZoom, focusControlLimits, focusLift }) => {
  const shelfMeshes = [];
  const bookMeshes = [];

  const shelfMaterial = new THREE.MeshStandardMaterial({
    color: '#6f4a31',
    roughness: 0.8,
  });

  const shelfWidth = 2.9;
  const shelfHeight = 4.2;
  const shelfDepth = 0.8;
  const shelfX = 6.1;
  const shelfZ = 3.2;

  // Bottom panel
  shelfMeshes.push(addMesh(
    new THREE.BoxGeometry(shelfWidth, 0.1, shelfDepth),
    shelfMaterial,
    { position: new THREE.Vector3(shelfX, 0.05, shelfZ) },
  ));

  // Top panel
  shelfMeshes.push(addMesh(
    new THREE.BoxGeometry(shelfWidth, 0.1, shelfDepth),
    shelfMaterial,
    { position: new THREE.Vector3(shelfX, shelfHeight - 0.05, shelfZ) },
  ));

  // Left panel
  shelfMeshes.push(addMesh(
    new THREE.BoxGeometry(0.1, shelfHeight - 0.2, shelfDepth),
    shelfMaterial,
    { position: new THREE.Vector3(shelfX - shelfWidth / 2 + 0.05, shelfHeight / 2, shelfZ) },
  ));

  // Right panel
  shelfMeshes.push(addMesh(
    new THREE.BoxGeometry(0.1, shelfHeight - 0.2, shelfDepth),
    shelfMaterial,
    { position: new THREE.Vector3(shelfX + shelfWidth / 2 - 0.05, shelfHeight / 2, shelfZ) },
  ));

  // Intermediate shelves
  for (let i = 1; i < 4; i++) {
    const shelfY = i * 1.0;
    shelfMeshes.push(addMesh(
      new THREE.BoxGeometry(shelfWidth - 0.2, 0.1, shelfDepth),
      shelfMaterial,
      { position: new THREE.Vector3(shelfX, shelfY + 0.05, shelfZ) },
    ));
  }

  const colors = ['#dd8e69', '#7aa0cf', '#f2d36d', '#9fc39f', '#c792c7', '#d97b53', '#4a6ea8', '#6b4a58', '#4285F4', '#EA4335', '#FBBC05', '#34A853'];
  const titles = [
    'HTML', 'CSS', 'JS', 'WebGL', 'Three.js', 'React', 'Vue', 'Node',
    'Deno', 'Bun', 'Rust', 'Go', 'Python', 'Java', 'C++', 'C#',
    'Swift', 'Kotlin', 'Dart', 'Ruby', 'PHP', 'SQL', 'NoSQL', 'Git',
    'Docker', 'K8s', 'AWS', 'GCP', 'Azure', 'Linux'
  ];

  for (let row = 0; row < 4; row += 1) {
    const shelfY = row * 1.0 + 0.1; // bottom of the books
    let currentX = shelfX - shelfWidth / 2 + 0.15; // start from left panel

    // Place random number of books
    const numBooks = 6 + Math.floor(Math.random() * 5); // 6 to 10 books per shelf
    for (let book = 0; book < numBooks; book += 1) {
      const bookWidth = 0.15 + Math.random() * 0.1;
      const bookHeight = 0.65 + Math.random() * 0.2;
      const bookDepth = 0.35 + Math.random() * 0.1;
      const title = titles[Math.floor(Math.random() * titles.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const spineTexture = createBookSpineTexture(title, color);
      const bookSpineMaterial = new THREE.MeshStandardMaterial({
        map: spineTexture,
        roughness: 0.92,
      });
      const bookCoverMaterial = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.92,
      });

      const materials = [
        bookCoverMaterial, // right (+x)
        bookCoverMaterial, // left (-x)
        bookCoverMaterial, // top (+y)
        bookCoverMaterial, // bottom (-y)
        bookSpineMaterial, // front (+z), spine faces us
        bookCoverMaterial, // back (-z)
      ];

      bookMeshes.push(addMesh(
        new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth),
        materials,
        {
          position: new THREE.Vector3(
            currentX + bookWidth / 2,
            shelfY + bookHeight / 2,
            shelfZ + (shelfDepth / 2 - bookDepth / 2 - 0.05) // flush towards front
          ),
          rotation: new THREE.Vector3(
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.05
          )
        },
      ));
      
      currentX += bookWidth + 0.02 + Math.random() * 0.03; // Gap between books
      if (currentX > shelfX + shelfWidth / 2 - 0.25) {
        break; // don't push past right panel
      }
    }
  }

  // Register the shelf and books as a focus target
  const dummyPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(shelfWidth, shelfHeight),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  dummyPlane.position.set(shelfX, shelfHeight / 2, shelfZ + shelfDepth / 2);
  scene.add(dummyPlane);
  
  const tempCenter = new THREE.Vector3();
  const tempDirection = new THREE.Vector3();

  registerFocusTarget('books', [...shelfMeshes, ...bookMeshes, dummyPlane], {
    getView: () => {
      dummyPlane.updateWorldMatrix(true, false);
      dummyPlane.getWorldPosition(tempCenter);
      
      // Look direction is towards the bookshelf (-z since spines are visible from +z side)
      // Actually spines face +z, so camera should be at positive Z relative to books.
      tempDirection.set(0, 0, 1); 

      return {
        target: tempCenter.clone(),
        position: tempCenter.clone()
          .add(tempDirection.multiplyScalar(4.5))
          .add(focusLift),
        zoom: computeFocusZoom([dummyPlane], 1.2),
        controlLimits: focusControlLimits,
      };
    },
  });
};
