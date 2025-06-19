import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useSpring, a } from "@react-spring/three";
import {
  OrbitControls,
  useGLTF,
  Environment,
  Lightformer,
  Html,
} from "@react-three/drei";
import { Suspense } from "react";
import "./Phone.css";

function SmartphoneModel({ url = "/Oneplus.glb" }) {
  const { scene } = useGLTF(url);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (scene) {
      setLoaded(true);
    }
  }, [scene]);

  const { position, rotation } = useSpring({
    delay: 500,
    from: {
      position: [0.25, 0, 0],
      rotation: [0.5, 3 * Math.PI, 0],
    },
    to: async (next) => {
      if (loaded) {
        await next({
          position: [0, 0, 0],
          rotation: [-Math.PI / 5, -0.3, -0.4],
        });
      }
    },
    config: { mass: 10, tension: 120, friction: 50 },
    immediate: !loaded,
  });

  return (
    <a.primitive
      object={scene}
      scale={1}
      position={position}
      rotation={rotation}
    />
  );
}

export default function Phone() {
  const [fov, setFov] = useState(getFovFromWidth(window.innerWidth));

  useEffect(() => {
    const handleResize = () => {
      setFov(getFovFromWidth(window.innerWidth));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function getFovFromWidth(width) {
    if (width < 640) return 46;
    if (width < 1024) return 36;
    return 30;
  }

  return (
    <div className="phone-container">
      <Canvas camera={{ position: [0, 0.2, 0.5], fov: fov }} dpr={[1.6, 2]}>
        <Suspense
          fallback={
            <Html>
              <div className="font-[Teachers] text-white/80 px-8 py-6 backdrop-blur-md border-[#757575] border rounded-full bg-[#ffffff]/20">
                Loading
              </div>
            </Html>
          }
        >
          <ambientLight intensity={1} />

          {/* Top Right */}
          <directionalLight position={[3, 4, 5]} intensity={2} />
          {/* Front Left */}
          <directionalLight
            position={[-2, 1, 1]}
            intensity={1.2}
            color="#dceeff"
          />
          {/* Back Right */}
          <directionalLight
            position={[1.5, 2, -2]}
            intensity={1.2}
            color="#ccdfff"
          />
          {/* Back Top */}
          <directionalLight
            position={[0, 1, -2]}
            intensity={10}
            color="#e0e0ff"
          />

          {/* Reflection: Area Lights*/}
          <Environment resolution={256}>
            <Lightformer
              intensity={4}
              position={[0, 2, -3]}
              scale={[4, 3, 1]}
              color="#ffffff"
            />

            <Lightformer
              intensity={3}
              position={[3, 1, 3]}
              scale={[3, 2, 1]}
              color="#fffbe7"
            />
            <Lightformer
              intensity={1.5}
              position={[-4, 2, 1]}
              scale={[2, 3, 1]}
              color="#d4e8ff"
            />
          </Environment>

          <SmartphoneModel />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
