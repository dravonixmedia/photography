/**
 * Generates temporary placeholder frame sequences and portfolio images.
 *
 * These are procedurally rendered stand-ins so the scroll architecture,
 * canvas engine and GSAP timeline can be built and tested before the real
 * Blender / Cinema 4D / Unreal renders and studio photography are ready.
 *
 * Replace the output of this script with real assets before launch —
 * see README.md "Adding the rendered frames" section.
 *
 * Run with: node scripts/generate-placeholder-assets.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const PUBLIC = path.join(ROOT, "public");

const DESKTOP = { w: 1920, h: 1080 };
const MOBILE = { w: 1080, h: 1920 };

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const ease = (t) => t * t * (3 - 2 * t);

function pad(n) {
  return String(n).padStart(4, "0");
}

/* ---------------------------------------------------------------------- */
/* Shared visual fragments                                                */
/* ---------------------------------------------------------------------- */

function backdrop(w, h, seed, glow = 0.12) {
  const rand = mulberry32(seed);
  const dust = Array.from({ length: 22 }, () => {
    const x = rand() * w;
    const y = rand() * h;
    const r = 0.6 + rand() * 1.8;
    const o = 0.04 + rand() * 0.16;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#f4f1ea" opacity="${o.toFixed(3)}" />`;
  }).join("");

  return `
    <rect width="${w}" height="${h}" fill="#020203" />
    <radialGradient id="vg" cx="50%" cy="42%" r="75%">
      <stop offset="0%" stop-color="#0d0d10" stop-opacity="${glow}" />
      <stop offset="55%" stop-color="#020203" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.6" />
    </radialGradient>
    <rect width="${w}" height="${h}" fill="url(#vg)" />
    <rect x="0" y="${h * 0.82}" width="${w}" height="${h * 0.18}" fill="url(#floor)" opacity="0.5" />
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a0a0c" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </linearGradient>
    ${dust}
  `;
}

function grainFilter(id) {
  return `
    <filter id="${id}">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="noise" />
      <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" />
    </filter>
  `;
}

