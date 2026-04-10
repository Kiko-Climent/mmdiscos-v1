import {
  DEFAULT_CREDITS_LINES,
  PANEL_FONT_SIZE,
  PANEL_GAP_TIGHT,
  PANEL_LINE_HEIGHT,
  PANEL_TEXT,
} from "./constants";
import { panelP, panelPUpper, panelPWide } from "./panelStyles";

export default function ReleaseTrackPanel({
  panelRef,
  panelLayout,
  trackLeft,
  trackW,
  focusedData,
}) {
  return (
    <div
      ref={panelRef}
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
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
        }}
      >
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
              style={{
                ...panelP,
                minWidth: 18,
                letterSpacing: "0.06em",
                fontVariantNumeric: "tabular-nums",
                flexShrink: 0,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={panelPWide}>{track}</span>
          </div>
        ))}
      </div>

      {focusedData && (
        <div
          style={{
            flexShrink: 0,
            marginTop: "auto",
            paddingTop: PANEL_GAP_TIGHT * 4,
          }}
        >
          <p
            style={{
              ...panelPUpper,
              marginBottom: PANEL_GAP_TIGHT * 2,
            }}
          >
            Credits
          </p>
          <div
            style={{
              fontSize: PANEL_FONT_SIZE,
              lineHeight: PANEL_LINE_HEIGHT,
              letterSpacing: "0.04em",
              color: PANEL_TEXT,
            }}
          >
            {DEFAULT_CREDITS_LINES.map((line, i) => (
              <p key={i} style={panelPWide}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
