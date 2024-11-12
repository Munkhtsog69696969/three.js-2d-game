import * as THREE from "three";

export default class Bullet {
    constructor(x, y, z, speed, width, height, depth, direction) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.speed = speed;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.direction = direction.normalize(); // Ensure direction is normalized

        this.bullet = this.createBullet();
    }

    createBullet() {
        const boxGeometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const boxMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00, // Bullet color
        });

        const bullet = new THREE.Mesh(boxGeometry, boxMaterial);
        bullet.position.set(this.x, this.y, this.z);

        bullet.lookAt(bullet.position.clone().add(this.direction)); // Make bullet face the direction

        return bullet;
    }

    addToScene(scene) {
        scene.add(this.bullet);
    }

    update(entities,floorSize,bullets) {
        const deltaPosition = this.direction.clone().multiplyScalar(this.speed);
        this.bullet.position.add(deltaPosition);

        // Check for collisions with entities using AABB
        entities.forEach((entity, index) => {
            if (this.checkCollision(entity)) {
                // Collision detected, remove entity from the scene
                if (entity.entity.parent) {
                    entity.entity.parent.remove(entity.entity);
                }
    
                entities.splice(index, 1);

                const bulletIndex = bullets.indexOf(this);

                if (bulletIndex !== -1) {
                    bullets.splice(bulletIndex, 1);
                }
        
                // Optionally, remove the bullet from the scene if needed
                if (this.bullet.parent) {
                    this.bullet.parent.remove(this.bullet);
                }
            }
        });

        if (Math.abs(this.bullet.position.x) > floorSize / 2 || Math.abs(this.bullet.position.z) > floorSize / 2) {
            const bulletIndex = bullets.indexOf(this);

            if (bulletIndex !== -1) {
                bullets.splice(bulletIndex, 1);
            }
            
            if (this.bullet.parent) {
                this.bullet.parent.remove(this.bullet);
            }
        }
    }

    // AABB collision detection
    checkCollision(entity) {
        const bulletBox = new THREE.Box3().setFromObject(this.bullet);
        const entityBox = new THREE.Box3().setFromObject(entity.entity);

        // Check if the two bounding boxes intersect
        return bulletBox.intersectsBox(entityBox);
    }
}
