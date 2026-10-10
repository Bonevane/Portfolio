import { useEffect, useRef, useState } from "react";
import "./Toggle.css";

export default function ToggleSwitch({ setMiscSection }) {
  const [active, setActive] = useState("Gallery");
  const miscRef = useRef(null);
  const skillsRef = useRef(null);
  const [slideStyle, setSlideStyle] = useState({
    width: 0,
    height: 0,
    left: 0,
  });

  useEffect(() => {
    const activeRef = active === "Gallery" ? miscRef : skillsRef;
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
    <div className="misc-toggle toggle relative flex gap-2 rounded-full border border-[#757575]/70 p-1 bg-[#D9D9D9]/15 overflow-hidden w-fit">
      {/* Sliding background */}
      <div
        className="misc-toggle-slider absolute rounded-full border border-[#757575] bg-[#d9d9d9]/20 transition-all duration-300 ease-in-out"
        style={{
          width: slideStyle.width,
          height: slideStyle.height,
          left: slideStyle.left,
        }}
      />

      {/* Buttons */}
      <button
        ref={miscRef}
        onClick={() => setActive("Gallery")}
        className="toggleBtn relative z-10 text-[#CEC9C9]"
        data-selected={active === "Gallery"}
        aria-pressed={active === "Gallery"}
        style={{ backgroundColor: "transparent" }}
      >
        <span className="misc-toggle-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="1em" height="1em">
            <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" fill="currentColor" />
          </svg>
        </span>
        Gallery
      </button>
      <button
        ref={skillsRef}
        onClick={() => setActive("Skills")}
        className="toggleBtn relative z-10 text-[#CEC9C9]"
        data-selected={active === "Skills"}
        aria-pressed={active === "Skills"}
        style={{ backgroundColor: "transparent" }}
      >
        <span className="misc-toggle-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="1em" height="1em">
            <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" fill="currentColor" />
          </svg>
        </span>
        Skills
      </button>
    </div>
  );
}
