import { useRef, useState, useEffect, useMemo } from "react";
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
        className="absolute top-0 right-0 z-10 hover:scale-110 transition-transform duration-400 ease-[cubic-bezier(0.34,2,0.64,1)]"
        ref={centerRef}
      >
        <img
          src={bonevaneIcon}
          alt="Bonevane"
          className="w-[56vw] h-[56vw] max-w-[40vh] max-h-[40vh] rounded-full p-12 border-1 border-[#757575]/50 bg-[#84AEFF]/25 backdrop-blur-xl"
        />
        <img
          src={bonevaneIcon}
          alt="Bonevane"
          className="absolute top-0 right-0 w-[56vw] h-[56vw] max-w-[40vh] max-h-[40vh] rounded-full p-12 z-[-1]"
        />
      </div>
      {socials.map((social, i) => {
        const layer = Math.floor(i / iconsPerLayer);
        const { radius, duration } = layerConfigs[layer];
        const orbitAlpha = 0.3 - layer * 0.08;

        return (
          <div
            key={social.name}
            className="absolute top-0 right-0"
            style={{
              width: radius * 2,
              height: radius * 2,
              marginRight: -radius + offsetY,
              marginTop: -radius + offsetY,
              animation: `orbit ${duration}s linear infinite`,
              willChange: "transform",
              pointerEvents: "none",
            }}
          >
            {/* Orbit Circle */}
            <div
              className="absolute left-0 top-0 w-full h-full rounded-full z-[-10]"
              style={{
                border: `1px solid rgba(117, 117, 117, ${
                  hoveredLayer === layer ? 0.6 : orbitAlpha
                })`,
                transform: `scale(1.42)`,
                transition: "border 0.2s ease",
              }}
            ></div>
          </div>
        );
      })}
      {socials.map((social, i) => {
        const layer = Math.floor(i / iconsPerLayer);
        const { radius, duration } = layerConfigs[layer];
        const baseRotation = baseRotations[i];

        return (
          <div
            key={social.name}
            className="absolute top-0 right-0"
            style={{
              width: radius * 2,
              height: radius * 2,
              marginRight: -radius + offsetY,
              marginTop: -radius + offsetY,
              animation: `orbitIn ${3}s cubic-bezier(0.1,0.9,0.64,1), orbit ${duration}s linear infinite ${2.92}s`,
              willChange: "transform",
              pointerEvents: "none",
            }}
          >
            {[0, 120, 240].map((offset, j) => {
              const rotation = baseRotation + offset;

              return (
                <div
                  className="absolute left-0 top-0 w-full h-full rounded-full z-[1]"
                  style={{
                    "--start-rotation": `${rotation}deg`,
                    transform: `rotate(${rotation}deg)`,
                  }}
                >
                  <div
                    key={`${social.name}-${j}`}
                    className="absolute left-0 top-0 w-[16vw] h-[16vw] max-w-20 max-h-20 rounded-full translate-x-[-50%] translate-y-[-50%]"
                    style={{
                      animation: `orbitInReverse ${3}s cubic-bezier(0.1,0.9,0.64,1), orbit-reverse ${duration}s linear infinite ${2.92}s`,
                    }}
                  >
                    <a
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full absolute rounded-full border-1 border-[#757575]/80 left-0 top-0 hover:scale-110 transition-transform duration-400 ease-[cubic-bezier(0.34,2,0.64,1)] z-10 backdrop-blur-md"
                      onMouseEnter={() => setHoveredLayer(layer)}
                      onMouseLeave={() => setHoveredLayer(null)}
                      style={{
                        backgroundColor: `#${social.color}40`,
                        pointerEvents: "all",
                      }}
                    >
                      <img
                        src={social.icon}
                        alt={social.name}
                        className="w-full h-full p-[20%]"
                        style={{}}
                      />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
