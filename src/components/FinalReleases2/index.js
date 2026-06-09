"use client";

import { useRef, useState, useEffect } from "react";
import { useSliderScene } from "./useSliderScene";
import { InfoPanel, TrackPanel, MobilePanel } from "./panels2";
import IndexView from "./IndexView";
import { PADDING_PX, INFO_W_FRAC } from "./constants";
import { CENTER_IDX, SLIDE_COUNT, TITLES } from "./releaseMap";

const DATA_PILL_STYLE = {
  width: "clamp(68px, 16vw, 103px)",
  padding: "clamp(0.36rem, 1vw, 0.423rem) clamp(0.18rem, 0.5vw, 0.22rem)",
  display: "inline-flex",
  alignItems: "flex-end",
  justifyContent: "center",
  borderRadius: 2,
  backgroundColor: "#000",
  color: "#fff",
  fontSize: "clamp(10.5px, 2.6vw, 11px)",
  letterSpacing: "0.012em",
  lineHeight: 0,
  whiteSpace: "nowrap",
  border: "1px solid #000",
  margin: 0,
  overflow: "hidden",
};

const FORMAT_PILL_STYLE = {
  ...DATA_PILL_STYLE,
  width: "clamp(132px, 30vw, 172px)",
};

export default function FinalReleases2() {
  const canvasRef     = useRef(null);
  const titleRef      = useRef(null);
  const counterRef    = useRef(null);
  const infoPanelRef  = useRef(null);
  const trackPanelRef = useRef(null);
  const sceneApiRef   = useRef(null);

  const [isIndex, setIsIndex] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const { focusedData, activeData, panelLayout, viewportSize } = useSliderScene({
    canvasRef,
    sceneApiRef,
    titleRef,
    counterRef,
    infoPanelRef,
    trackPanelRef,
  });

  const goToIndex = () => {
    if (transitioning || isIndex) return;
    setTransitioning(true);
    sceneApiRef.current?.animateToCenter(() => {
      setIsIndex(true);
      setTransitioning(false);
    });
  };

  const goToSlider = () => {
    if (transitioning || !isIndex) return;
    setTransitioning(true);
    setIsIndex(false);
    sceneApiRef.current?.animateToPyramid(() => {
      setTransitioning(false);
    });
  };

  // Refs always point to latest handlers — avoids stale closures in event listeners
  const actionsRef = useRef({});
  actionsRef.current = { goToIndex, goToSlider };

  useEffect(() => {
    const onIndex  = () => actionsRef.current.goToIndex();
    const onSlider = () => actionsRef.current.goToSlider();
    window.addEventListener("mm-releases-go-index",  onIndex);
    window.addEventListener("mm-releases-go-slider", onSlider);
    return () => {
      window.removeEventListener("mm-releases-go-index",  onIndex);
      window.removeEventListener("mm-releases-go-slider", onSlider);
    };
  }, []);

  const isMobile  = viewportSize.w > 0 && viewportSize.w < 768;
  const refValue = (activeData?.ref || "—").toUpperCase();
  const yearValue = activeData?.year || "—";
  const formatValue = activeData
    ? (activeData.vinyl ? activeData.vinyl : activeData.format || "")
    : "";
  const dataPillStyle = isMobile
    ? { ...DATA_PILL_STYLE, width: "80px" }
    : DATA_PILL_STYLE;
  const formatPillStyle = FORMAT_PILL_STYLE;

  // Mobile: InfoPanel ocupa todo el ancho disponible bajo el hero; TrackPanel oculto
  // Desktop: InfoPanel izquierda, TrackPanel derecha
  const infoW     = isMobile
    ? panelLayout.availableW
    : Math.max(120, panelLayout.availableW * INFO_W_FRAC - panelLayout.gap * 0.5);
  const trackLeft = panelLayout.left + infoW + panelLayout.gap;
  const trackW    = isMobile
    ? 0
    : Math.max(0, panelLayout.availableW - infoW - panelLayout.gap - PADDING_PX * 2);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        background: "#fff",
        height: viewportSize.h > 0 ? viewportSize.h : "100vh",
      }}
    >
      {/* Canvas — always mounted */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          zIndex: 1,
          opacity: isIndex ? 0.1 : 1,
          transition: "opacity 0.7s ease",
        }}
      />

      {/* Focus-mode panels */}
      {isMobile ? (
        <MobilePanel
          forwardRef={infoPanelRef}
          panelLayout={panelLayout}
          infoW={infoW}
          focusedData={focusedData}
        />
      ) : (
        <>
          <InfoPanel
            forwardRef={infoPanelRef}
            panelLayout={panelLayout}
            infoW={infoW}
            focusedData={focusedData}
          />
          <TrackPanel
            forwardRef={trackPanelRef}
            panelLayout={panelLayout}
            trackLeft={trackLeft}
            trackW={trackW}
            focusedData={focusedData}
          />
        </>
      )}

      {/* Index overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          opacity: isIndex ? 1 : 0,
          pointerEvents: isIndex ? "auto" : "none",
          transition: "opacity 0.45s ease",
        }}
      >
        <IndexView />
      </div>

      {/* Grain */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23g)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px",
          mixBlendMode: "multiply",
          opacity: 0.03,
          zIndex: 2,
        }}
      />

      {/* Bottom UI */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-end justify-between"
        style={{
          padding: "0 36px 32px",
          zIndex: 10,
          opacity: isIndex ? 0 : 1,
          transition: "opacity 0.3s ease",
          pointerEvents: isIndex ? "none" : "auto",
        }}
      >
        <span ref={titleRef} style={{ display: "none" }} />
        <span ref={counterRef} style={{ display: "none" }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            width: "100%",
            justifyContent: "center",
            opacity: focusedData ? 0 : 1,
            transition: "opacity 0.2s ease",
            pointerEvents: focusedData ? "none" : "auto",
          }}
        >
          <p style={formatPillStyle}>{formatValue}</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              flexWrap: "nowrap",
            }}
          >
            <p style={dataPillStyle}>{refValue}</p>
            <p style={dataPillStyle}>{yearValue}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