function wrapSvg(w, h, body, grainId) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    ${grainFilter(grainId)}
    ${body}
    <rect width="${w}" height="${h}" filter="url(#${grainId})" opacity="0.5" />
  </svg>`;
}

/* ---------------------------------------------------------------------- */
/* Sequence: walking + camera reveal                                      */
/* ---------------------------------------------------------------------- */

function silhouette(cx, cy, scale, armRaise, cameraFacing) {
  // Simple stylised humanoid silhouette holding a camera.
  const s = scale;
  const headR = 26 * s;
  const shoulderW = 74 * s;
  const hipW = 54 * s;
  const torsoH = 150 * s;
  const legH = 190 * s;

  const headY = cy - torsoH - legH * 0.02 - headR;
  const shoulderY = headY + headR + 8 * s;
  const hipY = shoulderY + torsoH;
  const footY = hipY + legH;

  const torso = `M ${cx - shoulderW / 2} ${shoulderY}
    C ${cx - hipW / 2} ${shoulderY + torsoH * 0.4}, ${cx - hipW / 2} ${shoulderY + torsoH * 0.6}, ${cx - hipW / 2} ${hipY}
    L ${cx + hipW / 2} ${hipY}
    C ${cx + hipW / 2} ${shoulderY + torsoH * 0.6}, ${cx + hipW / 2} ${shoulderY + torsoH * 0.4}, ${cx + shoulderW / 2} ${shoulderY}
    Z`;

  const legGap = 10 * s;
  const legL = `M ${cx - hipW / 2 + 4 * s} ${hipY} L ${cx - legGap} ${footY} L ${cx - legGap - 22 * s} ${footY} L ${cx - hipW / 2 - 6 * s} ${hipY} Z`;
  const legR = `M ${cx + hipW / 2 - 4 * s} ${hipY} L ${cx + legGap} ${footY} L ${cx + legGap + 22 * s} ${footY} L ${cx + hipW / 2 + 6 * s} ${hipY} Z`;

  // Arm holding camera: lowered near hip early, raised to eye level later.
  const handX = lerp(cx + shoulderW / 2 + 30 * s, cx, armRaise);
  const handY = lerp(hipY - 10 * s, headY + headR * 0.6, armRaise);
  const elbowX = cx + shoulderW / 2 - 6 * s;
  const elbowY = lerp(shoulderY + torsoH * 0.35, shoulderY + torsoH * 0.15, armRaise);

  const arm = `M ${cx + shoulderW / 2 - 10 * s} ${shoulderY + 6 * s}
    L ${elbowX} ${elbowY}
    L ${handX} ${handY}`;

  const camW = 46 * s;
  const camH = 30 * s;
  const camRot = lerp(8, cameraFacing, armRaise);
  const lensR = 10 * s;

  const camera = `
    <g transform="translate(${handX} ${handY}) rotate(${camRot})">
      <rect x="${-camW / 2}" y="${-camH / 2}" width="${camW}" height="${camH}" rx="${4 * s}"
        fill="#e7e5df" opacity="${0.55 + armRaise * 0.4}" />
      <circle cx="${camW / 2 - 2 * s}" cy="0" r="${lensR}" fill="#050506" opacity="0.9" />
      <circle cx="${camW / 2 - 2 * s}" cy="0" r="${lensR * 0.55}" fill="#3a3a3f" opacity="${0.5 + armRaise * 0.5}" />
    </g>
  `;

  return `
    <g opacity="0.94">
      <ellipse cx="${cx}" cy="${headY}" rx="${headR * 0.86}" ry="${headR}" fill="#050506" />
      <path d="${torso}" fill="#050506" />
      <path d="${legL}" fill="#050506" />
      <path d="${legR}" fill="#050506" />
      <path d="${arm}" stroke="#050506" stroke-width="${11 * s}" fill="none" stroke-linecap="round" />
      ${camera}
      <ellipse cx="${cx}" cy="${headY}" rx="${headR * 0.86}" ry="${headR}" fill="none" stroke="#f4f1ea" stroke-opacity="0.18" stroke-width="1.4" />
      <path d="${torso}" fill="none" stroke="#f4f1ea" stroke-opacity="0.14" stroke-width="1.2" />
    </g>
  `;
}

function walkingFrame(w, h, t, seed) {
  const cx = w / 2 + Math.sin(t * Math.PI) * w * 0.015;
  const cy = h * 0.98;
  const scale = lerp(0.34, w > h ? 1.55 : 1.85, ease(t)) * (w / 1920);
  const armRaise = clamp((t - 0.55) / 0.45, 0, 1);
  const beamOpacity = lerp(0.16, 0.05, t);

  const beamW = w * 0.16;
  const body = `
    ${backdrop(w, h, seed, lerp(0.08, 0.2, t))}
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f4f1ea" stop-opacity="${beamOpacity}" />
      <stop offset="100%" stop-color="#f4f1ea" stop-opacity="0" />
    </linearGradient>
    <polygon points="${w / 2 - beamW / 2},0 ${w / 2 + beamW / 2},0 ${w / 2 + beamW * 1.4},${h} ${w / 2 - beamW * 1.4},${h}" fill="url(#beam)" />
    ${silhouette(cx, cy, scale, armRaise, 92)}
  `;
  return wrapSvg(w, h, body, "grain");
}

/* ---------------------------------------------------------------------- */
/* Sequence: lens zoom                                                    */
/* ---------------------------------------------------------------------- */

function lensGraphic(cx, cy, r, t, seed) {
  const rand = mulberry32(seed);
  const rings = [1, 0.82, 0.66, 0.5].map((f, i) => {
    const rr = r * f;
    const rot = t * (18 + i * 6);
    return `
      <circle cx="${cx}" cy="${cy}" r="${rr}" fill="none"
        stroke="#e7e5df" stroke-opacity="${0.08 + i * 0.03}" stroke-width="${Math.max(1, r * 0.006)}"
        transform="rotate(${rot} ${cx} ${cy})" />
    `;
  }).join("");

  const arcs = Array.from({ length: 4 }, (_, i) => {
    const a0 = rand() * 360 + t * 30;
    const a1 = a0 + 30 + rand() * 40;
    const rr = r * (0.9 - i * 0.14);
    const large = 0;
    const toRad = (a) => (a * Math.PI) / 180;
    const x0 = cx + rr * Math.cos(toRad(a0));
    const y0 = cy + rr * Math.sin(toRad(a0));
    const x1 = cx + rr * Math.cos(toRad(a1));
    const y1 = cy + rr * Math.sin(toRad(a1));
    return `<path d="M ${x0} ${y0} A ${rr} ${rr} 0 ${large} 1 ${x1} ${y1}" stroke="#f4f1ea" stroke-opacity="0.22" stroke-width="${Math.max(1.2, r * 0.01)}" fill="none" />`;
  }).join("");

  const blades = 9;
  const aperture = clamp(0.18 + t * 0.6, 0.18, 0.82);
  const bladePaths = Array.from({ length: blades }, (_, i) => {
    const a = (360 / blades) * i + t * 40;
    const inner = r * (0.16 + (1 - aperture) * 0.3);
    const outer = r * 0.42;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const a1 = toRad(a);
    const a2 = toRad(a + 360 / blades * 0.72);
    const p1x = cx + inner * Math.cos(a1);
    const p1y = cy + inner * Math.sin(a1);
    const p2x = cx + outer * Math.cos((a1 + a2) / 2);
    const p2y = cy + outer * Math.sin((a1 + a2) / 2);
    const p3x = cx + inner * Math.cos(a2);
    const p3y = cy + inner * Math.sin(a2);
    return `<path d="M ${p1x} ${p1y} L ${p2x} ${p2y} L ${p3x} ${p3y} Z" fill="#050506" stroke="#3a3a3f" stroke-width="1" stroke-opacity="0.4" />`;
  }).join("");

  return `
    <circle cx="${cx}" cy="${cy}" r="${r * 1.06}" fill="#0a0a0c" stroke="#3a3a3f" stroke-width="${r * 0.02}" />
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#050506" />
    ${rings}
    ${arcs}
    ${bladePaths}
    <circle cx="${cx}" cy="${cy}" r="${r * (0.16 + (1 - aperture) * 0.3)}" fill="#000000" />
    <ellipse cx="${cx - r * 0.28}" cy="${cy - r * 0.28}" rx="${r * 0.18}" ry="${r * 0.1}" fill="#f4f1ea" opacity="${0.12 + t * 0.08}" />
  `;
}

function lensZoomFrame(w, h, t, seed) {
  const cx = w / 2;
  const cy = h / 2;
  const r = lerp(Math.min(w, h) * 0.12, Math.min(w, h) * 0.75, ease(t));
  const body = `
    ${backdrop(w, h, seed, 0.05)}
    ${lensGraphic(cx, cy, r, t, seed)}
  `;
  return wrapSvg(w, h, body, "grain");
}

/* ---------------------------------------------------------------------- */
/* Sequence: camera internals                                             */
/* ---------------------------------------------------------------------- */

function internalsFrame(w, h, t, seed) {
  const cy = h / 2;
  const layers = 6;
  const spanX = w * 0.7;
  const startX = w * 0.16 + w * 0.06 * (1 - t);

  const els = Array.from({ length: layers }, (_, i) => {
    const f = i / (layers - 1);
    const x = startX + spanX * f;
    const ry = h * lerp(0.32, 0.1, f);
    const rx = ry * 0.34;
    const op = 0.1 + (1 - f) * 0.08;
    return `<ellipse cx="${x}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#e7e5df" stroke-opacity="${op + t * 0.05}" stroke-width="1.4" />`;
  }).join("");

  const beamX = lerp(w * 0.1, w * 0.86, ease(t));
  const sensorX = w * 0.88;
  const sensorLit = t > 0.82 ? clamp((t - 0.82) / 0.14, 0, 1) : 0;

  const gridCells = 6;
  const sensorGrid = Array.from({ length: gridCells * gridCells }, (_, i) => {
    const gx = i % gridCells;
    const gy = Math.floor(i / gridCells);
    const size = 6;
    const gap = 3;
    const total = gridCells * (size + gap);
    const ox = sensorX - total / 2 + gx * (size + gap);
    const oy = cy - total / 2 + gy * (size + gap);
    return `<rect x="${ox}" y="${oy}" width="${size}" height="${size}" fill="#f4f1ea" opacity="${sensorLit * (0.12 + 0.1 * ((gx + gy) % 2))}" />`;
  }).join("");

  const guideLines = `
    <line x1="${w * 0.08}" y1="${h * 0.14}" x2="${w * 0.92}" y2="${h * 0.14}" stroke="#e7e5df" stroke-opacity="0.05" stroke-width="1" />
    <line x1="${w * 0.08}" y1="${h * 0.86}" x2="${w * 0.92}" y2="${h * 0.86}" stroke="#e7e5df" stroke-opacity="0.05" stroke-width="1" />
  `;

  const body = `
    ${backdrop(w, h, seed, 0.06)}
    ${guideLines}
    ${els}
    <linearGradient id="beamH" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f4f1ea" stop-opacity="0" />
      <stop offset="85%" stop-color="#f4f1ea" stop-opacity="0.55" />
      <stop offset="100%" stop-color="#f4f1ea" stop-opacity="0.85" />
    </linearGradient>
    <rect x="${w * 0.08}" y="${cy - 1.1}" width="${Math.max(2, beamX - w * 0.08)}" height="2.2" fill="url(#beamH)" />
    <circle cx="${beamX}" cy="${cy}" r="4.5" fill="#f4f1ea" opacity="0.7" />
    <rect x="${sensorX - 42}" y="${cy - 42}" width="84" height="84" rx="4" fill="none" stroke="#e7e5df" stroke-opacity="${0.18 + sensorLit * 0.3}" stroke-width="1.4" />
    ${sensorGrid}
  `;
  return wrapSvg(w, h, body, "grain");
}

/* ---------------------------------------------------------------------- */
/* Sequence: lens return (camera body + filmmaker facing viewer)          */
/* ---------------------------------------------------------------------- */

function cameraBody(cx, cy, scale, recordLit) {
  const s = scale;
  const bodyW = 260 * s;
  const bodyH = 150 * s;
  const gripW = 56 * s;

  return `
    <g>
      <rect x="${cx - bodyW / 2}" y="${cy - bodyH / 2}" width="${bodyW}" height="${bodyH}" rx="${10 * s}"
        fill="#0c0c0e" stroke="#3a3a3f" stroke-width="${1.4 * s}" />
      <rect x="${cx + bodyW / 2 - gripW}" y="${cy - bodyH / 2}" width="${gripW}" height="${bodyH}" rx="${10 * s}"
        fill="#111114" />
      <rect x="${cx - bodyW * 0.14}" y="${cy - bodyH / 2 - 24 * s}" width="${bodyW * 0.3}" height="${28 * s}" rx="${4 * s}" fill="#0c0c0e" stroke="#3a3a3f" stroke-width="${1 * s}" />
      <circle cx="${cx - bodyW * 0.18}" cy="${cy}" r="${58 * s}" fill="#050506" stroke="#4a4a50" stroke-width="${2 * s}" />
      <circle cx="${cx - bodyW * 0.18}" cy="${cy}" r="${34 * s}" fill="#0a0a0c" stroke="#2a2a2e" stroke-width="${1 * s}" />
      <ellipse cx="${cx - bodyW * 0.24}" cy="${cy - 16 * s}" rx="${12 * s}" ry="${7 * s}" fill="#e7e5df" opacity="0.14" />
      <circle cx="${cx + bodyW * 0.3}" cy="${cy - bodyH * 0.22}" r="${6 * s}" fill="${recordLit > 0 ? "#c23b2f" : "#3a3a3f"}" opacity="${recordLit > 0 ? 0.8 + recordLit * 0.2 : 0.6}" />
      <circle cx="${cx + bodyW * 0.3}" cy="${cy - bodyH * 0.05}" r="${8 * s}" fill="none" stroke="#4a4a50" stroke-width="${1.4 * s}" />
      <rect x="${cx + bodyW * 0.22}" y="${cy + bodyH * 0.14}" width="${bodyW * 0.16}" height="${6 * s}" rx="${3 * s}" fill="#2a2a2e" />
    </g>
  `;
}

function lensReturnFrame(w, h, t, seed) {
  const cx = w / 2;
  const cy = h * 0.5;
  const scale = lerp(2.6, 1, ease(Math.min(t / 0.7, 1))) * (Math.min(w, h) / 900);
  const recordLit = clamp((t - 0.86) / 0.14, 0, 1);
  const bodyOp = clamp(t / 0.35, 0.15, 1);

  const body = `
    ${backdrop(w, h, seed, 0.1)}
    <g opacity="${bodyOp}">
      ${cameraBody(cx, cy, scale, recordLit)}
    </g>
  `;
  return wrapSvg(w, h, body, "grain");
}

/* ---------------------------------------------------------------------- */
/* Portfolio placeholder images                                           */
/* ---------------------------------------------------------------------- */

const PORTFOLIO_SPECS = [
  { name: "weddings-01", w: 1600, h: 2000, hue: 24 },
  { name: "weddings-02", w: 2000, h: 1333, hue: 30 },
  { name: "fashion-01", w: 1600, h: 2000, hue: 210 },
  { name: "fashion-02", w: 2000, h: 1333, hue: 200 },
  { name: "commercial-01", w: 2000, h: 1333, hue: 40 },
  { name: "portraits-01", w: 1600, h: 2000, hue: 18 },
  { name: "portraits-02", w: 1600, h: 2000, hue: 12 },
  { name: "editorial-01", w: 2000, h: 1333, hue: 190 },
  { name: "editorial-02", w: 1600, h: 2000, hue: 44 },
  { name: "films-01", w: 2000, h: 1125, hue: 0 },
  { name: "featured-01", w: 2400, h: 1500, hue: 26 },
  { name: "featured-02", w: 2400, h: 1500, hue: 205 },
  { name: "hero-featured", w: 2400, h: 1500, hue: 22 },
  { name: "about-portrait", w: 1600, h: 2000, hue: 20 },
  { name: "bts-01", w: 2000, h: 1333, hue: 34 },
  { name: "bts-02", w: 2000, h: 1333, hue: 28 },
  { name: "og-cover", w: 1200, h: 630, hue: 24 },
];

function portfolioSvg(w, h, hue, seed) {
  const rand = mulberry32(seed);
  const c1 = `hsl(${hue} 22% 10%)`;
  const c2 = `hsl(${hue} 14% 4%)`;
  const streaks = Array.from({ length: 5 }, () => {
    const x1 = rand() * w;
    const y1 = rand() * h;
    const x2 = x1 + (rand() - 0.5) * w * 0.6;
    const y2 = y1 + (rand() - 0.5) * h * 0.6;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="hsl(${hue} 30% 60%)" stroke-opacity="0.05" stroke-width="${40 + rand() * 80}" stroke-linecap="round" />`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
      <radialGradient id="glow" cx="30%" cy="26%" r="70%">
        <stop offset="0%" stop-color="hsl(${hue} 35% 24%)" stop-opacity="0.5" />
        <stop offset="100%" stop-color="transparent" />
      </radialGradient>
      ${grainFilter("pgrain")}
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg)" />
    <rect width="${w}" height="${h}" fill="url(#glow)" />
    ${streaks}
    <rect width="${w}" height="${h}" filter="url(#pgrain)" opacity="0.4" />
  </svg>`;
}

/* ---------------------------------------------------------------------- */
/* Runner                                                                  */
/* ---------------------------------------------------------------------- */

async function renderSequence(name, frameFn, count, dims, subfolder) {
  const dir = path.join(PUBLIC, "sequences", name, subfolder);
  await mkdir(dir, { recursive: true });
  for (let i = 1; i <= count; i++) {
    const t = (i - 1) / (count - 1);
    const svg = frameFn(dims.w, dims.h, t, i * 7919 + name.length);
    const outPath = path.join(dir, `frame_${pad(i)}.webp`);
    await sharp(Buffer.from(svg)).webp({ quality: subfolder === "mobile" ? 62 : 68 }).toFile(outPath);
  }
  console.log(`✓ ${name}/${subfolder}: ${count} frames -> ${path.relative(ROOT, dir)}`);
}

async function renderPortfolio() {
  const dir = path.join(PUBLIC, "images", "portfolio");
  await mkdir(dir, { recursive: true });
  let i = 0;
  for (const spec of PORTFOLIO_SPECS) {
    i += 1;
    const svg = portfolioSvg(spec.w, spec.h, spec.hue, i * 104729);
    const outPath = path.join(dir, `${spec.name}.jpg`);
    await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(outPath);
  }
  console.log(`✓ portfolio placeholders: ${PORTFOLIO_SPECS.length} images -> ${path.relative(ROOT, dir)}`);
}

async function main() {
  const FRAME_COUNTS = {
    walking: 28,
    "lens-zoom": 22,
    "camera-internals": 32,
    "lens-return": 22,
  };

  await renderSequence("walking", walkingFrame, FRAME_COUNTS.walking, DESKTOP, "desktop");
  await renderSequence("walking", walkingFrame, FRAME_COUNTS.walking, MOBILE, "mobile");

  await renderSequence("lens-zoom", lensZoomFrame, FRAME_COUNTS["lens-zoom"], DESKTOP, "desktop");
  await renderSequence("lens-zoom", lensZoomFrame, FRAME_COUNTS["lens-zoom"], MOBILE, "mobile");

  await renderSequence("camera-internals", internalsFrame, FRAME_COUNTS["camera-internals"], DESKTOP, "desktop");
  await renderSequence("camera-internals", internalsFrame, FRAME_COUNTS["camera-internals"], MOBILE, "mobile");

  await renderSequence("lens-return", lensReturnFrame, FRAME_COUNTS["lens-return"], DESKTOP, "desktop");
  await renderSequence("lens-return", lensReturnFrame, FRAME_COUNTS["lens-return"], MOBILE, "mobile");

  await renderPortfolio();

  await writeFile(
    path.join(PUBLIC, "sequences", "README.txt"),
    "These frames are procedurally generated placeholders for local development.\n" +
      "Replace each folder's contents with real rendered frames (frame_0001.webp, frame_0002.webp, ...).\n" +
      "Keep the same naming convention and folder structure.\n"
  );

  console.log("\nAll placeholder assets generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
