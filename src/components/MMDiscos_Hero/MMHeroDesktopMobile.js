"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Shared constants ──────────────────────────────────────────────────────────
const ORBITAL_IMAGES = [
  "/img12.jpg",
  "/MMD038.png",
  "/MMD040_Cover-1.jpg",
  "/morira - cover.png",
  "/img13.jpg",
  "/MMD039_Artwork Promo Full.png",
  "/MMD039.png",
  "/MMD040-2.png",
  "/statues.jpeg",
];

const SVH_DESKTOP    = 15;   // scroll space per image on desktop
const SVH_MOBILE     = 8;    // faster orbital on mobile
const SURVIVOR_INDEX = ORBITAL_IMAGES.length - 1;

// Mobile: individual artist spans for stagger reveal
const ARTISTS = [
  "Asa Tate", "Daichi", "Nic Jalusi", "Pleasure Voyage", "Mogwaa", "Statues",
  "Mori Ra", "Longhair", "Kross Section", "Komodo", "Marvin & Guy", "Distance",
  "Guillaume", "Pontcho", "Saturn", "Corben", "Bonnie & Klein", "Celex",
  "Florin Büchel", "NairLess", "Hal Incandenza", "Volta Cab", "Coyote",
  "Marcello Giordani", "Albion", "Serasso", "Atlantic Brain", "Jaisiel",
  "Trepanado", "Ruf Dug", "Chida", "Franz Scala", "Sankt Göran", "The.Deal",
  "A Beat Disciple", "Jakob Mäder", "Da Silva",
];

