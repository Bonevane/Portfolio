import { useEffect, useLayoutEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
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

useGLTF.preload("/P9P.glb");

function SmartphoneModel({ url = "/P9P.glb" }) {
  const { scene } = useGLTF(url);
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const rootScene = useThree((s) => s.scene);
  const setFrameloop = useThree((s) => s.setFrameloop);
  const [loaded, setLoaded] = useState(false);

  // Hold the render loop until every shader variant is compiled in parallel.
  // Otherwise the first frame compiles ~14 physical materials synchronously,
  // which is the hitch right as the phone starts spinning in.
  useLayoutEffect(() => {
    setFrameloop("never");
  }, [setFrameloop]);

  useEffect(() => {
    let cancelled = false;
    gl.compileAsync(rootScene, camera).then(() => {
      if (cancelled) return;
      setFrameloop("always");
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [gl, rootScene, camera, setFrameloop]);

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
          <ambientLight intensity={0.45} />

          {/* Key: top right, warm-neutral */}
          <directionalLight
            position={[3, 4, 5]}
            intensity={2.6}
            color="#fff3e4"
          />
          {/* Fill: front left, soft and cool */}
          <directionalLight
            position={[-3, 1, 2]}
            intensity={0.7}
            color="#dde7f5"
          />
          {/* Rim: back left, lifts the dark edge off the dark background */}
          <directionalLight
            position={[-2.5, 2, -3]}
            intensity={3.5}
            color="#eaf0fa"
          />
          {/* Back Top */}
          <directionalLight
            position={[0, 1, -2]}
            intensity={8}
            color="#f4f2ee"
          />

          {/* Reflection: Area Lights*/}
          <Environment resolution={256}>
            {/* Long strip overhead: one continuous highlight across glass */}
            <Lightformer
              form="rect"
              intensity={3}
              position={[0, 5, 0.5]}
              scale={[8, 0.8, 1]}
              color="#ffffff"
            />
            {/* Warm right */}
            <Lightformer
              form="rect"
              intensity={3}
              position={[3.5, 1, 3]}
              scale={[3, 2, 1]}
              color="#fff4e0"
            />
            {/* Cool left */}
            <Lightformer
              form="rect"
              intensity={1.8}
              position={[-4, 1.5, 1]}
              scale={[2, 3, 1]}
              color="#d6e4ff"
            />
            {/* Back: feeds the transmission + rear clearcoat */}
            <Lightformer
              form="rect"
              intensity={3}
              position={[0, 2, -3]}
              scale={[4, 3, 1]}
              color="#f0f0f5"
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
