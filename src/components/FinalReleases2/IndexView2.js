"use client";

import { useState, useEffect } from "react";
import { DataReleases } from "../data/index";

/**
 * IndexView2 — editorial / agency take.
 *
 * Desktop: untouched, single dense row per release (matches IndexView).
 * Mobile : two-line entry, marginalia ref, display title.
 *
 *   028   mogwaa            LP   2023      ← meta strip, hairline, all uniform
 *         Hazzy Dreams                     ← display title, slight emphasis
 *
 * Ref hangs in a left gutter like a page number; the meta strip echoes the
 * desktop column rhythm; the title gets its own baseline as the visual anchor.
 * No borders, tight vertical rhythm, fits within viewport without scroll.
 */

const COLS_DESKTOP = [
  { key: "ref" },
  { key: "artist" },
  { key: "title" },
  { key: "year" },
  { key: "type" },
  { key: "format", right: true },
];

const DASH = "—";

const stripFormatTag = (s) =>
  s ? s.replace(/\s+(EP|LP)\b/gi, "").trim() : s;

const shortType = (t) => {
  if (!t) return DASH;
  const first = t.split(",")[0].trim();
  return first || DASH;
};

export default function IndexView2() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const hoveredRelease = hoveredIndex !== null ? DataReleases[hoveredIndex] : null;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const GRID = `repeat(${COLS_DESKTOP.length}, 1fr)`;

  return (
    <div className="relative w-full h-full flex items-center justify-center">

      {/* Soft radial vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 0,
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.65) 100%)",
        }}
      />

      {/* Hover image */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 1 }}
      >
        {hoveredRelease?.image && (
          <img
            src={hoveredRelease.image}
            alt={hoveredRelease.title}
            style={{
              width: isMobile ? 220 : 480,
              height: isMobile ? 220 : 480,
              objectFit: "cover",
            }}
          />
        )}
      </div>

      {/* Release list */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          padding: isMobile ? "0 10px" : "0 40px",
          boxSizing: "border-box",
        }}
      >
        {DataReleases.map((release, i) => {
          const dimmed = hoveredIndex !== null && hoveredIndex !== i;

          if (isMobile) {
            const artistMobile = release.artistMobile ?? release.artist ?? DASH;
            const titleMobile =
              release.titleMobile ?? stripFormatTag(release.title) ?? DASH;
            const typeMobile = shortType(release.type);

            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onTouchStart={() => setHoveredIndex(i)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "52px 1fr",
                  columnGap: 18,
                  padding: "2px 0",
                  cursor: "default",
                  opacity: dimmed ? 0.2 : 1,
                  transition: "opacity 0.2s ease",
                  color: "#111",
                }}
              >
                {/* Marginalia ref */}
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.02em",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {release.ref ?? DASH}
                </span>

                {/* Two-line content block */}
                <div style={{ minWidth: 0 }}>
                  {/* Meta strip — artist anchors left, type+year cluster right */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 12,
                      fontSize: 11,
                      letterSpacing: "0.02em",
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        minWidth: 0,
                        flex: "1 1 auto",
                      }}
                    >
                      {artistMobile}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 14,
                        flex: "0 0 auto",
                      }}
                    >
                      <span>{typeMobile}</span>
                      <span>{release.year ?? DASH}</span>
                    </span>
                  </div>

                  {/* Display title */}
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.05,
                      marginTop: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {titleMobile}
                  </div>
                </div>
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
                padding: "5px 0",
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
    </div>
  );
}
