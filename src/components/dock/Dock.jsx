import React, { useState, useRef, useEffect } from "react";
import "./Dock.css";
import { tabs } from "../../data/Sections.js";

export default function Dock({ selected, setSelected }) {
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
    if (!highlightRef.current || !containerRef.current) return;
    const tabEl = containerRef.current.querySelector(`[data-tab="${tab}"]`);
    if (!tabEl) return;

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
    return () => window.removeEventListener("resize", handleResize);
  }, [selected]);

  return (
    <div className="dock-container swoop" ref={containerRef}>
      <div className="dock-highlight" ref={highlightRef} />
      <div className="dock-ring flex justify-between" ref={ringRef} />
      {tabs.map((tab, index) => (
        <div
          key={tab}
          data-tab={tab}
          className={`dock-tab ${selected === tab ? "selected" : ""} ${
            animateTabs.includes(index) ? "swoop" : ""
          }`}
          onClick={() => setSelected(tab)}
          onMouseEnter={() => handleMouseEnter(tab)}
          onMouseLeave={handleMouseLeave}
        >
          {tab}
        </div>
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
