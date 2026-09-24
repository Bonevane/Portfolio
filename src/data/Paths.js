import { projects } from "./Cards.js";

export const paths = {
  Home: "/home",
  Portfolios: "/portfolios",
  Misc: "/misc",
  Contact: "/contact",
};

export const tabsFromPath = {
  "/": "Home",
  "/home": "Home",
  "/portfolios": "Portfolios",
  "/misc": "Misc",
  "/contact": "Contact",
};

// Project pages live under /projects/<slug> and are part of the Portfolios tab.
const projectSlugs = new Set(projects.map((p) => p.slug));

// Only real projects count, so /projects/<typo> shows the 404 page.
export function projectSlugFromPath(path) {
  const m = path.match(/^\/projects\/([a-z0-9-]+)\/?$/);
  return m && projectSlugs.has(m[1]) ? m[1] : null;
}

export function tabFromPath(path) {
  if (tabsFromPath[path]) return tabsFromPath[path];
  return projectSlugFromPath(path) ? "Portfolios" : "404";
}
