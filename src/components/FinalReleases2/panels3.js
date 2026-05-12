"use client";

import { Fragment } from "react";
import {
  PANEL_FONT_SIZE,
  PANEL_LINE_HEIGHT,
  PANEL_TEXT,
  PANEL_GAP_TIGHT,
  PADDING_PX,
} from "./constants";
import { DEFAULT_CREDITS_LINES } from "./releaseMap";

// ─── Design tokens ────────────────────────────────────────────────────────────
// Ficha catalográfica: jerarquía editorial con dos planos tipográficos
// (display / meta) y reglas horizontales sistemáticas, no decorativas.

const RULE = "1px solid #000";

const META_SIZE     = 10;
const META_TRACK    = "0.16em";
const TRACK_SIZE    = PANEL_FONT_SIZE; // 12
const DISPLAY_SIZE  = 30;
const CREDIT_SIZE   = 10;
const SIDE_GAP      = 12;

const meta = {
  margin: 0,
  fontSize: META_SIZE,
  lineHeight: 1.2,
  letterSpacing: META_TRACK,
  textTransform: "uppercase",
  color: PANEL_TEXT,
};

const metaValue = {
  ...meta,
  letterSpacing: "0.08em",
};

const display = {
  margin: 0,
  fontSize: DISPLAY_SIZE,
  lineHeight: 0.96,
  letterSpacing: "-0.01em",
  color: PANEL_TEXT,
  fontWeight: 400,
};

const trackRow = {
  display: "flex",
  alignItems: "baseline",
  gap: SIDE_GAP,
  padding: "5px 0",
  borderBottom: RULE,
  fontSize: TRACK_SIZE,
  lineHeight: 1.2,
  color: PANEL_TEXT,
};

const trackIdx = {
  minWidth: 26,
  letterSpacing: "0.08em",
  fontVariantNumeric: "tabular-nums",
  flexShrink: 0,
};

const trackName = {
  flex: 1,
  letterSpacing: "0.02em",
};

const sideLabel = {
  ...meta,
  paddingBottom: 6,
  marginBottom: 0,
};

// Y positions for the unified rules that cross both columns. TOP rule sits at
// the bottom of the first row (meta · ref / side label) — both 18px tall.
// FOOTER_HEIGHT keeps both footer blocks at the same y so the BOTTOM rule
// lands cleanly above bandcamp/soundcloud and the credits grid.
const TOP_RULE_Y    = 18;
const FOOTER_HEIGHT = 64;

// Empty placeholder header — invisible text, same height + rule as a real label.
// Used in digital releases so the top datum line aligns with the info column.
const NBSP = " ";

const link = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: PANEL_TEXT,
  textDecoration: "none",
  padding: "8px 0",
  borderBottom: RULE,
};

