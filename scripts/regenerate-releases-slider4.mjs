/**
 * Regenera ReleasesSlider4.js monolítico (sin imports desde FinalReleases)
 * a partir de useReleasesSliderScene + constantes + JSX original.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const hookPath = path.join(root, "src/components/FinalReleases/useReleasesSliderScene.js");
const hook = fs.readFileSync(hookPath, "utf8");

let inner = hook
  .replace(/^[\s\S]*?useEffect\(\(\) => \{\n/, "")
  .replace(/\n  \}, \[\]\); \/\/ eslint-disable-line react-hooks\/exhaustive-deps.*\n\}\n?$/, "")
  .replace(/bgActiveRef/g, "bgActive");
inner = inner.replace(/\n  \}, \[\]\);\s*$/, "");

const constantsBlock = `
// ─── Config ─────────────────────────────────────────────────────────────────

const CARD_W         = 340;
const CARD_H         = 340;
const SPACING        = 330;
const SCROLL_LERP    = 0.07;
const SLIDE_COOLDOWN = 620;
const FOCUS_THUMB_Z = 0;
const THUMB_SCALE   = 0.12;
const COLUMN_GAP_FRAC = 0.14;
const COLUMN_GAP_MIN  = 72;
const PADDING_PX      = 12;
const THUMB_GAP_Y   = 14;
const HERO_SCALE    = 1.06;

const FOCUS_ENTER_STAGGER         = 0.048;
const FOCUS_ENTER_THUMB_DURATION  = 0.95;
const FOCUS_ENTER_THUMB_EASE      = "power2.out";
const FOCUS_ENTER_HERO_DURATION   = 1.0;
const FOCUS_ENTER_HERO_EASE       = "power3.inOut";
const FOCUS_ENTER_HERO_DELAY      = 0.06;

const IMAGES = [
  "/img1.jpg",
  "/img2.jpg",
  "/img3.jpg",
  "/img4.jpg",
  "/img5.jpg",
  "/MMD040_Cover-1.jpg",
  "/MMD039.png",
  "/img8.jpg",
  "/img9.jpg",
  "/img10.jpg",
  "/MMD038.png",
  "/MMD040-2.png",
  "/morira - cover.png",
  "/Celex - cover.jpg",
  "/corben_peachland_cover.jpg",
  "/Factory Edits - cover.jpg",
];

const SLIDE_COUNT = IMAGES.length;

const TITLES = IMAGES.map((_, i) => \`MM — \${String(i + 1).padStart(3, "0")}\`);

const RELEASE_MAP = {};
DataReleases.forEach((r) => { if (r.image) RELEASE_MAP[r.image] = r; });

const vert = /* glsl */ \`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
\`;

const frag = /* glsl */ \`
  uniform sampler2D uTexture;
  uniform vec2      uMouse;
  uniform float     uHover;
  uniform float     uTime;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    if (uHover > 0.0) {
      vec2  dir    = uv - uMouse;
      float dist   = length(dir);
      float ripple = sin(dist * 22.0 - uTime * 5.0) * 0.018;
      ripple *= smoothstep(0.75, 0.0, dist) * uHover;
      uv += normalize(dir + vec2(0.0001)) * ripple;
      uv  = clamp(uv, 0.001, 0.999);
    }
    gl_FragColor = texture2D(uTexture, uv);
  }
\`;

const CENTER_IDX = Math.floor(SLIDE_COUNT / 2);

const DEFAULT_CREDITS_LINES = [
  "All Tracks Written, Produced by NairLess",
  "Mastering by Baldo Gallego",
  "Graphics & Design by J.Diaz | allthatjazz",
  "Curated By Da Silva & Dj Katah",
  "A & R by Moon & Mann",
  "Distributed By Word and Sound",
  "Powered By MM Discos",
];

const PANEL_FONT_SIZE = 9;
const PANEL_LINE_HEIGHT = 1.15;
const PANEL_TEXT = "#000";
const PANEL_GAP_TIGHT = 1;

function wrapCarouselOffset(offset, trackWidth) {
  const half = trackWidth / 2;
  return ((((offset + half) % trackWidth) + trackWidth) % trackWidth) - half;
}

function calcFinalPos(i, scroll, W) {
  const trackWidth = SLIDE_COUNT * SPACING;
  const offset = wrapCarouselOffset(i * SPACING - scroll, trackWidth);
  const absDist = Math.abs(offset);
  const t       = Math.min(absDist / (W * 1.1), 1.0);
  const tEased  = Math.pow(t, 0.75);
  return {
    x:     offset,
    y:     -tEased * 140,
    z:     -tEased * 900,
    scale: 1.06 - tEased * 0.45,
  };
}

`;

const INFO = `  const INFO_W_FRAC = 0.38;
  const infoW     = Math.max(120, panelLayout.availableW * INFO_W_FRAC - panelLayout.gap * 0.5);
  const trackLeft = panelLayout.left + infoW + panelLayout.gap;
  const trackW    = Math.max(0, panelLayout.availableW - infoW - panelLayout.gap - PADDING_PX * 2);
`;

