import { useEffect, useRef, useState } from "react";
import "./VideoPlayer.css";

export default function VideoPlayer({ media, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const currentMedia = media[currentIndex];
  
  const videoRefs = useRef([]);
  const progressRefs = useRef([]);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progresses, setProgresses] = useState(Array(media.length).fill(0));
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const showInfoRef = useRef(showInfo);
  useEffect(() => {
    showInfoRef.current = showInfo;
  }, [showInfo]);
  
  // Track mount state to defer heavy video playback until entry animations finish
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);

  // Scroll handler to toggle info / close player
  useEffect(() => {
    const scrollAccumulator = { current: 0 };
    const lastScrollDirection = { current: null };
    
    const processScroll = (deltaY, threshold = 150) => {
      if (Math.abs(deltaY) < 5) return;
      
      const currentDirection = deltaY > 0 ? "down" : "up";
      
      if (lastScrollDirection.current !== currentDirection) {
        scrollAccumulator.current = 0;
        lastScrollDirection.current = currentDirection;
      }
      
      scrollAccumulator.current += Math.abs(deltaY);
      
      if (scrollAccumulator.current > threshold) {
        if (currentDirection === "down") {
          if (!showInfoRef.current) setShowInfo(true);
        } else if (currentDirection === "up") {
          if (showInfoRef.current) {
            setShowInfo(false);
          } else {
            onClose();
          }
        }
        scrollAccumulator.current = 0;
      }
    };

    const handleWheel = (e) => {
      processScroll(e.deltaY, 150);
    };

    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      scrollAccumulator.current = 0;
    };
    
    const handleTouchMove = (e) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      
      if (Math.abs(deltaY) > 5) {
        processScroll(deltaY, 100);
        touchStartY = touchY; // Reset drag origin so it acts progressively
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [onClose]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    // Defer the initial autoplay by 800ms to allow the CSS slide-up animation 
    // to complete smoothly without GPU/CPU contention from video decoding.
    const timer = setTimeout(() => {
      setIsReadyToPlay(true);
    }, 800);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      clearTimeout(timer);
    };
  }, []);

  // Manage Play/Pause states when sliding between videos
  useEffect(() => {
    if (!isReadyToPlay) return;

    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === currentIndex) {
        vid.play().catch(e => console.error("Autoplay failed:", e));
        setIsPlaying(true);
      } else {
        vid.pause();
        // Optional: Reset time when sliding away so it starts fresh next time
        vid.currentTime = 0;
      }
    });
  }, [currentIndex, isReadyToPlay]);

  // Sync Volume globally across all videos
  useEffect(() => {
    videoRefs.current.forEach(vid => {
      if (vid) vid.volume = volume;
    });
  }, [volume]);

  const togglePlay = (e, idx) => {
    e.stopPropagation();
    if (idx !== currentIndex) return;
    const vid = videoRefs.current[idx];
    if (!vid) return;
    if (isPlaying) {
      vid.pause();
    } else {
      vid.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e, idx) => {
    e.stopPropagation();
    const vid = videoRefs.current[idx];
    const pRef = progressRefs.current[idx];
    if (!vid || !pRef) return;
    const rect = pRef.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    vid.currentTime = percentage * vid.duration;
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    
    // Check if on mobile (screen width < 768px)
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // Trigger native HTML5 video fullscreen on mobile
      const vid = videoRefs.current[currentIndex];
      if (!vid) return;
      
      if (vid.requestFullscreen) {
        vid.requestFullscreen().catch(err => console.error(err));
      } else if (vid.webkitEnterFullscreen) {
        // iOS Safari specific
        vid.webkitEnterFullscreen();
      }
    } else {
      // Trigger custom UI fullscreen on desktop
      if (!containerRef.current) return;
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[999] bg-transparent flex items-center justify-center video-backdrop pointer-events-auto"
      style={{ cursor: isFullscreen ? 'auto' : 'none' }}
      onClick={onClose}
    >
      <div 
        ref={containerRef}
        className={`flex flex-col gap-4 md:gap-6 items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)] ${showInfo ? '-translate-y-8' : 'translate-y-0'} w-full px-2 md:px-0 md:w-[90vw] max-w-[1800px] video-slide-up h-[100dvh] md:h-auto`}
        style={{ cursor: isFullscreen ? 'auto' : 'none' }}
      >
        
        {/* Track Container */}
        <div className="w-full h-[55vh] md:h-[82vh] overflow-visible relative flex items-center justify-center">
          
          {/* Sliding Track */}
          <div 
            className="flex w-full h-full items-center transition-transform duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)]"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {media.map((item, idx) => (
              <div 
                key={idx}
                className="flex-[0_0_100%] h-full flex items-center justify-center relative"
              >
                {/* Individual Video Card (Shrink Wraps the video via object-contain) */}
                <div 
                  className={`relative max-h-full max-w-full rounded-2xl md:rounded-[3rem] overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] md:shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 video-container group ${idx === currentIndex ? (item.type === 'video' && isPlaying ? "video-playing" : "video-paused") : "video-paused"}`}
                  onClick={(e) => {
                    if (item.type === 'video') togglePlay(e, idx);
                  }}
                >
                  {item.type !== 'video' ? (
                    <img 
                      src={item.url} 
                      className="max-h-[55vh] md:max-h-[82vh] max-w-full md:max-w-[90vw] object-contain rounded-2xl md:rounded-[3rem]"
                      alt={item.title || "Image"}
                    />
                  ) : (
                    <video 
                      ref={el => videoRefs.current[idx] = el}
                      src={item.url} 
                      preload="metadata"
                      className="max-h-[55vh] md:max-h-[82vh] max-w-full md:max-w-[90vw] object-contain rounded-2xl md:rounded-[3rem]"
                      playsInline
                      onTimeUpdate={(e) => {
                        setProgresses(prev => {
                          const newProg = [...prev];
                          newProg[idx] = (e.target.currentTime / e.target.duration) * 100;
                          return newProg;
                        });
                      }}
                      onEnded={() => {
                        if (idx === currentIndex) {
                          setIsPlaying(false);
                          if (media.length > 1) {
                            setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
                          }
                        }
                      }}
                    />
                  )}
                  
                  {/* Embedded Control Pill */}
                  {item.type === 'video' && (
                    <div 
                      className={`absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] max-w-[600px] h-10 md:h-12 rounded-full bg-black/40 md:bg-black/30 backdrop-blur-xl border border-white/10 flex items-center px-4 md:px-6 gap-3 md:gap-6 transition-opacity duration-500 z-50 cursor-auto ${!isPlaying ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                    {/* Main Scrubber */}
                    <div 
                      className="flex-1 h-3 flex items-center cursor-pointer relative group/scrubber carousel-nav-btn"
                      onClick={(e) => handleSeek(e, idx)}
                      ref={el => progressRefs.current[idx] = el}
                    >
                      <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full transition-all duration-100 pointer-events-none"
                          style={{ width: `${progresses[idx] || 0}%` }}
                        />
                      </div>
                      <div 
                        className="absolute w-3 h-3 bg-white rounded-full opacity-0 group-hover/scrubber:opacity-100 transition-opacity pointer-events-none shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                        style={{ left: `calc(${progresses[idx] || 0}% - 6px)` }}
                      />
                    </div>

                    {/* Volume Control (Hidden on Mobile) */}
                    <div className="hidden md:flex items-center gap-3 group/volume">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover/volume:opacity-100 transition-opacity">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </svg>
                      <div 
                        className="w-16 h-3 flex items-center cursor-pointer relative carousel-nav-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const newVol = Math.max(0, Math.min(1, x / rect.width));
                          setVolume(newVol);
                        }}
                      >
                        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-white rounded-full transition-all duration-100 pointer-events-none"
                            style={{ width: `${volume * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fullscreen Toggle */}
                    <button 
                      className="carousel-nav-btn opacity-70 hover:opacity-100 hover:scale-110 transition-all text-white"
                      onClick={toggleFullscreen}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-[18px] md:h-[18px]">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                      </svg>
                    </button>
                  </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Media Info Bar (Static below track) */}
        <div 
          className="w-full max-w-6xl mx-auto flex flex-col gap-4 px-2 md:px-4 text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center w-full gap-4">
            
            {/* Title & Info Toggle */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <h2 className="text-xl md:text-3xl font-[ElMessiri] tracking-wide truncate">{currentMedia.title || "Untitled Video"}</h2>
              <button 
                className={`shrink-0 carousel-nav-btn w-6 h-6 md:w-7 md:h-7 rounded-full border text-xs md:text-sm font-semibold flex items-center justify-center transition-all ${showInfo ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-white/40 text-white/70 hover:bg-white/10 hover:text-white'}`}
                onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }}
              >
                i
              </button>
            </div>

            {/* Navigation Arrows (Desktop Only) */}
            {media.length > 1 && (
              <div className="hidden sm:flex gap-3">
                <button 
                  className="carousel-nav-btn w-12 h-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-black transition-all"
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1)); }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button 
                  className="carousel-nav-btn w-12 h-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-black transition-all"
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0)); }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            )}
          </div>

          {/* Expandable Description */}
          <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)] ${showInfo ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <p className="text-white/70 max-w-[800px] text-sm md:text-lg leading-relaxed pt-1 pb-4 text-left">
                {currentMedia.description || "No description available."}
              </p>
            </div>
          </div>
          
          {/* Navigation Arrows (Mobile Only - Placed below description) */}
          {media.length > 1 && (
            <div className="flex sm:hidden gap-4 w-full justify-center pb-4">
              <button 
                className="carousel-nav-btn w-10 h-10 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-black transition-all"
                onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1)); }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button 
                className="carousel-nav-btn w-10 h-10 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-black transition-all"
                onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0)); }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
