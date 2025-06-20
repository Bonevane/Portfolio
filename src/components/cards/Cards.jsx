import { useEffect, useState, useRef } from "react";
import { cards } from "../../data/Cards.js";
import "./Cards.css";

export default function Cards({ setCardSection }) {
  const [centerIndex, setCenterIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [prevCardSection, setPrevCardSection] = useState(0);
  const [animComplete, setAnimComplete] = useState(false);
  const touchVelocityRef = useRef(0);
  const decayFrame = useRef(null);

  const wheelScrollFactor = 0.002;
  const visibleCount = 6;
  const half = Math.floor(visibleCount / 2);

  // Vibration for Android
  const lastVibrationStep = useRef(null);
  useEffect(() => {
    const step = Math.round(centerIndex * 10) % 10;
    const isClickPoint = step === 5 || step === 0;

    if (isClickPoint && lastVibrationStep.current !== step) {
      lastVibrationStep.current = step;
      if (navigator.vibrate) navigator.vibrate(1);
    }
  }, [centerIndex]);

  // Scrolling stuff and whatnot
  const handleWheel = (e) => {
    e.preventDefault();
    setCenterIndex((prev) => {
      let next = prev + e.deltaY * wheelScrollFactor;
      next = Math.max(0, Math.min(cards.length - 1, next));
      return next;
    });
  };

  useEffect(() => {
    const handle = (e) => handleWheel(e);

    let touchStartY = 0;
    let lastTouchY = 0;
    let lastTouchTime = 0;

    const handleTouchStart = (e) => {
      if (decayFrame.current) cancelAnimationFrame(decayFrame.current);
      touchStartY = e.touches[0].clientY;
      lastTouchY = touchStartY;
      lastTouchTime = Date.now();
      touchVelocityRef.current = 0;
    };

    const handleTouchMove = (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = lastTouchY - currentY;

      // Prevent jitter
      if (Math.abs(deltaY) < 2) return;

      const now = Date.now();
      const dt = now - lastTouchTime;

      // Estimate velocity (pixels/ms)
      touchVelocityRef.current = deltaY / dt;

      lastTouchY = currentY;
      lastTouchTime = now;

      handleWheel({
        deltaY,
        preventDefault: () => e.preventDefault(),
      });
    };

    const handleTouchEnd = () => {
      let velocity = touchVelocityRef.current * 30; // Convert to px/frame assuming ~60fps

      const decay = () => {
        if (Math.abs(velocity) < 0.1) return;

        handleWheel({
          deltaY: velocity,
          preventDefault: () => {},
        });

        velocity *= 0.92; // Friction factor
        decayFrame.current = requestAnimationFrame(decay);
      };

      decay();
    };

    window.addEventListener("wheel", handle, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handle);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      if (decayFrame.current) cancelAnimationFrame(decayFrame.current);
    };
  }, []);

  // These set the card section, but wait until the initial animation is complete
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

  // Initial animation to the last card
  useEffect(() => {
    let frameId;
    const target = cards.length - 1;
    const speed = 0.05; // Speed to last card
    const centerRef = { current: 0 };

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
      {cards.map((card, cardIndex) => {
        const offset = (cardIndex - centerIndex) * 1.5;
        const isSelected = selectedCard === cardIndex;

        if (Math.abs(offset) > half + 1 && !isSelected) return null;

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
                <h2 className="text-[1em] font-[ElMessiri]">{card.title}</h2>
                <div className="flex justify-between items-center gap-2 w-full">
                  <div className="flex gap-2">
                    {card.live === "" ? (
                      ""
                    ) : (
                      <a
                        href={card.live}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <h2 className="live-btn">Live</h2>
                      </a>
                    )}
                    {card.code === "" ? (
                      ""
                    ) : (
                      <a
                        href={card.code}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <h2 className="code-btn">Code</h2>
                      </a>
                    )}
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
              <p className="text-[0.6em] font-normal ">{card.description}</p>
            </div>
            <div className="pb-4 px-4 flex gap-2 justify-between flex-wrap">
              {card.tags.map((tag) => (
                <h2 className="project-tag">{tag}</h2>
              ))}
            </div>
          </div>
        );

        return (
          <div
            key={cardIndex}
            className="card-origin absolute"
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
                  src={card.thumbnail}
                  alt={card.title}
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