const jsxReturn = `  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        background: "#fff",
        height: viewportSize.h > 0 ? viewportSize.h : "100vh",
      }}
    >

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />

      {/* ── Panel info (sección 2): artist/title · year/ref · format/vinyl ── */}
      <div
        ref={infoPanelRef}
        style={{
          position:       "absolute",
          left:           panelLayout.left,
          top:            panelLayout.top,
          width:          infoW,
          height:         panelLayout.height,
          opacity:        0,
          pointerEvents:  "none",
          zIndex:         3,
          display:        "flex",
          flexDirection:  "column",
          justifyContent: "space-between",
        }}
      >
        {focusedData && (
          <>
            {/* 1 · Artist + Title */}
            <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
              <p style={{
                margin: 0,
                fontSize: PANEL_FONT_SIZE,
                lineHeight: PANEL_LINE_HEIGHT,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: PANEL_TEXT,
              }}>
                {focusedData.artist}
              </p>
              <p style={{
                margin: 0,
                fontSize: PANEL_FONT_SIZE,
                lineHeight: PANEL_LINE_HEIGHT,
                letterSpacing: "0.04em",
                color: PANEL_TEXT,
              }}>
                {focusedData.title}
              </p>
            </div>

            {/* 2 · Year + Ref */}
            <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
              <p style={{
                margin: 0,
                fontSize: PANEL_FONT_SIZE,
                lineHeight: PANEL_LINE_HEIGHT,
                letterSpacing: "0.04em",
                color: PANEL_TEXT,
              }}>
                {focusedData.year}
              </p>
              <p style={{
                margin: 0,
                fontSize: PANEL_FONT_SIZE,
                lineHeight: PANEL_LINE_HEIGHT,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: PANEL_TEXT,
              }}>
                {focusedData.ref}
              </p>
            </div>

            {/* 3 · Format + Vinyl */}
            <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
              <p style={{
                margin: 0,
                fontSize: PANEL_FONT_SIZE,
                lineHeight: PANEL_LINE_HEIGHT,
                letterSpacing: "0.04em",
                color: PANEL_TEXT,
              }}>
                {focusedData.format}
              </p>
              {focusedData.vinyl && (
                <p style={{
                  margin: 0,
                  fontSize: PANEL_FONT_SIZE,
                  lineHeight: PANEL_LINE_HEIGHT,
                  letterSpacing: "0.04em",
                  color: PANEL_TEXT,
                }}>
                  {focusedData.vinyl}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Panel tracklist (sección 3) ──────────────────────────────────── */}
      <div
        ref={trackPanelRef}
        style={{
          position:       "absolute",
          left:           trackLeft,
          top:            panelLayout.top,
          width:          trackW,
          height:         panelLayout.height,
          opacity:        0,
          pointerEvents:  "none",
          zIndex:         3,
          overflow:       "hidden",
          display:        "flex",
          flexDirection:  "column",
        }}
      >
        <div
          style={{
            flex:       1,
            minHeight:  0,
            overflow:   "auto",
          }}
        >
          {focusedData?.tracklist?.map((track, i) => (
            <div
              key={i}
              style={{
                display:    "flex",
                alignItems: "baseline",
                lineHeight: PANEL_LINE_HEIGHT,
                fontSize:   PANEL_FONT_SIZE,
                color:      PANEL_TEXT,
              }}
            >
              <span style={{
                margin:             0,
                fontSize:           PANEL_FONT_SIZE,
                lineHeight:         PANEL_LINE_HEIGHT,
                color:              PANEL_TEXT,
                minWidth:           18,
                letterSpacing:      "0.06em",
                fontVariantNumeric: "tabular-nums",
                flexShrink:         0,
              }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{
                margin:        0,
                fontSize:      PANEL_FONT_SIZE,
                lineHeight:    PANEL_LINE_HEIGHT,
                letterSpacing: "0.04em",
                color:         PANEL_TEXT,
              }}>
                {track}
              </span>
            </div>
          ))}
        </div>

        {focusedData && (
          <div
            style={{
              flexShrink:  0,
              marginTop:   "auto",
              paddingTop:  PANEL_GAP_TIGHT * 4,
            }}
          >
            <p style={{
              margin:        0,
              marginBottom:  PANEL_GAP_TIGHT * 2,
              fontSize:      PANEL_FONT_SIZE,
              lineHeight:    PANEL_LINE_HEIGHT,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color:         PANEL_TEXT,
            }}>
              Credits
            </p>
            <div
              style={{
                fontSize: PANEL_FONT_SIZE,
                lineHeight: PANEL_LINE_HEIGHT,
                letterSpacing: "0.04em",
                color: PANEL_TEXT,
              }}
            >
              {DEFAULT_CREDITS_LINES.map((line, i) => (
                <p
                  key={i}
                  style={{
                    margin: 0,
                    fontSize: PANEL_FONT_SIZE,
                    lineHeight: PANEL_LINE_HEIGHT,
                    letterSpacing: "0.04em",
                    color: PANEL_TEXT,
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Grain overlay (igual que el original) ─────────────────────────── */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: \`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23g)'/%3E%3C/svg%3E")\`,
        backgroundRepeat: "repeat",
        backgroundSize: "256px",
        mixBlendMode: "multiply",
        opacity: 0.03,
        zIndex: 2,
      }} />
    </div>
  );
}
`;

const out = `"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { DataReleases } from "../data";

${constantsBlock}
export default function ReleasesSlider4() {
  const canvasRef  = useRef(null);
  const titleRef   = useRef(null);
  const counterRef = useRef(null);
  const bgARef     = useRef(null);
  const bgBRef     = useRef(null);
  const bgActive   = useRef("a");

  const infoPanelRef  = useRef(null);
  const trackPanelRef = useRef(null);

  const [focusedData, setFocusedData] = useState(null);
  const [panelLayout, setPanelLayout] = useState({
    left: 0, top: 0, height: 0, availableW: 0, gap: 0,
  });

  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const sync = () =>
      setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
${inner}
  }, []);

${INFO}
${jsxReturn}
`;

const outPath = path.join(root, "src/components/ReleasesSlider/ReleasesSlider4.js");
fs.writeFileSync(outPath, out);
console.log("Wrote", outPath, out.split("\n").length, "lines");