const credit = {
  margin: 0,
  fontSize: CREDIT_SIZE,
  lineHeight: 1.4,
  letterSpacing: "0.04em",
  color: PANEL_TEXT,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function splitInHalf(tracks) {
  const mid = Math.ceil(tracks.length / 2);
  return [tracks.slice(0, mid), tracks.slice(mid)];
}

function parseTrack(raw) {
  if (!raw) return { artist: null, title: "" };
  const s = raw.trim();
  // Split on " - ", " — " or " – " (compilations encode "Artist - Title")
  const m = s.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  if (m) return { artist: m[1].trim(), title: m[2].trim() };
  return { artist: null, title: s };
}

// Single cell for one track. Stretches vertically inside its grid row so the
// border-bottom always lands at the row's max height — the trick that keeps
// A_i and B_i baselines aligned even when one wraps.
function TrackCell({ raw, label, compact, parsed }) {
  const cellStyle = {
    display: "flex",
    alignItems: "baseline",
    gap: SIDE_GAP,
    padding: compact ? "3px 0" : "5px 0",
    borderBottom: RULE,
    fontSize: TRACK_SIZE,
    lineHeight: 1.25,
    color: PANEL_TEXT,
    minWidth: 0,
    boxSizing: "border-box",
  };

  if (!raw) {
    // Empty B-slot when sides have different lengths — keep the rule for rhythm.
    return <div style={{ ...cellStyle, opacity: 0.18 }} />;
  }

  const { artist, title } = parsed ? parseTrack(raw) : { artist: null, title: raw };

  return (
    <div style={cellStyle}>
      <span style={trackIdx}>{label}</span>
      <span style={{ flex: 1, minWidth: 0, overflowWrap: "break-word" }}>
        {artist && (
          <span
            style={{
              display: "block",
              fontSize: 9,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              lineHeight: 1.25,
              marginBottom: 1,
            }}
          >
            {artist}
          </span>
        )}
        <span style={{ display: "block", letterSpacing: "0.02em" }}>{title}</span>
      </span>
    </div>
  );
}

// Two-side grid: A_i and B_i live in the same grid row so they share its height.
function PairedTrackGrid({
  colA, colB, hasVinyl, parsed, compact, columnGap = 28,
}) {
  const rows   = Math.max(colA.length, colB.length);
  const labelA = hasVinyl ? "SIDE A" : NBSP;
  const labelB = hasVinyl ? "SIDE B" : NBSP;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridAutoRows: "max-content",
        columnGap,
      }}
    >
      <p style={sideLabel}>{labelA}</p>
      <p style={sideLabel}>{labelB}</p>

      {Array.from({ length: rows }).map((_, i) => (
        <Fragment key={i}>
          <TrackCell
            raw={colA[i]}
            label={hasVinyl ? `A${i + 1}` : String(i + 1).padStart(2, "0")}
            compact={compact}
            parsed={parsed}
          />
          <TrackCell
            raw={colB[i]}
            label={
              hasVinyl
                ? `B${i + 1}`
                : String(colA.length + i + 1).padStart(2, "0")
            }
            compact={compact}
            parsed={parsed}
          />
        </Fragment>
      ))}
    </div>
  );
}

// Single-column rendering for short releases (≤8 tracks, no vinyl).
// Renders an empty header so the top datum line aligns with the info column.
function SingleColumnTracks({ tracks, parsed, compact }) {
  return (
    <>
      <p style={sideLabel}>{NBSP}</p>
      {tracks.map((t, i) => (
        <TrackCell
          key={i}
          raw={t}
          label={String(i + 1).padStart(2, "0")}
          compact={compact}
          parsed={parsed}
        />
      ))}
    </>
  );
}

function Arrow({ size = 13 }) {
  return (
    <span
      aria-hidden
      style={{
        fontSize: size,
        lineHeight: 1,
        display: "inline-block",
        transform: "translateY(-1px)",
      }}
    >
      ↗
    </span>
  );
}

function ExternalLink({ href, label }) {
  return (
    <a
      href={href || "#"}
      target="_blank"
      rel="noreferrer noopener"
      style={link}
      onClick={(e) => {
        if (!href) e.preventDefault();
      }}
    >
      <Arrow />
      <span>{label}</span>
    </a>
  );
}

function MetaRow({ k, v }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
      <span style={{ ...meta, minWidth: 52, opacity: 0.55 }}>{k}</span>
      <span style={metaValue}>{v}</span>
    </div>
  );
}

// ─── InfoPanel (desktop, left column) ─────────────────────────────────────────

