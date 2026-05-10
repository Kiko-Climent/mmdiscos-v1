"use client";

import {
  PANEL_FONT_SIZE,
  PANEL_FONT_SIZE_MOBILE,
  PANEL_LINE_HEIGHT,
  PANEL_TEXT,
  PANEL_GAP_TIGHT,
} from "./constants";
import { DEFAULT_CREDITS_LINES } from "./releaseMap";

// ─── Shared style helper ──────────────────────────────────────────────────────

const RULE = "1px solid rgba(0,0,0,0.45)";
const ROW_PAD_BOTTOM = 4;

const txt = (extra = {}) => ({
  margin: 0,
  fontSize: PANEL_FONT_SIZE,
  lineHeight: PANEL_LINE_HEIGHT,
  color: PANEL_TEXT,
  ...extra,
});

// Row underline — aplicado a cada `<p>` o fila que sea una línea de texto.
const lineRule = {
  paddingBottom: ROW_PAD_BOTTOM,
  borderBottom: RULE,
};

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
            <p style={txt({ letterSpacing: "0.06em", textTransform: "uppercase", ...lineRule })}>
              {focusedData.artist}
            </p>
            <p style={txt({ letterSpacing: "0.04em", ...lineRule })}>
              {focusedData.title}
            </p>
          </div>

          {/* Year + Ref */}
          <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
            <p style={txt({ letterSpacing: "0.04em", ...lineRule })}>{focusedData.year}</p>
            <p style={txt({ letterSpacing: "0.06em", textTransform: "uppercase", ...lineRule })}>
              {focusedData.ref}
            </p>
          </div>

          {/* Format + Vinyl */}
          <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
            <p style={txt({ letterSpacing: "0.04em", ...lineRule })}>{focusedData.format}</p>
            {focusedData.vinyl && (
              <p style={txt({ letterSpacing: "0.04em", ...lineRule })}>{focusedData.vinyl}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── MobilePanel — metadata left · tracklist right · no credits ──────────────

export function MobilePanel({ forwardRef, panelLayout, infoW, focusedData }) {
  const mTxt = (extra = {}) => ({
    margin: 0,
    fontSize: PANEL_FONT_SIZE_MOBILE,
    lineHeight: PANEL_LINE_HEIGHT,
    color: PANEL_TEXT,
    ...extra,
  });
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
        gap: 24,
        overflow: "hidden",
        fontSize: PANEL_FONT_SIZE_MOBILE,
      }}
    >
      {focusedData && (
        <>
          {/* Left column: metadata fields */}
          <div
            style={{
              flex: "0 0 auto",
              width: "42%",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
              <p style={mTxt({ letterSpacing: "0.06em", textTransform: "uppercase", ...lineRule })}>
                {focusedData.artist}
              </p>
              <p style={mTxt({ letterSpacing: "0.04em", ...lineRule })}>{focusedData.title}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
              <p style={mTxt({ letterSpacing: "0.04em", ...lineRule })}>{focusedData.year}</p>
              <p style={mTxt({ letterSpacing: "0.06em", textTransform: "uppercase", ...lineRule })}>
                {focusedData.ref}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
              <p style={mTxt({ letterSpacing: "0.04em", ...lineRule })}>{focusedData.format}</p>
              {focusedData.vinyl && (
                <p style={mTxt({ letterSpacing: "0.04em", ...lineRule })}>{focusedData.vinyl}</p>
              )}
            </div>
          </div>

          {/* Right column: tracklist pushed right, text left-aligned.
              The longest title's right edge aligns with the hero's right edge. */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-end",
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            {/* maxWidth:"100%" hace que títulos largos hagan salto de línea
                en lugar de desbordar y cortarse por la izquierda */}
            <div style={{ maxWidth: "100%", overflowWrap: "break-word" }}>
              {focusedData.tracklist?.map((track, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    lineHeight: PANEL_LINE_HEIGHT,
                    fontSize: PANEL_FONT_SIZE_MOBILE,
                    color: PANEL_TEXT,
                    ...lineRule,
                  }}
                >
                  <span
                    style={mTxt({
                      minWidth: 16,
                      letterSpacing: "0.06em",
                      fontVariantNumeric: "tabular-nums",
                      flexShrink: 0,
                    })}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={mTxt({ letterSpacing: "0.04em" })}>{track}</span>
                </div>
              ))}
            </div>
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
              ...lineRule,
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

      {/* Credits — sin encabezado, font 10px (12 × 0.833, ratio editorial
          minor third) para restarles presencia frente al tracklist. */}
      {focusedData && (
        <div style={{ flexShrink: 0, marginTop: "auto", paddingTop: PANEL_GAP_TIGHT * 4 }}>
          {DEFAULT_CREDITS_LINES.map((line, i) => (
            <p
              key={i}
              style={txt({
                fontSize: 10,
                letterSpacing: "0.04em",
                ...lineRule,
              })}
            >
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
