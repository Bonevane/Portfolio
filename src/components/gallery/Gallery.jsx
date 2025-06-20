import { useEffect, useRef, useState } from "react";
import "./Gallery.css";

export default function MiscGallery({ imagesLeft, imagesRight }) {
  const [offset, setOffset] = useState(0);
  const [itemHeight, setItemHeight] = useState(0);
  const scrollSpeed = useRef(0);
  const itemRef = useRef(null);
  const requestRef = useRef();

  const allLeft = [...imagesLeft];
  const allRight = [...imagesRight];

  // Measure height of one item including spacing
  useEffect(() => {
    const measure = () => {
      if (itemRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        setItemHeight(rect.height + rect.width / 4);
      }
    };

    measure(); // Initial measurement

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Entry animation
  useEffect(() => {
    let entryScrollSpeed = 200; // initial speed (px per frame)
    const decay = 0.95; // decay factor per frame (higher = slower deceleration)
    const minSpeed = 0.1; // minimum speed to stop animation

    const entryScroll = () => {
      setOffset((prev) => prev + entryScrollSpeed);
      entryScrollSpeed *= decay;

      if (Math.abs(entryScrollSpeed) > minSpeed) {
        requestAnimationFrame(entryScroll);
      }
    };

    requestAnimationFrame(entryScroll);
  }, []);

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      scrollSpeed.current += e.deltaY * 0.15;
    };

    let lastTouchY = null;

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        lastTouchY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && lastTouchY != null) {
        const currentY = e.touches[0].clientY;
        const deltaY = lastTouchY - currentY;
        scrollSpeed.current += deltaY * 0.3;
        lastTouchY = currentY;
        e.preventDefault(); // prevent native scroll
      }
    };

    const handleTouchEnd = () => {
      lastTouchY = null;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    const animate = () => {
      scrollSpeed.current *= 0.9; // friction
      if (Math.abs(scrollSpeed.current) > 0.1) {
        setOffset((prev) => prev + scrollSpeed.current);
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

  const getTranslate = (index, originalLength, direction = 1) => {
    const totalHeight = originalLength * itemHeight;
    const rawOffset = (offset * direction) % totalHeight;
    const y = (index * itemHeight - rawOffset + totalHeight) % totalHeight;
    return `translateY(${y - totalHeight / 3}px)`;
  };

  return (
    <div className="gallery-wrapper">
      <div className="gallery-column">
        {allLeft.map((pic, i) => (
          <div
            key={`l-${i}`}
            ref={i === 0 ? itemRef : null}
            className="gallery-item"
            style={
              itemHeight
                ? { transform: getTranslate(i, imagesLeft.length, 1) }
                : {}
            }
          >
            <div className="gallery-fallback" />
            <div className="gallery-item-inner">
              <div className="gallery-item-inner">
                <div className="gallery-label">{pic.text}</div>
                <img src={pic.url} className="gallery-image-blur" />
                <img src={pic.url} className="gallery-image" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="gallery-column">
        {allRight.map((pic, i) => (
          <div
            key={`r-${i}`}
            className="gallery-item"
            style={
              itemHeight
                ? { transform: getTranslate(i, imagesRight.length, -1) }
                : {}
            }
          >
            <div className="gallery-fallback" />

            <div className="gallery-item-inner">
              <div className="gallery-item-inner">
                <div className="gallery-label">{pic.text}</div>
                <img src={pic.url} className="gallery-image-blur" />
                <img src={pic.url} className="gallery-image" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
