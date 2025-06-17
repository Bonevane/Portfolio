import { useRef, useState, useEffect, useMemo } from "react";
import "./Orbit.css";
import { socials, bonevaneIcon } from "../../data/Socials";

export default function Orbit() {
  const centerRef = useRef(null);
  const [offsetY, setOffsetY] = useState(0);
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const baseRotations = useMemo(() => {
    return socials.map((_, i) => i * 40 + Math.floor(Math.random() * 10));
  }, []);

  const iconsPerLayer = 2;

  useEffect(() => {
    if (centerRef.current) {
      const height = centerRef.current.offsetHeight;
      setOffsetY(height / 2);
    }
  }, []);

  const layerConfigs = [
    { radius: 180, duration: 50 },
    { radius: 260, duration: 67 },
    { radius: 345, duration: 80 },
    { radius: 440, duration: 105 },
  ];

  return (
    <div className="fixed top-[-40px] right-[-80px] w-[100vh] h-[100vh] animate-[fadeIn_1s_ease-in_backwards]">
      <div
        className="absolute top-0 right-0 z-10 hover:scale-110 transition-transform duration-400 ease-[cubic-bezier(0.34,2,0.64,1)]"
        ref={centerRef}
      >
        <img
          src={bonevaneIcon}
          alt="Bonevane"
          className="w-82 h-82 rounded-full p-12 border-1 border-[#757575]/50 bg-[#84AEFF]/25 backdrop-blur-xl"
        />
        <img
          src={bonevaneIcon}
          alt="Bonevane"
          className="absolute top-0 right-0 w-82 h-82 rounded-full p-12 z-[-1]"
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
                    className="absolute left-0 top-0 w-20 h-20 rounded-full translate-x-[-50%] translate-y-[-50%]"
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
                        className="w-full h-full p-4"
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
