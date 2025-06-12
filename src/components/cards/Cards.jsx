import { useEffect, useState } from "react";
import "./Cards.css";

const allCards = [
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
];

export default function Cards() {
  const [centerIndex, setCenterIndex] = useState(0);
  const [prevCenterIndex, setPrevCenterIndex] = useState(0);

  const scrollVelocity = 0.002; // Smaller is slower for real

  const visibleCount = 6;
  const half = Math.floor(visibleCount / 2);

  const handleWheel = (e) => {
    e.preventDefault();
    setCenterIndex((prev) => {
      let next = prev + e.deltaY * scrollVelocity;
      next = Math.max(0, Math.min(allCards.length - 1, next));
      setPrevCenterIndex(prev);
      return next;
    });
  };

  useEffect(() => {
    const handle = (e) => handleWheel(e);
    window.addEventListener("wheel", handle, { passive: false });
    return () => window.removeEventListener("wheel", handle);
  }, []);

  useEffect(() => {
    let frameId;
    const target = allCards.length - 1; // The index you want to animate to
    const speed = 0.05; // Adjust speed to taste
    const centerRef = { current: 0 }; // Local tracker

    const animate = () => {
      centerRef.current += (target - centerRef.current) * speed;

      if (Math.abs(target - centerRef.current) < 0.01) {
        setCenterIndex(target);
        cancelAnimationFrame(frameId);
        return;
      }

      setCenterIndex(centerRef.current);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(frameId);
  }, []);

  const scrollDirection = centerIndex > prevCenterIndex ? "down" : "up";

  return (
    <div className="cards-container absolute bottom-[2rem] right-[8rem] z-0">
      {allCards.map((text, cardIndex) => {
        const offsetStock = cardIndex - centerIndex;
        let offset = offsetStock * 2;
        if (scrollDirection === "down") {
          offset = offsetStock * 1.5;
        } else {
          offset = offsetStock * 1.5;
        }

        if (Math.abs(offset) > half + 1) return null; // Hide far-away cards

        const baseRotation = 5;
        const rotation = baseRotation + offset * 5;
        const translateX = offset * offset * 50;
        const translateY = offset * offset * 25;

        const blur = Math.pow(Math.abs(offset), 2) * 0.6;
        const opacity = 1 - Math.abs(offset) * 0.18;

        return (
          <div
            key={cardIndex}
            className="absolute transition-all duration-[0.5s] ease-out"
            style={{
              transform: `rotate(${-rotation}deg) translateY(${translateY}px) translateX(${translateX}px)`,
              transformOrigin: "bottom right",
              zIndex: cardIndex,
              right: "5rem",
              bottom: "4rem",
            }}
          >
            <div
              className="card h-120 w-100 flex items-center justify-center text-white font-semibold text-xl rounded-3xl shadow-xl backdrop-blur-md bg-[#D9D9D9]/20 border border-[#757575]/70"
              style={{
                filter: `blur(${blur}px)`,
                opacity: opacity,
              }}
            >
              {text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
