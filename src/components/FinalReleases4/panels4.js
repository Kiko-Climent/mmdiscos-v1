"use client";

import { PADDING_PX } from "./constants";
import { DEFAULT_CREDITS_LINES } from "./releaseMap";

const HEADLINE_FONT = "'Favorit', sans-serif";
const GREY_TEXT_SOFT = "#9a9a9a";
const INK = "#111111";
const ARTIST = "#8A8A8A";

function splitInHalf(tracks) {
  const mid = Math.ceil(tracks.length / 2);
  return [tracks.slice(0, mid), tracks.slice(mid)];
}

function formatLine(data) {
  const type = (data.type || "").trim();
  const vinyl = (data.vinyl || "").trim();
  if (type && vinyl) return `${type} · ${vinyl}`;
  return type || vinyl || "—";
}

function Arrow({ size = 11 }) {
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
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: HEADLINE_FONT,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: INK,
        textDecoration: "none",
      }}
      onClick={(e) => {
        if (!href) e.preventDefault();
      }}
    >
      <Arrow />
      <span>{label}</span>
    </a>
  );
}

function MetaPair({ k, v }) {
  if (!v) return null;
  return (
    <div>
      <p
        style={{
          margin: 0,
          fontFamily: HEADLINE_FONT,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: GREY_TEXT_SOFT,
        }}
      >
        {k}
      </p>
      <p
        style={{
          margin: "3px 0 0",
          fontFamily: HEADLINE_FONT,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: INK,
        }}
      >
        {v}
      </p>
    </div>
  );
}

function TrackRow({ label, raw }) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: HEADLINE_FONT,
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.32,
        minWidth: 0,
      }}
    >
      <span style={{ color: GREY_TEXT_SOFT }}>{label}</span>
      {" "}
      <span style={{ color: INK }}>{raw}</span>
    </p>
  );
}

