import { useEffect, useState, useRef } from "react";
import { cards } from "../../data/Cards.js";
import "./Cards.css";

export default function Cards({ setCardSection, setActiveVideo }) {
  const [centerIndex, setCenterIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [prevCardSection, setPrevCardSection] = useState(0);
  const [animComplete, setAnimComplete] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const touchVelocityRef = useRef(0);
  const decayFrame = useRef(null);
  const isDragging = useRef(false);
  const isTouching = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);

  const selectedCardRef = useRef(selectedCard);
  const scrollAccumulatorRef = useRef(0);

  useEffect(() => {
    selectedCardRef.current = selectedCard;
    if (selectedCard !== null) {
      scrollAccumulatorRef.current = 0;
      setCurrentMediaIndex(0);
    }
  }, [selectedCard]);

  const wheelScrollFactor = 0.002;
  const visibleCount = 6;
  const half = Math.floor(visibleCount / 2);

  // Vibration for Android (Disabled for now)
  const lastVibrationStep = useRef(null);
  useEffect(() => {
    const step = Math.round(centerIndex * 10) % 10;
    const isClickPoint = step === 5 || step === 0;

    if (isClickPoint && lastVibrationStep.current !== step) {
      lastVibrationStep.current = step;
      // if (navigator.vibrate) navigator.vibrate(1);   // Uncomment for vibration (Disabled because can be annoying)
    }
  }, [centerIndex]);

  useEffect(() => {
    // General wheel and touch handling
    const handleWheel = (e) => {
      if (e.preventDefault) e.preventDefault();

      const dX = e.deltaX || 0;
      const dY = e.deltaY || 0;
      const effectiveDelta = dY + dX * 0.5;

      // Always update the center index so the background carousel rotates
      setCenterIndex((prev) => {
        let next = prev + effectiveDelta * wheelScrollFactor;
        next = Math.max(0, Math.min(cards.length - 1, next));
        return next;
      });

      if (selectedCardRef.current !== null) {
        scrollAccumulatorRef.current += Math.abs(effectiveDelta);
        
        // Wait until they've scrolled enough to trigger a close (~150px of delta)
        if (scrollAccumulatorRef.current > 150) {
          setSelectedCard(null);
          scrollAccumulatorRef.current = 0;
        }
      }
    };

    const start = (x, y, isTouch = false) => {
      if (decayFrame.current) cancelAnimationFrame(decayFrame.current);
      isTouch ? (isTouching.current = true) : (isDragging.current = true);
      lastX.current = x;
      lastY.current = y;
      lastTime.current = Date.now();
      touchVelocityRef.current = 0;
      document.body.style.userSelect = "none";
    };

    const move = (x, y, e) => {
      const dX = lastX.current - x;
      const dY = lastY.current - y;
      const effectiveDelta = dY + dX * 0.5;

      if (Math.abs(effectiveDelta) < 2) return;

      const now = Date.now();
      const dt = now - lastTime.current;

      // Always track velocity so flick momentum carries into the carousel
      touchVelocityRef.current = effectiveDelta / dt;

      lastX.current = x;
      lastY.current = y;
      lastTime.current = now;

      handleWheel({
        deltaY: effectiveDelta,
        deltaX: 0,
        preventDefault: () => {
          if (e.preventDefault) e.preventDefault();
        },
      });
    };

    const end = (isTouch = false) => {
      if (isTouch) {
        if (!isTouching.current) return;
        isTouching.current = false;
      } else {
        if (!isDragging.current) return;
        isDragging.current = false;
      }

      document.body.style.userSelect = "";

      let velocity = touchVelocityRef.current * 30;
      const decay = () => {
        if (Math.abs(velocity) < 0.1) return;
        handleWheel({ deltaY: velocity, deltaX: 0, preventDefault: () => {} });
        velocity *= 0.92;
        decayFrame.current = requestAnimationFrame(decay);
      };
      decay();
    };

    // For Mouse Events
    const handleMouseDown = (e) => start(e.clientX, e.clientY, false);
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      move(e.clientX, e.clientY, e);
    };
    const handleMouseUp = () => end(false);

    // For Touch Events
    const handleTouchStart = (e) => start(e.touches[0].clientX, e.touches[0].clientY, true);
    const handleTouchMove = (e) => move(e.touches[0].clientX, e.touches[0].clientY, e);
    const handleTouchEnd = () => end(true);

    // ALL THEM LISTENERS
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
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
    <div className={`cards-container fixed bottom-[2em] right-[8em] w-[100vw] h-[100vh] pointer-events-none ${selectedCard !== null ? 'z-[60]' : 'z-10'}`}>
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
              transition: "all 0.5s cubic-bezier(0.34, 1.3, 0.64, 1)",
            }
          : {};

        const safeMediaIndex = (isSelected && card.media && currentMediaIndex < card.media.length) ? currentMediaIndex : 0;

        const cardContent = (
          <div className="text-left text-[#B5B5B5] text-[3.4vh] flex flex-col justify-between h-full">
            <div className="py-3 px-4">
              <div className="flex mb-2 gap-4 items-center">
                <h2 className="text-[1em] font-[ElMessiri] whitespace-nowrap">
                  {card.title}
                </h2>
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
            className="card-origin absolute pointer-events-auto"
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
                className="slideIn relative w-full group overflow-hidden"
                style={{
                  paddingTop: isSelected ? "56.25%" : "0%",
                  opacity: isSelected ? 1 : 0,
                }}
              >
                {card.media ? (
                  <>
                    {card.media.map((mediaItem, idx) => (
                      <img
                        key={idx}
                        src={mediaItem.type === 'image' || !mediaItem.type ? mediaItem.url : card.thumbnail}
                        alt={card.title}
                        className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
                          isSelected ? "border-b border-[#757575]/70" : ""
                        } rounded-t-3xl ${idx === safeMediaIndex ? "opacity-100" : "opacity-0"}`}
                      />
                    ))}
                    
                    {isSelected && card.media[safeMediaIndex].type === 'video' && (
                      <div 
                        className="absolute inset-0 rounded-t-3xl flex items-center justify-center z-40 bg-black/20 backdrop-blur-sm pointer-events-auto cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (setActiveVideo) {
                            const videoMedia = card.media.filter(m => m.type === 'video');
                            const startIndex = videoMedia.findIndex(m => m.url === card.media[safeMediaIndex].url);
                            setActiveVideo({ media: videoMedia, startIndex: Math.max(0, startIndex) });
                          }
                        }}
                      >
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center hover:scale-110 hover:bg-white/30 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                            <path d="M8 5V19L19 12L8 5Z" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {isSelected && card.media.length > 1 && (
                      <>
                        {/* Dots indicator */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                          {card.media.map((_, idx) => (
                            <div 
                              key={idx} 
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === safeMediaIndex ? 'bg-white scale-125' : 'bg-white/40'}`} 
                            />
                          ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none z-50">
                          <button
                            className="carousel-nav-btn w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all pointer-events-auto cursor-pointer opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : card.media.length - 1));
                            }}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                          </button>
                          
                          <button
                            className="carousel-nav-btn w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all pointer-events-auto cursor-pointer opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentMediaIndex((prev) => (prev < card.media.length - 1 ? prev + 1 : 0));
                            }}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <img
                    src={card.thumbnail}
                    alt={card.title}
                    className={`absolute top-0 left-0 w-full h-full object-cover ${
                      isSelected ? "border-b border-[#757575]/70" : ""
                    }  rounded-t-3xl`}
                  />
                )}
              </div>
              {cardContent}
            </div>
          </div>
        );
      })}
    </div>
  );
}
