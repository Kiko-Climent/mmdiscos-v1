"use client";

import { useState, useEffect } from "react";
import { DataReleases } from "../data/index";

const COLS_DESKTOP = [
  { key: "ref" },
  { key: "artist" },
  { key: "title" },
  { key: "year" },
  { key: "type" },
  { key: "format", right: true },
];

const DASH = "—";

export default function IndexView() {
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
            style={{ width: isMobile ? 220 : 480, height: isMobile ? 220 : 480, objectFit: "cover" }}
          />
        )}
      </div>

      {/* Release list */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", padding: isMobile ? "0 8px" : "0 40px", boxSizing: "border-box" }}>

        {DataReleases.map((release, i) => {
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
                  padding: "7px 0",
                  cursor: "default",
                  opacity: dimmed ? 0.2 : 1,
                  transition: "opacity 0.2s ease",
                  color: "#111",
                  fontSize: 11,
                  letterSpacing: "0.02em",
                  lineHeight: 1.1,
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
