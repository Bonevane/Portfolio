import { useEffect, useRef } from "react";
import "./Cursor.css";

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const cursorMode = useRef("default");
  const requestRef = useRef(null);

  useEffect(() => {
    // Disable on touch devices
    if (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    )
      return;

    const dot = dotRef.current;
    const ringEl = ringRef.current;
    if (!dot || !ringEl) return;

    // Set initial position off-screen
    mouse.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    ring.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const onMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      // Dot is instantly attached to cursor
      dot.style.transform = `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0) translate(-50%, -50%)`;
    };

    const updateRing = () => {
      // Lerp for buttery smooth ring follow
      ring.current.x += (mouse.current.x - ring.current.x) * 0.15;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.15;

      ringEl.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%)`;

      requestRef.current = requestAnimationFrame(updateRing);
    };

    requestRef.current = requestAnimationFrame(updateRing);

    const updateCursorMode = (target) => {
      if (!target || !target.closest) return;

      let nextMode = "default";
      
      try {
        const style = window.getComputedStyle(target);
        const isPointer = style.cursor === "pointer";
        const isElementInteractable = target.closest(
          'a, button, [role="button"], input, select, textarea, .dock-tab, .card, .card-origin, .project-tag, .live-btn, .code-btn, .gallery-label, .gallery-item-inner, .toggle-switch, .bonevane'
        );
        const isScrollable = target.closest(".cards-container, .gallery-wrapper, .cards-page");
        const isVideoBackdrop = target.closest(".video-backdrop");
        const isVideoPlaying = target.closest(".video-playing");
        const isVideoPaused = target.closest(".video-paused");
        const isCarouselBtn = target.closest(".carousel-nav-btn, .live-btn, .code-btn");
        const isGrab = target.closest(".flower-container");

        if (isCarouselBtn) {
          nextMode = "carousel-btn";
        } else if (isVideoPlaying) {
          nextMode = "pause";
        } else if (isVideoPaused) {
          nextMode = "play";
        } else if (isVideoBackdrop) {
          nextMode = "close";
        } else if (isGrab) {
          nextMode = "grab";
        } else if (isPointer || isElementInteractable) {
          nextMode = "interactable";
        } else if (isScrollable) {
          nextMode = "scrollable";
        }
      } catch (err) {}

      if (cursorMode.current !== nextMode) {
        ringEl.classList.remove(`ring-${cursorMode.current}`);
        dot.classList.remove(`dot-${cursorMode.current}`);
        
        cursorMode.current = nextMode;
        
        ringEl.classList.add(`ring-${cursorMode.current}`);
        dot.classList.add(`dot-${cursorMode.current}`);
      }
    };

    const onMouseOver = (e) => updateCursorMode(e.target);

    const onPointerDown = () => {
      dot.classList.add("clicking");
      ringEl.classList.add("clicking");
    };

    const onPointerUp = (e) => {
      dot.classList.remove("clicking");
      ringEl.classList.remove("clicking");
      
      // Allow React state changes (like play/pause classes) to flush to the DOM
      setTimeout(() => {
        try {
          const currentTarget = document.elementFromPoint(mouse.current.x, mouse.current.y);
          updateCursorMode(currentTarget || e.target);
        } catch (err) {}
      }, 20);
    };

    window.addEventListener("pointermove", onMouseMove, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("pointerover", onMouseOver, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMouseMove);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("pointerover", onMouseOver);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot dot-default" ref={dotRef}>
        {/* Scroll Icon */}
        <svg
          className="scroll-icon cursor-svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="6" y="3" width="12" height="18" rx="6" />
          <path d="M12 7v4" />
        </svg>

        {/* Grab Hand Icon */}
        <svg
          className="grab-icon cursor-svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
          <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>

        {/* Play Icon */}
        <svg
          className="play-icon cursor-svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="white"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>

        {/* Pause Icon */}
        <svg
          className="pause-icon cursor-svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="white"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>

        {/* Close Icon */}
        <svg
          className="close-icon cursor-svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
      <div className="cursor-ring ring-default" ref={ringRef}></div>
    </>
  );
}
