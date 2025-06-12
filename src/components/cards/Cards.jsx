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
  const [selectedCard, setSelectedCard] = useState(null);

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

        const isSelected = selectedCard === cardIndex;

        if (Math.abs(offset) > half + 1 && !isSelected) return null; // Hide far-away cards

        const baseRotation = 5;
        const rotation = baseRotation + offset * 5;
        const translateX = offset * offset * 50;
        const translateY = offset * offset * 25;

        const blur = Math.pow(Math.abs(offset), 2) * 0.6;
        const opacity = 1 - Math.abs(offset) * 0.18;

        const expandedStyle = isSelected
          ? {
              transform: " scale(1.2) rotate(0deg)",
              zIndex: 9999,
              transition: "all 0.5s ease",
            }
          : {};

        return (
          <div
            key={cardIndex}
            className="absolute transition-all duration-[0.5s] ease-out"
            onClick={() => {
              isSelected ? setSelectedCard(null) : setSelectedCard(cardIndex);
            }}
            style={{
              transform: `rotate(${-rotation}deg) translateY(${translateY}px) translateX(${translateX}px)`,
              transformOrigin: "bottom right",
              zIndex: cardIndex,
              right: "5rem",
              bottom: "4rem",
              ...expandedStyle,
            }}
          >
            {isSelected ? (
              <div
                className="card flex-col h-120 w-100 text-white font-semibold text-xl rounded-3xl shadow-xl backdrop-blur-md border border-[#757575]/70"
                style={{
                  padding: "0",
                  justifyContent: "normal",
                }}
              >
                {/* 16:9 Image */}
                <div
                  className="relative w-full"
                  style={{ paddingTop: "56.25%" }}
                >
                  <img
                    src="../FeatureLarge.jpg"
                    alt="Project Thumbnail"
                    className="absolute top-0 left-0 w-full h-full object-cover border-b border-[#757575]/70 rounded-t-3xl"
                  />
                </div>
                <div className="text-left text-[#B5B5B5] flex flex-col justify-between h-full">
                  {/* Heading and Description */}
                  <div className="p-4">
                    <div className="flex mb-2 gap-4">
                      <h2 className="text-3xl font-[ElMessiri]">Aperture</h2>
                      <h2 className="live-btn">Live</h2>
                    </div>
                    <p className="text-xl font-normal ">
                      A 2D Hyper-Casual Puzzle game built in Unity. Based on
                      “Portal” from Valve.
                    </p>
                  </div>

                  <div className="pb-4 px-4 flex gap-2 justify-between flex-wrap">
                    <h2 className="project-tag">Unity</h2>
                    <h2 className="project-tag">HLSL</h2>
                    <h2 className="project-tag">Tailwind</h2>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="card h-120 w-100 text-white font-semibold text-xl rounded-3xl shadow-xl backdrop-blur-md bg-[#D9D9D9]/20 border border-[#757575]/70"
                style={{
                  filter: `blur(${blur}px)`,
                  opacity: opacity,
                }}
              >
                <div>{text}</div>

                <div style={{}} className="py-2">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 35 35"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M28.3546 1.82294C30.889 1.96936 32.9114 3.99181 33.0579 6.52625L34.3849 29.4963C34.6499 34.0837 29.1068 36.5694 25.8576 33.3202L1.56055 9.02315C-1.68861 5.77399 0.797104 0.23093 5.38446 0.495944L28.3546 1.82294Z"
                      fill="#D9D9D9"
                      fill-opacity="0.9"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
