import { PANEL_GAP_TIGHT } from "./constants";
import { panelPUpper, panelPWide } from "./panelStyles";

export default function ReleaseInfoPanel({ panelRef, panelLayout, infoW, focusedData }) {
  return (
    <div
      ref={panelRef}
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
          <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
            <p style={panelPUpper}>{focusedData.artist}</p>
            <p style={panelPWide}>{focusedData.title}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
            <p style={panelPWide}>{focusedData.year}</p>
            <p style={panelPUpper}>{focusedData.ref}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
            <p style={panelPWide}>{focusedData.format}</p>
            {focusedData.vinyl && <p style={panelPWide}>{focusedData.vinyl}</p>}
          </div>
        </>
      )}
    </div>
  );
}
