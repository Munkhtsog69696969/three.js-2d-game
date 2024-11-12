import * as THREE from 'three';

export default class Wall {
  height: number;
  thickness: number;
  length: number;
  color: number;
  texture: string | undefined;
  posX: number;
  posY: number;
  posZ: number;
  rotateY: number;
  mesh: THREE.Mesh;

  constructor(
    height: number,
    thickness: number,
    length: number,
    color: number = 0x808080,
    texture: string | undefined = undefined,
    posX: number = 0,
    posY: number = 0,
    posZ: number = 0,
    rotateY: number = 0
  ) {
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

  createWall(): THREE.Mesh {
    const wallGeometry = new THREE.BoxGeometry(this.length, this.height, this.thickness);
    const textureLoader = new THREE.TextureLoader();

    let wallMaterial: THREE.Material;
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

  addToScene(scene: THREE.Scene): void {
    scene.add(this.mesh);
  }
}
