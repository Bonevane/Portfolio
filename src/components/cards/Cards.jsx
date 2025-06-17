import { useEffect, useState } from "react";
import { cards } from "../../data/sections";
import "./Cards.css";

export default function Cards({ setCardSection }) {
  const [centerIndex, setCenterIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [prevCardSection, setPrevCardSection] = useState(0);
  const [animComplete, setAnimComplete] = useState(false);

  const scrollVelocity = 0.002;

  const visibleCount = 6;
  const half = Math.floor(visibleCount / 2);

  const handleWheel = (e) => {
    e.preventDefault();
    setCenterIndex((prev) => {
      let next = prev + e.deltaY * scrollVelocity;
      next = Math.max(0, Math.min(cards.length - 1, next));
      return next;
    });
  };

  useEffect(() => {
    setCardSection(cards[cards.length - 1].section);
    setPrevCardSection(cards[cards.length - 1].section);
  }, [setCardSection]);

  useEffect(() => {
    if (!animComplete) return;
    const progress = Math.round(centerIndex);
    if (cards[progress].section != prevCardSection) {
      setCardSection(cards[progress].section);
    }
    setPrevCardSection(cards[progress].section);
  }, [centerIndex, setCardSection, prevCardSection, animComplete]);

  useEffect(() => {
    const handle = (e) => handleWheel(e);

    let touchStartY = 0;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const deltaY = touchStartY - e.touches[0].clientY;
      if (Math.abs(deltaY) < 10) return;

      handleWheel({
        deltaY,
        preventDefault: () => e.preventDefault(),
      });
    };

    window.addEventListener("wheel", handle, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handle);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  useEffect(() => {
    let frameId;
    const target = cards.length - 1; // The index you want to animate to
    const speed = 0.05; // Adjust speed to taste
    const centerRef = { current: 0 }; // Local tracker

    const animate = () => {
      centerRef.current += (target - centerRef.current) * speed;

      if (Math.abs(target - centerRef.current) < 0.01) {
        setCenterIndex(target);
        cancelAnimationFrame(frameId);
        setAnimComplete(true);
        return;
      }

      setCenterIndex(centerRef.current);
      frameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="cards-container fixed bottom-[2em] right-[8em] z-10 w-[100vw] h-[100vh]">
      {cards.map((text, cardIndex) => {
        const offset = (cardIndex - centerIndex) * 1.5;
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
              transform: " scale(1.15) rotate(0deg) translateX(8%)",
              zIndex: 9999,
              transition: "all 0.5s ease",
            }
          : {};

        const cardContent = (
          <div className="text-left text-[#B5B5B5] text-[3.4vh] flex flex-col justify-between h-full">
            <div className="py-3 px-4">
              <div className="flex mb-2 gap-4">
                <h2 className="text-[1em] font-[ElMessiri]">Aperture</h2>
                <div className="flex justify-between items-center gap-2 w-full">
                  <div className="flex gap-2">
                    <h2 className="live-btn">Live</h2>
                    <h2 className="live-btn">Live</h2>
                  </div>
                  {!isSelected && (
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
                        fillOpacity="0.9"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-[0.6em] font-normal ">
                A 2D Hyper-Casual Puzzle game built in Unity. Based on “Portal”
                from Valve.
              </p>
            </div>
            <div className="pb-4 px-4 flex gap-2 justify-between flex-wrap">
              <h2 className="project-tag">Unity</h2>
              <h2 className="project-tag">HLSL</h2>
              <h2 className="project-tag">Tailwind</h2>
            </div>
          </div>
        );

        return (
          <div
            key={cardIndex}
            className="card-origin absolute transition-all duration-[0.5s] ease-out"
            onClick={() => {
              isSelected ? setSelectedCard(null) : setSelectedCard(cardIndex);
            }}
            style={{
              transform: `rotate(${-rotation}deg) translateY(${translateY}px) translateX(${translateX}px)`,
              transformOrigin: "bottom right",
              zIndex: cardIndex,
              ...expandedStyle,
            }}
          >
            <div
              className={`card flex-col text-white font-semibold text-xl rounded-3xl shadow-xl backdrop-blur-md border border-[#757575]/70`}
              style={{
                filter: isSelected ? undefined : `blur(${blur}px)`,
                opacity: isSelected ? 1 : opacity,
                padding: "0",
                justifyContent: "normal",
              }}
            >
              <div
                className="slideIn relative w-full"
                style={{
                  paddingTop: isSelected ? "56.25%" : "0%",
                  opacity: isSelected ? 1 : 0,
                }}
              >
                <img
                  src="../FeatureLarge.jpg"
                  alt="Project Thumbnail"
                  className={`absolute top-0 left-0 w-full h-full object-cover ${
                    isSelected ? "border-b border-[#757575]/70" : ""
                  }  rounded-t-3xl`}
                />
              </div>
              {cardContent}
            </div>
          </div>
        );
      })}
    </div>
  );
}
