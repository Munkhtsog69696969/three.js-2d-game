import * as THREE from "three";

export default class Entity {
  spawnRange: number;
  width: number;
  height: number;
  depth: number;
  speed: number;
  repulsionStrength: number;
  minDistance: number;
  texture: THREE.Texture | null;
  entity: THREE.Mesh;

  constructor(
    spawnRange: number,
    width: number,
    height: number,
    depth: number,
    texture: string | null = null
  ) {
    this.spawnRange = spawnRange;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.speed = 0.1;
    this.repulsionStrength = 0.03; // Strength of the repulsion force
    this.minDistance = 1.0;        // Minimum distance to maintain between entities

    this.texture = texture ? new THREE.TextureLoader().load(texture) : null;

    if (this.texture) {
      this.texture.wrapS = THREE.RepeatWrapping;
      this.texture.wrapT = THREE.RepeatWrapping;
    }

    this.entity = this.createEntity();
  }

  createEntity(): THREE.Mesh {
    const boxGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);

    const boxMaterial = this.texture
      ? new THREE.MeshStandardMaterial({ map: this.texture })
      : new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(
      Math.random() * this.spawnRange - this.spawnRange / 2,
      this.height / 2,
      Math.random() * this.spawnRange - this.spawnRange / 2
    );

    return box;
  }

  addToScene(scene: THREE.Scene): void {
    scene.add(this.entity);
  }

  updateEntity(camera: THREE.Camera, entities: Entity[], floorSize: number): void {
    const cameraPosition = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
    const entityPosition = new THREE.Vector3().setFromMatrixPosition(this.entity.matrixWorld);

    // Move toward the camera
    const directionToCamera = new THREE.Vector3().subVectors(cameraPosition, entityPosition);
    if (directionToCamera.length() >= this.speed) {
      directionToCamera.normalize();
      this.entity.position.add(directionToCamera.multiplyScalar(this.speed));
    }

    // Apply repulsion from nearby entities
    entities.forEach(otherEntity => {
      if (otherEntity !== this) {
        const otherPosition = new THREE.Vector3().setFromMatrixPosition(otherEntity.entity.matrixWorld);
        const distance = entityPosition.distanceTo(otherPosition);

        if (distance < this.minDistance) {
          // Calculate the repulsion vector
          const repulsion = new THREE.Vector3().subVectors(entityPosition, otherPosition);

          // Zero out the Y component to prevent upward or downward movement
          repulsion.y = 0;

          // Normalize and apply a capped repulsion strength
          const distanceFactor = Math.max(distance, 1); // Prevents division by zero
          repulsion.normalize().multiplyScalar(Math.min(this.repulsionStrength / distanceFactor, 0.2)); // Cap the repulsion strength

          // Apply the repulsion force
          this.entity.position.add(repulsion);
        }
      }
    });

    if (Math.abs(this.entity.position.x) > floorSize) {
      this.entity.position.x = Math.sign(this.entity.position.x) * floorSize; // Clamp to boundary
    }
    if (Math.abs(this.entity.position.z) > floorSize) {
      this.entity.position.z = Math.sign(this.entity.position.z) * floorSize; // Clamp to boundary
    }
  }
}
