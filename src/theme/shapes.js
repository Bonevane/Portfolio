// Material 3 Expressive flowers and cookies, built the way Google builds them:
// from geometry rather than traced curves, so every edge is a true arc.
//
// - Flowers are star polygons whose outer and inner corners are rounded with
//   circular arcs (sizes relative to an outer radius of 1).
// - Cookies are rings of circular lobes joined by concave fillet arcs.
//
// Parameters were fitted to Google's M3 Expressive shape set (within about half
// a percent of the reference outlines). Every shape is sampled as radius vs.
// angle with the same number of samples, so any two can morph by interpolating.
const P = Math.PI;
const defs = {
  flower: { points: 8, inner: 0.567, outerRound: 0.1226, innerRound: 0.0157, phase: 0 },
  softBurst: { points: 10, inner: 0.6878, outerRound: 0.0968, innerRound: 0.1134, phase: P / 10 },
  sunny: { points: 8, inner: 0.7947, outerRound: 0.1446, innerRound: 0.2809, phase: 0 },
  verySunny: { points: 8, inner: 0.6452, outerRound: 0.1447, innerRound: 0.1544, phase: 0 },
  cookie4: { lobes: 4, centre: 0.4596, radius: 0.3508, fillet: 0.3674, phase: P / 4 },
  clover4: { lobes: 4, centre: 0.5283, radius: 0.5771, fillet: 0.0214, phase: P / 4 },
  cookie6: { lobes: 6, centre: 0.5025, radius: 0.5195, fillet: 0.6101, phase: P / 6 },
  cookie7: { lobes: 7, centre: 0.6134, radius: 0.4297, fillet: 0.5164, phase: P / 14 },
  cookie8: { lobes: 8, centre: 0.6638, radius: 0.4185, fillet: 0.0798, phase: P / 8 },
  cookie9: { lobes: 9, centre: 0.6155, radius: 0.3087, fillet: 0.2824, phase: P / 6 },
  cookie12: { lobes: 12, centre: 0.6959, radius: 0.182, fillet: 0.1802, phase: 0 },
};

const SAMPLES = 360;
const TAU = Math.PI * 2;
const angleAt = (i) => (i / SAMPLES) * TAU;
const wrap = (a) => ((a % TAU) + TAU) % TAU;

export const shapes = defs;

// Outline of a rounded star as points, then resampled by angle (the outline
// is star-shaped around the centre, so every ray crosses it once).
function starRadii({ points: n, inner, outerRound, innerRound, phase }, rotation) {
  const m = n * 2;
  const verts = [];
  for (let k = 0; k < m; k++) {
    const a = (k * Math.PI) / n;
    const rad = k % 2 ? inner : 1;
    verts.push([rad * Math.cos(a), rad * Math.sin(a)]);
  }
  const edge = Math.hypot(verts[1][0] - verts[0][0], verts[1][1] - verts[0][1]);
  const outline = [];
  for (let k = 0; k < m; k++) {
    const [px, py] = verts[(k - 1 + m) % m];
    const [cx, cy] = verts[k];
    const [nx, ny] = verts[(k + 1) % m];
    const u1 = [(px - cx) / edge, (py - cy) / edge];
    const u2 = [(nx - cx) / edge, (ny - cy) / edge];
    const th = Math.acos(Math.max(-1, Math.min(1, u1[0] * u2[0] + u1[1] * u2[1])));
    let r = k % 2 ? innerRound : outerRound;
    let d = r / Math.tan(th / 2);
    if (d > edge / 2) {
      d = edge / 2;
      r = d * Math.tan(th / 2);
    }
    // Arc centre sits on the corner's bisector, tangent to both edges.
    const bl = Math.hypot(u1[0] + u2[0], u1[1] + u2[1]);
    const h = r / Math.sin(th / 2);
    const ox = cx + ((u1[0] + u2[0]) / bl) * h;
    const oy = cy + ((u1[1] + u2[1]) / bl) * h;
    const a1 = Math.atan2(cy + u1[1] * d - oy, cx + u1[0] * d - ox);
    const a2 = Math.atan2(cy + u2[1] * d - oy, cx + u2[0] * d - ox);
    const da = wrap(a2 - a1 + Math.PI) - Math.PI;
    for (let s = 0; s <= 24; s++) {
      const a = a1 + (da * s) / 24;
      outline.push([ox + r * Math.cos(a), oy + r * Math.sin(a)]);
    }
  }
  const pts = outline
    .map(([x, y]) => [wrap(Math.atan2(y, x) + phase + rotation), Math.hypot(x, y)])
    .sort((p, q) => p[0] - q[0]);
  const last = pts[pts.length - 1];
  pts.unshift([last[0] - TAU, last[1]]);
  pts.push([pts[1][0] + TAU, pts[1][1]]);
  const out = new Float32Array(SAMPLES);
  let j = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const t = angleAt(i);
    while (pts[j + 1][0] < t) j++;
    const [t0, r0] = pts[j];
    const [t1, r1] = pts[j + 1];
    out[i] = t1 > t0 ? r0 + ((r1 - r0) * (t - t0)) / (t1 - t0) : r0;
  }
  return out;
}

// A ray from the centre against n lobe circles, with concave fillets between.
function cookieRadii({ lobes: n, centre: c, radius: a, fillet: f, phase }, rotation) {
  const half = Math.PI / n;
  // Fillet circles sit between lobes, touching both.
  const e = c * Math.cos(half) + Math.sqrt(Math.max(0, (a + f) ** 2 - (c * Math.sin(half)) ** 2));
  const lx = c * Math.cos(half);
  const ly = -c * Math.sin(half);
  const dl = Math.hypot(e - lx, ly);
  const width = Math.abs(Math.atan2(ly - (a * ly) / dl, lx + (a * (e - lx)) / dl));
  const out = new Float32Array(SAMPLES);
  for (let i = 0; i < SAMPLES; i++) {
    const t = angleAt(i) - phase - rotation;
    const dLobe = t - Math.round(t / (2 * half)) * 2 * half;
    const dGap = t - half - Math.round((t - half) / (2 * half)) * 2 * half;
    out[i] =
      Math.abs(dGap) < width
        ? e * Math.cos(dGap) - Math.sqrt(Math.max(0, f * f - (e * Math.sin(dGap)) ** 2))
        : c * Math.cos(dLobe) + Math.sqrt(Math.max(0, a * a - (c * Math.sin(dLobe)) ** 2));
  }
  return out;
}

export function radii(name, rotation = 0) {
  const def = defs[name] || defs.cookie12;
  return def.lobes ? cookieRadii(def, rotation) : starRadii(def, rotation);
}

// Closed smooth path through the polar samples (Catmull-Rom as cubic Béziers),
// scaled so the shape fills a 0..1 box.
export function pathFromRadii(r) {
  const n = r.length;
  let max = 0;
  for (let i = 0; i < n; i++) max = Math.max(max, r[i]);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = angleAt(i);
    const k = (0.5 * r[i]) / max;
    pts.push([0.5 + k * Math.cos(t), 0.5 + k * Math.sin(t)]);
  }
  const f = (v) => v.toFixed(4);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}

export const shapePath = (name, rotation = 0) => pathFromRadii(radii(name, rotation));

export function lerpRadii(a, b, t) {
  const out = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] + (b[i] - a[i]) * t;
  return out;
}
