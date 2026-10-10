import { useEffect, useState } from "react";
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

  useEffect(() => {
    applyScheme(section, dark, enabled);
  }, [section, dark, enabled]);

  return dark;
}
