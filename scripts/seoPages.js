// Build step: one static HTML file per route, so crawlers and link-preview
// bots that don't run JavaScript still get the right title, description,
// canonical URL and social tags. Also writes a real 404 page and a sitemap
// generated from the project and gallery data.
import fs from "node:fs";
import path from "node:path";
import { seo, siteUrl } from "../src/data/Seo.js";
import { cards } from "../src/data/Cards.js";
import { picsLeft, picsRight } from "../src/data/Pictures.js";

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function setAttr(html, pattern, value) {
  if (!pattern.test(html)) throw new Error(`seoPages: tag not found for ${pattern}`);
  return html.replace(pattern, (_, before, after) => `${before}${esc(value)}${after}`);
}

function pageFor(template, entry) {
  const url = entry.path ? siteUrl + entry.path : siteUrl + "/";
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${esc(entry.title)}</title>`);
  html = setAttr(html, /(<meta\s+name="description"\s+content=")[^"]*(")/, entry.description);
  html = setAttr(html, /(<meta\s+name="title"\s+content=")[^"]*(")/, entry.title);
  html = setAttr(html, /(<meta\s+property="og:title"\s+content=")[^"]*(")/, entry.title);
  html = setAttr(html, /(<meta\s+property="og:description"\s+content=")[^"]*(")/, entry.description);
  html = setAttr(html, /(<meta\s+property="og:url"\s+content=")[^"]*(")/, url);
  html = setAttr(html, /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, entry.title);
  html = setAttr(html, /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, entry.description);
  html = setAttr(html, /(<link\s+rel="canonical"\s+href=")[^"]*(")/, url);
  html = setAttr(
    html,
    /(<meta\s+name="robots"\s+content=")[^"]*(")/,
    entry.noindex ? "noindex, nofollow" : "index, follow"
  );
  return html;
}

function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const abs = (u) => siteUrl + "/" + u.replace(/^\.?\//, "");
  const projectImages = [...new Set(cards.map((c) => c.thumbnail).filter(Boolean))];
  const galleryImages = [...picsLeft, ...picsRight].map((p) => p.url);
  const images = {
    "/portfolios": projectImages,
    "/misc": galleryImages,
  };
  const urls = Object.values(seo)
    .filter((e) => e.path)
    .map((e) => {
      const imgs = (images[e.path] || [])
        .map((u) => `\n    <image:image><image:loc>${esc(abs(u))}</image:loc></image:image>`)
        .join("");
      return `  <url>\n    <loc>${siteUrl}${e.path}</loc>\n    <lastmod>${today}</lastmod>${imgs}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
}

export default function seoPages() {
  let outDir;
  return {
    name: "seo-pages",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const template = fs.readFileSync(path.join(outDir, "index.html"), "utf8");
      const write = (file, html) => fs.writeFileSync(path.join(outDir, file), html);

      write("index.html", pageFor(template, seo.Home));
      // /home is an alias of the home page; its canonical points at "/".
      write("home.html", pageFor(template, seo.Home));
      for (const key of ["Portfolios", "Misc", "Contact"]) {
        write(`${seo[key].path.slice(1)}.html`, pageFor(template, seo[key]));
      }
      write("404.html", pageFor(template, seo[404]));
      write("sitemap.xml", sitemap());
    },
  };
}
