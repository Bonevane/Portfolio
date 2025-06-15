import { useRef, useState, useEffect } from "react";
import "./Orbit.css";
import { socials, bonevaneIcon } from "../../data/Socials";

export default function Orbit() {
  const centerRef = useRef(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    if (centerRef.current) {
      const height = centerRef.current.offsetHeight;
      setOffsetY(height / 2);
    }
  }, []);

  const layerConfigs = [
    { radius: 180, duration: 20 },
    { radius: 260, duration: 25 },
    { radius: 350, duration: 30 },
    { radius: 440, duration: 35 },
  ];

  return (
    <div className="fixed top-[-40px] right-[-80px] w-[100vh] h-[100vh] z-40">
      <div
        className="absolute top-0 right-0 z-10 hover:scale-110 transition-transform"
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
      <div
        className="absolute top-0 right-0 w-82 h-82 border-1 border-[#757575]/50 rounded-full z-[-1]"
        style={{ transform: "scale(1.55)" }}
      />
      <div
        className="absolute top-0 right-0 w-82 h-82 border-1 border-[#757575]/30 rounded-full z-[-1]"
        style={{ transform: "scale(2.25)" }}
      />
      <div
        className="absolute top-0 right-0 w-82 h-82 border-1 border-[#757575]/20 rounded-full z-[-1]"
        style={{ transform: "scale(3.025)" }}
      />
      <div
        className="absolute top-0 right-0 w-82 h-82 border-1 border-[#757575]/10 rounded-full z-[-1]"
        style={{ transform: "scale(3.8)" }}
      />
      {socials.map((social, i) => {
        const iconsPerLayer = 2;
        const layer = Math.floor(i / iconsPerLayer);
        const { radius, duration } = layerConfigs[layer];

        return (
          <div
            key={social.name}
            className="absolute top-0 right-0"
            style={{
              "--start-rotation": `${i * 45}deg`,
              width: radius * 2,
              height: radius * 2,
              marginRight: -radius + offsetY,
              marginTop: -radius + offsetY,
              animation: `orbit ${duration}s linear infinite`,
              willChange: "transform",
              pointerEvents: "none",
            }}
          >
            <a
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-20 h-20 absolute rounded-full border-1 border-[#757575]/80 left-0 top-0 hover:scale-110 transition-transform z-10 backdrop-blur-md"
              style={{
                backgroundColor: `#${social.color}40`,
                pointerEvents: "all",
                animation: `orbit-reverse ${duration}s linear infinite`,
              }}
            >
              <img
                src={social.icon}
                alt={social.name}
                className="w-20 h-20 p-4"
              />
            </a>
          </div>
        );
      })}
    </div>
  );
}
