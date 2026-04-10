"use client";

import { useRef, useState } from "react";
import { useSliderScene } from "./useSliderScene";
import { InfoPanel, TrackPanel } from "./panels";
import IndexView from "./IndexView";
import { PADDING_PX, INFO_W_FRAC } from "./constants";
import { CENTER_IDX, SLIDE_COUNT, TITLES } from "./releaseMap";

export default function FinalReleases2() {
  const canvasRef     = useRef(null);
  const titleRef      = useRef(null);
  const counterRef    = useRef(null);
  const infoPanelRef  = useRef(null);
  const trackPanelRef = useRef(null);
  const sceneApiRef   = useRef(null);

  const [isIndex, setIsIndex] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const { focusedData, panelLayout, viewportSize } = useSliderScene({
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

  const infoW     = Math.max(120, panelLayout.availableW * INFO_W_FRAC - panelLayout.gap * 0.5);
  const trackLeft = panelLayout.left + infoW + panelLayout.gap;
  const trackW    = Math.max(0, panelLayout.availableW - infoW - panelLayout.gap - PADDING_PX * 2);

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

      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between"
        style={{ padding: "28px 36px", zIndex: 30 }}
      >
        <span
          style={{
            fontSize: 9,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#000",
            opacity: 0.4,
          }}
        >
          MM Discos
        </span>

        <button
          onClick={isIndex ? goToSlider : goToIndex}
          disabled={transitioning}
          style={{
            background: "none",
            border: "none",
            cursor: transitioning ? "default" : "pointer",
            fontSize: 9,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#000",
            opacity: transitioning ? 0.3 : 0.6,
            padding: 0,
            transition: "opacity 0.2s",
          }}
        >
          {isIndex ? "Slider" : "Index"}
        </button>
      </div>

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
      </div>
    </div>
  );
}
