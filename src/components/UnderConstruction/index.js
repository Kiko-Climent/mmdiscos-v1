"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

const MMHoldingScreen = () => {
  const logoScale = 0.6;

  const boxRef        = useRef(null);
  const logoRef       = useRef(null);
  const logoBlackRef  = useRef(null);
  const logoWhiteRef  = useRef(null);
  const videoRef      = useRef(null);

  const handleMouseEnter = useCallback(() => {
    gsap.to(logoBlackRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" });
    gsap.to(logoWhiteRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" });
  }, []);

  const handleMouseLeave = useCallback(() => {
    gsap.to(logoBlackRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.to(logoWhiteRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" });
  }, []);

  useEffect(() => {
    // Prevent any scrolling
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const box  = boxRef.current;
    const logo = logoRef.current;

    if (!box || !logo) return;

    const init = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isDesktop = vw >= 720;

      const boxW = isDesktop ? vw * 0.35 : vw * 0.85;
      const boxH = isDesktop ? boxW * (9 / 16) : boxW * (3 / 4);
      const boxLeft = (vw - boxW) / 2;
      const boxTop  = (vh - boxH) / 2;

      const logoPadding = isDesktop ? "2.5rem" : "1.25rem";

      // Size the logo to match box width
      gsap.set(logo, { width: boxW * logoScale, padding: logoPadding });
      const logoHeight = logo.getBoundingClientRect().height;

      gsap.set(logo, {
        left: boxLeft + (boxW - boxW * logoScale) / 2,
        top:  boxTop + (boxH - logoHeight) / 2,
        width: boxW * logoScale,
        padding: logoPadding,
      });

      if (!isDesktop) {
        gsap.set(box, { width: boxW, height: boxH });
      }
    };

    init();

    // Fade in entrance
    gsap.fromTo(
      [box, logo],
      { opacity: 0 },
      { opacity: 1, duration: 1.4, ease: "power2.out", stagger: 0.2 }
    );

    let resizeTimeout = null;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(init, 80);
    };

    window.addEventListener("resize", onResize);
    const vv = window.visualViewport;
    if (vv) vv.addEventListener("resize", onResize);

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", onResize);
      if (vv) vv.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {/* Background video */}
      <div
        ref={videoRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        >
          <source src="/video/MM Hero BG_1.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Frosted glass box */}
      <div
        ref={boxRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "35%",
          aspectRatio: "16/9",
          backgroundColor: "rgba(255,255,255,0.35)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          pointerEvents: "none",
          zIndex: 5,
          opacity: 0,
        }}
      />

      {/* Logo — clickable link */}
      <a
        ref={logoRef}
        href="https://mmdiscos.bandcamp.com/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="MM Discos en Bandcamp"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "fixed",
          zIndex: 9999,
          opacity: 0,
          cursor: "pointer",
          display: "block",
          textDecoration: "none",
        }}
      >
        {/* Invisible sizer */}
        <img
          src="/logo/Balearic Sound System Logo.svg"
          alt=""
          aria-hidden
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
        {/* Black layer */}
        <div
          ref={logoBlackRef}
          style={{ position: "absolute", inset: 0 }}
        >
          <img
            src="/logo/Balearic Sound System Logo.svg"
            alt="MM Discos"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>
        {/* White layer — visible on hover */}
        <div
          ref={logoWhiteRef}
          style={{ position: "absolute", inset: 0, opacity: 0 }}
        >
          <img
            src="/logo/Balearic Sound System Logo.svg"
            alt=""
            aria-hidden
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              filter: "invert(1)",
            }}
          />
        </div>
      </a>
    </div>
  );
};

export default MMHoldingScreen;