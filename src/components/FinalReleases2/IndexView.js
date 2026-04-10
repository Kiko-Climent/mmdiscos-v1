"use client";

import { useState } from "react";
import { DataReleases } from "../data/index";

const COLS = [
  { key: "ref" },
  { key: "artist" },
  { key: "title" },
  { key: "year" },
  { key: "type" },
  { key: "format", right: true },
];

const GRID = `repeat(${COLS.length}, 1fr)`;

export default function IndexView() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const hoveredRelease = hoveredIndex !== null ? DataReleases[hoveredIndex] : null;

  return (
    <div className="relative w-full h-full flex items-center justify-center">

      {/* Soft radial vignette — softens thumbnails at edges, keeps center clean */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 0,
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.65) 100%)",
        }}
      />

      {/* Hover image — scale+fade in on each change */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 1 }}
      >
        {hoveredRelease?.image && (
          <img
            src={hoveredRelease.image}
            alt={hoveredRelease.title}
            style={{ width: 480, height: 480, objectFit: "cover" }}
          />
        )}
      </div>

      {/* Release list */}
      <div className="w-full px-10" style={{ position: "relative", zIndex: 2 }}>

        {/* Rows */}
        {DataReleases.map((release, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              padding: "5px 0",
              cursor: "default",
              opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.2 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            {COLS.map((col) => (
              <span
                key={col.key}
                style={{
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  color: "#111",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textAlign: col.right ? "right" : "left",
                }}
              >
                {col.key === "format"
                  ? (release.vinyl ?? release.format ?? "\u2014")
                  : (release[col.key] ?? "\u2014")}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
