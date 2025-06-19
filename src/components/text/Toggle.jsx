import { useEffect, useRef, useState } from "react";
import "./Toggle.css";

export default function ToggleSwitch({ setMiscSection }) {
  const [active, setActive] = useState("Misc");
  const miscRef = useRef(null);
  const skillsRef = useRef(null);
  const [slideStyle, setSlideStyle] = useState({
    width: 0,
    height: 0,
    left: 0,
  });

  useEffect(() => {
    const activeRef = active === "Misc" ? miscRef : skillsRef;
    if (activeRef.current) {
      const { offsetWidth, offsetHeight, offsetLeft } = activeRef.current;
      setSlideStyle({
        width: offsetWidth,
        height: offsetHeight,
        left: offsetLeft,
      });
      setMiscSection(active);
    }
  }, [active, setMiscSection]);

  return (
    <div className="toggle relative flex gap-2 rounded-full border border-[#757575]/70 p-1 bg-[#D9D9D9]/15 overflow-hidden w-fit">
      {/* Sliding background */}
      <div
        className="absolute rounded-full border border-[#757575] bg-[#d9d9d9]/20 transition-all duration-300 ease-in-out"
        style={{
          width: slideStyle.width,
          height: slideStyle.height,
          left: slideStyle.left,
        }}
      />

      {/* Buttons */}
      <button
        ref={miscRef}
        onClick={() => setActive("Misc")}
        className="toggleBtn relative z-10 text-[#CEC9C9]"
        style={{ backgroundColor: "transparent" }}
      >
        Misc
      </button>
      <button
        ref={skillsRef}
        onClick={() => setActive("Skills")}
        className="toggleBtn relative z-10 text-[#CEC9C9]"
        style={{ backgroundColor: "transparent" }}
      >
        Skills
      </button>
    </div>
  );
}
