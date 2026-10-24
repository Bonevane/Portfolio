// Effects level: "full" (every blur) or "lite" (cards and buttons drop their
// glass blur), shown as <html data-fx="...">. Low-end Android GPUs (older
// Snapdragon / MediaTek parts) can't keep up with stacked live blurs.
//
// To avoid false positives, no single hint is enough to switch to lite:
// - A GPU on the known-weak list switches straight away.
// - An unknown GPU switches only after two separate measurements of real
//   frames both show the page struggling.
// - A known-fast GPU switches only if it's very slow (e.g. heat throttling).
// Memory size isn't used: Chrome rounds and caps it, so it misfires alone.
//
// The verdict is remembered per GPU, so later visits start in the right mode.
// It never flips back during a visit. ?fx=lite / ?fx=full force a mode
// (remembered; ?fx=auto clears it). Decisions are logged to the console.
import { useSyncExternalStore } from "react";

const KEY = "fx";
const MEASURED_TTL = 14 * 24 * 3600 * 1000; // re-measure a measured verdict after this

let current = "full";
const listeners = new Set();

function set(mode, why) {
  if (mode === current) return;
  current = mode;
  document.documentElement.dataset.fx = mode;
  if (why) console.info(`[fx] ${mode}: ${why}`);
  listeners.forEach((l) => l());
}

export function useFx() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => current,
  );
}

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function writeStore(v) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* private mode etc. */
  }
}

// The GPU's name as WebGL reports it, e.g. "Adreno (TM) 610", "Mali-G57 MC2".
function gpuName() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "";
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return name;
  } catch {
    return "";
  }
}

// "weak", "fast" or "unknown". Mid-range parts are left unknown on purpose:
// whether they cope depends on the phone (screen resolution, thermals), so
// they're judged by measurement instead.
export function classifyGpu(name) {
  const n = name.toLowerCase();
  if (!n) return "unknown";
  if (/swiftshader|llvmpipe|softpipe|software|basic render/.test(n)) return "weak";
  if (/apple|xclipse|immortalis|nvidia|geforce|radeon|rtx|quadro/.test(n)) return "fast";
  let m = /adreno[^0-9]*(\d{3})/.exec(n);
  if (m) {
    const v = +m[1];
    if (v >= 730) return "fast"; // Snapdragon 8 Gen x and newer flagships
    // Older flagship parts (Snapdragon 855/865/888) and the upper mid-range
    // Adreno 725 (7+ Gen 2) usually cope; let measurement decide.
    if ([640, 650, 660, 725].includes(v)) return "unknown";
    // Everything else below 730 is budget or mid-range and struggles with
    // stacked blurs: 3xx-5xx, 610-620 (Snapdragon 4xx/6xx, 4 Gen x),
    // 642/642L/643/644 (778G/780G, e.g. Mi 11 Lite 5G), 710/720/722
    // (6/7-series Gen x, e.g. Redmi Note 14 Pro+).
    return "weak";
  }
  m = /mali[- ]?([gt])(\d+)(?:.*?\bm[cp](\d+))?/.exec(n);
  if (m) {
    const v = +m[2];
    const cores = m[3] ? +m[3] : 0;
    if (m[1] === "t" || v < 60) return "weak"; // Mali-T, G31/G51/G52/G57 (budget MediaTek)
    // Few cores means weak whatever the generation: G615 MC2 (Dimensity
    // 7300, Redmi Note 14 Pro), G68 MC4 (Dimensity 1080/7050), G57 MC2.
    if (cores && cores <= 4) return "weak";
    if (v === 77 || v === 78 || v >= 700) return "fast"; // G77/G78, G710+
    return "unknown"; // G610 MC6, G71-G76 with more cores
  }
  // Older PowerVR (GE8320 in Helio P/A) and the B-series BXM in Dimensity
  // 7020/7025/930 (e.g. Redmi Note 14 5G).
  if (/powervr|\bimg\b/.test(n)) return /ge\d{4}|g\d{4}|sgx|bxm/.test(n) ? "weak" : "unknown";
  return "unknown";
}

// Runs once before React renders, so the first frame is already in the right mode.
export function initFx() {
  document.documentElement.dataset.fx = current;
  const store = readStore();
  const param = new URLSearchParams(location.search).get("fx");
  if (param === "auto") {
    delete store.force;
    writeStore(store);
  } else if (param === "lite" || param === "full") {
    store.force = param;
    writeStore(store);
  }
  if (store.force) {
    set(store.force, `forced by ?fx=${store.force} (use ?fx=auto to undo)`);
    return;
  }

  const gpu = gpuName();
  const tier = classifyGpu(gpu);
  if (tier === "weak") {
    set("lite", `GPU "${gpu}" is on the low-end list`);
    return;
  }
  // A measured verdict for this same GPU that's still fresh.
  if (store.gpu === gpu && store.mode && Date.now() - (store.at || 0) < MEASURED_TTL) {
    if (store.mode === "lite") set("lite", `measured slow on an earlier visit (GPU "${gpu}")`);
    return;
  }
  measure(gpu, tier);
}

// Watches real frames for a while. A window counts as slow when too many of
// its frames take much longer than the screen's own refresh interval; two
// slow windows switch to lite. Windows only count while the page is visible,
// and measuring starts after load + fonts, skipping the first second.
function measure(gpu, tier) {
  const WINDOW = 2000; // ms per window
  const MAX_WINDOWS = 10; // give up (stay full) after ~20s of watching
  const NEEDED = 2;
  const missedLimit = tier === "fast" ? 0.5 : 0.25; // share of long frames

  const start = () => {
    let slow = 0;
    let windows = 0;
    let frames = [];
    let last = 0;
    let windowStart = 0;
    // A hidden tab doesn't render, so the window in progress is dropped and
    // the gap while hidden is never counted as a slow frame.
    const reset = () => {
      frames = [];
      last = 0;
      windowStart = 0;
    };
    document.addEventListener("visibilitychange", reset);
    const done = () => document.removeEventListener("visibilitychange", reset);
    const tick = (now) => {
      if (document.hidden) {
        reset();
        requestAnimationFrame(tick);
        return;
      }
      if (last) frames.push(now - last);
      last = now;
      if (!windowStart) windowStart = now;
      if (now - windowStart >= WINDOW && frames.length > 10) {
        // The refresh interval is what the fastest frames achieve, so a
        // 90/120Hz screen isn't judged against 60Hz timings.
        const sorted = [...frames].sort((a, b) => a - b);
        const vsync = sorted[Math.floor(sorted.length * 0.1)];
        const missed = frames.filter((f) => f > vsync * 1.6 && f > 20).length / frames.length;
        windows++;
        if (missed > missedLimit) slow++;
        frames = [];
        windowStart = now;
        if (slow >= NEEDED) {
          writeStore({ ...readStore(), gpu, mode: "lite", at: Date.now() });
          set("lite", `${Math.round(missed * 100)}% of frames were late in ${slow} of ${windows} measurements (GPU "${gpu || "unknown"}")`);
          done();
          return;
        }
        if (windows >= MAX_WINDOWS) {
          writeStore({ ...readStore(), gpu, mode: "full", at: Date.now() });
          console.info(`[fx] full: frames kept up (${slow} slow of ${windows} measurements, GPU "${gpu || "unknown"}")`);
          done();
          return;
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const afterLoad = () =>
    (document.fonts?.ready ?? Promise.resolve()).then(() => setTimeout(start, 1000));
  if (document.readyState === "complete") afterLoad();
  else addEventListener("load", afterLoad, { once: true });
}