export function InfoPanel({ forwardRef, panelLayout, infoW, focusedData }) {
  // Full width of the focused area (info column + gap + tracks column),
  // excluding the trailing PADDING_PX on the right edge.
  const fullRuleWidth = Math.max(0, panelLayout.availableW - PADDING_PX * 2);

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
      }}
    >
      {focusedData && (
        <>
          {/* Unified TOP rule — spans both columns, overflows InfoPanel
              rightward across the gap and into TrackPanel's bounds. */}
          <div
            style={{
              position: "absolute",
              top: TOP_RULE_Y,
              left: 0,
              width: fullRuleWidth,
              height: 0,
              borderTop: RULE,
              pointerEvents: "none",
            }}
          />

          {/* Unified BOTTOM rule — spans both columns. */}
          <div
            style={{
              position: "absolute",
              bottom: FOOTER_HEIGHT,
              left: 0,
              width: fullRuleWidth,
              height: 0,
              borderTop: RULE,
              pointerEvents: "none",
            }}
          />

          {/* Top meta — ref · year */}
          <div style={{ paddingBottom: 6 }}>
            <p style={metaValue}>
              {(focusedData.ref || "").toUpperCase()}
              {focusedData.year ? ` · ${focusedData.year}` : ""}
            </p>
          </div>

          {/* Display — artist + title */}
          <div style={{ paddingTop: 14, paddingBottom: 16, borderBottom: RULE }}>
            <p style={{ ...display, marginBottom: 6 }}>{focusedData.artist}</p>
            <p style={display}>{focusedData.title}</p>
          </div>

          {/* Format block */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              paddingTop: 12,
              paddingBottom: 12,
              borderBottom: RULE,
            }}
          >
            <MetaRow
              k="FORMAT"
              v={
                focusedData.type
                  ? focusedData.type + (focusedData.vinyl ? ` · ${focusedData.vinyl}` : "")
                  : focusedData.vinyl || "—"
              }
            />
            {focusedData.format && <MetaRow k="FILES" v={focusedData.format} />}
          </div>

          {/* Footer — links anchored at bottom with fixed height so the
              unified rule above lands cleanly on the same y as credits. */}
          <div
            style={{
              height: FOOTER_HEIGHT,
              marginTop: "auto",
              paddingTop: 8,
              display: "flex",
              flexDirection: "column",
              pointerEvents: "auto",
            }}
          >
            <ExternalLink href={focusedData.bandcamp}   label="BANDCAMP" />
            <ExternalLink href={focusedData.soundcloud} label="SOUNDCLOUD" />
          </div>
        </>
      )}
    </div>
  );
}

// ─── TrackPanel (desktop, right column) ───────────────────────────────────────

export function TrackPanel({ forwardRef, panelLayout, trackLeft, trackW, focusedData }) {
  const tracks    = focusedData?.tracklist || [];
  const hasVinyl  = !!focusedData?.vinyl;
  const isComp    = focusedData?.artist === "Various Artists";
  const twoCol    = hasVinyl || tracks.length > 8;
  const [colA, colB] = twoCol ? splitInHalf(tracks) : [tracks, []];
  const longSide  = Math.max(colA.length, colB.length);
  // Compact when each side still holds many rows; compilations wrap to 2 lines
  // per row so the threshold is lower.
  const compact   = isComp ? longSide > 5 : longSide > 7;

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
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        {twoCol ? (
          <PairedTrackGrid
            colA={colA}
            colB={colB}
            hasVinyl={hasVinyl}
            parsed={isComp}
            compact={compact}
          />
        ) : (
          <SingleColumnTracks tracks={tracks} parsed={isComp} compact={false} />
        )}
      </div>

      {focusedData && <CreditsStrip />}
    </div>
  );
}

// ─── Credits strip ────────────────────────────────────────────────────────────
// 2-column compact grid. Same content for every release for now, but rendered
// as colophon-style metadata: small caps key on the left, value on the right,
// no decoration. Frees ~80px of vertical space vs. the previous stacked list.

function CreditsStrip() {
  return (
    <div
      style={{
        height: FOOTER_HEIGHT,
        marginTop: "auto",
        paddingTop: 8,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        columnGap: 24,
        rowGap: 2,
        alignContent: "start",
      }}
    >
      {DEFAULT_CREDITS_LINES.map((line, i) => (
        <p key={i} style={{ ...credit, fontSize: 9, lineHeight: 1.3 }}>
          {line}
        </p>
      ))}
    </div>
  );
}

// ─── MobilePanel — single column, vertical stack ──────────────────────────────
// Dedicated mobile layout. Editorial vertical reading, smaller type system,
// drops credits and FILES line. Tracklist scrolls internally so the layout
// survives short heights (small phones with browser chrome visible).

const M_META_SIZE    = 9;
const M_DISPLAY_SIZE = 18;
const M_TRACK_SIZE   = 10;

const mobileMeta = {
  margin: 0,
  fontSize: M_META_SIZE,
  lineHeight: 1.25,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: PANEL_TEXT,
};

function MobileTrackRow({ label, raw, parsed, isLast }) {
  const { artist, title } = parsed ? parseTrack(raw) : { artist: null, title: raw };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        padding: "2px 0",
        borderBottom: isLast ? "none" : RULE,
        color: PANEL_TEXT,
        minWidth: 0,
      }}
    >
      <span
        style={{
          minWidth: 22,
          fontSize: M_TRACK_SIZE,
          letterSpacing: "0.08em",
          fontVariantNumeric: "tabular-nums",
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span style={{ flex: 1, minWidth: 0, overflowWrap: "break-word" }}>
        {artist && (
          <span
            style={{
              display: "block",
              fontSize: 8,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              lineHeight: 1.25,
              marginBottom: 1,
            }}
          >
            {artist}
          </span>
        )}
        <span
          style={{
            display: "block",
            fontSize: M_TRACK_SIZE,
            letterSpacing: "0.02em",
            lineHeight: 1.3,
          }}
        >
          {title}
        </span>
      </span>
    </div>
  );
}

