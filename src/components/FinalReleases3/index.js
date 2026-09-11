"use client";

import { useRef, useState, useEffect } from "react";
import { useSliderScene } from "./useSliderScene";
import { InfoPanel, TrackPanel, MobilePanel, BottomBar } from "./panels2";
import IndexView from "./IndexView";
import { PADDING_PX, INFO_W_FRAC } from "./constants";

const NAV_TYPE =
  "uppercase text-[18px] font-semibold tracking-[-0.06em] leading-[1.05] text-black";

export default function FinalReleases3() {
  const canvasRef      = useRef(null);
  const titleRef       = useRef(null);
  const counterRef     = useRef(null);
  const infoPanelRef   = useRef(null);
  const trackPanelRef  = useRef(null);
  const bottomBarRef   = useRef(null);
  const sceneApiRef    = useRef(null);

  const [isIndex, setIsIndex] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const { focusedData, activeData, panelLayout, viewportSize, thumbStrip } = useSliderScene({
    canvasRef,
    sceneApiRef,
    titleRef,
    counterRef,
    infoPanelRef,
    trackPanelRef,
    bottomBarRef,
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
  const artistValue = activeData?.artist || "";
  const refValue = (activeData?.ref || "").toUpperCase();
  const yearValue = activeData?.year || "";
  const formatValue = activeData
    ? (activeData.vinyl ? activeData.vinyl : activeData.format || "")
    : "";

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
      {/* View switcher — same type as NewNav, baselines lock to RELEASES / MANIFESTO.
          Desktop: centered. Mobile: right edge, same px-3 as #mm-new-nav. */}
      <div
        className="absolute top-0 z-30 flex flex-col pt-2.5 pointer-events-none max-md:right-0 max-md:items-end max-md:px-3 md:left-1/2 md:-translate-x-1/2 md:items-center"
        aria-label="View mode"
      >
        <span className={`${NAV_TYPE} invisible`} aria-hidden>
          MM DISCOS
        </span>
        <span className={`${NAV_TYPE} invisible`} aria-hidden>
          ABOUT
        </span>
        <button
          type="button"
          onClick={goToSlider}
          className={`${NAV_TYPE} bg-transparent border-0 p-0 m-0 cursor-pointer appearance-none pointer-events-auto transition-opacity duration-150 ${
            isIndex ? "opacity-45 hover:opacity-100" : "opacity-100 hover:opacity-45"
          }`}
        >
          SLIDER
        </button>
        <button
          type="button"
          onClick={goToIndex}
          className={`${NAV_TYPE} bg-transparent border-0 p-0 m-0 cursor-pointer appearance-none pointer-events-auto transition-opacity duration-150 ${
            isIndex ? "opacity-100 hover:opacity-45" : "opacity-45 hover:opacity-100"
          }`}
        >
          INDEX
        </button>
      </div>

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

      {/* Mobile thumb column scroller — native overflow, drives Three.js Y */}
      {thumbStrip && !isIndex ? (
        <div
          aria-hidden
          onScroll={(e) => sceneApiRef.current?.setThumbScroll(e.currentTarget.scrollTop)}
          onClick={(e) => sceneApiRef.current?.pickFocusAt(e.clientX, e.clientY)}
          className="absolute z-[4] overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            left: 0,
            top: thumbStrip.top,
            width: thumbStrip.width,
            height: thumbStrip.windowH,
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            touchAction: "pan-y",
          }}
        >
          <div style={{ height: Math.max(thumbStrip.contentH, thumbStrip.windowH), width: "100%" }} />
        </div>
      ) : null}

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
          <BottomBar
            forwardRef={bottomBarRef}
            panelLayout={panelLayout}
            infoW={infoW}
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

      <span ref={counterRef} style={{ display: "none" }} />

      {/* Cover metadata — centered under the featured card */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none pb-2.5"
        style={{
          opacity: isIndex || focusedData ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      >
        <div ref={titleRef} className="flex flex-col items-center text-center">
          {artistValue ? (
            <p className={`${NAV_TYPE} m-0`}>{artistValue}</p>
          ) : null}
          {formatValue ? (
            <p className={`${NAV_TYPE} m-0 whitespace-nowrap`}>{formatValue}</p>
          ) : null}
          {refValue || yearValue ? (
            <p className={`${NAV_TYPE} m-0`}>
              {[refValue, yearValue].filter(Boolean).join("    ")}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
