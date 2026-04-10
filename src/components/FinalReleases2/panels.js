"use client";

import {
  PANEL_FONT_SIZE,
  PANEL_LINE_HEIGHT,
  PANEL_TEXT,
  PANEL_GAP_TIGHT,
} from "./constants";
import { DEFAULT_CREDITS_LINES } from "./releaseMap";

// ─── Shared style helper ──────────────────────────────────────────────────────

const txt = (extra = {}) => ({
  margin: 0,
  fontSize: PANEL_FONT_SIZE,
  lineHeight: PANEL_LINE_HEIGHT,
  color: PANEL_TEXT,
  ...extra,
});

// ─── InfoPanel ────────────────────────────────────────────────────────────────

export function InfoPanel({ forwardRef, panelLayout, infoW, focusedData }) {
  return (
    <div
      ref={forwardRef}
      style={{
        position: "absolute",
        left: panelLayout.left,
        top: panelLayout.top,
        width: infoW,
        height: panelLayout.height,
        opacity: 0,
        pointerEvents: "none",
        zIndex: 3,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {focusedData && (
        <>
          {/* Artist + Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
            <p style={txt({ letterSpacing: "0.06em", textTransform: "uppercase" })}>
              {focusedData.artist}
            </p>
            <p style={txt({ letterSpacing: "0.04em" })}>
              {focusedData.title}
            </p>
          </div>

          {/* Year + Ref */}
          <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
            <p style={txt({ letterSpacing: "0.04em" })}>{focusedData.year}</p>
            <p style={txt({ letterSpacing: "0.06em", textTransform: "uppercase" })}>
              {focusedData.ref}
            </p>
          </div>

          {/* Format + Vinyl */}
          <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
            <p style={txt({ letterSpacing: "0.04em" })}>{focusedData.format}</p>
            {focusedData.vinyl && (
              <p style={txt({ letterSpacing: "0.04em" })}>{focusedData.vinyl}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── TrackPanel ───────────────────────────────────────────────────────────────

export function TrackPanel({ forwardRef, panelLayout, trackLeft, trackW, focusedData }) {
  return (
    <div
      ref={forwardRef}
      style={{
        position: "absolute",
        left: trackLeft,
        top: panelLayout.top,
        width: trackW,
        height: panelLayout.height,
        opacity: 0,
        pointerEvents: "none",
        zIndex: 3,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Tracklist */}
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {focusedData?.tracklist?.map((track, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "baseline",
              lineHeight: PANEL_LINE_HEIGHT,
              fontSize: PANEL_FONT_SIZE,
              color: PANEL_TEXT,
            }}
          >
            <span
              style={txt({
                minWidth: 18,
                letterSpacing: "0.06em",
                fontVariantNumeric: "tabular-nums",
                flexShrink: 0,
              })}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={txt({ letterSpacing: "0.04em" })}>{track}</span>
          </div>
        ))}
      </div>

      {/* Credits */}
      {focusedData && (
        <div style={{ flexShrink: 0, marginTop: "auto", paddingTop: PANEL_GAP_TIGHT * 4 }}>
          <p
            style={txt({
              marginBottom: PANEL_GAP_TIGHT * 2,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            })}
          >
            Credits
          </p>
          <div>
            {DEFAULT_CREDITS_LINES.map((line, i) => (
              <p key={i} style={txt({ letterSpacing: "0.04em" })}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
