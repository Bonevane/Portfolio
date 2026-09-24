// Build step: one static HTML file per route, so crawlers and link-preview
// bots that don't run JavaScript still get the right title, description,
// canonical URL and social tags. Also writes a real 404 page and a sitemap
// generated from the project and gallery data.
import fs from "node:fs";
import path from "node:path";
import { seo, siteUrl, projectSeo } from "../src/data/Seo.js";
import { cards, projects } from "../src/data/Cards.js";
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
  if (entry.image) {
    html = setAttr(html, /(<meta\s+property="og:image"\s+content=")[^"]*(")/, entry.image.url);
    html = setAttr(html, /(<meta\s+name="twitter:image"\s+content=")[^"]*(")/, entry.image.url);
    html = setAttr(html, /(<meta\s+property="og:image:alt"\s+content=")[^"]*(")/, entry.image.alt);
    html = setAttr(html, /(<meta\s+name="twitter:image:alt"\s+content=")[^"]*(")/, entry.image.alt);
    // The default share image is a JPEG; project thumbnails may be WebP/PNG.
    html = html.replace(/\s*<meta\s+property="og:image:(type|width|height)"[^>]*>/g, "");
  }
  return html;
}

const absUrl = (u) => siteUrl + "/" + u.replace(/^\.?\//, "");

// Extra <head>/<noscript> content for a project page: a CreativeWork for
// search engines, and readable text for crawlers that don't run JavaScript.
function projectPage(template, card) {
  const entry = projectSeo(card);
  let html = pageFor(template, entry);

  const images = card.media.filter((m) => m.type === "image").map((m) => absUrl(m.url));
  const video = card.media.find((m) => m.type === "video");
  const ld = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: card.title,
    description: card.longDescription || entry.description,
    url: siteUrl + entry.path,
    image: images.length ? images : entry.image.url,
    keywords: card.tags.join(", "),
    genre: card.section.replace("_", " "),
    author: { "@id": `${siteUrl}/#person` },
    isPartOf: { "@id": `${siteUrl}/#website` },
  };
  if (card.code) ld.codeRepository = card.code;
  if (card.live) ld.sameAs = card.live;
  if (video) ld.video = { "@type": "VideoObject", name: card.title, description: entry.description, contentUrl: absUrl(video.url), thumbnailUrl: entry.image.url };
  html = html.replace(
    "</head>",
    `  <script type="application/ld+json">${JSON.stringify(ld)}</script>\n  </head>`
  );

  const links = [
    card.live && `<a href="${esc(card.live)}">Live</a>`,
    card.code && `<a href="${esc(card.code)}">Code</a>`,
    `<a href="${siteUrl}/portfolios">All projects</a>`,
  ].filter(Boolean).join(" · ");
  const noscript = `<noscript>
      <main style="font-family: sans-serif; padding: 2rem; color: #cec9c9; background: #000">
        <h1>${esc(card.title)}</h1>
        <p>${esc(card.longDescription || entry.description)}</p>
        <p>${card.tags.map(esc).join(", ")}</p>
        <p>${links}</p>
        <p>By <a href="${siteUrl}/">Rafay Ahmad (Bonevane)</a>.</p>
      </main>
    </noscript>`;
  if (!/<noscript>[\s\S]*?<\/noscript>/.test(html)) throw new Error("seoPages: <noscript> not found");
  return html.replace(/<noscript>[\s\S]*?<\/noscript>/, noscript);
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
  const pages = Object.values(seo)
    .filter((e) => e.path)
    .map((e) => {
      const imgs = (images[e.path] || [])
        .map((u) => `\n    <image:image><image:loc>${esc(abs(u))}</image:loc></image:image>`)
        .join("");
      return `  <url>\n    <loc>${siteUrl}${e.path}</loc>\n    <lastmod>${today}</lastmod>${imgs}\n  </url>`;
    });
  const projectUrls = projects.map((p) => {
    const imgs = [...new Set([p.thumbnail, ...p.media.filter((m) => m.type === "image").map((m) => m.url)])]
      .filter(Boolean)
      .map((u) => `\n    <image:image><image:loc>${esc(abs(u))}</image:loc></image:image>`)
      .join("");
    return `  <url>\n    <loc>${siteUrl}/projects/${p.slug}</loc>\n    <lastmod>${today}</lastmod>${imgs}\n  </url>`;
  });
  const urls = [...pages, ...projectUrls].join("\n");
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
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    // index.html uses %SITE_URL% so the address lives only in src/data/Site.js.
    transformIndexHtml(html) {
      return html.replaceAll("%SITE_URL%", siteUrl);
    },
    closeBundle() {
      if (!outDir || this.meta?.watchMode) return;
      const template = fs.readFileSync(path.join(outDir, "index.html"), "utf8");
      const write = (file, html) => fs.writeFileSync(path.join(outDir, file), html);

      write("index.html", pageFor(template, seo.Home));
      // /home is an alias of the home page; its canonical points at "/".
      write("home.html", pageFor(template, seo.Home));
      for (const key of ["Portfolios", "Misc", "Contact"]) {
        write(`${seo[key].path.slice(1)}.html`, pageFor(template, seo[key]));
      }
      write("404.html", pageFor(template, seo[404]));
      fs.mkdirSync(path.join(outDir, "projects"), { recursive: true });
      for (const card of projects) {
        write(`projects/${card.slug}.html`, projectPage(template, card));
      }
      write("sitemap.xml", sitemap());
      write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
    },
  };
}
