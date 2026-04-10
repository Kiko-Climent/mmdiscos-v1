"use client";

import { useState } from "react";
import { DataReleases } from "../data/index";

const COLS = [
  { key: "ref"    },
  { key: "artist" },
  { key: "title"  },
  { key: "year"   },
  { key: "type"   },
  { key: "format", right: true },
];

const GRID = `repeat(${COLS.length}, 1fr)`;

export default function IndexReleases2() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const hoveredRelease = hoveredIndex !== null ? DataReleases[hoveredIndex] : null;

  return (
    <div
      className="relative w-full min-h-screen flex items-center justify-center"
      style={{ background: "transparent" }}
    >
      {/* Imagen centrada */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{
          zIndex: 0,
          opacity: hoveredRelease?.image ? 1 : 0,
          transition: "opacity 0.25s ease",
        }}
      >
        {hoveredRelease?.image && (
          <img
            src={hoveredRelease.image}
            alt={hoveredRelease.title}
            style={{ width: 350, height: 350, objectFit: "cover" }}
          />
        )}
      </div>

      {/* Lista */}
      <div className="w-full px-10" style={{ position: "relative", zIndex: 1 }}>
        {DataReleases.map((release, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              padding: "4px 0",
              opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.25 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            {COLS.map((col) => (
              <span key={col.key} style={cell(col.right)}>
                {col.key === "format"
                  ? (release.vinyl ?? release.format ?? "—")
                  : (release[col.key] ?? "—")}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const cell = (right = false) => ({
  fontSize:     9,
  letterSpacing: "0.08em",
  color:         "#333",
  whiteSpace:    "nowrap",
  overflow:      "hidden",
  textOverflow:  "ellipsis",
  textAlign:     right ? "right" : "left",
});