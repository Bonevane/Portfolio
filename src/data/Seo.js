// Per-route metadata applied by App on navigation. Everything else in the
// <head> is static in index.html.
import { siteUrl } from "./Site.js";

export { siteUrl };

export const seo = {
  Home: {
    title: "Rafay Ahmad | Creative Developer & Designer",
    description:
      "Creative developer and designer from Pakistan crafting interactive experiences with React, Next.js, Three.js, Blender and Unity. Web apps, 3D art, games and research.",
    path: "/",
  },
  Portfolios: {
    title: "Portfolio | Rafay Ahmad",
    description:
      "Selected work by Rafay Ahmad: web apps built with React and Next.js, Blender renders and animations, Unity games, AR tools, CUDA and deep learning experiments.",
    path: "/portfolios",
  },
  Misc: {
    title: "Gallery & Skills | Rafay Ahmad",
    description:
      "Photography and scenes by Rafay Ahmad, plus the tools and languages behind the work, shown on a 3D Pixel 9 Pro.",
    path: "/misc",
  },
  Contact: {
    title: "Contact | Rafay Ahmad",
    description:
      "Get in touch with Rafay Ahmad on GitHub, LinkedIn, X, YouTube, Instagram, itch.io, Discord or by email.",
    path: "/contact",
  },
  404: {
    title: "Not Found | Rafay Ahmad",
    description: "That page doesn't exist.",
    path: null,
    noindex: true,
  },
};

export const defaultImage = {
  url: `${siteUrl}/og-image.jpg`,
  alt: "Moon Over the Castle, a Blender cinematic by Rafay Ahmad",
};

// Metadata for a single project page (/projects/<slug>).
export function projectSeo(card) {
  const thumb = card.thumbnail || card.media?.find((m) => m.type === "image")?.url;
  return {
    title: `${card.title} | Rafay Ahmad`,
    description: card.description.trim(),
    path: `/projects/${card.slug}`,
    image: thumb
      ? { url: siteUrl + "/" + thumb.replace(/^\.?\//, ""), alt: card.title }
      : defaultImage,
  };
}

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    const [key, val] = selector.match(/\[(\w+(?::\w+)?)="([^"]+)"\]/).slice(1);
    el.setAttribute(key, val);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

export function applySeo(tabOrEntry) {
  const entry =
    typeof tabOrEntry === "object" ? tabOrEntry : seo[tabOrEntry] || seo["404"];
  const image = entry.image || defaultImage;
  setMeta('meta[property="og:image"]', "content", image.url);
  setMeta('meta[property="og:image:alt"]', "content", image.alt);
  setMeta('meta[name="twitter:image"]', "content", image.url);
  setMeta('meta[name="twitter:image:alt"]', "content", image.alt);
  document.title = entry.title;
  setMeta('meta[name="description"]', "content", entry.description);
  setMeta('meta[property="og:title"]', "content", entry.title);
  setMeta('meta[property="og:description"]', "content", entry.description);
  setMeta('meta[name="twitter:title"]', "content", entry.title);
  setMeta('meta[name="twitter:description"]', "content", entry.description);

  const url = entry.path ? siteUrl + entry.path : siteUrl + "/";
  setMeta('meta[property="og:url"]', "content", url);
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;

  // Unknown routes get a real 404 from the server too (see scripts/seoPages.js).
  let robots = document.head.querySelector('meta[name="robots"]');
  if (robots) robots.setAttribute("content", entry.noindex ? "noindex, nofollow" : "index, follow");
}
