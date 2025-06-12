import { useRef, useEffect } from "react";
import "./Flower.css";

export default function Flower() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    let animationFrame;
    let speed = 0.2; // degrees per frame
    let targetSpeed = 0.2;

    let isDragging = false;
    let lastAngle = 0;
    let lastTime = 0;
    let currentRotation = 0;

    const getAngle = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const x = e.clientX - cx;
      const y = e.clientY - cy;
      return Math.atan2(y, x) * (180 / Math.PI);
    };

    const onPointerDown = (e) => {
      isDragging = true;
      speed = 0;
      lastAngle = getAngle(e);
      lastTime = performance.now();
      e.preventDefault();
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const angle = getAngle(e);
      const now = performance.now();
      const deltaAngle = angle - lastAngle;
      const deltaTime = now - lastTime;

      currentRotation += deltaAngle;
      el.style.transform = `rotate(${currentRotation}deg)`;
      el.dataset.rotation = currentRotation;

      speed = (deltaAngle / deltaTime) * 16; // ~per-frame rotational speed
      lastAngle = angle;
      lastTime = now;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const update = () => {
      if (!isDragging) {
        const current = parseFloat(el.dataset.rotation || "0");
        const next = current + speed;
        el.style.transform = `rotate(${next}deg)`;
        el.dataset.rotation = next;
        currentRotation = next;

        speed += (targetSpeed - speed) * 0.05;
      }
      animationFrame = requestAnimationFrame(update);
    };

    update();

    el.addEventListener("mouseenter", () => (targetSpeed = 0.5));
    el.addEventListener("mouseleave", () => (targetSpeed = 0.2));

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      cancelAnimationFrame(animationFrame);
      el.removeEventListener("mouseenter", () => (targetSpeed = 0.5));
      el.removeEventListener("mouseleave", () => (targetSpeed = 0.2));
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  return (
    <div>
      <div className="fixed w-full h-full top-0 bg-[url(./grain.png)] bg-repeat opacity-25"></div>
      {/* <div className="fixed bottom-0 right-0 w-[40vw] h-[40vw] translate-x-1/2 translate-y-1/2 rounded-full bg-white blur-[50rem]"></div> */}
      <div className="fixed top-0 right-0 translate-x-2/7 -translate-y-2/7 w-[130vw] max-w-[900px] h-[130vw] max-h-[900px] flex items-center justify-center">
        {/* Rotating Flower Wrapper */}
        <div className="absolute w-full h-full rounded-full rotating-flower-wrapper z-10">
          <div
            ref={ref}
            data-rotation="0"
            className="relative w-full h-full rounded-full will-change-transform"
          >
            {/* Blur flower shape */}
            <div
              className="absolute inset-0 backdrop-blur-xl rounded-full rotating-flower"
              style={{
                WebkitMaskImage: 'url("/flower.svg")',
                maskImage: 'url("/flower.svg")',
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                background: "rgba(140, 140, 140, 0.3)",
              }}
            />
          </div>
        </div>

        {/* Center blurred circle */}
        <div className="flex items-center justify-center w-[70%] h-[70%] rounded-full backdrop-blur-lg bg-white/10 border border-white/5 z-20 profile-circle">
          <img
            src="/me.jpg" // change to your actual image path
            alt="Profile"
            className="w-[90%] h-[90%] object-cover rounded-full "
          />
        </div>
      </div>
    </div>
  );
}