export default function MMHeroDesktopMobile() {
  const [isMobile, setIsMobile] = useState(null);

  // ── Shared refs ───────────────────────────────────────────────────────────
  const videoContainerRef   = useRef(null);
  const videoRef            = useRef(null);
  const boxRef              = useRef(null);
  const logoRef             = useRef(null);
  const carouselSpacerRef   = useRef(null);
  const quoteContainerRef   = useRef(null);
  const orbitalContainerRef = useRef(null);
  const orbitalImgsRef      = useRef([]);
  const survivorRef         = useRef(null);
  const grainFlashRef       = useRef(null);
  const sinkActiveRef       = useRef(false);

  // ── SVG filter refs ───────────────────────────────────────────────────────
  const aBlurRef  = useRef(null);
  const aMorphRef = useRef(null);
  const aGlowRef  = useRef(null);
  const qBlurRef  = useRef(null);
  const qMorphRef = useRef(null);
  const qGlowRef  = useRef(null);

  // ── Desktop-only refs ─────────────────────────────────────────────────────
  const spacerRef   = useRef(null);
  const artistsRef  = useRef(null);

  // ── Mobile-only refs ──────────────────────────────────────────────────────
  const snapBufferRef   = useRef(null);
  const artistsProxyRef = useRef(null);
  const artistsTextRef  = useRef(null);
  const artistsSpansRef = useRef([]);

  const totalImages = ORBITAL_IMAGES.length;

  // ── Step 1: detect device on mount ───────────────────────────────────────
  useEffect(() => {
    setIsMobile(window.innerWidth < 720);
  }, []);

  // ── Step 2: setup animations once device is known ────────────────────────
  useEffect(() => {
    if (isMobile === null) return;

    const box     = boxRef.current;
    const logo    = logoRef.current;
    const videoEl = videoRef.current;
    if (!box || !logo) return;

    // Freeze viewport dimensions at mount to prevent address-bar resize jumps.
    const frozenVH = window.innerHeight;
    const frozenVW = window.innerWidth;
    const vw = frozenVW;
    const vh = frozenVH;

    if (videoContainerRef.current) {
      videoContainerRef.current.style.height = `${frozenVH}px`;
    }

    // ── Preload orbital images ──────────────────────────────────────────────
    ORBITAL_IMAGES.forEach((src) => { const img = new Image(); img.src = src; });

    // ── Orbital shared math ────────────────────────────────────────────────
    const imageEls      = orbitalImgsRef.current.filter(Boolean);
    const getAngle      = (i) => (i / totalImages) * Math.PI * 2 - Math.PI / 2;
    const SPIRAL_TURNS  = 1.5;
    const totalRotation = SPIRAL_TURNS * Math.PI * 2;

    // Center images via xPercent/yPercent once — orbital offset via x/y (GPU transform).
    imageEls.forEach((el) => {
      gsap.set(el, { xPercent: -50, yPercent: -50 });
    });

    // Mobile orbital: hidden via clipPath for wipe reveal; desktop: opacity only.
    if (isMobile) {
      imageEls.forEach((el) => gsap.set(el, { clipPath: "inset(0% 100% 0% 0%)" }));
    }

    const setOrbitalProgress = (rawP) => {
      const p        = Math.max(0, Math.min(1, rawP));
      const diagonal = Math.sqrt((vw / 2) ** 2 + (vh / 2) ** 2);

      // startRadius: all images begin off-screen regardless of angle.
      const imgPx  = isMobile
        ? Math.min(200, Math.round(vw * 0.32))
        : Math.min(420, Math.round(vw * 0.22));
      const startR = isMobile
        ? diagonal * 1.3          // slightly beyond diagonal → fully off-screen on mobile
        : diagonal + imgPx * 0.6; // accounts for image size on desktop

      const eR  = Math.pow(p, 1.3);
      const eA  = Math.pow(p, 1.1);
      const sc  = 0.08 + 0.92 * Math.pow(p, 0.55);

      imageEls.forEach((el, i) => {
        const angle = getAngle(i) + totalRotation * eA;
        const r     = startR * (1 - eR);
        // x/y are CSS transforms → GPU composite, zero layout reflow.
        gsap.set(el, { x: Math.cos(angle) * r, y: Math.sin(angle) * r, scale: sc });
      });
    };

    setOrbitalProgress(0);
    gsap.set(orbitalContainerRef.current, { opacity: 0 });

    // ── Sink animation (shared) ────────────────────────────────────────────
    const triggerSinkAnimation = () => {
      if (sinkActiveRef.current) return;
      sinkActiveRef.current = true;

      const others   = imageEls.filter((_, i) => i !== SURVIVOR_INDEX);
      const survivor = survivorRef.current;
      if (!survivor) return;

      gsap.set(orbitalContainerRef.current, { opacity: 1 });
      gsap.set(others, { opacity: 0 });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(orbitalContainerRef.current, { opacity: 0 });
          gsap.set(others, { opacity: 1 });
          if (isMobile) gsap.set(others, { clipPath: "inset(0% 100% 0% 0%)" });
          gsap.set(survivor, { scale: 1, opacity: 1 });
          if (isMobile) gsap.set(survivor, { clipPath: "inset(0% 0% 0% 0%)" });
          sinkActiveRef.current = false;
        },
      });

      if (grainFlashRef.current) {
        tl.fromTo(grainFlashRef.current, { opacity: 0 }, {
          opacity: 0.22, duration: 0.07, ease: "none", yoyo: true, repeat: 1,
        });
      }
      tl.to(survivor, { scale: 1.02, duration: 0.12, ease: "power1.out" }, "<0.04");
      tl.to(survivor, { scale: 0, opacity: 0, duration: 0.9, ease: "power3.in" });
    };

    // ── Orbital visibility ─────────────────────────────────────────────────
    const showOrbital = () => {
      if (isMobile) {
        // Wipe reveal: more energetic on mobile
        gsap.set(orbitalContainerRef.current, { opacity: 1 });
        gsap.fromTo(
          imageEls,
          { clipPath: "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "expo.out",
            stagger: { each: 0.055, from: "random" } }
        );
      } else {
        gsap.to(orbitalContainerRef.current, { opacity: 1, duration: 0.5, ease: "power2.out" });
      }
    };

    const hideOrbital = () => {
      if (sinkActiveRef.current) return;
      gsap.set(orbitalContainerRef.current, { opacity: 0 });
      if (isMobile) gsap.set(imageEls, { clipPath: "inset(0% 100% 0% 0%)" });
    };

    // ── Morph-reveal helper (shared) ───────────────────────────────────────
    // Blur/morph/glow peaks: 5/1.5/3.5 — already moderate, no further reduction needed
    // for in-flow text (desktop). For mobile these are used only on the quote section.
    const createMorphReveal = (el, refs) => {
      if (!el || !refs.blur || !refs.morph || !refs.glow) return null;
      refs.blur.setAttribute("stdDeviation", "5");
      refs.morph.setAttribute("radius",      "1.5");
      refs.glow.setAttribute("stdDeviation", "3.5");
      gsap.set(el, { opacity: 1 });
      return ScrollTrigger.create({
        trigger: el,
        start:   "top 95%",
        end:     "top -5%",
        scrub:   isMobile ? 2 : 5,
        onUpdate: (self) => {
          const p = self.progress;
          let sharp;
          if (p <= 0.4)       sharp = p / 0.4;
          else if (p <= 0.78) sharp = 1;
          else                sharp = 1 - (p - 0.78) / 0.22;
          const a = Math.pow(Math.max(0, 1 - sharp), 1.5);
          refs.blur.setAttribute("stdDeviation", (5   * a).toFixed(4));
          refs.morph.setAttribute("radius",      (1.5 * a).toFixed(4));
          refs.glow.setAttribute("stdDeviation", (3.5 * a).toFixed(4));
        },
      });
    };

    // ════════════════════════════════════════════════════════════════
    // MOBILE BRANCH
    // ════════════════════════════════════════════════════════════════
    if (isMobile) {
      // Box initial: small centered rectangle
      const mBoxW      = vw * 0.82;
      const mBoxH      = mBoxW * (9 / 16);
      const endLogoW   = 250;  // igual que .mm-global-logo-nav → mismo tamaño en todas las páginas
      const endLogoLeft = (vw - endLogoW) / 2;

      gsap.set(box, {
        width:           mBoxW,
        height:          mBoxH,
        xPercent:        -50,
        yPercent:        -50,
        backgroundColor: "rgba(255,255,255,0.35)",
      });

      // Logo anchored at top:0/left:0 in CSS; x/y = GPU transform, no layout reflow.
      gsap.set(logo, {
        x:       (vw - mBoxW) / 2,
        y:       vh / 2 - mBoxH / 2,
        width:   mBoxW,
        padding: "2.5rem",
        opacity: 1,
      });

      // Artist spans: initially hidden (revealed after snap)
      const artistSpans = artistsSpansRef.current.filter(Boolean);
      gsap.set(artistsTextRef.current, { xPercent: -50, yPercent: -50, y: 0 });
      gsap.set(artistSpans, { opacity: 0 });
      aBlurRef.current?.setAttribute("stdDeviation", "0");
      aMorphRef.current?.setAttribute("radius",       "0");
      aGlowRef.current?.setAttribute("stdDeviation",  "0");

      // Text exit: scrub the artist overlay upward as artistsProxy scrolls past.
      // Filter peaks: 5/1.5/3 (reduced from 9/2.5/5) — avoids GPU spike that
      // coincides with the 9-image clipPath wipe of the orbital reveal.
      const textExitTrigger = ScrollTrigger.create({
        trigger:             artistsProxyRef.current,
        start:               "top top",
        end:                 "bottom top",
        scrub:               0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(artistsTextRef.current, { y: -p * vh * 1.2 });
          const a = Math.pow(p, 0.5);
          aBlurRef.current?.setAttribute("stdDeviation", (5   * a).toFixed(4));
          aMorphRef.current?.setAttribute("radius",       (1.5 * a).toFixed(4));
          aGlowRef.current?.setAttribute("stdDeviation",  (3   * a).toFixed(4));
        },
        onLeaveBack: () => {
          gsap.set(artistsTextRef.current, { y: 0 });
          aBlurRef.current?.setAttribute("stdDeviation", "0");
          aMorphRef.current?.setAttribute("radius",       "0");
          aGlowRef.current?.setAttribute("stdDeviation",  "0");
        },
      });

      // Orbital: starts when proxy enters viewport, ends when carousel spacer exits.
      const orbitalTrigger = ScrollTrigger.create({
        trigger:             artistsProxyRef.current,
        start:               "top bottom",
        endTrigger:          carouselSpacerRef.current,
        end:                 "bottom top",
        scrub:               1.0,
        invalidateOnRefresh: true,
        onLeave:             triggerSinkAnimation,
        onEnterBack:         showOrbital,
        onLeaveBack:         hideOrbital,
        onUpdate:            (self) => setOrbitalProgress(self.progress),
      });

      // Orbital images become visible when proxy top reaches viewport top
      // (same moment text starts its exit scroll).
      const orbitalVisibilityTrigger = ScrollTrigger.create({
        trigger:     artistsProxyRef.current,
        start:       "top top",
        onEnter:     showOrbital,
        onLeaveBack: hideOrbital,
      });

      // Quote section morph reveal
      const quoteTrigger = createMorphReveal(quoteContainerRef.current, {
        blur: qBlurRef.current, morph: qMorphRef.current, glow: qGlowRef.current,
      });

      // ── Snap animation (one-shot on first wheel/touch) ──────────────────
      let snapFired = false;

      const revealArtistsText = () => {
        window.dispatchEvent(new Event("mm-hero-logo-settled"));

        // Remove expensive GPU effects now that box is fully opaque and covers video.
        box.style.backdropFilter       = "none";
        box.style.webkitBackdropFilter = "none";
        if (videoEl) { videoEl.pause(); videoEl.style.display = "none"; }

        // Filter reveal: reduced peaks (4/1.2/2.5) to avoid GPU spike while
        // the artist spans are also animating in simultaneously.
        aBlurRef.current?.setAttribute("stdDeviation", "4");
        aMorphRef.current?.setAttribute("radius",       "1.2");
        aGlowRef.current?.setAttribute("stdDeviation",  "2.5");

        const fProxy = { t: 0 };
        gsap.to(fProxy, {
          t: 1, duration: 1.4, ease: "power3.out",
          onUpdate() {
            const a = 1 - fProxy.t;
            aBlurRef.current?.setAttribute("stdDeviation", (4   * a).toFixed(4));
            aMorphRef.current?.setAttribute("radius",       (1.2 * a).toFixed(4));
            aGlowRef.current?.setAttribute("stdDeviation",  (2.5 * a).toFixed(4));
          },
          onComplete() {
            aBlurRef.current?.setAttribute("stdDeviation", "0");
            aMorphRef.current?.setAttribute("radius",       "0");
            aGlowRef.current?.setAttribute("stdDeviation",  "0");
          },
        });

        gsap.fromTo(
          artistSpans,
          { opacity: 0 },
          { opacity: 1, duration: 0.85, ease: "power3.out",
            stagger: { each: 0.04, from: "random" } }
        );
      };

      const fireSnapAnimation = () => {
        if (snapFired) return;
        snapFired = true;
        window.removeEventListener("wheel",     fireSnapAnimation);
        window.removeEventListener("touchmove", fireSnapAnimation);

        const tl = gsap.timeline({ onComplete: revealArtistsText });

        if (videoEl) tl.to(videoEl, { opacity: 0, duration: 0.18, ease: "expo.in" }, 0);

        // Box expands width first (horizontal cut), then height
        tl.to(box, { width: vw, duration: 0.22, ease: "expo.out" }, 0);
        tl.to(box, { height: vh, backgroundColor: "rgba(255,255,255,1)", duration: 0.38, ease: "expo.out" }, 0.18);

        // Logo slides to top-center via x/y (GPU transform, no layout reflow)
        tl.to(logo, { x: endLogoLeft, y: 0, width: endLogoW, duration: 0.42, ease: "expo.out" }, 0.22);
      };

      window.addEventListener("wheel",     fireSnapAnimation, { passive: true });
      window.addEventListener("touchmove", fireSnapAnimation, { passive: true });

      // Double-RAF: ensure ScrollTrigger positions are calculated after DOM is fully laid out.
      requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));

      return () => {
        window.removeEventListener("wheel",     fireSnapAnimation);
        window.removeEventListener("touchmove", fireSnapAnimation);
        textExitTrigger.kill();
        orbitalTrigger.kill();
        orbitalVisibilityTrigger.kill();
        quoteTrigger?.kill();
      };
    }

    // ════════════════════════════════════════════════════════════════
    // DESKTOP BRANCH
    // ════════════════════════════════════════════════════════════════
    const spacer = spacerRef.current;
    if (!spacer) return;

    // Box starts at 25vw × 16:9, centered.
    const boxW    = box.offsetWidth;
    const boxH    = box.offsetHeight;
    const boxLeft = (vw - boxW) / 2;
    const boxTop  = (vh - boxH) / 2;
    const endWidth = 250;
    const endLeft  = (vw - endWidth) / 2;

    // Logo anchored at top:0/left:0 in CSS; initial position aligns with box top-left.
    // Uses x/y (GPU transform) — no top/left layout reflow during scrub animation.
    gsap.set(logo, {
      x:       boxLeft,
      y:       boxTop,
      width:   boxW,
      padding: "2.5rem",
      opacity: 1,
    });

    // Box/logo scrub: expands to fill viewport as user scrolls through spacer.
    const logoTrigger = ScrollTrigger.create({
      trigger: spacer,
      start:   "top top",
      end:     `+=${vh}px`,
      scrub:   1,
      onLeave:     () => window.dispatchEvent(new Event("mm-hero-logo-settled")),
      onEnterBack: () => window.dispatchEvent(new Event("mm-hero-logo-reset")),
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(box, {
          width:           gsap.utils.interpolate(boxW, vw, p),
          height:          gsap.utils.interpolate(boxH, vh, p),
          backgroundColor: `rgba(255,255,255,${gsap.utils.interpolate(0.35, 1, p)})`,
        });
        // x/y transforms — GPU composite, no reflow
        gsap.set(logo, {
          x:     gsap.utils.interpolate(boxLeft, endLeft, p),
          y:     gsap.utils.interpolate(boxTop, 0, p),
          width: gsap.utils.interpolate(boxW, endWidth, p),
        });
        if (videoEl) gsap.set(videoEl, { opacity: 1 - p });
      },
    });

    // Orbital: starts as artists section enters viewport, ends when carousel spacer exits.
    const orbitalTrigger = ScrollTrigger.create({
      trigger:             artistsRef.current,
      start:               "top 95%",
      endTrigger:          carouselSpacerRef.current,
      end:                 "bottom top",
      scrub:               2.5,
      invalidateOnRefresh: true,
      onLeave:             triggerSinkAnimation,
      onEnterBack:         showOrbital,
      onLeaveBack:         hideOrbital,
      onUpdate:            (self) => setOrbitalProgress(self.progress),
    });

    const orbitalVisibilityTrigger = ScrollTrigger.create({
      trigger:     artistsRef.current,
      start:       "top 17%",
      onEnter:     showOrbital,
      onLeaveBack: hideOrbital,
    });

    const t1 = createMorphReveal(artistsRef.current, {
      blur: aBlurRef.current, morph: aMorphRef.current, glow: aGlowRef.current,
    });
    const t2 = createMorphReveal(quoteContainerRef.current, {
      blur: qBlurRef.current, morph: qMorphRef.current, glow: qGlowRef.current,
    });

    return () => {
      logoTrigger.kill();
      orbitalTrigger.kill();
      orbitalVisibilityTrigger.kill();
      t1?.kill();
      t2?.kill();
    };
  }, [isMobile]);

  // Don't render until we know the device — prevents SSR mismatch and layout flash.
  if (isMobile === null) return null;

  const svhPerImage = isMobile ? SVH_MOBILE : SVH_DESKTOP;

  return (
    <>
      {/* ── SVG morph filters ─────────────────────────────────────────────── */}
      <svg
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        aria-hidden="true"
      >
        <defs>
          {/* Artists filter — used by: desktop in-flow p, mobile fixed overlay */}
          <filter
            id="morph-artists"
            x="-15%" y="-60%" width="130%" height="220%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur ref={aBlurRef} in="SourceGraphic" stdDeviation="0" result="blurred" />
            <feMorphology ref={aMorphRef} operator="dilate" radius="0" in="blurred" result="morphed" />
            <feGaussianBlur ref={aGlowRef} in="morphed" stdDeviation="0" result="glow" />
            <feColorMatrix
              in="glow" type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.8 0"
              result="brightGlow"
            />
            <feMerge>
              <feMergeNode in="brightGlow" />
              <feMergeNode in="morphed" />
            </feMerge>
          </filter>

          {/* Quote filter — shared */}
          <filter
            id="morph-quote"
            x="-15%" y="-60%" width="130%" height="220%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur ref={qBlurRef} in="SourceGraphic" stdDeviation="5" result="blurred" />
            <feMorphology ref={qMorphRef} operator="dilate" radius="1.5" in="blurred" result="morphed" />
            <feGaussianBlur ref={qGlowRef} in="morphed" stdDeviation="3.5" result="glow" />
            <feColorMatrix
              in="glow" type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.8 0"
              result="brightGlow"
            />
            <feMerge>
              <feMergeNode in="brightGlow" />
              <feMergeNode in="morphed" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* ══════════════════════════════════════════════════════════════════════
          SCROLL STRUCTURE — creates page height; different per device
          ══════════════════════════════════════════════════════════════════════ */}

      {/* MOBILE: snap buffer + artists proxy */}
      {isMobile && (
        <>
          {/* 60svh absorbs scroll while snap animation plays */}
          <div ref={snapBufferRef} style={{ height: "60svh", pointerEvents: "none" }} />
          {/* 70svh: trigger zone for text exit scrub + orbital start */}
          <div ref={artistsProxyRef} style={{ height: "70svh", pointerEvents: "none" }} />
        </>
      )}

      {/* DESKTOP: hero lock zone + artists section in normal flow */}
      {!isMobile && (
        <>
          {/* 200svh: first ~100svh locks for box/logo expansion scrub */}
          <div ref={spacerRef} style={{ height: "200svh", pointerEvents: "none" }} />
          <section
            style={{
              position: "relative", zIndex: 9000,
              width: "100%", minHeight: "100svh",
              display: "flex", justifyContent: "center",
              alignItems: "center", padding: "2.5rem 0",
            }}
          >
            <p
              ref={artistsRef}
              style={{
                width:         "70%",
                fontFamily:    "'Barlow Condensed', sans-serif",
                fontSize:      "clamp(1.4rem, 2.8vw, 3.2rem)",
                fontWeight:    700,
                lineHeight:    1.05,
                letterSpacing: "0.01em",
                textTransform: "lowercase",
                textAlign:     "center",
                filter:        "url(#morph-artists)",
              }}
            >
              Asa Tate, Daichi, Nic Jalusi, Pleasure Voyage, Mogwaa, Statues, Mori Ra,
              Longhair, Kross Section, Komodo, Marvin &amp; Guy, Distance, Guillaume,
              Pontcho, Saturn, Corben, Bonnie &amp; Klein, Celex, Florin Büchel,
              NairLess, Hal Incandenza, Volta Cab, Coyote, Marcello Giordani, Albion,
              Serasso, Atlantic Brain, Jaisiel, Trepanado, Ruf Dug, Chida, Franz Scala,
              Sankt Göran, The.Deal, A Beat Disciple, Jakob Mäder, Da Silva,
            </p>
          </section>
        </>
      )}

      {/* Orbital spacer — shared; SVH per image differs by device */}
      <div
        ref={carouselSpacerRef}
        style={{ height: `${totalImages * svhPerImage}svh`, pointerEvents: "none" }}
      />

      {/* Gap before quote */}
      <div style={{ height: isMobile ? "40svh" : "60svh", pointerEvents: "none" }} />

      {/* Quote section — shared */}
      <section
        style={{
          position: "relative", zIndex: 9000,
          width: "100%", height: "100svh",
          display: "flex", justifyContent: "center", alignItems: "center",
        }}
      >
        <div
          ref={quoteContainerRef}
          style={{
            width:         isMobile ? "90%" : "65%",
            display:       "flex",
            flexDirection: "column",
            gap:           "1rem",
            filter:        "url(#morph-quote)",
          }}
        >
          <p style={{
            fontFamily:    "'Barlow Condensed', sans-serif",
            fontSize:      isMobile
              ? "clamp(1.3rem, 5vw, 2.2rem)"
              : "clamp(1.4rem, 2.8vw, 3.2rem)",
            fontWeight:    700,
            lineHeight:    1.05,
            letterSpacing: "0.01em",
            textTransform: "lowercase",
            textAlign:     "left",
          }}>
            {"We played without rules, without thinking about styles or what would come next. One track could be slow, the next dark, then something pop or an impossible guitar, but it all made sense in that moment. The dancefloor didn't ask for coherence, it asked for emotion — and as long as people stayed there, smiling and lost, you knew you were doing it right."}
          </p>
          <p style={{
            fontFamily:    "'Host Grotesk', sans-serif",
            fontSize:      "0.9rem",
            fontWeight:    450,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            textAlign:     "left",
            opacity:       0.5,
          }}>
            — Dj Alfredo
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FIXED OVERLAYS — always on screen, z-index managed
          ══════════════════════════════════════════════════════════════════════ */}

      {/* Video background */}
      <div
        ref={videoContainerRef}
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          width:         "100%",
          height:        "100svh", // overwritten to px in useEffect (prevents bar-resize jump)
          pointerEvents: "none",
          overflow:      "hidden",
        }}
      >
        <video
          ref={videoRef}
          autoPlay muted loop playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        >
          <source src="/video/MM Hero BG_1.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Box — expands to fill screen on snap (mobile) or scrub (desktop) */}
      <div
        ref={boxRef}
        style={{
          position:        "fixed",
          top:             "50%",
          left:            "50%",
          // CSS transform centers the box; GSAP uses xPercent/yPercent on mobile
          // and leaves this CSS transform intact on desktop (width/height only).
          transform:       "translate(-50%, -50%)",
          width:           isMobile ? "82vw" : "25%",
          aspectRatio:     isMobile ? undefined : "16/9",
          backgroundColor: "rgba(255,255,255,0.35)",
          backdropFilter:  "blur(3px)",
          pointerEvents:   "none",
        }}
      />

      {/* Logo — dual-layer (black/white) for About curtain reveal in _app.js.
          Anchored at top:0/left:0; position driven entirely by GSAP x/y transforms. */}
      <div
        id="mm-hero-animated-logo"
        ref={logoRef}
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          zIndex:        9999,
          opacity:       isMobile ? 1 : 0, // mobile: visible from start; desktop: revealed by GSAP
          pointerEvents: "none",
          isolation:     "isolate",
        }}
      >
        {/* Ghost image — fixes container size; invisible */}
        <img
          src="/logo/Balearic Sound System Logo.svg"
          alt=""
          aria-hidden
          style={{ width: "100%", height: "auto", display: "block", opacity: 0, pointerEvents: "none" }}
        />
        {/* Black layer */}
        <div
          className="logo-layer-black"
          style={{ position: "absolute", inset: "2.5rem", pointerEvents: "none", clipPath: "inset(0 0 0 0)" }}
        >
          <img
            src="/logo/Balearic Sound System Logo.svg"
            alt=""
            aria-hidden
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        </div>
        {/* White (inverted) layer — revealed by About curtain */}
        <div
          className="logo-layer-white"
          style={{
            position:  "absolute",
            inset:     "2.5rem",
            zIndex:    1,
            pointerEvents: "none",
            clipPath:  "inset(100% 0 0 0)",
          }}
        >
          <img
            src="/logo/Balearic Sound System Logo.svg"
            alt="MM Discos"
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", filter: "invert(1)" }}
          />
        </div>
      </div>

      {/* MOBILE: fixed artist text overlay (exits upward on scroll).
          IMPORTANT: outer div handles transform (scrub y), inner div carries
          the SVG filter — they cannot coexist on the same element in WebKit
          (SVG filter breaks in composited layers). */}
      {isMobile && (
        <div
          ref={artistsTextRef}
          style={{
            position:      "fixed",
            top:           "50%",
            left:          "50%",
            width:         "90%",
            zIndex:        9000,
            pointerEvents: "none",
          }}
        >
          <div style={{ filter: "url(#morph-artists)" }}>
            <p style={{
              fontFamily:    "'Barlow Condensed', sans-serif",
              fontSize:      "clamp(1.1rem, 4.5vw, 1.9rem)",
              fontWeight:    700,
              lineHeight:    1.1,
              letterSpacing: "0.01em",
              textTransform: "lowercase",
              textAlign:     "center",
            }}>
              {ARTISTS.map((name, i) => (
                <span
                  key={i}
                  ref={(el) => { artistsSpansRef.current[i] = el; }}
                >
                  {name}{i < ARTISTS.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}

      {/* Orbital images — shared; mobile uses clipPath wipe, desktop uses opacity */}
      <div
        ref={orbitalContainerRef}
        style={{
          position:      "fixed",
          inset:         0,
          zIndex:        8000,
          pointerEvents: "none",
          opacity:       0,
        }}
      >
        {ORBITAL_IMAGES.map((src, i) => (
          <div
            key={src}
            ref={(el) => {
              orbitalImgsRef.current[i] = el;
              if (i === SURVIVOR_INDEX) survivorRef.current = el;
            }}
            style={{
              position:    "absolute",
              left:        "50%",
              top:         "50%",
              // xPercent/yPercent: -50 applied by GSAP for centering;
              // x/y offsets applied by setOrbitalProgress (GPU transform, no reflow).
              width:       isMobile
                ? "clamp(200px, 56vw, 340px)"
                : "clamp(140px, 22vw, 420px)",
              aspectRatio: "1 / 1",
            }}
          >
            <img
              src={src}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        ))}

        {/* Analog flash — single frame grain on sink transition */}
        <div
          ref={grainFlashRef}
          style={{
            position:      "absolute",
            inset:         0,
            background:    "#ffffff",
            opacity:       0,
            mixBlendMode:  "overlay",
            pointerEvents: "none",
          }}
        />
      </div>
    </>
  );
}
