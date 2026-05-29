import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { experiences } from "../../data/ExperienceData";
import "./Experience.css";

export default function Experience({ onClose }) {
  const trackRef = useRef(null);
  const itemRefs = useRef([]);
  const itemMetrics = useRef([]);

  const [offset, setOffset] = useState(0);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const scrollSpeed = useRef(0);
  const requestRef = useRef();
  
  const minOffset = useRef(0);
  const maxOffset = useRef(0);
  const initialized = useRef(false);

  // Measure static DOM layout exactly
  useLayoutEffect(() => {
    const measure = () => {
      const wh = window.innerHeight;
      setWindowHeight(wh);
      
      if (trackRef.current && itemRefs.current.length > 0) {
        const metrics = itemRefs.current.map(el => {
          if (!el) return { top: 0, height: 0 };
          return {
            top: el.offsetTop,
            height: el.offsetHeight
          };
        });
        itemMetrics.current = metrics;
        
        if (metrics[0] && metrics[metrics.length - 1]) {
          const firstCenter = metrics[0].top + metrics[0].height / 2;
          const lastCenter = metrics[metrics.length - 1].top + metrics[metrics.length - 1].height / 2;
          
          minOffset.current = firstCenter - wh / 2;
          maxOffset.current = lastCenter - wh / 2;
          
          // Force perfectly center the first item on initial load
          if (!initialized.current) {
            setOffset(minOffset.current);
            initialized.current = true;
          }
        }
      }
    };
    
    measure();
    const observer = new ResizeObserver(measure);
    if (trackRef.current) observer.observe(trackRef.current);
    window.addEventListener("resize", measure);
    
    // Ensure accurate layout after fonts and elements fully render
    const to = setTimeout(measure, 150);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      clearTimeout(to);
    };
  }, []);

  // Continuous momentum scroll logic
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      // Normalize Firefox deltaMode
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 40; // DOM_DELTA_LINE
      else if (e.deltaMode === 2) dy *= window.innerHeight; // DOM_DELTA_PAGE
      
      scrollSpeed.current += dy * 0.15;
    };

    let lastTouchY = null;

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) lastTouchY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && lastTouchY != null) {
        const currentY = e.touches[0].clientY;
        const deltaY = lastTouchY - currentY;
        scrollSpeed.current += deltaY * 0.3;
        lastTouchY = currentY;
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => { lastTouchY = null; };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    const animate = () => {
      scrollSpeed.current *= 0.9; // smooth friction
      if (Math.abs(scrollSpeed.current) > 0.1) {
        setOffset((prev) => {
          let next = prev + scrollSpeed.current;
          
          // Hard clamp bounds to perfectly lock on first and last items
          if (next < minOffset.current) {
            next = minOffset.current;
            scrollSpeed.current *= -0.1; // tiny bounce
          } else if (next > maxOffset.current) {
            next = maxOffset.current;
            scrollSpeed.current *= -0.1; // tiny bounce
          }
          
          return next;
        });
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const viewportCenterY = windowHeight / 2;

  return (
    <div className="fixed inset-0 z-[999] bg-transparent flex items-center justify-center pointer-events-auto experience-backdrop">
      
      {/* Floating Close Button */}
      <div 
        className="fixed top-8 right-8 z-[1000] carousel-nav-btn w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-white hover:text-black hover:scale-110 transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        onClick={onClose}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>

      <div className="relative w-[100vw] h-[100vh] overflow-hidden experience-slide-up">
        
        {/* Custom scroll track */}
        <div 
          ref={trackRef}
          style={{ transform: `translateY(-${offset}px)` }}
          className="relative will-change-transform flex flex-col items-center gap-[30vh] py-[50vh]"
        >
          {experiences.map((exp, idx) => {
            const metrics = itemMetrics.current[idx];
            let blur = 10;
            let containerOpacity = 0.3;
            let scale = 0.9;
            let descOpacity = 0;
            let zIndex = 10;

            if (metrics) {
              const itemCenter = metrics.top + metrics.height / 2 - offset;
              const distance = Math.abs(itemCenter - viewportCenterY);
              
              // Only perfectly sharp within a very tight 50px boundary
              const activeDistance = Math.max(0, distance - 50);
              
              // Container fades gently over 1000px distance
              const progress = Math.min(1, activeDistance / 1000); 
              
              // Descriptions fade to 0% over an massive 650px distance.
              // This is crucial: mouse wheels tick in ~100px intervals. 
              // A short distance makes it vanish in 2 ticks (causing a "pop").
              // 650px ensures it requires a long, sustained scroll to fully vanish!
              const descProgress = Math.min(1, activeDistance / 650);
              
              blur = progress * 12;
              containerOpacity = 1 - (progress * 0.7); // 1.0 -> 0.3
              scale = 1 - (progress * 0.1);   // 1.0 -> 0.9
              descOpacity = 1 - descProgress; // 1.0 -> 0.0
              zIndex = Math.round((1 - progress) * 10);
            }

            return (
              <div 
                key={exp.id}
                ref={(el) => (itemRefs.current[idx] = el)}
                className="w-full max-w-[1000px] flex flex-col items-center justify-center will-change-transform"
                style={{
                  filter: `blur(${blur}px)`,
                  opacity: containerOpacity,
                  transform: `scale(${scale})`,
                  zIndex: zIndex,
                }}
              >
                {/* Massive Title (Remains slightly visible and blurred when inactive) */}
                <h1 className="font-[ElMessiri] text-center tracking-wide leading-tight px-4 text-white text-[5vw]">
                  {exp.title}
                </h1>

                {/* Organization and Year (Fades out seamlessly) */}
                <h3 
                  className="font-[Teachers] uppercase tracking-[0.2em] text-white/60 mt-4 will-change-opacity"
                  style={{ opacity: descOpacity }}
                >
                  {exp.organization} <span className="mx-2">•</span> {exp.year}
                </h3>

                {/* Glassmorphic Card (Removed BG per request, remains as text container) */}
                <div 
                  className="mt-8 w-[90vw] max-w-[700px] will-change-opacity flex flex-col items-center text-center"
                  style={{ opacity: descOpacity }}
                >
                  <p className="text-white/70 text-lg md:text-xl leading-relaxed font-[Teachers]">
                    {exp.description}
                  </p>
                  
                  {exp.publication && (
                    <div className="mt-12 flex flex-col items-center justify-center gap-6">
                      <div className="flex flex-col items-center text-center">
                        <span className="text-xs text-white/40 uppercase tracking-[0.3em] mb-2">Featured Publication</span>
                        <span className="text-white/90 font-[ElMessiri] text-2xl tracking-wide">{exp.publication.title}</span>
                      </div>
                      <a 
                        href={exp.publication.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group carousel-nav-btn flex items-center gap-3 rounded-full border border-white/20 px-8 py-3 bg-transparent text-white/80 hover:bg-white hover:text-black hover:border-white transition-all duration-300 cursor-pointer"
                      >
                        <span className="text-xs font-[Teachers] tracking-[0.2em] uppercase font-medium">Read Full Article</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-300">
                          <path d="M5 12h14"></path>
                          <path d="m12 5 7 7-7 7"></path>
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
