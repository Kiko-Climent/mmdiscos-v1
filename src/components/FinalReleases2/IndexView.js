"use client";

import { useState, useEffect } from "react";
import { SORTED_RELEASES } from "./releaseMap";

const COLS_DESKTOP = [
  { key: "ref" },
  { key: "artist" },
  { key: "title" },
  { key: "year" },
  { key: "type" },
  { key: "format", right: true },
];

const DASH = "—";

// ── Responsive images optimizadas (sharp → /public/img-opt/v2) ─────────────
// AVIF primario (~97% soporte 2026, ~30-40% más pequeño que WebP), WebP
// fallback vía onerror. srcSet 720/960/1280w + sizes ajustado al render
// real (480 desktop / 220 mobile) → el browser elige la variante exacta.
const COVER_OPT_BASE = "/img-opt/v2";
const imageBase = (path) => {
  if (!path) return null;
  return path.replace(/^\//, "").replace(/\.[^.]+$/, "");
};
const optUrl = (base, size, ext) =>
  `${COVER_OPT_BASE}/${base}__balanced-${size}.${ext}`;
const buildSrcSet = (base, ext) =>
  `${optUrl(base, 720, ext)} 720w, ${optUrl(base, 960, ext)} 960w, ${optUrl(base, 1280, ext)} 1280w`;

export default function IndexView() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [fallbackByBase, setFallbackByBase] = useState({});
  const [navBottom, setNavBottom] = useState(140);
  const hoveredRelease = hoveredIndex !== null ? SORTED_RELEASES[hoveredIndex] : null;
  const hoveredBase = hoveredRelease ? imageBase(hoveredRelease.image) : null;
  const shouldUseOriginal =
    hoveredBase && Object.prototype.hasOwnProperty.call(fallbackByBase, hoveredBase);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Measure actual bottom of the fixed navbar so the list never collides with it.
  // Reads mm-global-menu-pills (rendered by _app.js) and adds a small breathing gap.
  useEffect(() => {
    const measure = () => {
      const pills = document.getElementById("mm-global-menu-pills");
      if (pills) {
        setNavBottom(pills.getBoundingClientRect().bottom + 16);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // ── Deferred preload + decode de todos los covers ───────────────────────
  // El problema crítico de UX en producción: cada hover/tap dispara un fetch
  // de red Y un decode en el frame de paint → stall visible. Solución doble:
  //   1. Preload (descarga el archivo) dentro de requestIdleCallback.
  //   2. img.decode() (decodifica AVIF/WebP a bitmap en RAM) → cuando el
  //      user hace hover, paint = instant, sin frame stall.
  // AVIF primario; si decode falla, fallback a WebP con decode también.
  // Connection-aware: si el user está en saveData o conexión muy lenta,
  // saltamos el preload (el <picture> hará lazy fetch al primer hover).
  // Flag one-shot por sesión (window.__mmReleasesCoversPreloaded).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__mmReleasesCoversPreloaded) return;

    // Respeta data-saver y conexiones lentas (Network Information API,
    // solo Chromium — undefined en Safari/Firefox = procedemos normal).
    const conn = navigator.connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") return;

    window.__mmReleasesCoversPreloaded = true;

    const mobile = window.innerWidth < 768;
    const dpr = window.devicePixelRatio || 1;
    // Render máx: 480 desktop, 220 mobile. DPR 2 desktop → 960 cubre.
    // DPR 3 desktop (retina alto) → 1280. Mobile DPR 3 (220×3=660) → 720 cubre.
    const size = mobile ? 720 : (dpr > 2 ? 1280 : 960);

    const preloadCovers = () => {
      const bases = new Set();
      SORTED_RELEASES.forEach((r) => {
        const b = imageBase(r.image);
        if (b) bases.add(b);
      });
      bases.forEach((base) => {
        const img = new Image();
        img.src = optUrl(base, size, "avif");
        // decode() devuelve Promise. .catch() encadena fallback a WebP.
        // Doble .catch() final silencia cualquier fallo (browser muy viejo,
        // network error) — en ese caso el <picture> hará fetch en el hover,
        // comportamiento idéntico al estado pre-optimización.
        img.decode()
          .catch(() => {
            img.src = optUrl(base, size, "webp");
            return img.decode();
          })
          .catch(() => {});
      });
    };

    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(preloadCovers, { timeout: 1500 });
    } else {
      setTimeout(preloadCovers, 300);
    }
  }, []);

  const GRID = `repeat(${COLS_DESKTOP.length}, 1fr)`;

  return (
    <div
      className="relative w-full h-full"
      style={{ display: "flex", flexDirection: "column", overflowY: "auto" }}
    >

      {/* Soft radial vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 0,
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.65) 100%)",
        }}
      />

      {/* Hover image — <picture> con AVIF + WebP fallback. srcSet 720/960/1280w
          permite al browser elegir según DPR. Preload diferido (useEffect arriba)
          garantiza que el file ya está en cache cuando React monta este nodo. */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 1 }}
      >
        {hoveredBase && !shouldUseOriginal && (
          <picture>
            <source
              type="image/avif"
              srcSet={buildSrcSet(hoveredBase, "avif")}
              sizes={isMobile ? "220px" : "480px"}
            />
            <source
              type="image/webp"
              srcSet={buildSrcSet(hoveredBase, "webp")}
              sizes={isMobile ? "220px" : "480px"}
            />
            <img
              src={optUrl(hoveredBase, isMobile ? 720 : 960, "webp")}
              alt={hoveredRelease.title}
              decoding="async"
              fetchPriority="high"
              onError={() => {
                setFallbackByBase((prev) => ({ ...prev, [hoveredBase]: true }));
              }}
              style={{ width: isMobile ? 220 : 480, height: isMobile ? 220 : 480, objectFit: "cover" }}
            />
          </picture>
        )}
        {hoveredRelease && shouldUseOriginal && (
          <img
            src={hoveredRelease.image}
            alt={hoveredRelease.title}
            decoding="async"
            fetchPriority="high"
            style={{ width: isMobile ? 220 : 480, height: isMobile ? 220 : 480, objectFit: "cover" }}
          />
        )}
      </div>

      {/* Safe-zone top spacer: flex:1 centers when space allows, minHeight guarantees
          the list never slides under the fixed navbar regardless of viewport height. */}
      <div style={{ flex: 1, minHeight: navBottom, pointerEvents: "none" }} />

      {/* Release list */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", padding: isMobile ? "0 8px" : "0 40px", boxSizing: "border-box" }}>

        {SORTED_RELEASES.map((release, i) => {
          const dimmed = hoveredIndex !== null && hoveredIndex !== i;

          if (isMobile) {
            const artistMobile = release.artistMobile ?? release.artist ?? DASH;
            const titleMobile =
              release.titleMobile ??
              (release.title ? release.title.replace(/\s+(EP|LP)\b/gi, "").trim() : DASH);
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onTouchStart={() => setHoveredIndex(i)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px 116px 1fr auto",
                  alignItems: "baseline",
                  columnGap: 10,
                  padding: "5px 0",
                  cursor: "default",
                  opacity: dimmed ? 0.2 : 1,
                  transition: "opacity 0.2s ease",
                  color: "#111",
                  fontSize: 11,
                  letterSpacing: "0.02em",
                  lineHeight: 1.05,
                  whiteSpace: "nowrap",
                }}
              >
                <span>{release.ref ?? DASH}</span>

                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    minWidth: 0,
                  }}
                >
                  {artistMobile}
                </span>

                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    minWidth: 0,
                    textAlign: "right",
                  }}
                >
                  {titleMobile}
                </span>

                <span>{release.year ?? DASH}</span>
              </div>
            );
          }

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                display: "grid",
                gridTemplateColumns: GRID,
                padding: "4px 0",
                cursor: "default",
                opacity: dimmed ? 0.2 : 1,
                transition: "opacity 0.2s ease",
              }}
            >
              {COLS_DESKTOP.map((col) => (
                <span
                  key={col.key}
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.08em",
                    color: "#111",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: col.right ? "right" : "left",
                  }}
                >
                  {col.key === "format"
                    ? (release.vinyl ?? release.format ?? DASH)
                    : (release[col.key] ?? DASH)}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      {/* Bottom spacer — mirrors top so the list stays centered */}
      <div style={{ flex: 1, minHeight: 24, pointerEvents: "none" }} />
    </div>
  );
}
