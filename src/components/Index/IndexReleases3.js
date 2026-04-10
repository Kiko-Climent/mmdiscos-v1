"use client";

import { useState, useEffect } from "react";
import { DataReleases } from "../data/index";

// ─── Config compartida con ReleasesSlider3 ───────────────────────────────────
const PANEL_FONT_SIZE   = 9;
const PANEL_LINE_HEIGHT = 1.15;
const PANEL_TEXT        = "#000";
const PANEL_GAP_TIGHT   = 1;

const THUMB_W  = 40;
const THUMB_H  = 40;
const THUMB_GAP = 6;
const HERO_SIZE = 340;
const COL_GAP   = 48;
const SIDE_PAD  = 40;

const DEFAULT_CREDITS_LINES = [
  "All Tracks Written, Produced by NairLess",
  "Mastering by Baldo Gallego",
  "Graphics & Design by J.Diaz | allthatjazz",
  "Curated By Da Silva & Dj Katah",
  "A & R by Moon & Mann",
  "Distributed By Word and Sound",
  "Powered By MM Discos",
];

const COLS = [
  { key: "ref"    },
  { key: "artist" },
  { key: "title"  },
  { key: "year"   },
  { key: "type"   },
  { key: "format", right: true },
];
const GRID = `repeat(${COLS.length}, 1fr)`;

// ─── Helpers de estilo ────────────────────────────────────────────────────────
const pLabel = () => ({
  margin: 0,
  fontSize: PANEL_FONT_SIZE,
  lineHeight: PANEL_LINE_HEIGHT,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: PANEL_TEXT,
});

const pText = () => ({
  margin: 0,
  fontSize: PANEL_FONT_SIZE,
  lineHeight: PANEL_LINE_HEIGHT,
  letterSpacing: "0.04em",
  color: PANEL_TEXT,
});

const cell = (right = false) => ({
  fontSize:      9,
  letterSpacing: "0.08em",
  color:         "#333",
  whiteSpace:    "nowrap",
  overflow:      "hidden",
  textOverflow:  "ellipsis",
  textAlign:     right ? "right" : "left",
});