export function DetailPanel({ forwardRef, panelLayout, focusedData }) {
  const tracks = focusedData?.tracklist || [];
  const hasVinyl = !!focusedData?.vinyl;
  const twoCol = hasVinyl || tracks.length > 6;
  const [colA, colB] = twoCol ? splitInHalf(tracks) : [tracks, []];
  const labelFor = (i, side) => {
    if (hasVinyl) return `${side}${i + 1}`;
    return String(i + 1).padStart(2, "0");
  };
  const credits = focusedData?.credits ?? DEFAULT_CREDITS_LINES;
  const catalog = [focusedData?.ref?.toUpperCase(), focusedData?.year]
    .filter(Boolean)
    .join("  ·  ");

  const {
    left = 0,
    top = 0,
    availableW = 0,
    heroLeft = 0,
    heroTop = 0,
    heroW = 0,
    heroH = 0,
  } = panelLayout;
  const infoW = Math.max(0, availableW - PADDING_PX);

  return (
    <div
      ref={forwardRef}
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0,
        pointerEvents: "none",
        zIndex: 3,
      }}
    >
      {focusedData ? (
        <>
          <div
            style={{
              position: "absolute",
              left,
              top,
              width: infoW,
            }}
          >
            {catalog ? (
              <p
                style={{
                  margin: 0,
                  fontFamily: HEADLINE_FONT,
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: "-0.06em",
                  lineHeight: 1.05,
                  textTransform: "uppercase",
                  color: INK,
                }}
              >
                {catalog}
              </p>
            ) : null}

            <div style={{ marginTop: 6 }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: HEADLINE_FONT,
                  fontSize: 30,
                  fontWeight: 600,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  color: ARTIST,
                }}
              >
                {focusedData.artist}
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: HEADLINE_FONT,
                  fontSize: 30,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  color: INK,
                }}
              >
                {focusedData.title}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: 36,
                marginTop: 12,
              }}
            >
              <MetaPair k="Format" v={formatLine(focusedData)} />
              <MetaPair k="Files" v={focusedData.format} />
            </div>

            <div style={{ marginTop: 12 }}>
              <p
                style={{
                  margin: "0 0 4px",
                  fontFamily: HEADLINE_FONT,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: GREY_TEXT_SOFT,
                }}
              >
                Tracklist
              </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: twoCol ? "1fr 1fr" : "1fr",
                columnGap: 24,
              }}
            >
              <div>
                {colA.map((track, i) => (
                  <TrackRow
                    key={`a-${i}`}
                    label={labelFor(i, "A")}
                    raw={track}
                  />
                ))}
              </div>
              {twoCol ? (
                <div>
                  {colB.map((track, i) => (
                    <TrackRow
                      key={`b-${i}`}
                      label={hasVinyl ? labelFor(i, "B") : labelFor(colA.length + i, "")}
                      raw={track}
                    />
                  ))}
                </div>
              ) : null}
            </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 20,
                marginTop: 14,
                pointerEvents: "auto",
              }}
            >
              <ExternalLink href={focusedData.bandcamp} label="Bandcamp" />
              <ExternalLink href={focusedData.soundcloud} label="Soundcloud" />
            </div>
          </div>

          {heroW > 0 ? (
            <div
              style={{
                position: "absolute",
                left: heroLeft,
                top: heroTop + heroH + 16,
                width: heroW,
              }}
            >
              {credits.map((line, i) => (
                <p
                  key={i}
                  style={{
                    margin: 0,
                    fontFamily: HEADLINE_FONT,
                    fontSize: 10,
                    fontWeight: 600,
                    lineHeight: 1.4,
                    color: INK,
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export function MobilePanel({ forwardRef, panelLayout, infoW, focusedData }) {
  const tracks = focusedData?.tracklist || [];
  const hasVinyl = !!focusedData?.vinyl;
  const [sideA, sideB] = hasVinyl ? splitInHalf(tracks) : [tracks, []];
  const artistLabel = focusedData?.artistMobile || focusedData?.artist || "";
  const catalog = [focusedData?.ref?.toUpperCase(), focusedData?.year]
    .filter(Boolean)
    .join("  ·  ");

  const labelStyle = {
    margin: 0,
    fontFamily: HEADLINE_FONT,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: GREY_TEXT_SOFT,
  };

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
      {focusedData ? (
        <>
          {catalog ? (
            <p
              style={{
                margin: 0,
                fontFamily: HEADLINE_FONT,
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "-0.06em",
                lineHeight: 1.05,
                textTransform: "uppercase",
                color: INK,
              }}
            >
              {catalog}
            </p>
          ) : null}

          <div style={{ marginTop: 4 }}>
            <p
              style={{
                margin: 0,
                fontFamily: HEADLINE_FONT,
                fontSize: 22,
                fontWeight: 600,
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
                color: ARTIST,
              }}
            >
              {artistLabel}
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: HEADLINE_FONT,
                fontSize: 22,
                fontWeight: 700,
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
                color: INK,
              }}
            >
              {focusedData.title}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 28,
              marginTop: 10,
            }}
          >
            <MetaPair k="Format" v={formatLine(focusedData)} />
            <MetaPair k="Files" v={focusedData.format} />
          </div>

          <p style={{ ...labelStyle, margin: "10px 0 3px" }}>Tracklist</p>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              overflowX: "hidden",
              pointerEvents: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {hasVinyl ? (
              <>
                {sideA.map((track, i) => (
                  <TrackRow key={`a-${i}`} label={`A${i + 1}`} raw={track} />
                ))}
                {sideB.map((track, i) => (
                  <TrackRow key={`b-${i}`} label={`B${i + 1}`} raw={track} />
                ))}
              </>
            ) : (
              tracks.map((track, i) => (
                <TrackRow
                  key={i}
                  label={String(i + 1).padStart(2, "0")}
                  raw={track}
                />
              ))
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 18,
              marginTop: 10,
              pointerEvents: "auto",
            }}
          >
            <ExternalLink href={focusedData.bandcamp} label="Bandcamp" />
            <ExternalLink href={focusedData.soundcloud} label="Soundcloud" />
          </div>
        </>
      ) : null}
    </div>
  );
}
