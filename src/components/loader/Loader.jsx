import { useEffect, useRef } from "react";
import { useDesign } from "../../theme/design.js";
import "./Loader.css";

// Material 3 Expressive wavy progress indicator (indeterminate): a wavy arc
// that grows and shrinks as it chases round a circle, with a flat track
// filling the rest of the ring, separated by small gaps.
const R = 20; // ring radius, in a 48 x 48 box
const AMP = 1.6; // wave height
const WAVES = 11; // waves around a full circle
const GAP = 14; // degrees of gap between the arc's ends and the track
const CYCLE = 1333; // ms for one grow + shrink
const SPIN = 2400; // ms for one turn of the whole indicator
const MIN_SWEEP = 12;
const MAX_SWEEP = 280;

const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const clamp = (x) => Math.min(1, Math.max(0, x));
const rad = (deg) => (deg * Math.PI) / 180;

// Points along an arc whose radius follows a sine wave.
function wavyArc(from, to, phase) {
  const steps = Math.max(2, Math.ceil((to - from) / 2));
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const a = rad(from + ((to - from) * i) / steps);
    const r = R + AMP * Math.sin(a * WAVES + phase);
    d += `${i ? "L" : "M"}${(24 + r * Math.cos(a)).toFixed(2)} ${(24 + r * Math.sin(a)).toFixed(2)}`;
  }
  return d;
}

function flatArc(from, to) {
  if (to - from < 1) return "";
  const p = (deg) => `${(24 + R * Math.cos(rad(deg))).toFixed(2)} ${(24 + R * Math.sin(rad(deg))).toFixed(2)}`;
  return `M${p(from)} A${R} ${R} 0 ${to - from > 180 ? 1 : 0} 1 ${p(to)}`;
}

function M3Loader() {
  const arcRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw = (now) => {
      const cycle = Math.floor(now / CYCLE);
      const p = (now % CYCLE) / CYCLE;
      // The head runs ahead in the first half, the tail catches up in the
      // second; each cycle starts where the last one's tail stopped.
      const grow = ease(clamp(p * 2));
      const shrink = ease(clamp(p * 2 - 1));
      const span = MAX_SWEEP - MIN_SWEEP;
      const base = cycle * span + (now / SPIN) * 360 - 90;
      const tail = base + shrink * span;
      const head = base + MIN_SWEEP + grow * span;
      arcRef.current?.setAttribute("d", wavyArc(tail, head, -now / 140));
      trackRef.current?.setAttribute("d", flatArc(head + GAP, tail + 360 - GAP));
    };
    if (reduce) {
      draw(CYCLE / 2);
      return;
    }
    let raf = 0;
    const frame = (now) => {
      draw(now);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg className="m3-loader" viewBox="0 0 48 48">
      <path ref={trackRef} className="m3-loader-track" />
      <path ref={arcRef} className="m3-loader-arc" />
    </svg>
  );
}

// The original design's loader: "Ring Resize" from SVG Spinners by Utkarsh
// Verma (MIT, github.com/n3r4zzurr0/svg-spinners), styled in Loader.css.
function RingLoader() {
  return (
    <svg className="ring-loader" viewBox="0 0 24 24">
      <g>
        <circle cx="12" cy="12" r="9.5" />
      </g>
    </svg>
  );
}

export default function Loader({ label = "Loading" }) {
  const design = useDesign();
  return (
    <div className="loader" role="status" aria-label={label}>
      {design === "m3" ? <M3Loader /> : <RingLoader />}
    </div>
  );
}
