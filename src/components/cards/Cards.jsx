import { memo, useEffect, useState, useRef } from "react";
import { cards } from "../../data/Cards.js";
import { projectSlugFromPath } from "../../data/Paths.js";
import { applySeo, projectSeo } from "../../data/Seo.js";
import ScrollHint from "./ScrollHint.jsx";
import "./Cards.css";

// Fade whichever edges of the long description still have text beyond them.
function updateDescFade(el) {
  if (!el) return;
  const { scrollTop, scrollHeight, clientHeight } = el;
  el.classList.toggle("fade-top", scrollTop > 1);
  el.classList.toggle("fade-bottom", scrollTop + clientHeight < scrollHeight - 1);
}

const visibleCount = 6;
const half = Math.floor(visibleCount / 2);

// Where a card sits for a given carousel position. Null when it is outside
// the visible window (unless `force`).
function layoutFor(cardIndex, center, force = false) {
  const offset = (cardIndex - center) * 1.5;
  if (!force && Math.abs(offset) > half + 1) return null;
  return {
    rotation: 5 + offset * 5,
    translateX: offset * offset * 50,
    translateY: offset * offset * 25,
  };
}

// Everything inside a card except its position and depth effects. Scrolling
// re-renders the carousel every frame, but only the cards' transforms change
// then, so this is memoized and only re-renders when the card itself changes
// (opened, closed, or showing another image).
const CardInner = memo(function CardInner({
  card,
  isSelected,
  mediaIndex,
  setCurrentMediaIndex,
  setActiveVideo,
  swipe,
}) {
  const hasGallery = isSelected && card.media && card.media.length > 1;
  // Once opened, a card keeps its gallery mounted (already downloaded), so
  // closing it still cross-fades from whichever image was showing.
  const [opened, setOpened] = useState(false);
  if (isSelected && !opened) setOpened(true);
  const showPrev = () =>
    setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : card.media.length - 1));
  const showNext = () =>
    setCurrentMediaIndex((prev) => (prev < card.media.length - 1 ? prev + 1 : 0));

  return (
    <>
      <div
        className="slideIn relative w-full group overflow-hidden"
        style={{
          paddingTop: isSelected ? "56.25%" : "0%",
          opacity: isSelected ? 1 : 0,
        }}
        onTouchStart={(e) => {
          if (!hasGallery) return;
          swipe.startX = e.touches[0].clientX;
          swipe.startY = e.touches[0].clientY;
          swipe.horizontal = false;
        }}
        onTouchMove={(e) => {
          if (!hasGallery) return;
          const diffX = swipe.startX - e.touches[0].clientX;
          const diffY = swipe.startY - e.touches[0].clientY;
          if (!swipe.horizontal && Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
            swipe.horizontal = true;
          }
          if (swipe.horizontal) e.stopPropagation();
        }}
        onTouchEnd={(e) => {
          if (!hasGallery) return;
          if (swipe.horizontal) {
            e.stopPropagation();
            const diffX = swipe.startX - e.changedTouches[0].clientX;
            if (Math.abs(diffX) > 40) diffX > 0 ? showNext() : showPrev();
          }
          swipe.horizontal = false;
        }}
      >
        {card.media ? (
          <>
            {card.media.map((mediaItem, idx) =>
              // A card that hasn't been opened only needs the image it opens
              // on; the rest of its gallery loads when it is opened.
              !opened && !isSelected && idx !== mediaIndex ? null : (
                <img
                  key={idx}
                  decoding="async"
                  src={mediaItem.type === 'image' || !mediaItem.type ? mediaItem.url : card.thumbnail}
                  alt={card.title}
                  className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
                    isSelected ? "border-b border-[#757575]/70" : ""
                  } rounded-t-3xl ${idx === mediaIndex ? "opacity-100" : "opacity-0"}`}
                />
              ),
            )}

            {isSelected && card.media[mediaIndex].type === 'video' && (
              <div
                className="card-play-scrim absolute inset-0 rounded-t-3xl flex items-center justify-center z-40 bg-black/20 backdrop-blur-sm pointer-events-auto cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (setActiveVideo) {
                    const videoMedia = card.media.filter(m => m.type === 'video');
                    const startIndex = videoMedia.findIndex(m => m.url === card.media[mediaIndex].url);
                    setActiveVideo({ media: videoMedia, startIndex: Math.max(0, startIndex) });
                  }
                }}
              >
                <div className="card-play w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center hover:scale-110 hover:bg-white/30 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                    <path d="M8 5V19L19 12L8 5Z" />
                  </svg>
                </div>
              </div>
            )}

            {hasGallery && (
              <>
                {/* Dots indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                  {card.media.map((_, idx) => (
                    <div
                      key={idx}
                      className={`card-dot w-2 h-2 rounded-full transition-all duration-300 ${idx === mediaIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                      data-active={idx === mediaIndex}
                    />
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none z-50">
                  <button
                    className="card-nav carousel-nav-btn w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all pointer-events-auto cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      showPrev();
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>

                  <button
                    className="card-nav carousel-nav-btn w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all pointer-events-auto cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      showNext();
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
            decoding="async"
            src={card.thumbnail}
            alt={card.title}
            className={`absolute top-0 left-0 w-full h-full object-cover ${
              isSelected ? "border-b border-[#757575]/70" : ""
            }  rounded-t-3xl`}
          />
        )}
      </div>

      <div className="card-body text-left text-[#B5B5B5] text-[3.4vh] flex flex-col justify-between flex-1 min-h-0">
        <div className="card-head py-3 px-4 flex flex-col min-h-0">
          <div className="card-title-row flex mb-2 gap-4 items-center">
            <h2 className="card-title text-[1em] font-[ElMessiri] whitespace-nowrap">
              {/* A real link so crawlers can reach /projects/<slug>; a normal
                  click still just opens or closes the card in place. */}
              <a
                href={`/projects/${card.slug}`}
                className="text-inherit no-underline"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                }}
              >
                {card.title}
              </a>
            </h2>
            <div className="card-actions flex justify-between items-center gap-2 w-full">
              <div className="flex gap-2">
                {card.live === "" ? (
                  ""
                ) : (
                  <a
                    href={card.live}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="live-btn block">Live</span>
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
                    <span className="code-btn block">Code</span>
                  </a>
                )}
              </div>
              {!isSelected && (
                <svg
                  className="card-arrow"
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
          {isSelected && card.longDescription ? (
            <p
              ref={(el) => {
                if (!el) return;
                updateDescFade(el);
                // The card grows as it opens; re-check once it settles.
                const ro = new ResizeObserver(() => updateDescFade(el));
                ro.observe(el);
                return () => ro.disconnect();
              }}
              onScroll={(e) => updateDescFade(e.currentTarget)}
              className="card-desc-scroll text-[0.6em] font-normal overflow-y-auto min-h-0 pr-2"
            >
              {card.longDescription}
            </p>
          ) : (
            <p className="text-[0.6em] font-normal ">{card.description}</p>
          )}
        </div>
        <div className="card-tags pb-4 px-4 flex gap-2 justify-between flex-wrap">
          {card.tags.map((tag) => (
            <span key={tag} className="project-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </>
  );
});

export default function Cards({ setCardSection, setActiveVideo, paused = false, isExperienceOpen = false }) {
  // Wheel/touch/drag listeners live on window, so an overlay on top (Experience,
  // video player) would otherwise scroll the carousel behind it.
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
    if (paused) dismissScrollHint();
  }, [paused]);

  const isExperienceOpenRef = useRef(isExperienceOpen);
  useEffect(() => {
    isExperienceOpenRef.current = isExperienceOpen;
    if (isExperienceOpen) dismissScrollHint();
  }, [isExperienceOpen]);

  const [centerIndex, setCenterIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [prevCardSection, setPrevCardSection] = useState(0);
  const [animComplete, setAnimComplete] = useState(false);
  const animCompleteRef = useRef(false);
  useEffect(() => {
    animCompleteRef.current = animComplete;
  }, [animComplete]);

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Wrong-way scroll detection dropdown
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [hintShake, setHintShake] = useState(false);
  const [hintDirection, setHintDirection] = useState("up");
  const isHintVisibleRef = useRef(false);
  useEffect(() => {
    isHintVisibleRef.current = showScrollHint;
  }, [showScrollHint]);

  const hintTimerRef = useRef(null);
  const shakeTimerRef = useRef(null);
  const wrongScrollDeltaRef = useRef(0);
  const resetAccumulatorTimerRef = useRef(null);
  const gestureMovedCarouselRef = useRef(false);
  const gestureEndTimerRef = useRef(null);

  const dismissScrollHint = () => {
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
    setShowScrollHint(false);
    wrongScrollDeltaRef.current = 0;
  };

  const triggerScrollHint = (direction) => {
    if (pausedRef.current || isExperienceOpenRef.current) return;
    if (selectedCardRef.current !== null) return;

    setHintDirection(direction);

    if (isHintVisibleRef.current) {
      setHintShake(true);
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = setTimeout(() => setHintShake(false), 450);
    } else {
      setShowScrollHint(true);
    }

    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => {
      setShowScrollHint(false);
    }, 3500);
  };
  const touchVelocityRef = useRef(0);
  const decayFrame = useRef(null);
  const renderFrame = useRef(0);
  const isDragging = useRef(false);
  const isTouching = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  
  // Touch state for swiping between an open card's images (see CardInner).
  const swipeRef = useRef({ startX: 0, startY: 0, horizontal: false });

  const selectedCardRef = useRef(selectedCard);
  const scrollAccumulatorRef = useRef(0);

  // On WebKit the wrapper has no CSS transition (see Cards.css), so a card
  // closing would snap back. Give just that card a one-shot transition for
  // the duration of the close; a single retarget is fine there.
  const [closingCard, setClosingCard] = useState(null);

  // Set together with selectedCard so the very first frame of the close
  // already carries the transition.
  const closeCard = () => {
    const closing = selectedCardRef.current;
    if (closing === null) return;
    setClosingCard(closing);
    setSelectedCard(null);
  };

  useEffect(() => {
    selectedCardRef.current = selectedCard;
    if (selectedCard !== null) {
      scrollAccumulatorRef.current = 0;
      setCurrentMediaIndex(0);
      dismissScrollHint();
    }
  }, [selectedCard]);

  useEffect(() => {
    if (closingCard === null) return;
    const t = setTimeout(() => setClosingCard(null), 250);
    return () => clearTimeout(t);
  }, [closingCard]);

  // WebKit can't smooth per-frame transform updates with a CSS transition
  // (a transition retargeted inside rAF is re-evaluated at progress 0 every
  // frame), so on WebKit the smoothing the .card-origin transition provides
  // elsewhere is done here in JS: each card's rendered rotate/translate
  // chases its target by a fixed fraction per frame, like a short ease-out.
  const isWebKit = useRef(false);
  const smoothed = useRef({});
  const [, setSmoothTick] = useState(0);
  const centerIndexRef = useRef(0);
  // Restarts the WebKit smoothing loop below, which stops once cards settle.
  const wakeSmoothing = useRef(() => {});
  useEffect(() => {
    centerIndexRef.current = centerIndex;
    wakeSmoothing.current();
  }, [centerIndex]);

  useEffect(() => {
    const ua = navigator.userAgent;
    const webkit =
      /iPad|iPhone|iPod/.test(ua) ||
      (/Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua));
    isWebKit.current = webkit;
    if (!webkit) return;

    const follow = 0.15;
    let frame = 0;
    const loop = () => {
      const center = centerIndexRef.current;
      const store = smoothed.current;
      let changed = false;
      cards.forEach((_, cardIndex) => {
        const target = layoutFor(cardIndex, center);
        if (!target) {
          if (store[cardIndex]) {
            delete store[cardIndex];
          }
          return;
        }
        const cur = store[cardIndex];
        if (!cur) {
          store[cardIndex] = { ...target };
          return;
        }
        for (const k of ["rotation", "translateX", "translateY"]) {
          const d = target[k] - cur[k];
          if (Math.abs(d) > 0.01) {
            cur[k] += d * follow;
            changed = true;
          } else if (cur[k] !== target[k]) {
            cur[k] = target[k];
            changed = true;
          }
        }
      });
      // Keep going only while something is still moving, so the page can
      // idle (an endless loop keeps iPhones from ever resting).
      if (changed) {
        setSmoothTick((t) => t + 1);
        frame = requestAnimationFrame(loop);
      } else {
        frame = 0;
      }
    };
    wakeSmoothing.current = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };
    wakeSmoothing.current();
    return () => {
      cancelAnimationFrame(frame);
      wakeSmoothing.current = () => {};
    };
  }, []);

  const wheelScrollFactor = 0.002;

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
      if (pausedRef.current) return;
      // Scrolling over an open card's long description only ever scrolls the
      // text, even at its ends, so it can't move the carousel or close the card.
      if (e.target?.closest?.(".card-desc-scroll")) return;
      if (e.preventDefault) e.preventDefault();

      const dX = e.deltaX || 0;
      const dY = e.deltaY || 0;
      const effectiveDelta = dY + dX * 0.5;

      const currentIdx = centerIndexRef.current;
      const maxIdx = cards.length - 1;
      const nextIdx = Math.max(0, Math.min(maxIdx, currentIdx + effectiveDelta * wheelScrollFactor));
      const didMove = Math.abs(nextIdx - currentIdx) > 0.0001;

      // Reset gesture tracking when scrolling ceases
      if (gestureEndTimerRef.current) clearTimeout(gestureEndTimerRef.current);
      gestureEndTimerRef.current = setTimeout(() => {
        gestureMovedCarouselRef.current = false;
        wrongScrollDeltaRef.current = 0;
      }, 250);

      // Detect scrolling the wrong way:
      // Only when publications & experience section is not open, no card selected, and not momentum decay
      if (
        !pausedRef.current &&
        !isExperienceOpenRef.current &&
        selectedCardRef.current === null &&
        !e.isDecay
      ) {
        if (didMove) {
          // This scroll gesture is actively moving the carousel.
          // A gesture that moved the carousel must NEVER trigger the wrong-way hint!
          gestureMovedCarouselRef.current = true;
          wrongScrollDeltaRef.current = 0;

          // If the hint is visible and user scrolls in a valid direction, dismiss it
          if (isHintVisibleRef.current) {
            dismissScrollHint();
          }
        } else {
          // The carousel DID NOT move (it is clamped against the end).
          const isAtTop = currentIdx >= maxIdx - 0.01 && effectiveDelta > 0;
          const isAtBottom = currentIdx <= 0.01 && effectiveDelta < 0;

          // Only a gesture that starts while resting at the end counts. A
          // gesture that moved the carousel there (a flick and its momentum
          // tail included) never shows the hint, however long it keeps going;
          // the user has to stop at the end and then scroll outwards.
          if ((isAtTop || isAtBottom) && !gestureMovedCarouselRef.current) {
            wrongScrollDeltaRef.current += Math.abs(effectiveDelta);

            if (resetAccumulatorTimerRef.current) clearTimeout(resetAccumulatorTimerRef.current);
            resetAccumulatorTimerRef.current = setTimeout(() => {
              wrongScrollDeltaRef.current = 0;
            }, 250);

            if (wrongScrollDeltaRef.current >= 150) {
              triggerScrollHint(isAtTop ? "up" : "down");
              wrongScrollDeltaRef.current = 0;
            }
          }
        }
      }

      // Always update the center index so the background carousel rotates.
      // Trackpads send well over 60 wheel events a second, so the position is
      // tracked here and rendered at most once per frame.
      centerIndexRef.current = nextIdx;
      if (!renderFrame.current) {
        renderFrame.current = requestAnimationFrame(() => {
          renderFrame.current = 0;
          setCenterIndex(centerIndexRef.current);
        });
      }

      if (selectedCardRef.current !== null) {
        scrollAccumulatorRef.current += Math.abs(effectiveDelta);
        
        // Wait until they've scrolled enough to trigger a close (~150px of delta)
        if (scrollAccumulatorRef.current > 150) {
          closeCard();
          scrollAccumulatorRef.current = 0;
        }
      }
    };

    const start = (x, y, isTouch = false, target = null) => {
      if (pausedRef.current) return;
      // Dragging on an open card's description scrolls the text, not the carousel.
      if (target?.closest?.(".card-desc-scroll")) return;
      if (decayFrame.current) cancelAnimationFrame(decayFrame.current);
      isTouch ? (isTouching.current = true) : (isDragging.current = true);
      lastX.current = x;
      lastY.current = y;
      lastTime.current = Date.now();
      touchVelocityRef.current = 0;
      document.body.style.userSelect = "none";
    };

    const move = (x, y, e) => {
      if (swipeRef.current.horizontal) return;
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
        handleWheel({ deltaY: velocity, deltaX: 0, isDecay: true, preventDefault: () => {} });
        velocity *= 0.92;
        decayFrame.current = requestAnimationFrame(decay);
      };
      decay();
    };

    // For Mouse Events
    const handleMouseDown = (e) => start(e.clientX, e.clientY, false, e.target);
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      move(e.clientX, e.clientY, e);
    };
    const handleMouseUp = () => end(false);

    // For Touch Events
    const handleTouchStart = (e) =>
      start(e.touches[0].clientX, e.touches[0].clientY, true, e.target);
    const handleTouchMove = (e) => {
      // Only a touch that started a carousel drag moves the carousel.
      if (!isTouching.current) return;
      move(e.touches[0].clientX, e.touches[0].clientY, e);
    };
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
      if (renderFrame.current) cancelAnimationFrame(renderFrame.current);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      if (resetAccumulatorTimerRef.current) clearTimeout(resetAccumulatorTimerRef.current);
      if (gestureEndTimerRef.current) clearTimeout(gestureEndTimerRef.current);
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

  // A /projects/<slug> URL opens that project: the intro animation lands on
  // its card (in its own section, not the Highlights copy) and opens it.
  const deepLinkIndex = useRef(
    (() => {
      const slug = projectSlugFromPath(window.location.pathname);
      if (!slug) return -1;
      return cards.findIndex((c) => c.slug === slug && c.section !== "Highlights");
    })()
  );

  // Keep the address bar and <head> in step with the open card, so a project
  // can be shared by URL. replaceState keeps the back button as it was.
  const hadOpenCard = useRef(false);
  useEffect(() => {
    if (selectedCard !== null) {
      const card = cards[selectedCard];
      window.history.replaceState(window.history.state, "", `/projects/${card.slug}`);
      applySeo(projectSeo(card));
      hadOpenCard.current = true;
    } else if (hadOpenCard.current) {
      window.history.replaceState(window.history.state, "", "/portfolios");
      applySeo("Portfolios");
      hadOpenCard.current = false;
    }
  }, [selectedCard]);

  // Initial animation to the last card (or the deep-linked one)
  useEffect(() => {
    let frameId;
    const linked = deepLinkIndex.current;
    const target = linked >= 0 ? linked : cards.length - 1;
    const speed = 0.05; // Speed to last card
    const centerRef = { current: 0 };

    const animate = () => {
      centerRef.current += (target - centerRef.current) * speed;

      if (Math.abs(target - centerRef.current) < 0.01) {
        setCenterIndex(target);
        cancelAnimationFrame(frameId);
        setAnimComplete(true);
        animCompleteRef.current = true;
        if (linked >= 0) setSelectedCard(linked);
        return;
      }

      setCenterIndex(centerRef.current);
      frameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <>
      <ScrollHint
        visible={showScrollHint}
        shake={hintShake}
        direction={hintDirection}
        onDismiss={dismissScrollHint}
      />
      <div className={`cards-container fixed bottom-[2em] right-[8em] w-[100vw] h-[100vh] pointer-events-none ${selectedCard !== null ? 'z-[60]' : 'z-10'}`}>
      {cards.map((card, cardIndex) => {
        const isSelected = selectedCard === cardIndex;
        const target = layoutFor(cardIndex, centerIndex);
        if (!target && !isSelected) return null;
        const offset = (cardIndex - centerIndex) * 1.5;
        const shown =
          isWebKit.current && target
            ? smoothed.current[cardIndex] ?? target
            : target ?? layoutFor(cardIndex, centerIndex, true);
        const { rotation, translateX, translateY } = shown;

        const blur = Math.pow(Math.abs(offset), 2) * 1.0;
        const opacity = 1 - Math.abs(offset) * 0.18;

        const expandedStyle = isSelected
          ? {
              transform: " scale(1.15) rotate(0deg) translateX(8%)",
              zIndex: 9999,
              transition: "all 0.5s cubic-bezier(0.34, 1.3, 0.64, 1)",
            }
          : {};

        const safeMediaIndex = (isSelected && card.media && currentMediaIndex < card.media.length) ? currentMediaIndex : 0;

        return (
          <div
            key={cardIndex}
            className="card-origin absolute pointer-events-auto"
            onClick={() => {
              isSelected ? closeCard() : setSelectedCard(cardIndex);
            }}
            style={{
              transform: `rotate(${-rotation}deg) translateY(${translateY}px) translateX(${translateX}px)`,
              transformOrigin: "bottom right",
              zIndex: cardIndex,
              ...(isWebKit.current && closingCard === cardIndex
                ? { transition: "all 0.2s ease-out" }
                : {}),
              ...expandedStyle,
            }}
          >
            <div
              className={`card flex-col text-white font-semibold text-xl rounded-3xl shadow-xl backdrop-blur-md border border-[#757575]/70`}
              style={{
                // Depth blur goes on .card itself, except on WebKit, which
                // won't update a per-frame filter on a layer that also has
                // backdrop-filter + will-change (renders stale). Firefox has
                // the opposite problem: a filter on a descendant of that
                // layer breaks stacking. So each engine gets its own spot.
                filter: isSelected || isWebKit.current ? undefined : `blur(${blur}px)`,
                // A card blurred this much by depth looks the same without its
                // frosted-glass backdrop (pixel diffs: at most a few colour
                // levels), and stacking the two blurs every frame is what
                // makes weaker GPUs drop frames, so the far cards skip it.
                ...(!isSelected && blur >= 4
                  ? { backdropFilter: "none", WebkitBackdropFilter: "none" }
                  : {}),
                opacity: isSelected ? 1 : opacity,
                padding: "0",
                justifyContent: "normal",
              }}
            >
              <div
                className="flex flex-col w-full h-full"
                style={{
                  filter:
                    isSelected || !isWebKit.current ? undefined : `blur(${blur}px)`,
                }}
              >
              <CardInner
                card={card}
                isSelected={isSelected}
                mediaIndex={safeMediaIndex}
                setCurrentMediaIndex={setCurrentMediaIndex}
                setActiveVideo={setActiveVideo}
                swipe={swipeRef.current}
              />
              </div>
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
}