// ─── Componente ───────────────────────────────────────────────────────────────
export default function IndexReleases3() {
  const [hoveredIndex,  setHoveredIndex]  = useState(null);
  const [focusedIndex,  setFocusedIndex]  = useState(null);
  const [visible,       setVisible]       = useState(false);

  const focusedData = focusedIndex !== null ? DataReleases[focusedIndex] : null;

  const openDetail = (i) => {
    setFocusedIndex(i);
    requestAnimationFrame(() => setVisible(true));
  };

  const closeDetail = () => {
    setVisible(false);
    setTimeout(() => setFocusedIndex(null), 300);
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeDetail(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Releases que van como miniaturas (todos excepto el focuseado)
  const thumbReleases = focusedIndex !== null
    ? DataReleases.filter((_, i) => i !== focusedIndex)
    : [];

  return (
    <div
      className="relative w-full min-h-screen flex items-center justify-center"
      style={{ background: "#fff" }}
    >
      {/* ── Imagen hover (lista) ──────────────────────────────────────────── */}
      {!focusedData && (
        <div
          className="pointer-events-none fixed inset-0 flex items-center justify-center"
          style={{
            zIndex:     0,
            opacity:    hoveredIndex !== null && DataReleases[hoveredIndex]?.image ? 1 : 0,
            transition: "opacity 0.25s ease",
          }}
        >
          {hoveredIndex !== null && DataReleases[hoveredIndex]?.image && (
            <img
              src={DataReleases[hoveredIndex].image}
              alt=""
              style={{ width: 300, height: 300, objectFit: "cover" }}
            />
          )}
        </div>
      )}

      {/* ── Lista ─────────────────────────────────────────────────────────── */}
      <div className="w-full px-10" style={{ position: "relative", zIndex: 1 }}>
        {DataReleases.map((release, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => openDetail(i)}
            style={{
              display:             "grid",
              gridTemplateColumns: GRID,
              padding:             "9px 0",
              cursor:              "pointer",
              opacity:             hoveredIndex !== null && hoveredIndex !== i ? 0.25 : 1,
              transition:          "opacity 0.2s ease",
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

      {/* ── Vista detalle ─────────────────────────────────────────────────── */}
      {focusedData && (
        <div
          style={{
            position:   "fixed",
            inset:      0,
            background: "#fff",
            zIndex:     10,
            opacity:    visible ? 1 : 0,
            transition: "opacity 0.3s ease",
            display:    "flex",
            alignItems: "center",
          }}
        >
          {/* Botón cerrar */}
          <button
            onClick={closeDetail}
            style={{
              position:      "absolute",
              top:           SIDE_PAD,
              right:         SIDE_PAD,
              background:    "none",
              border:        "none",
              cursor:        "pointer",
              fontSize:      PANEL_FONT_SIZE,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color:         PANEL_TEXT,
              padding:       0,
              zIndex:        2,
            }}
          >
            Close
          </button>

          {/* ── Columna 1: miniaturas ──────────────────────────────────────── */}
          <div
            style={{
              flexShrink:     0,
              width:          THUMB_W + SIDE_PAD * 2,
              height:         "100%",
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              justifyContent: "center",
              gap:            THUMB_GAP,
              padding:        `${SIDE_PAD}px ${SIDE_PAD}px`,
              overflowY:      "auto",
              boxSizing:      "border-box",
            }}
          >
            {thumbReleases.map((r, i) => (
              <div
                key={i}
                onClick={() => {
                  const realIndex = DataReleases.findIndex((d) => d === r);
                  setFocusedIndex(realIndex);
                }}
                style={{
                  width:        THUMB_W,
                  height:       THUMB_H,
                  flexShrink:   0,
                  cursor:       "pointer",
                  overflow:     "hidden",
                  opacity:      0.6,
                  transition:   "opacity 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
              >
                {r.image ? (
                  <img
                    src={r.image}
                    alt={r.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#eee" }} />
                )}
              </div>
            ))}
          </div>

          {/* ── Columna 2: imagen hero ─────────────────────────────────────── */}
          <div
            style={{
              flexShrink: 0,
              width:      HERO_SIZE,
              height:     HERO_SIZE,
            }}
          >
            {focusedData.image && (
              <img
                src={focusedData.image}
                alt={focusedData.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            )}
          </div>

          {/* ── Columna 3: info ───────────────────────────────────────────── */}
          <div
            style={{
              flexShrink:     0,
              width:          160,
              height:         HERO_SIZE,
              marginLeft:     COL_GAP,
              display:        "flex",
              flexDirection:  "column",
              justifyContent: "space-between",
            }}
          >
            {/* Artist + Title */}
            <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
              <p style={pLabel()}>{focusedData.artist}</p>
              <p style={pText()}>{focusedData.title}</p>
            </div>

            {/* Year + Ref */}
            <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
              <p style={pText()}>{focusedData.year}</p>
              <p style={pLabel()}>{focusedData.ref}</p>
            </div>

            {/* Type + Format + Vinyl */}
            <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
              <p style={pText()}>{focusedData.type}</p>
              <p style={pText()}>{focusedData.format}</p>
              {focusedData.vinyl && <p style={pText()}>{focusedData.vinyl}</p>}
            </div>
          </div>

          {/* ── Columna 4: tracklist + credits ────────────────────────────── */}
          <div
            style={{
              flex:           1,
              height:         HERO_SIZE,
              marginLeft:     COL_GAP,
              marginRight:    SIDE_PAD,
              display:        "flex",
              flexDirection:  "column",
              justifyContent: "space-between",
              overflow:       "hidden",
            }}
          >
            {/* Tracklist */}
            <div style={{ overflow: "auto", flex: 1 }}>
              {focusedData.tracklist?.map((track, i) => (
                <div
                  key={i}
                  style={{
                    display:    "flex",
                    alignItems: "baseline",
                    gap:        10,
                    lineHeight: PANEL_LINE_HEIGHT,
                  }}
                >
                  <span style={{
                    fontSize:           PANEL_FONT_SIZE,
                    color:              PANEL_TEXT,
                    minWidth:           18,
                    letterSpacing:      "0.06em",
                    fontVariantNumeric: "tabular-nums",
                    flexShrink:         0,
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={pText()}>{track}</span>
                </div>
              ))}
            </div>

            {/* Credits + Links */}
            <div style={{ flexShrink: 0, paddingTop: 16 }}>
              <p style={{ ...pLabel(), marginBottom: PANEL_GAP_TIGHT * 2 }}>Credits</p>
              {DEFAULT_CREDITS_LINES.map((line, i) => (
                <p key={i} style={{ ...pText(), margin: 0 }}>{line}</p>
              ))}

              <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                {focusedData.bandcamp && (
                  <a
                    href={focusedData.bandcamp}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...pLabel(), textDecoration: "none" }}
                  >
                    Bandcamp ↗
                  </a>
                )}
                {focusedData.soundcloud && (
                  <a
                    href={focusedData.soundcloud}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...pLabel(), textDecoration: "none" }}
                  >
                    Soundcloud ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}