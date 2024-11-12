"use client"
import { useEffect,useRef,useState } from 'react'
import { useRouter } from 'next/navigation'
import * as THREE from 'three'

import Floor from "./FloorClass"
import Wall from "./WallClass"
import Bullet from "./BulletClass"
import Entity from "./EntityClass"
import Health from "./HealthClass"

export default function ThreeScene() {  
  const router=useRouter()

  const mountRef = useRef<HTMLDivElement | null>(null);
  const direction=useRef(new THREE.Vector3(0, 0, 0))
  const velocity=0.2
  const [isLocked, setIsLocked] = useState(false);

  const rotation = useRef({ yaw: 0, pitch: 0 });

  const wave=useRef<number>(10)
  const [showGameInfo,setShowGameInfo]=useState(false)
  const [entitiesSpawned, setEntitiesSpawned] = useState(false);

  const [health,setHealth]=useState(100)
  const gameOver=useRef<boolean>(false)

  useEffect(() => {
    const isReloaded = JSON.parse(window.localStorage.getItem("isReload") || "false");

    // If not reloaded, trigger reload and set the reload flag
    if (!isReloaded) {
      window.localStorage.setItem("isReload", "true");
      window.location.reload();
    } else {
      window.localStorage.setItem("isReload", "false");
    }
  }, []);

  useEffect(()=>{
    if(health<=0){
        gameOver.current=true
        window.localStorage.setItem("isReload",JSON.stringify(false))
        router.push("/gameover")
    }
  },[health])
  useEffect(() => {

    // Ensure mountRef is not null
    if (!mountRef.current) return;

    // Set up the scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0,1.6,0)
    // camera.lookAt(0,0,0)

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // const loader = new EXRLoader();
    // loader.load('/sunset_jhbcentral_4k.exr', (texture:any) => {
    //   // Set the loaded EXR texture as the environment map
    //   scene.background = texture;
    //   scene.environment = texture; // Optional: applies texture to scene lighting
    // });

    const floor=new Floor(300,300,0x808080,'/floor.png')
    floor.addToScene(scene)

    // Create walls around the floor
    const wall1 = new Wall(10, 0.5, 300, 0x808080, '/wall.avif', 0, 5, -150); // Back wall
    wall1.addToScene(scene);

    const wall2 = new Wall(10, 0.5, 300, 0x808080, '/wall.avif', 0, 5, 150); // Front wall
    wall2.addToScene(scene);

    const wall3 = new Wall(10, 0.5, 300, 0x808080, '/wall.avif', -150, 5, 0, Math.PI / 2); // Left wall, rotated 90°
    wall3.addToScene(scene);

    const wall4 = new Wall(10, 0.5, 300, 0x808080, '/wall.avif', 150, 5, 0, Math.PI / 2); // Right wall, rotated 90°
    wall4.addToScene(scene);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5).normalize();
    scene.add(directionalLight);

    const cubeGeometry = new THREE.BoxGeometry();
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(10,1,0)
    scene.add(cube);

    let bullets: Bullet[] = [];
    let entities: Entity[]=[]
    let healths: Health[]=[]

    const activeKeys = {
        KeyW: false,
        KeyS: false,
        KeyA: false,
        KeyD: false,
    };
      
    const handleKeyDown = (event: any) => {
        switch (event.code) {
            case 'KeyW':
            activeKeys.KeyW = true;
            direction.current.z = -1; // Move forward
            break;
            case 'KeyS':
            activeKeys.KeyS = true;
            direction.current.z = 1; // Move backward
            break;
            case 'KeyA':
            activeKeys.KeyA = true;
            direction.current.x = -1; // Move left
            break;
            case 'KeyD':
            activeKeys.KeyD = true;
            direction.current.x = 1; // Move right
            break;
        }
    };
    
    const handleKeyUp = (event: any) => {
        switch (event.code) {
          case 'KeyW':
            activeKeys.KeyW = false;
            if (!activeKeys.KeyS) {
              direction.current.z = 0; // Stop moving forward if "S" is not pressed
            }
            break;
          case 'KeyS':
            activeKeys.KeyS = false;
            if (!activeKeys.KeyW) {
              direction.current.z = 0; // Stop moving backward if "W" is not pressed
            }
            break;
          case 'KeyA':
            activeKeys.KeyA = false;
            if (!activeKeys.KeyD) {
              direction.current.x = 0; // Stop moving left if "D" is not pressed
            }
            break;
          case 'KeyD':
            activeKeys.KeyD = false;
            if (!activeKeys.KeyA) {
              direction.current.x = 0; // Stop moving right if "A" is not pressed
            }
            break;
        }
    };

    const handleMouseMove = (event:any) => {
        const sensitivity = 0.0015;
      
        // Update only yaw (horizontal rotation) based on mouse X movement
        rotation.current.yaw -= event.movementX * sensitivity;

        rotation.current.yaw %= 2 * Math.PI;
    };

    const handlePointerLock = () => {
        if (mountRef.current) {
            mountRef.current.requestPointerLock();
        }
    };

    const handleLockChange = () => {
        if (document.pointerLockElement === mountRef.current) {
            setIsLocked(true);
        } else {
            setIsLocked(false);
        }
    };

    const fireBullets=()=> {
        // if (!isLocked) return; // Only fire if pointer is locked
      
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.normalize();
      
        const newBullet = new Bullet(
          camera.position.x,
          camera.position.y,
          camera.position.z,
          0.3, // size
          0.1, // width
          0.1, // height
          0.2, // speed
          cameraDirection // shooting direction
        );
        newBullet.addToScene(scene);
        bullets.push(newBullet);
    }

    function updateCamera() {
        // Check if the camera is within the bounds of the 300x300 floor
        const floorSize = 300 / 2;
    
        // Prevent the camera from going out of bounds
        if (Math.abs(camera.position.x) > floorSize) {
            camera.position.x = Math.sign(camera.position.x) * floorSize; // Clamp to boundary
        }
        if (Math.abs(camera.position.z) > floorSize) {
            camera.position.z = Math.sign(camera.position.z) * floorSize; // Clamp to boundary
        }

        // Define a small epsilon value for tolerance
        const entityEpsilon = 0.1;  // Adjust the value as needed for your game

        for (const entity of entities) {
            if (entity.entity) {
                // Check if the camera and entity are within a small distance (epsilon) from each other
                if (
                    Math.abs(camera.position.x - entity.entity.position.x) < entityEpsilon &&
                    Math.abs(camera.position.z - entity.entity.position.z) < entityEpsilon
                ) {
                    setHealth((prevHealth)=>prevHealth-1)
                }
            }
        }

        const healthEpsilion=1

        for(const healthPot of healths){
            if(healthPot.health){
                if (
                    Math.abs(camera.position.x - healthPot.health.position.x) < healthEpsilion &&
                    Math.abs(camera.position.z - healthPot.health.position.z) < healthEpsilion
                ) {
                    if(health+10<=100){
                        setHealth(health+10)
                    }else{
                        setHealth(100)
                    }
                    if(healthPot.health.parent){
                        healthPot.health.parent?.remove(healthPot.health)
                    }
                    healths.splice(healths.indexOf(healthPot),1)
                }
            }
        }

        // Calculate forward direction based on the yaw angle
        const forwardX = Math.sin(rotation.current.yaw);
        const forwardZ = Math.cos(rotation.current.yaw);
    
        // Update camera position based on forward direction
        camera.position.x += velocity * direction.current.z * forwardX; // Moving forward/backward
        camera.position.z += velocity * direction.current.z * forwardZ;
    
        // Calculate right direction vector to strafe (left/right movement)
        const rightX = Math.sin(rotation.current.yaw + Math.PI / 2);
        const rightZ = Math.cos(rotation.current.yaw + Math.PI / 2);
    
        // Apply right direction to x and z based on direction.x (strafing)
        camera.position.x += velocity * direction.current.x * rightX;
        camera.position.z += velocity * direction.current.x * rightZ;
    
        // Update camera rotation
        camera.rotation.y = rotation.current.yaw;
    }    

    function updateBullets() {
       for(let bullet of bullets){
            bullet.update(entities,300,bullets)
       }
    }   
    
    function updateEntities(){
        for(const entity of entities){
            entity.updateEntity(camera,entities,300)
        }
    }

    function gameInfo() {
        // Show "wave cleared" message if entities array is empty and game info isn't showing
        if (entities.length === 0 && !showGameInfo) {
            setShowGameInfo(true);
    
            // Set a timer for 5 seconds to hide the game info and increase the wave count
            const timer = setTimeout(() => {
                setShowGameInfo(false);
                wave.current+=10
                setEntitiesSpawned(false); // Reset entitiesSpawned for the new wave
            }, 5000);
    
            // Clear the timer when this function is called again before the timer finishes
            return () => clearTimeout(timer);
        }
    }
    
    function SpawnEntities() {
        // Spawn entities only when the game info is hidden, entities haven't been spawned yet, and no entities exist
        if (!showGameInfo && !entitiesSpawned && entities.length === 0) {
            const newEntities = []; // Temporary array to avoid modifying `entities` directly while looping
    
            for (let i = 0; i < wave.current; i++) {
                const newEntity = new Entity(100, 1, 1.8, 1, "/zombie.png");
                newEntity.addToScene(scene);
                newEntities.push(newEntity);
            }
            
            // Add the newly created entities to the main entities array
            entities.push(...newEntities);
            setEntitiesSpawned(true); // Prevents additional spawns within the same wave
        }
    }

    setInterval(()=>{
        function DropHealth(){
            const newHealth=new Health(300)
            newHealth.addToScene(scene)
            healths.push(newHealth)
        }
        DropHealth()
    },5000)
    
    function update() {
        if(!gameOver.current){
            updateCamera();
            updateBullets();
            updateEntities();
            gameInfo();
            SpawnEntities(); 
        }
    }
    

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handleLockChange , );

    document.addEventListener('click', handlePointerLock);
    document.addEventListener('click', fireBullets); // fire bullet when clicked

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      update()
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handlePointerLock);
      document.removeEventListener('pointerlockchange', handleLockChange);
      document.removeEventListener('click', fireBullets);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
    //   onClick={()=>handlePointerLock()}
      style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}
    >
        {/* corsair */}
        <div
            style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)', // This centers the element
            width: '5px',
            height: '5px',
            backgroundColor: 'white', // Change this to any background or cursor image
            color: 'red', 
            display: 'flex',
            alignItems: 'center', // Vertically align text or content
            justifyContent: 'center', // Horizontally align text or content
            pointerEvents: 'none', // Prevent the cursor from interfering with mouse interactions
            zIndex: 1000, // Ensure it is on top of other content
            }}
        />
        <div style={{
            position:"absolute",
            left: '50%',
            transform:"translate(-50%,40%)",
            opacity: showGameInfo ? 1 : 0,
            transition:"opacity 0.5s ease-in-out",
            color:"white",
            fontSize:20
        }}>
            Wave cleared! Next wave: {wave.current / 10}
        </div>
        {/* Healthbar */}
        <div style={{
            position: "absolute",
            left: "50%",
            transform: "translate(-50%)",
            bottom:15,
            width:"70%",
            display:"flex",
            justifyItems:"start",
            alignItems:"center",
            height: "50px",
            backgroundColor:"",
            border: "2px solid white", // Add 'px' for border width and 'solid' for style
        }}>
            <div style={{
                width: `${health}%`,
                height:"100%",
                backgroundColor:"red"
            }}
            >
            </div>
        </div>
        {gameOver.current && (
            <div style={{
                position: "absolute",
                width: "100vw", // Full width of the viewport
                height: "100vh", // Full height of the viewport
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                backgroundColor: "black"
            }}>
                Game Over
            </div>
        )}

      {!isLocked && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            zIndex: 1,
            cursor: 'pointer',
          }}
        >
          Click to Start
        </div>
      )}
    </div>
  )
}
