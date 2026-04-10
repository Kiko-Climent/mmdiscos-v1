"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import GrainOverlay from "./GrainOverlay";
import ReleaseInfoPanel from "./ReleaseInfoPanel";
import ReleaseTrackPanel from "./ReleaseTrackPanel";
import { INFO_W_FRAC, PADDING_PX } from "./constants";
import { useReleasesSliderScene } from "./useReleasesSliderScene";
import IndexReleases2 from "../Index/IndexReleases2";  // 👈 1. import

export default function FinalReleasesSlider() {
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const counterRef = useRef(null);
  const bgARef = useRef(null);
  const bgBRef = useRef(null);
  const bgActiveRef = useRef("a");

  const infoPanelRef = useRef(null);
  const trackPanelRef = useRef(null);
  const exitToIndexRef = useRef(null);   // 👈 2. ref nuevo
  const indexOverlayRef = useRef(null);  // 👈 3. ref nuevo

  const [focusedData, setFocusedData] = useState(null);
  const [panelLayout, setPanelLayout] = useState({
    left: 0,
    top: 0,
    height: 0,
    availableW: 0,
    gap: 0,
  });
  const [showIndex, setShowIndex] = useState(false);  // 👈 4. estado nuevo

  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const sync = () =>
      setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useReleasesSliderScene({
    canvasRef,
    titleRef,
    counterRef,
    bgARef,
    bgBRef,
    bgActiveRef,
    infoPanelRef,
    trackPanelRef,
    exitToIndexRef,   // 👈 5. pasarlo al hook
    setFocusedData,
    setPanelLayout,
  });

  // 👈 6. función que dispara la animación y monta el overlay
  function handleIndexClick() {
    exitToIndexRef.current?.(() => {
      setShowIndex(true);
      requestAnimationFrame(() => {
        if (indexOverlayRef.current) {
          gsap.fromTo(
            indexOverlayRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: "power2.out" }
          );
        }
      });
    });
  }

  const infoW = Math.max(
    120,
    panelLayout.availableW * INFO_W_FRAC - panelLayout.gap * 0.5
  );
  const trackLeft = panelLayout.left + infoW + panelLayout.gap;
  const trackW = Math.max(
    0,
    panelLayout.availableW - infoW - panelLayout.gap - PADDING_PX * 2
  );

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        background: "#fff",
        height: viewportSize.h > 0 ? viewportSize.h : "100vh",
      }}
    >
      {/* 👈 7. botón INDEX */}
      <button
        onClick={handleIndexClick}
        style={{
          position:      "absolute",
          top:           20,
          left:          "50%",
          transform:     "translateX(-50%)",
          zIndex:        10,
          background:    "none",
          border:        "none",
          cursor:        "pointer",
          fontSize:      9,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color:         "#000",
          padding:       "4px 8px",
        }}
      >
        Index
      </button>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      <ReleaseInfoPanel
        panelRef={infoPanelRef}
        panelLayout={panelLayout}
        infoW={infoW}
        focusedData={focusedData}
      />

      <ReleaseTrackPanel
        panelRef={trackPanelRef}
        panelLayout={panelLayout}
        trackLeft={trackLeft}
        trackW={trackW}
        focusedData={focusedData}
      />

      <GrainOverlay />

      {/* 👈 8. overlay IndexReleases2 */}
      {showIndex && (
        <div
          ref={indexOverlayRef}
          style={{
            position:   "absolute",
            inset:      0,
            zIndex:     20,
            opacity:    0,
            background: "transparent",
          }}
        >
          <IndexReleases2 />
        </div>
      )}
    </div>
  );
}