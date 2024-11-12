import * as THREE from "three";

export default class Health {
  floorSize: number;
  health: THREE.Mesh;

  constructor(floorSize: number) {
    this.floorSize = floorSize;
    this.health = this.createHealth();
  }

  createHealth(): THREE.Mesh {
    const geometry = new THREE.OctahedronGeometry(1, 0);

    // Create a material (choose any color or texture)
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const heart = new THREE.Mesh(geometry, material);

    const posX = (Math.random() - 0.5) * this.floorSize;
    const posZ = (Math.random() - 0.5) * this.floorSize;

    heart.position.set(posX, 1, posZ);

    return heart;
  }

  addToScene(scene: THREE.Scene): void {
    scene.add(this.health);
  }
}
