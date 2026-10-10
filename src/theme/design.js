// Which design is active: the original ("classic") or Material 3 Expressive
// ("m3"). Stored per visitor; applied as <html data-design="..."> so all M3
// styles can be scoped to it. Everything M3-specific loads only when used.
import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

const KEY = "design";
const listeners = new Set();
let current = readStored();

function readStored() {
  try {
    return localStorage.getItem(KEY) === "m3" ? "m3" : "classic";
  } catch {
    return "classic";
  }
}

// Google Sans Flex, fetched the first time M3 is shown.
let fontPromise = null;
function loadM3Font() {
  if (fontPromise) return fontPromise;
  fontPromise = new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght,ROND@6..144,1..1000,0..100&display=swap";
    link.onload = () =>
      document.fonts.load('600 1em "Google Sans Flex"').then(resolve, resolve);
    link.onerror = resolve;
    document.head.appendChild(link);
    setTimeout(resolve, 1500); // never hold the switch for long
  });
  return fontPromise;
}

function apply(design) {
  document.documentElement.dataset.design = design;
  if (design === "m3") loadM3Font();
}

// Called once before React renders, so there is no flash of the wrong design.
export function initDesign() {
  apply(current);
}

function set(design) {
  current = design;
  apply(design);
  try {
    localStorage.setItem(KEY, design);
  } catch {
    /* private mode etc. */
  }
  listeners.forEach((l) => l());
}

export function useDesign() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => current
  );
}

// Switch designs with a circular reveal growing from (x, y), where supported.
export async function toggleDesign(x = innerWidth / 2, y = innerHeight / 2) {
  const next = current === "m3" ? "classic" : "m3";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce) {
    if (next === "m3") await loadM3Font();
    set(next);
    return;
  }
  const root = document.documentElement;
  root.style.setProperty("--reveal-x", `${x}px`);
  root.style.setProperty("--reveal-y", `${y}px`);
  root.style.setProperty(
    "--reveal-r",
    `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`
  );
  if (next === "m3") await loadM3Font();
  // The update must finish synchronously: rendering (and requestAnimationFrame)
  // is paused while it runs, so waiting for a frame here stalls the page until
  // the browser's transition timeout. Components draw their first frame on
  // mount instead (see Aurora), so the snapshot is already complete.
  document.startViewTransition(() => flushSync(() => set(next)));
}
