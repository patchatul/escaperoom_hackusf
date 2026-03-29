import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef, useState, useMemo } from "react";
import QuizPopUp from "./QuizPopUp.tsx";

// ─── Quiz data — 5 questions, one per object ───────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    id: "book",
    question: "What is written on the first page of the old book?",
  },
  { id: "keypad", question: "What 4-digit code is carved into the wall?" },
  { id: "tv", question: "What face appears on the TV screen?" },
  { id: "skeleton", question: "How many bones are in the adult human body?" },
  { id: "ghost", question: "What year is engraved on the ghost's locket?" },
];

// Correct answers (lowercase for comparison)
const CORRECT_ANSWERS: Record<string, string> = {
  book: "death",
  keypad: "1313",
  tv: "yours",
  skeleton: "206",
  ghost: "1887",
};

// ─── Floating "?" marker — always visible, bobs up and down ───────────────────
function FloatingMarker({
  position,
  onClick,
  solved,
}: {
  position: [number, number, number];
  onClick: () => void;
  solved: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // We animate via JS in useFrame rather than CSS so it stays in sync with R3F
  const t = useRef(Math.random() * Math.PI * 2); // random phase offset per marker

  useFrame((_, delta) => {
    t.current += delta * 1.8;
    if (ref.current) {
      const offset = Math.sin(t.current) * 6; // ±6px bob
      ref.current.style.transform = `translateY(${offset}px)`;
    }
  });

  if (solved) return null;

  return (
    <Html position={position} center occlude={false} zIndexRange={[100, 0]}>
      <div
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        style={{
          cursor: "pointer",
          fontSize: "28px",
          fontWeight: "900",
          color: "#fff",
          textShadow: "0 0 12px #000, 0 0 4px rgba(0,0,0,0.9)",
          userSelect: "none",
          lineHeight: 1,
          padding: "4px 8px",
          background: "rgba(0,0,0,0.55)",
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.6)",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ?
      </div>
    </Html>
  );
}

// ─── Room model — exact from original ─────────────────────────────────────────
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
    scene.position.x -= center.x;
    scene.position.z -= center.z;
    scene.position.y -= newBox.min.y;

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

// ─── Flashlight — exact from original ─────────────────────────────────────────
function Flashlight() {
  const { camera, scene } = useThree();
  const lightRef = useRef<THREE.SpotLight>(null);

  useEffect(() => {
    if (lightRef.current) {
      const target = new THREE.Object3D();
      scene.add(target);
      lightRef.current.target = target;
    }
  }, [scene]);

  useFrame(() => {
    if (!lightRef.current) return;
    lightRef.current.position.copy(camera.position);
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const targetPos = camera.position.clone().add(direction.multiplyScalar(5));
    lightRef.current.target.position.copy(targetPos);
    lightRef.current.target.updateMatrixWorld();
  });

  return (
    <spotLight
      ref={lightRef}
      intensity={80}
      angle={0.5}
      penumbra={1.5}
      distance={15}
      decay={1}
      color="#ffffff"
      castShadow
    />
  );
}

// ─── Horror lights — exact from original ──────────────────────────────────────
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
      <ambientLight intensity={0.4} />
      <pointLight
        ref={ceilingLight}
        position={[0.4, 2.1, 0.1]}
        intensity={5}
        distance={10}
        decay={2}
        color="#ffed91"
        castShadow
      />
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
      <pointLight
        ref={redLight}
        position={[-2, 2, -2]}
        intensity={5}
        distance={5}
        decay={2}
        color="#7a0000"
      />
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

// ─── Props — all exact from original code ─────────────────────────────────────

function TV() {
  const { scene } = useGLTF("/models/vintage_tv_free.glb");
  const tv = useMemo(() => {
    const tv_clone = scene.clone();
    const box = new THREE.Box3().setFromObject(tv_clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const desiredSize = 1.2;
    const scale = desiredSize / maxDim;
    tv_clone.scale.setScalar(scale);
    const newBox = new THREE.Box3().setFromObject(tv_clone);
    const center = newBox.getCenter(new THREE.Vector3());
    tv_clone.position.x -= center.x;
    tv_clone.position.z -= center.z;
    tv_clone.position.y -= newBox.min.y;
    tv_clone.position.x += 2.5;
    tv_clone.position.z += 1;
    tv_clone.rotation.y = -Math.PI * 0.5;
    return tv_clone;
  }, [scene]);
  return <primitive object={tv} />;
}

function BloodText() {
  const { scene } = useGLTF("/models/behind_you.glb");
  const blood = useMemo(() => {
    const blood_text = scene.clone();
    blood_text.scale.set(0.2, 0.2, 0.2);
    blood_text.position.set(3, 1.8, 0.8);
    blood_text.rotation.y = Math.PI;
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
  return <primitive object={blood} />;
}

function Keypad() {
  const { scene } = useGLTF("/models/security_keypad.glb");
  const keypad = useMemo(() => {
    const k = scene.clone();
    k.scale.set(0.15, 0.15, 0.15);
    k.position.set(0.9, 1.25, -3);
    k.rotation.y = -Math.PI / 2;
    return k;
  }, [scene]);
  return <primitive object={keypad} />;
}

function Book({ onClick }: { onClick: () => void }) {
  const { scene } = useGLTF("/models/book_open.glb");
  const book = useMemo(() => {
    const b = scene.clone();
    b.scale.set(0.01, 0.01, 0.01);
    b.position.set(-1.2, 1, 1.7);
    b.rotation.y = -Math.PI;
    return b;
  }, [scene]);
  return (
    <primitive
      object={book}
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "default")}
    />
  );
}

function Skeleton() {
  const { scene } = useGLTF("/models/skeleton.glb");
  const skeleton = useMemo(() => {
    const s = scene.clone();
    s.scale.set(0.28, 0.28, 0.28);
    s.position.set(-2.7, 1.1, -0.4);
    s.rotation.y = -Math.PI / 0.6;
    return s;
  }, [scene]);
  return <primitive object={skeleton} />;
}

function Ghost() {
  const { scene } = useGLTF("/models/ghost.glb");
  const ghost = useMemo(() => {
    const s = scene.clone();
    s.scale.set(1.5, 1.5, 1.5);
    s.position.set(0.9, 1.1, 0.5);
    s.rotation.y = -Math.PI * 0.8;
    return s;
  }, [scene]);
  return <primitive object={ghost} />;
}

// ─── First-person controller — exact from original, + locked prop ──────────────
function FirstPersonController({ locked }: { locked: boolean }) {
  const { camera } = useThree();
  const keys = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    camera.position.set(0, 1.35, 2);
  }, [camera]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyW") keys.current.w = true;
      if (e.code === "KeyA") keys.current.a = true;
      if (e.code === "KeyS") keys.current.s = true;
      if (e.code === "KeyD") keys.current.d = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW") keys.current.w = false;
      if (e.code === "KeyA") keys.current.a = false;
      if (e.code === "KeyS") keys.current.s = false;
      if (e.code === "KeyD") keys.current.d = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const frontVector = useRef(new THREE.Vector3());
  const sideVector = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (locked) return;
    const speed = 2.2;
    frontVector.current.set(
      0,
      0,
      Number(keys.current.s) - Number(keys.current.w),
    );
    sideVector.current.set(
      Number(keys.current.a) - Number(keys.current.d),
      0,
      0,
    );
    direction.current
      .subVectors(frontVector.current, sideVector.current)
      .normalize()
      .multiplyScalar(speed * delta)
      .applyEuler(camera.rotation);
    velocity.current.copy(direction.current);
    camera.position.x += velocity.current.x;
    camera.position.z += velocity.current.z;
    camera.position.y = 1.35;
  });

  return <PointerLockControls />;
}

