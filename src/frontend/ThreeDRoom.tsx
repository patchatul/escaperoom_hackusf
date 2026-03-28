
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef, useState, useMemo } from "react";
import QuizPopup from "./QuizPopup.tsx";


interface BookProps {
  onClick: () => void;
}

function RoomModel() {
  const { scene } = useGLTF("/models/horror_room.glb");

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 10 / maxDim;
    scene.scale.setScalar(scale);

    const newBox = new THREE.Box3().setFromObject(scene);
    const center = newBox.getCenter(new THREE.Vector3());

    // Căn giữa theo X, Z và đặt đáy phòng xuống mặt đất
    scene.position.x -= center.x;
    scene.position.z -= center.z;
    scene.position.y -= newBox.min.y;

    // Cho nhìn được từ bên trong phòng
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        materials.forEach((mat) => {
          mat.side = THREE.DoubleSide;
          mat.needsUpdate = true;
        });

        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

function Flashlight() {
  const { camera, scene } = useThree();
  const lightRef = useRef<THREE.SpotLight>(null);

  useEffect(() => {
    if (lightRef.current) {
      // target của spotlight
      const target = new THREE.Object3D();
      scene.add(target);
      lightRef.current.target = target;
    }
  }, [scene]);

  useFrame(() => {
    if (!lightRef.current) return;

    // đặt đèn tại vị trí camera
    lightRef.current.position.copy(camera.position);

    // hướng đèn theo hướng nhìn
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    const targetPos = camera.position.clone().add(direction.multiplyScalar(5));
    lightRef.current.target.position.copy(targetPos);
    lightRef.current.target.updateMatrixWorld();
  });

  return (
    <spotLight
      ref={lightRef}
      intensity={80} //flashlight
      angle={0.5}       // 🔥 nhỏ = vùng sáng hẹp
      penumbra={1.5}
      distance={15}
      decay={1}
      color="#ffffff"
      castShadow
    />
  );
}
function HorrorLights() {
  const ceilingLight = useRef<THREE.PointLight>(null);
  const redLight = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    if (ceilingLight.current) {
      const flicker =
        2 +
        Math.sin(t * 18) * 0.25 +
        Math.sin(t * 37) * 0.12 +
        (Math.random() - 0.5) * 0.08;

      ceilingLight.current.intensity = Math.max(5, flicker);
    }

    if (redLight.current) {
      redLight.current.intensity = 0.5 + Math.sin(t * 2.5) * 0.08;
    }
  });

  return (
    <>
      {/* Ánh sáng nền rất nhẹ để không đen hoàn toàn */}
      <ambientLight intensity={0.4} />

      {/* Đèn chính trên trần, vàng cũ, nhấp nháy */}
      <pointLight
        ref={ceilingLight}
        position={[0.4, 2.1, 0.1]}
        intensity={5}
        distance={10}
        decay={2}
        color="#ffed91"
        castShadow
      />

      {/* SpotLight chiếu xuống để tạo cảm giác đèn trần thật hơn */}
      <spotLight
        position={[0, 2.35, 0]}
        target-position={[0, 0, 0]}
        angle={0.7}
        penumbra={0.7}
        intensity={2.2}
        distance={12}
        decay={2}
        color="#fff1c1"
        castShadow
      />

      {/* Đỏ nhẹ ở góc phòng cho horror vibe */}
      <pointLight
        ref={redLight}
        position={[-2, 2, -2]}
        intensity={5}
        distance={5}
        decay={2}
        color="#7a0000"
      />

      {/* Ánh sáng phụ rất nhẹ từ phía cửa để room còn chiều sâu */}
      <pointLight
        position={[0, 1.2, 2.5]}
        intensity={0.15}
        distance={5}
        decay={2}
        color="#8899aa"
      />
    </>
  );
}
function TV() {
  const { scene } = useGLTF("/models/vintage_tv_free.glb");

  const tv = useMemo(() => {
    const tv_clone = scene.clone();

    // 1. Compute bounding box
    const box = new THREE.Box3().setFromObject(tv_clone);
    const size = box.getSize(new THREE.Vector3());

    // 2. Get largest dimension
    const maxDim = Math.max(size.x, size.y, size.z);

    // 3. Normalize scale
    const desiredSize = 1.2;
    const scale = desiredSize / maxDim;
    tv_clone.scale.setScalar(scale);

    // 4. Recompute after scaling
    const newBox = new THREE.Box3().setFromObject(tv_clone);
    const center = newBox.getCenter(new THREE.Vector3());

    // 5. Center model
    tv_clone.position.x -= center.x;
    tv_clone.position.z -= center.z;
    tv_clone.position.y -= newBox.min.y;

    // 6. Move to corner
    tv_clone.position.x += 2.5;
    tv_clone.position.z += 1;

    // 7. Rotate toward room
    tv_clone.rotation.y = -Math.PI * 0.5;

    return tv_clone;
  }, [scene]);

  return <primitive object={tv} />;
}
function BloodText() {
  const { scene } = useGLTF("/models/behind_you.glb");

  const blood = useMemo(() => {
    const blood_text = scene.clone();

  
    // scale small (it's usually big or weird)
    blood_text.scale.set(0.2,0.2,0.2);

    // place on wall (adjust!)
    blood_text.position.set(3, 1.8, 0.8); 

    // rotate to face room
    blood_text.rotation.y = Math.PI;
    // fix material (important for decals)
    blood_text.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        materials.forEach((mat) => {
          if (!mat) return;
          mat.transparent = true;
          mat.depthWrite = false;
          mat.alphaTest = 0.5;
          mat.needsUpdate = true;
        });
      }
    });


  return blood_text;
}, [scene]);
  
  return <primitive object={blood} />

}
function Keypad() {
  const { scene } = useGLTF("/models/security_keypad.glb");

  const keypad = useMemo(() => {
    const k = scene.clone();

    k.scale.set(0.15, 0.15, 0.15);

    k.position.set(0.9, 1.25, -3); // x, y, z

    k.rotation.y = -Math.PI / 2;

    return k;
  }, [scene]);

  return <primitive object={keypad} />;
}
function Book({onClick} : BookProps){
  const {scene }= useGLTF("/models/book_open.glb");
  const book = useMemo(() => {
    const b = scene.clone();

    b.scale.set(0.01, 0.01, 0.01);

    b.position.set(-1.2, 1, 1.7); // x, y, z

    b.rotation.y = -Math.PI;

    return b;
  }, [scene]);

  return <primitive object={book} 
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "default")}
/>;
}
function Skeleton(){
  const {scene }= useGLTF("/models/skeleton.glb");
  const skeleton = useMemo(() => {
    const s = scene.clone();

    s.scale.set(0.28, 0.28, 0.28);

    s.position.set(-2.7, 1.1, -0.4); // x, y, z

    s.rotation.y = -Math.PI /0.6;

    return s;
  }, [scene]);

  return <primitive object={skeleton} />;
}
function Ghost(){
  const {scene }= useGLTF("/models/ghost.glb");
  const ghost = useMemo(() => {
    const s = scene.clone();

    s.scale.set(1.5, 1.5, 1.5);

    s.position.set(0.9, 1.1, 0.5); // x, y, z

    s.rotation.y = -Math.PI *0.8;

    return s;
  }, [scene]);

  return <primitive object={ghost} />;
}
//^3d elements

