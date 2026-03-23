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
  scene.add(posterA);

  const posterB = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 2.8),
    new THREE.MeshStandardMaterial({
      map: loadTexture('poster-doom'),
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
