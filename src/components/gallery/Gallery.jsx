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
    if (itemRef.current) {
      const height = itemRef.current.getBoundingClientRect().height;
      const width = itemRef.current.getBoundingClientRect().width;
      setItemHeight(height + width / 4); // include gap
    }
  }, []);

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

  // Manual scroll with friction
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      scrollSpeed.current += e.deltaY * 0.5;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    const animate = () => {
      scrollSpeed.current *= 0.5; // friction
      if (Math.abs(scrollSpeed.current) > 0.1) {
        setOffset((prev) => prev + scrollSpeed.current);
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("wheel", handleWheel);
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
        {allLeft.map((url, i) => (
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
                <div className="gallery-label">What is going on here?</div>
                <img src={url} className="gallery-image-blur" />
                <img src={url} className="gallery-image" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="gallery-column">
        {allRight.map((url, i) => (
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
                <div className="gallery-label">Placeholder</div>
                <img src={url} className="gallery-image-blur" />
                <img src={url} className="gallery-image" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
