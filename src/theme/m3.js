// Material 3 Expressive dynamic colour. Each section has a seed colour; the
// official colour library turns it into a full M3 scheme (2025 spec), which is
// written to CSS variables on <html>. Everything else in the UI reads those
// variables, so switching section recolours the whole interface.
import {
  Hct,
  SchemeVibrant,
  SchemeNeutral,
  MaterialDynamicColors as md,
  argbFromHex,
  hexFromArgb,
} from "@material/material-color-utilities";

// Seeds come from the original section colours (src/data/Colors.js).
const seeds = {
  // Red, as in Android 16 / M3 Expressive (hue ~26, reproduces its Settings colours).
  Home: "#C85043",
  Highlights: "#F4B63F",
  Web_Dev: "#0073CB",
  Blender: "#00C2CB",
  Experiments: "#7449FF",
  Game_Dev: "#FFC01F",
  Contact: "#16A085",
  Gallery: "#8A8A8A",
  Photos: "#8A8A8A",
  Skills: "#8A8A8A",
  404: "#FF3C73",
};

// Grey sections get a neutral scheme rather than an invented hue.
const neutral = new Set(["Gallery", "Photos", "Skills"]);

const roles = [
  "primary", "onPrimary", "primaryContainer", "onPrimaryContainer",
  "secondary", "onSecondary", "secondaryContainer", "onSecondaryContainer",
  "tertiary", "onTertiary", "tertiaryContainer", "onTertiaryContainer",
  "surface", "surfaceDim", "surfaceBright",
  "surfaceContainerLowest", "surfaceContainerLow", "surfaceContainer",
  "surfaceContainerHigh", "surfaceContainerHighest",
  "onSurface", "onSurfaceVariant", "outline", "outlineVariant",
  "inverseSurface", "inverseOnSurface", "inversePrimary",
];

const kebab = (s) => s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
const cache = new Map();

export function schemeFor(section, dark) {
  const key = `${section}|${dark}`;
  if (cache.has(key)) return cache.get(key);
  const seed = Hct.fromInt(argbFromHex(seeds[section] || seeds.Home));
  // Vibrant on the 2025 spec is what Android 16 uses: with a red seed it
  // reproduces the Settings app's surfaces almost exactly.
  const Scheme = neutral.has(section) ? SchemeNeutral : SchemeVibrant;
  const scheme = new Scheme(seed, dark, 0, "2025");
  const vars = {};
  for (const r of roles) vars[`--md-${kebab(r)}`] = hexFromArgb(md[r].getArgb(scheme));
  // Android's mapping: the page sits on surfaceContainer and cards on surface
  // (light) or surfaceBright (dark), which reads as lifted.
  vars["--m3-page"] = vars["--md-surface-container"];
  vars["--m3-card"] = dark ? vars["--md-surface-bright"] : vars["--md-surface"];
  cache.set(key, vars);
  return vars;
}

// The variables are always kept current (they are unused by the original
// design), so switching to M3 never shows a frame with stale colours.
export function applyScheme(section, dark, active) {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(schemeFor(section, dark))) root.style.setProperty(k, v);
  root.dataset.theme = dark ? "dark" : "light";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", active ? schemeFor(section, dark)["--m3-page"] : "#000000");
}
