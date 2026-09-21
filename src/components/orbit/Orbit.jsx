import { Fragment, useRef, useState, useEffect, useMemo } from "react";
import { socials, bonevaneIcon } from "../../data/Socials";
import "./Orbit.css";

export default function Orbit() {
  const centerRef = useRef(null);
  const [offsetY, setOffsetY] = useState(0);
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const [layerConfigs, setLayerConfigs] = useState([
    // Needs to be here because react and shi
    { radius: 120, duration: 50 },
    { radius: 190, duration: 67 },
    { radius: 260, duration: 80 },
    { radius: 350, duration: 105 },
  ]);

  const baseRotations = useMemo(() => {
    return socials.map((_, i) => i * 40 + Math.floor(Math.random() * 10));
  }, []);

  const iconsPerLayer = 2;

  useEffect(() => {
    if (centerRef.current) {
      const height = centerRef.current.offsetHeight;
      setOffsetY(height / 2);
    }
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // limit x -> smth or whatever idk
    const padding = 120;
    const maxSize = Math.min(screenWidth * 1.4, screenHeight);
    const minCircle = Math.min(screenWidth * 0.6, screenHeight * 0.4) - padding;
    const layerCount = Math.ceil(socials.length / iconsPerLayer);

    const radiusStep = (maxSize - minCircle) / (layerCount + 4);
    const generatedLayers = Array.from({ length: layerCount }, (_, i) => ({
      radius: minCircle + i * radiusStep + i * i * (radiusStep / 10),
      duration: 50 + i * 20,
    }));

    setLayerConfigs(generatedLayers);
  }, []);

  return (
    <div className="fixed top-[-40px] right-[-80px] w-[100vw] h-[100vh] animate-[fadeIn_1s_ease-in_backwards]">
      <div
        className="group absolute top-0 right-0 z-10 hover:scale-110 transition-transform duration-400 ease-[cubic-bezier(0.34,2,0.64,1)] cursor-pointer"
        ref={centerRef}
      >
        <span className="orbit-tooltip left-1/2 top-full mt-3">
          That&apos;s me
        </span>
        <img
          src={bonevaneIcon}
          alt="Bonevane"
          className="bonevane w-[56vw] h-[56vw] max-w-[40vh] max-h-[40vh] rounded-full p-12 border-1 border-[#757575]/50 bg-[#84AEFF]/25 backdrop-blur-xl"
        />
        <img
          src={bonevaneIcon}
          alt="Bonevane"
          className="bonevane absolute top-0 right-0 w-[56vw] h-[56vw] max-w-[40vh] max-h-[40vh] rounded-full p-12 z-[-1]"
        />
      </div>
      {/* Orbit rings: static. A rotating circle looks identical, so no animation. */}
      {socials.map((social, i) => {
        const layer = Math.floor(i / iconsPerLayer);
        if (i % iconsPerLayer !== 0) return null;
        const { radius } = layerConfigs[layer];
        // The old markup stacked two identical rings per layer; one ring at
        // the equivalent composited alpha looks the same.
        const stacked = (a) => 1 - (1 - a) * (1 - a);
        const orbitAlpha = stacked(0.3 - layer * 0.08);
        const hoverAlpha = stacked(0.6);
        const size = radius * 2 * 1.42;

        return (
          <div
            key={`ring-${layer}`}
            className="absolute top-0 right-0 rounded-full z-[-10] pointer-events-none"
            style={{
              width: size,
              height: size,
              marginRight: -size / 2 + offsetY,
              marginTop: -size / 2 + offsetY,
              border: `1px solid rgba(117, 117, 117, ${
                hoveredLayer === layer ? hoverAlpha : orbitAlpha
              })`,
              transition: "border 0.2s ease",
            }}
          ></div>
        );
      })}
      {/* Icons. Angle and radius live on static wrappers; the keyframes only
          spin 0->360 with no custom properties (WebKit resolves var() inside
          @keyframes unreliably). Every wrapper is 0x0, so there are no large
          rotating layers. */}
      {socials.map((social, i) => {
        const layer = Math.floor(i / iconsPerLayer);
        const { radius, duration } = layerConfigs[layer];
        const baseRotation = baseRotations[i];
        const entrance = "3s cubic-bezier(0.1,0.9,0.64,1)";

        return (
          <Fragment key={social.name}>
          {[0, 120, 240].map((offset, j) => {
          // The old layout parked each icon at the corner of a rotating disc,
          // i.e. at radius r*sqrt(2) and a 225deg phase. Keep that exact orbit.
          const rotation = baseRotation + offset + 225;

          return (
            <div
              key={`${social.name}-${j}`}
              className="orbit-icon absolute top-0 right-0 w-0 h-0"
              style={{
                marginRight: offsetY,
                marginTop: offsetY,
                transform: `rotate(${rotation}deg)`,
                pointerEvents: "none",
              }}
            >
              <div
                className="w-0 h-0"
                style={{
                  animation: `orbitIn ${entrance}, orbit ${duration}s linear infinite 2.92s`,
                }}
              >
                <div
                  className="w-0 h-0"
                  style={{ transform: `translateX(${radius * Math.SQRT2}px)` }}
                >
                  <div
                    className="relative w-0 h-0"
                    style={{
                      animation: `orbitInReverse ${entrance}, orbit-reverse ${duration}s linear infinite 2.92s`,
                    }}
                  >
                    <div
                      className="group absolute left-0 top-0 w-[16vw] h-[16vw] max-w-20 max-h-20 rounded-full translate-x-[-50%] translate-y-[-50%]"
                      style={{ transform: `rotate(${-rotation}deg)` }}
                    >
                      <span className="orbit-tooltip left-1/2 top-full mt-2">
                        {social.tooltip ?? social.name}
                      </span>
                      <a
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-full absolute rounded-full border-1 border-[#757575]/80 left-0 top-0 hover:scale-110 transition-transform duration-400 ease-[cubic-bezier(0.34,2,0.64,1)] z-10"
                        onMouseEnter={() => setHoveredLayer(layer)}
                        onMouseLeave={() => setHoveredLayer(null)}
                        style={{
                          backgroundColor: `color-mix(in srgb, #${social.color} 28%, #14201c)`,
                          pointerEvents: "all",
                        }}
                      >
                        <img
                          src={social.icon}
                          alt={social.name}
                          className="w-full h-full p-[20%]"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
          })}
          </Fragment>
        );
      })}
    </div>
  );
}