function FirstPersonController() {
  const { camera } = useThree();

  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
  });

  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const frontVector = useRef(new THREE.Vector3());
  const sideVector = useRef(new THREE.Vector3());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyW") setKeys((k) => ({ ...k, w: true }));
      if (e.code === "KeyA") setKeys((k) => ({ ...k, a: true }));
      if (e.code === "KeyS") setKeys((k) => ({ ...k, s: true }));
      if (e.code === "KeyD") setKeys((k) => ({ ...k, d: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW") setKeys((k) => ({ ...k, w: false }));
      if (e.code === "KeyA") setKeys((k) => ({ ...k, a: false }));
      if (e.code === "KeyS") setKeys((k) => ({ ...k, s: false }));
      if (e.code === "KeyD") setKeys((k) => ({ ...k, d: false }));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    // Spawn player ở tầm mắt vừa phải
    camera.position.set(0, 1.35, 2);
  }, [camera]);

  useFrame((_, delta) => {
    const speed = 2.2;

    frontVector.current.set(0, 0, Number(keys.s) - Number(keys.w));
    sideVector.current.set(Number(keys.a) - Number(keys.d), 0, 0);

    direction.current
      .subVectors(frontVector.current, sideVector.current)
      .normalize()
      .multiplyScalar(speed * delta)
      .applyEuler(camera.rotation);

    velocity.current.copy(direction.current);

    camera.position.x += velocity.current.x;
    camera.position.z += velocity.current.z;

    // Giữ mắt người ở cùng độ cao
    camera.position.y = 1.35;
  });

  return <PointerLockControls />;
}

export default function ModelViewer() {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <Canvas
      shadows
      style={{ width: "100vw", height: "100vh" }}
      camera={{ position: [0, 1.35, 2], fov: 75, near: 0.1, far: 1000 }}
    >
      <color attach="background" args={["black"]} />
      <fog attach="fog" args={["#", 4, 14]} />

      <RoomModel />
      <Flashlight />
      <HorrorLights />
      <TV/>
      <BloodText/>
      <Keypad />
      <Book onClick={() => setQuizOpen(true)} />

<QuizPopup
  visible={quizOpen}
  onSubmit={(answer) => {
    console.log("User answered:", answer);
    setQuizOpen(false);
  }}
/>
      <Skeleton/>
      <Ghost/>
      <FirstPersonController />
    </Canvas>
  );
}

useGLTF.preload("/models/horror_room.glb");
useGLTF.preload("/models/vintage_tv_free.glb");
useGLTF.preload("/models/behind_you.glb");
useGLTF.preload("/models/security_keypad.glb");
useGLTF.preload("/models/book_open.glb");
useGLTF.preload("/models/skeleton.glb");
useGLTF.preload("/models/ghost.glb");