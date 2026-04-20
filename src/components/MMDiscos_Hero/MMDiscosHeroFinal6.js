"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DataReleases } from "@/components/data";

gsap.registerPlugin(ScrollTrigger);

const GLOBAL_LOGO_PADDING = "1rem 2.5rem 2.5rem";
const GLOBAL_LOGO_LAYER_INSET = "1rem 2.5rem 2.5rem 2.5rem";
const LOGO_END_WIDTH_DESKTOP = 250;
const LOGO_END_WIDTH_MOBILE = 200;
const LOGO_FIT_FACTOR = 0.96;

// Explicit grid positions [col, row] — 4-column irregular layout with intentional empty cells
// Empty cells at (2,1), (4,2), (1,3), (3,4), (2,5)
const GRID_POSITIONS = [
  [1, 1], [3, 1], [4, 1],   // row 1
  [1, 2], [2, 2], [3, 2],   // row 2
  [2, 3], [3, 3], [4, 3],   // row 3
  [1, 4], [2, 4], [4, 4],   // row 4
  [1, 5], [3, 5], [4, 5],   // row 5
];

export default function MMDiscosHeroFinal6() {
  const spacerRef         = useRef(null);
  const boxRef            = useRef(null);
  const logoRef           = useRef(null);
  const videoRef          = useRef(null);
  const videoContainerRef = useRef(null);
  const artistsSectionRef = useRef(null);
  const artistsRef        = useRef(null);
  const quoteContainerRef = useRef(null);

  const gridContainerRef = useRef(null);
  const gridCellRefs     = useRef([]);

  const aBlurRef  = useRef(null);
  const aMorphRef = useRef(null);
  const aGlowRef  = useRef(null);

  const qBlurRef  = useRef(null);
  const qMorphRef = useRef(null);
  const qGlowRef  = useRef(null);

  useEffect(() => {
    const box     = boxRef.current;
    const logo    = logoRef.current;
    const spacer  = spacerRef.current;
    const videoEl = videoRef.current;
    if (!box || !logo || !spacer) return;

    const frozenVH = window.innerHeight;
    const frozenVW = window.innerWidth;

    if (videoContainerRef.current) {
      videoContainerRef.current.style.height = `${frozenVH}px`;
    }

    const getHeroViewport = () => {
      if (videoEl) {
        const r = videoEl.getBoundingClientRect();
        if (r.width > 0) return { vw: r.width, vh: frozenVH };
      }
      return { vw: frozenVW, vh: frozenVH };
    };

    const hero = { ...getHeroViewport() };
    const { vw, vh } = hero;
    const isDesktop = vw >= 720;

    /* ── Morph-reveal helper ─────────────────────────────── */
    const createMorphReveal = (el, refs) => {
      if (!el || !refs.blur || !refs.morph || !refs.glow) return null;
      refs.blur.setAttribute("stdDeviation", "5");
      refs.morph.setAttribute("radius", "1.5");
      refs.glow.setAttribute("stdDeviation", "3.5");
      gsap.set(el, { opacity: 1 });
      return ScrollTrigger.create({
        trigger: el,
        start: "top 95%",
        end: "top -5%",
        scrub: 5,
        onUpdate: (self) => {
          const p = self.progress;
          let sharp;
          if (p <= 0.4)       sharp = p / 0.4;
          else if (p <= 0.78) sharp = 1;
          else                sharp = 1 - (p - 0.78) / 0.22;
          const a = Math.pow(Math.max(0, 1 - sharp), 1.5);
          refs.blur.setAttribute("stdDeviation", (5 * a).toFixed(4));
          refs.morph.setAttribute("radius", (1.5 * a).toFixed(4));
          refs.glow.setAttribute("stdDeviation", (3.5 * a).toFixed(4));
        },
      });
    };

    /* ── Grid animation — FinalReleases2 style ───────────
       Phase 1: all cells slide in from off-screen left, form a tight
                horizontal row at scale 0.12 (mirrors FR2's FILA phase).
       Phase 2: each cell explodes from the row to its grid position
                (mirrors FR2's pyramid phase, but targets CSS grid slots).
    ──────────────────────────────────────────────────── */
    const container = gridContainerRef.current;
    const cells = gridCellRefs.current.filter(Boolean);
    gsap.set(container, { opacity: 0 });

    const animateGridIn = () => {
      if (!isDesktop || !container || cells.length === 0) return;

      gsap.killTweensOf([container, ...cells]);

      // Get natural layout positions while container is opacity:0 but in DOM
      const containerRect = container.getBoundingClientRect();
      const naturalCenters = cells.map((el) => {
        const r = el.getBoundingClientRect();
        return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width };
      });

      const cardW     = naturalCenters[0]?.w ?? 80;
      const FILA_SCALE = 0.12;
      const FILA_GAP   = cardW * FILA_SCALE + 6;  // mirrors FR2: CW * FILA_SCALE + 6
      const n          = cells.length;

      // Row: tight horizontal strip at container center-Y
      const rowCY    = containerRect.top + containerRect.height / 2;
      const rowCX    = containerRect.left + containerRect.width / 2;
      const totalW   = n * FILA_GAP;
      const rowStart = rowCX - totalW / 2 + FILA_GAP / 2;

      const rowPositions = cells.map((_, i) => ({
        cx: rowStart + i * FILA_GAP,
        cy: rowCY,
      }));

      // Off-screen start: all cells at ENTRY_X (left of viewport), at row Y
      // GSAP x/y are transforms relative to natural layout position.
      const ENTRY_X = -(window.innerWidth + 80);

      cells.forEach((el, i) => {
        const nat = naturalCenters[i];
        const row = rowPositions[i];
        gsap.set(el, {
          x: ENTRY_X - nat.cx,   // → viewport x = ENTRY_X (off-screen)
          y: row.cy - nat.cy,    // → viewport y = row.cy (row height)
          scale: FILA_SCALE,
          opacity: 1,
          transformOrigin: "center center",
        });
      });

      gsap.set(container, { opacity: 1 });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(cells, { opacity: 0.12, duration: 0.8, ease: "power1.inOut" });
        },
      });

      // Phase 1 — slide in from left, form tight row
      cells.forEach((el, i) => {
        const nat = naturalCenters[i];
        const row = rowPositions[i];
        tl.to(
          el,
          {
            x: row.cx - nat.cx,
            y: row.cy - nat.cy,
            scale: FILA_SCALE,
            duration: 0.5,
            ease: "power2.out",
          },
          i * 0.055,
        );
      });

      // Phase 2 — explode into grid positions  (mirrors FR2's pyramid phase)
      const PHASE2_START = n * 0.055 + 0.5 + 0.35;
      cells.forEach((el, i) => {
        tl.to(
          el,
          { x: 0, y: 0, scale: 1, duration: 1.1, ease: "power3.inOut" },
          PHASE2_START + i * 0.03,
        );
      });
    };

    const hideGrid = () => {
      gsap.killTweensOf([container, ...cells]);
      gsap.to(container, {
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          // Reset transforms so the animation replays correctly on re-enter
          gsap.set(cells, { x: 0, y: 0, scale: 1, opacity: 1, clearProps: "transform" });
        },
      });
    };

    window.addEventListener("mm-hero-logo-settled", animateGridIn);
    window.addEventListener("mm-hero-logo-reset", hideGrid);

    /* ── MÓVIL ─────────────────────────────────────────────── */
    if (!isDesktop) {
      let mobileTrigger = null;
      const w = () => hero.vw;
      const h = () => hero.vh;
      let mobileStartScaleX = 1;
      let mobileStartScaleY = 1;
      let mobileLogoStartY = 0;
      let mobileLogoStartScale = 1;

      const syncMobileLogoToBlurBox = () => {
        const ww = w();
        const hh = h();
        const mBoxWm = ww * 0.90;
        const mBoxHm = mBoxWm * (9 / 16);
        mobileStartScaleX = mBoxWm / ww;
        mobileStartScaleY = mBoxHm / hh;
        const endLogoW    = LOGO_END_WIDTH_MOBILE;
        const endLogoLeft = (ww - endLogoW) / 2;

        gsap.set(box, {
          width: ww, height: hh,
          xPercent: -50, yPercent: -50,
          scaleX: mobileStartScaleX, scaleY: mobileStartScaleY,
          backgroundColor: "rgba(255,255,255,0.35)",
        });

        logo.style.width           = `${endLogoW}px`;
        logo.style.padding         = GLOBAL_LOGO_PADDING;
        logo.style.transformOrigin = "top center";
        gsap.set(logo, { x: endLogoLeft, y: 0, scale: 1, opacity: 1 });

        const B = box.getBoundingClientRect();
        const L = logo.getBoundingClientRect();
        if (B.width <= 0 || B.height <= 0 || L.width <= 0 || L.height <= 0) return;
        mobileLogoStartScale = Math.min(B.width / L.width, B.height / L.height) * LOGO_FIT_FACTOR;
        const scaledH = L.height * mobileLogoStartScale;
        mobileLogoStartY = B.top + (B.height - scaledH) / 2;
        gsap.set(logo, { y: mobileLogoStartY, scale: mobileLogoStartScale });
      };

      const applyMobileHeroFrame = (self) => {
        const p = self.progress;
        gsap.set(box, {
          scaleX: gsap.utils.interpolate(mobileStartScaleX, 1, p),
          scaleY: gsap.utils.interpolate(mobileStartScaleY, 1, p),
          backgroundColor: `rgba(255,255,255,${gsap.utils.interpolate(0.35, 1, p)})`,
        });
        gsap.set(logo, {
          y:     gsap.utils.interpolate(mobileLogoStartY, 0, p),
          scale: gsap.utils.interpolate(mobileLogoStartScale, 1, p),
        });
        if (videoRef.current) gsap.set(videoRef.current, { opacity: 1 - p });
      };

      const setupMobileTrigger = () => {
        mobileTrigger?.kill();
        hero.vw = window.innerWidth;
        hero.vh = frozenVH;

        if (videoContainerRef.current) {
          videoContainerRef.current.style.height = `${frozenVH}px`;
        }

        syncMobileLogoToBlurBox();

        mobileTrigger = ScrollTrigger.create({
          trigger: spacer,
          start:   "top top",
          end:     `+=${hero.vh}px`,
          scrub:   1,
          onLeave:     () => window.dispatchEvent(new Event("mm-hero-logo-settled")),
          onEnterBack: () => window.dispatchEvent(new Event("mm-hero-logo-reset")),
          onUpdate: applyMobileHeroFrame,
        });

        applyMobileHeroFrame(mobileTrigger);

        requestAnimationFrame(() => {
          syncMobileLogoToBlurBox();
          applyMobileHeroFrame(mobileTrigger);
          ScrollTrigger.refresh();
        });
      };

      setupMobileTrigger();

      let resizeObserver = null;
      if (videoEl && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
        resizeObserver.observe(videoEl);
      }

      const onVisualViewportResize = () => {
        setupMobileTrigger();
        ScrollTrigger.refresh();
      };
      window.visualViewport?.addEventListener("resize", onVisualViewportResize);

      const t1 = createMorphReveal(artistsRef.current, {
        blur: aBlurRef.current, morph: aMorphRef.current, glow: aGlowRef.current,
      });
      const t2 = createMorphReveal(quoteContainerRef.current, {
        blur: qBlurRef.current, morph: qMorphRef.current, glow: qGlowRef.current,
      });

      return () => {
        mobileTrigger?.kill();
        resizeObserver?.disconnect();
        window.visualViewport?.removeEventListener("resize", onVisualViewportResize);
        window.removeEventListener("mm-hero-logo-settled", animateGridIn);
        window.removeEventListener("mm-hero-logo-reset", hideGrid);
        t1?.kill();
        t2?.kill();
      };
    }

    /* ── DESKTOP ─────────────────────────────────────────── */
    const boxW  = vw * 0.30;
    const boxH  = boxW * (9 / 16);

    const endWidth = LOGO_END_WIDTH_DESKTOP;
    const endLeft  = (vw - endWidth) / 2;

    const startScaleX = boxW / vw;
    const startScaleY = boxH / vh;

    gsap.set(box, {
      width: vw, height: vh,
      xPercent: -50, yPercent: -50,
      scaleX: startScaleX, scaleY: startScaleY,
    });

    let startScale = boxW / endWidth;
    let startY = 0;
    const syncLogoToBlurBox = () => {
      logo.style.width           = `${endWidth}px`;
      logo.style.padding         = GLOBAL_LOGO_PADDING;
      logo.style.transformOrigin = "top center";
      gsap.set(logo, { x: endLeft, y: 0, scale: 1, opacity: 1 });
      const B = box.getBoundingClientRect();
      const L = logo.getBoundingClientRect();
      if (B.width <= 0 || B.height <= 0 || L.width <= 0 || L.height <= 0) return;
      startScale = Math.min(B.width / L.width, B.height / L.height) * LOGO_FIT_FACTOR;
      const scaledH = L.height * startScale;
      startY = B.top + (B.height - scaledH) / 2;
      gsap.set(logo, { y: startY, scale: startScale });
    };
    syncLogoToBlurBox();
    requestAnimationFrame(() => {
      syncLogoToBlurBox();
      ScrollTrigger.refresh();
    });

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
          scaleX: gsap.utils.interpolate(startScaleX, 1, p),
          scaleY: gsap.utils.interpolate(startScaleY, 1, p),
          backgroundColor: `rgba(255,255,255,${gsap.utils.interpolate(0.35, 1, p)})`,
        });
        gsap.set(logo, {
          y:     gsap.utils.interpolate(startY, 0, p),
          scale: gsap.utils.interpolate(startScale, 1, p),
        });
        if (videoRef.current) gsap.set(videoRef.current, { opacity: 1 - p });
      },
    });

    const t1 = createMorphReveal(artistsRef.current, {
      blur: aBlurRef.current, morph: aMorphRef.current, glow: aGlowRef.current,
    });
    const t2 = createMorphReveal(quoteContainerRef.current, {
      blur: qBlurRef.current, morph: qMorphRef.current, glow: qGlowRef.current,
    });

    return () => {
      logoTrigger.kill();
      window.removeEventListener("mm-hero-logo-settled", animateGridIn);
      window.removeEventListener("mm-hero-logo-reset", hideGrid);
      t1?.kill();
      t2?.kill();
    };
  }, []);

  return (
    <>
      {/* ── SVG filters ──────────────────────────────────────── */}
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <defs>
          <filter id="morph-artists" x="-15%" y="-60%" width="130%" height="220%" colorInterpolationFilters="sRGB">
            <feGaussianBlur ref={aBlurRef} in="SourceGraphic" stdDeviation="5" result="blurred" />
            <feMorphology ref={aMorphRef} operator="dilate" radius="1.5" in="blurred" result="morphed" />
            <feGaussianBlur ref={aGlowRef} in="morphed" stdDeviation="3.5" result="glow" />
            <feColorMatrix in="glow" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.8 0" result="brightGlow" />
            <feMerge><feMergeNode in="brightGlow" /><feMergeNode in="morphed" /></feMerge>
          </filter>
          <filter id="morph-quote" x="-15%" y="-60%" width="130%" height="220%" colorInterpolationFilters="sRGB">
            <feGaussianBlur ref={qBlurRef} in="SourceGraphic" stdDeviation="5" result="blurred" />
            <feMorphology ref={qMorphRef} operator="dilate" radius="1.5" in="blurred" result="morphed" />
            <feGaussianBlur ref={qGlowRef} in="morphed" stdDeviation="3.5" result="glow" />
            <feColorMatrix in="glow" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.8 0" result="brightGlow" />
            <feMerge><feMergeNode in="brightGlow" /><feMergeNode in="morphed" /></feMerge>
          </filter>
        </defs>
      </svg>

      {/* ── Spacer (zona sticky logo + box) ──────────────────── */}
      <div ref={spacerRef} style={{ height: "200svh", pointerEvents: "none" }} />

      {/* ── Video background ─────────────────────────────────── */}
      <div
        ref={videoContainerRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: "100%", height: "100svh",
          pointerEvents: "none", overflow: "hidden",
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

      {/* ── Box blanco ───────────────────────────────────────── */}
      <div
        ref={boxRef}
        style={{
          position: "fixed", top: "50%", left: "50%",
          backgroundColor: "rgba(255,255,255,0.35)",
          backdropFilter: "blur(3px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Logo ─────────────────────────────────────────────── */}
      <div
        id="mm-hero-animated-logo"
        ref={logoRef}
        style={{
          position: "fixed", top: 0, left: 0,
          zIndex: 9999,
          pointerEvents: "none",
          opacity: 0,
          isolation: "isolate",
        }}
      >
        <img
          src="/logo/Balearic Sound System Logo.svg"
          alt="" aria-hidden
          style={{ width: "100%", height: "auto", display: "block", opacity: 0, pointerEvents: "none" }}
        />
        <div
          className="logo-layer-black"
          style={{ position: "absolute", inset: GLOBAL_LOGO_LAYER_INSET, pointerEvents: "none", clipPath: "inset(0 0 0 0)" }}
        >
          <img
            src="/logo/Balearic Sound System Logo.svg"
            alt="" aria-hidden
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        </div>
        <div
          className="logo-layer-white"
          style={{ position: "absolute", inset: GLOBAL_LOGO_LAYER_INSET, zIndex: 1, pointerEvents: "none", clipPath: "inset(100% 0 0 0)" }}
        >
          <img
            src="/logo/Balearic Sound System Logo.svg"
            alt="MM Discos"
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", filter: "invert(1)" }}
          />
        </div>
      </div>

      {/* ── Brutalist image grid — fixed right, desktop only ─── */}
      {/*
        Grid: 4 cols, 5 rows, 15 images from DataReleases.
        Empty cells at (2,1)(4,2)(1,3)(3,4)(2,5) for editorial asymmetry.
        Animation: replicates FinalReleases2 intro (row → grid) via GSAP.
      */}
      <div
        ref={gridContainerRef}
        style={{
          position: "fixed",
          top: "10vh",
          right: 0,
          width: "clamp(200px, 36vw, 480px)",
          padding: "0 2rem",
          zIndex: 8000,
          pointerEvents: "none",
          opacity: 0,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(5, auto)",
          gap: "3px",
          boxSizing: "border-box",
        }}
      >
        {DataReleases.map((release, i) => {
          const pos = GRID_POSITIONS[i];
          if (!pos) return null;
          const [col, row] = pos;
          return (
            <div
              key={release.image}
              ref={(el) => { gridCellRefs.current[i] = el; }}
              style={{
                gridColumn: col,
                gridRow: row,
                aspectRatio: "1 / 1",
                overflow: "hidden",
              }}
            >
              <img
                src={release.image}
                alt=""
                aria-hidden
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          );
        })}
      </div>

      {/* ── Artistas ─────────────────────────────────────────── */}
      <section
        ref={artistsSectionRef}
        style={{
          position: "relative", zIndex: 9000,
          width: "100%", minHeight: "100svh",
          display: "flex", justifyContent: "flex-start",
          alignItems: "center",
          paddingLeft: "2rem",
          paddingTop: "2.5rem", paddingBottom: "2.5rem",
        }}
      >
        <p
          ref={artistsRef}
          style={{
            width: "calc(50% + 3.3rem)",
            fontFamily: "'MyFont', sans-serif",
            fontSize: "clamp(0.58rem, 0.68vw, 0.74rem)",
            lineHeight: 1.75,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textAlign: "left",
            filter: "url(#morph-artists)",
          }}
        >
          Asa Tate, Daichi, Nic Jalusi, Pleasure Voyage, Mogwaa, Statues, Mori Ra,
          Longhair, Kross Section, Komodo, Marvin &amp; Guy, Distance, Guillaume,
          Pontcho, Saturn, Komodo, Corben, Bonnie &amp; Klein, Celex, Florin Büchel,
          NairLess, Hal Incandenza, Volta Cab, Coyote, Marcello Giordani, Albion,
          Serasso, Atlantic Brain, Jaisiel, Trepanado, Ruf Dug, Chida, Franz Scala,
          Sankt Göran, The.Deal, A Beat Disciple, Jakob Mäder, Da Silva,
        </p>
      </section>

      {/* ── Gap ──────────────────────────────────────────────── */}
      <div style={{ height: "60svh", pointerEvents: "none" }} />

      {/* ── Cita ─────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative", zIndex: 9000,
          width: "100%", height: "100svh",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          paddingLeft: "9vw",
          paddingRight: "calc(9vw - 0.5rem)",
        }}
      >
        <div
          ref={quoteContainerRef}
          style={{
            width: "42%",
            display: "flex", flexDirection: "column", gap: "1.2rem",
            filter: "url(#morph-quote)",
          }}
        >
          <p style={{
            fontFamily: "'MyFont', sans-serif",
            fontSize: "clamp(0.8rem, 0.95vw, 1.05rem)",
            lineHeight: 1.4,
            letterSpacing: "0.015em",
            textTransform: "none",
            textAlign: "left",
            margin: 0,
          }}>
            {"We played without rules, without thinking about styles or what would come next. One track could be slow, the next dark, then something pop or an impossible guitar, but it all made sense in that moment. The dancefloor didn't ask for coherence, it asked for emotion — and as long as people stayed there, smiling and lost, you knew you were doing it right."}
          </p>
          <p style={{
            fontFamily: "'MyFont', sans-serif",
            fontSize: "9px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textAlign: "left",
            margin: 0,
            opacity: 0.45,
          }}>
            Dj Alfredo
          </p>
        </div>
      </section>
    </>
  );
}