function MobileLink({ href, label }) {
  return (
    <a
      href={href || "#"}
      target="_blank"
      rel="noreferrer noopener"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: PANEL_TEXT,
        textDecoration: "none",
      }}
      onClick={(e) => {
        if (!href) e.preventDefault();
      }}
    >
      <Arrow size={11} />
      <span>{label}</span>
    </a>
  );
}

export function MobilePanel({ forwardRef, panelLayout, infoW, focusedData }) {
  const tracks   = focusedData?.tracklist || [];
  const hasVinyl = !!focusedData?.vinyl;
  const isComp   = focusedData?.artist === "Various Artists";
  const [sideA, sideB] = hasVinyl ? splitInHalf(tracks) : [tracks, []];

  // V.A for compilations — uses artistMobile from data when available.
  const artistLabel = focusedData?.artistMobile || focusedData?.artist || "";
  // Top meta line: ref · year · type (release format keyword now lives here).
  const metaParts = [
    (focusedData?.ref || "").toUpperCase(),
    focusedData?.year,
    focusedData?.type ? focusedData.type.toUpperCase() : null,
  ].filter(Boolean);

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
        // Container itself is click-through so taps outside the tracklist /
        // links exit focus mode. Inner blocks re-enable pointer events as needed.
        pointerEvents: "none",
        zIndex: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {focusedData && (
        <>
          {/* Meta — ref · year · type */}
          <div style={{ paddingBottom: 2, borderBottom: RULE }}>
            <p style={mobileMeta}>{metaParts.join(" · ")}</p>
          </div>

          {/* Display — artist + title on one line */}
          <div style={{ paddingTop: 4, paddingBottom: 5, borderBottom: RULE }}>
            <p style={{ ...display, fontSize: M_DISPLAY_SIZE, lineHeight: 1.05 }}>
              {artistLabel}
              {artistLabel && focusedData.title ? " — " : ""}
              {focusedData.title}
            </p>
          </div>

          {/* Tracklist — scrolls internally if it overflows. */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              pointerEvents: "auto",
              WebkitOverflowScrolling: "touch",
              paddingTop: 2,
            }}
          >
            {hasVinyl ? (
              <>
                <p
                  style={{
                    ...mobileMeta,
                    paddingTop: 3,
                    paddingBottom: 2,
                    borderBottom: RULE,
                  }}
                >
                  SIDE A
                </p>
                {sideA.map((t, i) => (
                  <MobileTrackRow
                    key={`a-${i}`}
                    label={`A${i + 1}`}
                    raw={t}
                    parsed={isComp}
                  />
                ))}
                <p
                  style={{
                    ...mobileMeta,
                    paddingTop: 6,
                    paddingBottom: 2,
                    borderBottom: RULE,
                  }}
                >
                  SIDE B
                </p>
                {sideB.map((t, i) => (
                  <MobileTrackRow
                    key={`b-${i}`}
                    label={`B${i + 1}`}
                    raw={t}
                    parsed={isComp}
                    isLast={i === sideB.length - 1}
                  />
                ))}
              </>
            ) : (
              tracks.map((t, i) => (
                <MobileTrackRow
                  key={i}
                  label={String(i + 1).padStart(2, "0")}
                  raw={t}
                  parsed={isComp}
                  isLast={i === tracks.length - 1}
                />
              ))
            )}
          </div>

          {/* Footer — links inline, side by side. */}
          <div
            style={{
              display: "flex",
              gap: 22,
              alignItems: "center",
              paddingTop: 5,
              paddingBottom: 1,
              borderTop: RULE,
              pointerEvents: "auto",
            }}
          >
            <MobileLink href={focusedData.bandcamp}   label="BANDCAMP" />
            <MobileLink href={focusedData.soundcloud} label="SOUNDCLOUD" />
          </div>
        </>
      )}
    </div>
  );
}
