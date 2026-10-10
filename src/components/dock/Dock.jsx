import React, { useState, useRef, useEffect } from "react";
import "./Dock.css";
import { tabs } from "../../data/Sections.js";
import { paths } from "../../data/Paths.js";
import { useDesign } from "../../theme/design.js";

export default function Dock({ selected, setSelected }) {
  const design = useDesign();
  const [animateTabs, setAnimateTabs] = useState([]);

  const containerRef = useRef(null);
  const highlightRef = useRef(null);
  const ringRef = useRef(null);
  const underlineRef = useRef(null);

  const moveRing = (tab) => {
    if (!ringRef.current || !containerRef.current) return;
    const tabEl = containerRef.current.querySelector(`[data-tab="${tab}"]`);
    if (!tabEl) return;

    const { offsetLeft, offsetWidth } = tabEl;
    ringRef.current.style.transform = `translateX(${offsetLeft}px)`;
    ringRef.current.style.width = `${offsetWidth}px`;
    ringRef.current.style.opacity = "1";
  };

  const moveHighlight = (tab) => {
    if (!highlightRef.current || !containerRef.current) {
      return;
    }
    const tabEl = containerRef.current.querySelector(`[data-tab="${tab}"]`);
    if (!tabEl) {
      highlightRef.current.style.transform = "translateX(-500px)";
      return;
    }

    const { offsetLeft, offsetWidth } = tabEl;
    highlightRef.current.style.transform = `translateX(${offsetLeft}px)`;
    highlightRef.current.style.width = `${offsetWidth}px`;
  };

  const moveUnderline = (tab) => {
    if (!underlineRef.current || !containerRef.current) return;
    const tabEl = containerRef.current.querySelector(`[data-tab="${tab}"]`);
    if (!tabEl) return;

    const padding = 2.5;
    const { offsetLeft, offsetWidth } = tabEl;
    underlineRef.current.style.transform = `translateX(calc(${offsetLeft}px + ${padding}em))`;
    underlineRef.current.style.width = `calc(${offsetWidth}px - ${
      padding * 2
    }em)`;
  };

  const handleMouseEnter = (tab) => {
    moveRing(tab);
    moveUnderline(tab);
  };

  const handleMouseLeave = () => {
    moveUnderline(selected);
    ringRef.current.style.opacity = "0";
  };

  // Initial animation
  useEffect(() => {
    setTimeout(() => {
      moveUnderline(selected);
      moveHighlight(selected);
    }, 100);

    // Animate dock tabs one by one
    tabs.forEach((_, i) => {
      setTimeout(() => {
        setAnimateTabs((prev) => [...prev, i]);
      }, i * 300); // delay per tab
    });

    const handleResize = () => {
      moveUnderline(selected);
      moveHighlight(selected);
    };

    window.addEventListener("resize", handleResize);
    // Also re-measure when the dock itself changes size, e.g. when switching
    // between the original and Material 3 designs (different font/padding)
    // or when a web font finishes loading.
    // Re-measure whenever any tab changes size: the dock itself can stay the
    // same width while its tabs move (e.g. switching designs, fonts loading).
    const ro = new ResizeObserver(handleResize);
    containerRef.current
      ?.querySelectorAll("[data-tab]")
      .forEach((tab) => ro.observe(tab));
    // And after a design switch: once the new styles apply, and again when the
    // dock's own padding/gap transition finishes (tabs slide, but don't resize).
    const t = setTimeout(handleResize, 50);
    const container = containerRef.current;
    container?.addEventListener("transitionend", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
      clearTimeout(t);
      container?.removeEventListener("transitionend", handleResize);
    };
  }, [selected, design]);

  return (
    <div className="dock-container swoop" ref={containerRef}>
      <div className="dock-highlight" ref={highlightRef} />
      <div className="dock-ring flex justify-between" ref={ringRef} />
      {tabs.map((tab, index) => (
        <a
          key={tab}
          href={paths[tab] || `/${tab.toLowerCase()}`}
          title={`${tab} Section`}
          aria-label={`Navigate to ${tab} Section`}
          data-tab={tab}
          className={`dock-tab ${selected === tab ? "selected" : ""} ${
            animateTabs.includes(index) ? "swoop" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            setSelected(tab);
          }}
          onMouseEnter={() => handleMouseEnter(tab)}
          onMouseLeave={handleMouseLeave}
        >
          {tab}
        </a>
      ))}
      <div
        style={{
          transform: "translateY(30px)",
          position: "absolute",
          bottom: "0",
          zIndex: "10",
        }}
      >
        <div className="dock-underline" ref={underlineRef} />
      </div>
      <div className="dock-underline-full" />
    </div>
  );
}
