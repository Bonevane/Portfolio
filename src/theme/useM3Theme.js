import { useEffect, useLayoutEffect, useState } from "react";
import { applyScheme } from "./m3.js";

const query = "(prefers-color-scheme: dark)";

// Follows the visitor's system light/dark setting and recolours on section change.
export default function useM3Theme(section, enabled = true) {
  const [dark, setDark] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // A layout effect, so the colours are in place in the same commit that turns
  // M3 on (the design switch renders synchronously inside a view transition).
  useLayoutEffect(() => {
    applyScheme(section, dark, enabled);
  }, [section, dark, enabled]);

  return dark;
}
