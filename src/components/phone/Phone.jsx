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

function SmartphoneModel({ url = "/Pixel_6.glb" }) {
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

  // Optional material enhancement
  //   useEffect(() => {
  //     scene.traverse((child) => {
  //       if (child.isMesh && child.material) {
  //         child.material.metalness = 0.8;
  //         child.material.roughness = 0.1;
  //       }
  //     });
  //   }, [scene]);

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
  return (
    <div className="fixed top-0 right-0 w-[50vw] h-[100vh] z-50">
      <Canvas camera={{ position: [0, 0, 0.5], fov: 30 }}>
        <Suspense
          fallback={
            <Html>
              <div className="font-[Teachers] text-white/80 px-8 py-6 backdrop-blur-md border-[#757575] border rounded-full bg-[#ffffff]/20">
                Loading
              </div>
            </Html>
          }
        >
          {/* LIGHTING */}
          <ambientLight intensity={0.8} />

          {/* Soft Key Light front-top-right */}
          <directionalLight position={[3, 4, 5]} intensity={1.2} />

          {/* Rim Light */}
          <Lightformer
            position={[-4, 2, -3]}
            intensity={1}
            color={"#ccccff"}
            visible={false}
          />

          {/* Reflections */}
          <Environment resolution={256}>
            <Lightformer
              intensity={3}
              position={[0, 5, -5]}
              scale={[5, 5, 1]}
            />
            <Lightformer
              intensity={2}
              position={[5, 1, 2]}
              scale={[2, 3, 1]}
              color="white"
            />
            <Lightformer
              intensity={1.5}
              position={[-5, 2, 1]}
              scale={[2, 2, 1]}
              color="skyblue"
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
