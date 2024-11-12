import * as THREE from 'three';

export default class Wall {
  constructor(height, thickness, length, color = 0x808080, texture = undefined, posX = 0, posY = 0, posZ = 0, rotateY = 0) {
    this.height = height;
    this.thickness = thickness;
    this.length = length;
    this.color = color;
    this.texture = texture;
    this.posX = posX;
    this.posY = posY;
    this.posZ = posZ;
    this.rotateY = rotateY;

    this.mesh = this.createWall();
  }

  createWall() {
    const wallGeometry = new THREE.BoxGeometry(this.length, this.height, this.thickness);
    const textureLoader = new THREE.TextureLoader();

    let wallMaterial;
    if (this.texture) {
      const wallTexture = textureLoader.load(this.texture);
      wallTexture.wrapS = THREE.RepeatWrapping;
      wallTexture.wrapT = THREE.RepeatWrapping;
      wallTexture.repeat.set(this.length / 10, this.height / 2); // Adjust for tiling effect
      wallMaterial = new THREE.MeshStandardMaterial({ map: wallTexture });
    } else {
      wallMaterial = new THREE.MeshStandardMaterial({ color: this.color });
    }

    const wall = new THREE.Mesh(wallGeometry, wallMaterial);

    // Set position and rotation
    wall.position.set(this.posX, this.posY, this.posZ);
    wall.rotation.y = this.rotateY;

    return wall;
  }

  addToScene(scene) {
    scene.add(this.mesh);
  }
}
