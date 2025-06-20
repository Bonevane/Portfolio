import { useRef, useEffect } from "react";
import "./Flower.css";

export default function Flower() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    let animationFrame;
    let speed = 0.2;
    let targetSpeed = 0.2;
    let initialSpeed = targetSpeed;

    let isDragging = false;
    let lastAngle = 0;
    let lastTime = 0;
    let currentRotation = 0;

    let lastVibrationTick = 0; // tracks when last vibration happened
    const tickInterval = 15; // to set degrees between each vibration

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

      speed = (deltaAngle / deltaTime) * 16;
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

      // VIBRATION: every tickInterval degrees
      const deltaSinceLastTick = Math.abs(currentRotation - lastVibrationTick);
      if (deltaSinceLastTick >= tickInterval) {
        if (
          navigator.vibrate &&
          (speed >= initialSpeed + 0.01 || speed <= initialSpeed - 0.01)
        ) {
          const vibrationStrength = 1;
          navigator.vibrate(vibrationStrength);
        }
        lastVibrationTick = currentRotation;
      }
      animationFrame = requestAnimationFrame(update);
    };

    update();

    el.addEventListener("mouseenter", () => (targetSpeed = 0.5));
    el.addEventListener("mouseleave", () => (targetSpeed = 0.2));

    el.addEventListener("pointerdown", onPointerDown, { passive: false });
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      cancelAnimationFrame(animationFrame);
      el.removeEventListener("mouseenter", () => (targetSpeed = 0.5));
      el.removeEventListener("mouseleave", () => (targetSpeed = 0.2));
      el.removeEventListener("pointerdown", onPointerDown, { passive: false });
      window.removeEventListener("pointermove", onPointerMove, {
        passive: false,
      });
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  return (
    <div>
      <div className="flower-container fixed top-0 right-0 translate-x-2/7 -translate-y-2/7 max-w-[900px] max-h-[900px] flex items-center justify-center">
        {/* Rotating Flower Wrapper */}
        <div className="absolute w-full h-full rounded-full rotating-flower-wrapper z-10">
          <div
            ref={ref}
            data-rotation="0"
            className="relative w-full h-full rounded-full will-change-transform"
          >
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

        {/* Center blurred circle and my pic*/}
        <div className="flex items-center justify-center w-[70%] h-[70%] rounded-full backdrop-blur-lg bg-white/10 border border-white/5 z-20 profile-circle">
          <img
            src="/me.webp"
            alt="Profile"
            className="w-[90%] h-[90%] object-cover rounded-full "
          />
        </div>
      </div>
    </div>
  );
}
