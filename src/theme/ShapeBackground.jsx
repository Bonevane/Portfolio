import { useEffect, useMemo, useRef } from "react";
import { radii, pathFromRadii, lerpRadii, shapePath } from "./shapes.js";
import "./ShapeBackground.css";

// Large M3 Expressive shapes behind the page. All of them turn slowly
// anticlockwise (CSS), and every few seconds one of them morphs into its next
// shape while turning a little further, on a damped spring, the way Google's
// shape morphs move.
const layers = [
  {
    cls: "bg-shape-a",
    fill: "--md-surface-container-highest",
    seq: ["cookie9", "sunny", "flower", "cookie7"],
    still: "cookie9",
  },
  {
    cls: "bg-shape-b",
    fill: "--md-surface-container-high",
    seq: ["clover4", "cookie6", "cookie8", "cookie4"],
    still: "cookie6",
  },
  {
    cls: "bg-shape-c",
    fill: "--md-secondary-container",
    seq: ["softBurst", "verySunny", "flower", "cookie12"],
    still: "cookie12",
  },
];

// Firefox (and Gecko-based browsers) draw inline SVG on the CPU and redraw it
// whenever its on-screen transform changes, so turning big vector shapes there
// is a crawl. In Firefox each shape is a fixed cookie drawn as a CSS mask (a
// texture the GPU turns for free), and nothing morphs.
const gecko =
  typeof CSS !== "undefined" && CSS.supports("-moz-appearance", "none");
const maskOf = (name) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><path d="${shapePath(name)}"/></svg>`,
  )}")`;

// Damped spring step response: one soft overshoot, then settles.
const ZETA = 0.62;
const OMEGA = 8.5;
const WD = OMEGA * Math.sqrt(1 - ZETA * ZETA);
const spring = (t) =>
  1 -
  Math.exp(-ZETA * OMEGA * t) *
    (Math.cos(WD * t) + ((ZETA * OMEGA) / WD) * Math.sin(WD * t));
const DURATION = 1.25; // seconds, enough for the spring to settle

export default function ShapeBackground() {
  const groupRefs = useRef([]);
  const pathRefs = useRef([]);
  // Initial shapes are drawn during render, so the very first frame (and the
  // design-switch snapshot) already has them.
  const initial = useMemo(
    () => layers.map((l) => pathFromRadii(radii(l.seq[0]))),
    [],
  );

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const state = layers.map((l, k) => ({
      shape: 0,
      r: radii(l.seq[0]),
      angle: k * 30,
    }));
    state.forEach((s, k) => {
      pathRefs.current[k]?.setAttribute("d", pathFromRadii(s.r));
      groupRefs.current[k]?.setAttribute(
        "transform",
        `rotate(${s.angle} 0.5 0.5)`,
      );
    });
    if (reduce || gecko) return;

    let raf = 0;
    let next = 0;
    const morph = () => {
      const k = next++ % layers.length;
      const s = state[k];
      const fromR = s.r;
      const fromA = s.angle;
      s.shape = (s.shape + 1) % layers[k].seq.length;
      const toR = radii(layers[k].seq[s.shape]);
      const toA = fromA + 50 + Math.random() * 40;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(DURATION, (now - start) / 1000);
        const e = spring(t);
        pathRefs.current[k]?.setAttribute(
          "d",
          pathFromRadii(lerpRadii(fromR, toR, e)),
        );
        groupRefs.current[k]?.setAttribute(
          "transform",
          `rotate(${fromA + (toA - fromA) * e} 0.5 0.5)`,
        );
        if (t < DURATION) raf = requestAnimationFrame(step);
        else {
          s.r = toR;
          s.angle = toA;
        }
      };
      raf = requestAnimationFrame(step);
    };
    const timer = setInterval(morph, 3000);
    return () => {
      clearInterval(timer);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className={`bg-shapes${gecko ? " bg-shapes-gecko" : ""}`}
      aria-hidden="true"
    >
      {layers.map((l, k) =>
        gecko ? (
          <div
            key={l.cls}
            className={`bg-shape ${l.cls}`}
            style={{
              backgroundColor: `var(${l.fill})`,
              maskImage: maskOf(l.still),
            }}
          />
        ) : (
          <svg key={l.cls} className={`bg-shape ${l.cls}`} viewBox="0 0 1 1">
            <g
              ref={(el) => (groupRefs.current[k] = el)}
              transform={`rotate(${k * 30} 0.5 0.5)`}
            >
              <path
                ref={(el) => (pathRefs.current[k] = el)}
                d={initial[k]}
                style={{ fill: `var(${l.fill})` }}
              />
            </g>
          </svg>
        ),
      )}
    </div>
  );
}