// ─── Marker positions — floats above each object, matching original positions ──
// Each marker is placed slightly above the object it belongs to.
const MARKER_POSITIONS: Record<string, [number, number, number]> = {
  book: [-1.2, 1.6, 1.7],
  keypad: [0.9, 1.7, -3.0],
  tv: [2.5, 1.8, 1.0],
  skeleton: [-2.7, 2.0, -0.4],
  ghost: [0.9, 2.0, 0.5],
};

// ─── Root component ────────────────────────────────────────────────────────────
export default function ModelViewer({
  onFinish,
  username,
}: {
  onFinish: () => void;
  username?: string;
}) {
  // Which question is currently being asked (null = none open)
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  // Which objects have been solved correctly
  const [solved, setSolved] = useState<Set<string>>(new Set());
  // Count of correct answers
  const [correctCount, setCorrectCount] = useState(0);
  // Navigate to ending
  const [goToEnding, setGoToEnding] = useState(false);

  const openQuiz = (id: string) => {
    setActiveQuestion(id);
    document.exitPointerLock?.();
  };

  const handleSubmit = (answer: string) => {
    if (!activeQuestion) return;
    const correct = CORRECT_ANSWERS[activeQuestion];
    const isRight = answer.trim().toLowerCase() === correct.toLowerCase();

    if (isRight) {
      const newSolved = new Set(solved);
      newSolved.add(activeQuestion);
      setSolved(newSolved);
      const newCount = correctCount + 1;
      setCorrectCount(newCount);
      setActiveQuestion(null);
      if (newCount >= 5) {
        // All 5 correct — go to ending after short delay
        setTimeout(() => setGoToEnding(true), 800);
      }
    } else {
      // Wrong answer — keep popup open (QuizPopup will handle feedback)
    }
  };

  // Navigate to ending page
  if (goToEnding) {
    onFinish();
    return null;
  }

  const currentQuestion = QUIZ_QUESTIONS.find((q) => q.id === activeQuestion);

  return (
    <>
      {/* Quiz popup — lives in normal DOM, always screen-centered */}
      <QuizPopUp
        visible={!!activeQuestion}
        question={currentQuestion?.question}
        correctAnswer={activeQuestion ? CORRECT_ANSWERS[activeQuestion] : ""}
        solvedCount={correctCount}
        onSubmit={handleSubmit}
        onClose={() => setActiveQuestion(null)}
        username={username}
      />

      <Canvas
        shadows
        style={{ width: "100vw", height: "100vh" }}
        camera={{ position: [0, 1.35, 2], fov: 75, near: 0.1, far: 1000 }}
      >
        <color attach="background" args={["black"]} />
        <fog attach="fog" args={["#000000", 4, 14]} />

        <RoomModel />
        <Flashlight />
        <HorrorLights />
        <TV />
        <BloodText />
        <Keypad />
        <Book onClick={() => openQuiz("book")} />
        <Skeleton />
        <Ghost />

        {/* Floating "?" markers — one per object, always visible, bob up/down */}
        {QUIZ_QUESTIONS.map((q) => (
          <FloatingMarker
            key={q.id}
            position={MARKER_POSITIONS[q.id]}
            onClick={() => openQuiz(q.id)}
            solved={solved.has(q.id)}
          />
        ))}

        <FirstPersonController locked={!!activeQuestion} />
      </Canvas>
    </>
  );
}

useGLTF.preload("/models/horror_room.glb");
useGLTF.preload("/models/vintage_tv_free.glb");
useGLTF.preload("/models/behind_you.glb");
useGLTF.preload("/models/security_keypad.glb");
useGLTF.preload("/models/book_open.glb");
useGLTF.preload("/models/skeleton.glb");
useGLTF.preload("/models/ghost.glb");
