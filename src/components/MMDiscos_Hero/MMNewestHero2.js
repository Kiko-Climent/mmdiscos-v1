"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Constants (must match globals.css .mm-global-logo-nav) ───────────────────
const LOGO_END_WIDTH_DESKTOP = 250;
const LOGO_END_WIDTH_MOBILE  = 200;
const LOGO_FIT_FACTOR        = 0.96;
const LOGO_PADDING           = "1rem 2.5rem 2.5rem";
const LOGO_LAYER_INSET       = "1rem 2.5rem 2.5rem 2.5rem";

// ── Artist → release image map ────────────────────────────────────────────────
const ARTIST_IMAGE_MAP = {
  "mogwaa":          "/img3.jpg",
  "daichi":          "/Daichi - cover.jpg",
  "nic jalusi":      "/MMD039.png",
  "pleasure voyage": "/img5.jpg",
  "statues":         "/statues.jpeg",
  "mori ra":         "/morira - cover.png",
  "guillaume":       "/img2.jpg",
  "pontcho":         "/MMD038.png",
  "corben":          "/corben_peachland_cover.jpg",
  "celex":           "/Celex - cover.jpg",
  "nairless":        "/img4.jpg",
  "jaisiel":         "/Factory Edits - cover.jpg",
  "trepanado":       "/Factory Edits - cover.jpg",
  "ruf dug":         "/MMD040-2.png",
  "saturn":          "/MMD040-2.png",
  "atlantic brain":  "/MMD040-2.png",
  "distance":        "/MMD040_Cover-1.jpg",
};

const ARTISTS = [
  "Asa Tate", "Daichi", "Nic Jalusi", "Pleasure Voyage", "Mogwaa", "Statues",
  "Mori Ra", "Longhair", "Kross Section", "Komodo", "Marvin & Guy", "Distance",
  "Guillaume", "Pontcho", "Saturn", "Corben", "Bonnie & Klein", "Celex",
  "Florin Büchel", "NairLess", "Hal Incandenza", "Volta Cab", "Coyote",
  "Marcello Giordani", "Albion", "Serasso", "Atlantic Brain", "Jaisiel",
  "Trepanado", "Ruf Dug", "Chida", "Franz Scala", "Sankt Göran", "The.Deal",
  "A Beat Disciple", "Jakob Mäder", "Da Silva",
];

export default function MMNewestHero2() {
  const spacerRef           = useRef(null);
  const videoContainerRef   = useRef(null);
  const videoRef            = useRef(null);
  const boxRef              = useRef(null);
  const logoRef             = useRef(null);
  const artistsContainerRef = useRef(null);
  const artistsSpansRef     = useRef([]);
  const hoverImageRef       = useRef(null);
  // Tracks hover capability — set once in useEffect, read in handlers
  const hasHoverRef         = useRef(false);

  // ── Hover handlers ───────────────────────────────────────────────────────────
  // clipPath wipe: enter grows up from bottom, exit snaps. Single <img>, src swapped.
  // No-op on touch/mobile devices (hasHoverRef is false).
  const handleHoverEnter = (name) => {
    if (!hasHoverRef.current) return;
    const src = ARTIST_IMAGE_MAP[name.toLowerCase()];
    if (!src || !hoverImageRef.current) return;
    hoverImageRef.current.src = src;
    hoverImageRef.current.style.display = "block";
    gsap.killTweensOf(hoverImageRef.current);
    gsap.fromTo(
      hoverImageRef.current,
      { scale: 1.05 },
      { scale: 1, duration: 0.28, ease: "power2.out" }
    );
  };

  const handleHoverLeave = () => {
    if (!hoverImageRef.current) return;
    gsap.killTweensOf(hoverImageRef.current);
    hoverImageRef.current.style.display = "none";
  };

  useEffect(() => {
    const box    = boxRef.current;
    const logo   = logoRef.current;
    const spacer = spacerRef.current;
    if (!box || !logo || !spacer) return;

    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;top:0;left:0;width:100vw;height:100lvh;visibility:hidden;pointer-events:none;";
    document.body.appendChild(probe);
    const probeRect = probe.getBoundingClientRect();
    const vh = probeRect.height;
    const vw = probeRect.width;
    document.body.removeChild(probe);

    // True hover support = pointer fine + hover capable (mouse/trackpad, not touch)
    hasHoverRef.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (videoContainerRef.current) {
      videoContainerRef.current.style.height = `${vh}px`;
    }

    // ── Box initial visual size ───────────────────────────────────────────────
    const isMobile    = vw < 720;
    const boxInitW    = isMobile ? vw * 0.88 : vw * 0.30;
    const boxInitH    = boxInitW * (9 / 16);
    const startScaleX = boxInitW / vw;
    const startScaleY = boxInitH / vh;

    // End position of logo — matches CSS .mm-global-logo-nav
    const endLogoW    = isMobile ? LOGO_END_WIDTH_MOBILE : LOGO_END_WIDTH_DESKTOP;
    const endLogoLeft = (vw - endLogoW) / 2;

    // ── Promote to GPU composited layers before any animation ─────────────────
    box.style.willChange  = "transform, background-color";
    logo.style.willChange = "transform";

    // ── Box: full-size DOM element, visually scaled to initial rectangle ───────
    gsap.set(box, {
      width:           vw,
      height:          vh,
      xPercent:        -50,
      yPercent:        -50,
      scaleX:          startScaleX,
      scaleY:          startScaleY,
      backgroundColor: "rgba(255,255,255,0.35)",
      force3D:         true,
    });

    // ── Logo: measure rendered size to compute startScale/startY ──────────────
    let startScale = 1;
    let startY     = 0;

    const syncLogo = () => {
      logo.style.width           = `${endLogoW}px`;
      logo.style.padding         = LOGO_PADDING;
      logo.style.transformOrigin = "top center";
      gsap.set(logo, { x: endLogoLeft, y: 0, scale: 1, opacity: 1, force3D: true });

      const B = box.getBoundingClientRect();
      const L = logo.getBoundingClientRect();
      if (B.width <= 0 || B.height <= 0 || L.width <= 0 || L.height <= 0) return;

      startScale    = Math.min(B.width / L.width, B.height / L.height) * LOGO_FIT_FACTOR;
      const scaledH = L.height * startScale;
      startY        = B.top + (B.height - scaledH) / 2;
      gsap.set(logo, { y: startY, scale: startScale });
    };

    syncLogo();
    requestAnimationFrame(() => {
      syncLogo();
      ScrollTrigger.refresh();
    });

    // ── Artists: invisible until reveal ──────────────────────────────────────
    const spans = artistsSpansRef.current.filter(Boolean);
    gsap.set(artistsContainerRef.current, { xPercent: -50, yPercent: -50, opacity: 0 });
    gsap.set(spans, { opacity: 0 });

    // ── Hover image: center via GSAP transform, preload all mapped covers ─────
    gsap.set(hoverImageRef.current, { xPercent: -50, yPercent: -50, scale: 1, force3D: true });
    Object.values(ARTIST_IMAGE_MAP).forEach((src) => { new Image().src = src; });

    // ── Reveal: fires when logo settles at top ────────────────────────────────
    const revealArtists = () => {
      window.dispatchEvent(new Event("mm-hero-logo-settled"));

      box.style.backdropFilter       = "none";
      box.style.webkitBackdropFilter = "none";

      box.style.willChange  = "auto";
      logo.style.willChange = "auto";

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.style.display = "none";
      }

      gsap.set(artistsContainerRef.current, { opacity: 1 });
      // Only enable pointer events where real hover is supported
      if (hasHoverRef.current) {
        artistsContainerRef.current.style.pointerEvents = "auto";
      }

      gsap.fromTo(
        spans,
        { opacity: 0 },
        { opacity: 1, duration: 0.85, ease: "power3.out", stagger: { each: 0.04, from: "random" } }
      );
    };

    // ── Reset: fires when user scrolls back above the logo trigger ────────────
    const resetHero = () => {
      window.dispatchEvent(new Event("mm-hero-logo-reset"));

      artistsContainerRef.current.style.pointerEvents = "none";
      handleHoverLeave();

      gsap.set([box, logo], { clearProps: "display,opacity" });

      box.style.willChange           = "transform, background-color";
      logo.style.willChange          = "transform";
      box.style.backdropFilter       = "blur(3px)";
      box.style.webkitBackdropFilter = "blur(3px)";

      gsap.to(artistsContainerRef.current, { opacity: 0, duration: 0.25, ease: "power2.in" });
      gsap.set(spans, { opacity: 0 });

      if (videoRef.current) {
        videoRef.current.style.display = "block";
        videoRef.current.play().catch(() => {});
      }
    };

    // ── Main scrub: box expands → logo travels to top ─────────────────────────
    const logoTrigger = ScrollTrigger.create({
      trigger:             spacer,
      start:               "top top",
      end:                 `+=${vh}px`,
      scrub:               1,
      invalidateOnRefresh: true,
      onLeave:             revealArtists,
      onEnterBack:         resetHero,
      onUpdate: (self) => {
        const p = self.progress;

        gsap.set(box, {
          scaleX:          gsap.utils.interpolate(startScaleX, 1, p),
          scaleY:          gsap.utils.interpolate(startScaleY, 1, p),
          backgroundColor: `rgba(255,255,255,${gsap.utils.interpolate(0.35, 1, p)})`,
        });

        gsap.set(logo, {
          y:     gsap.utils.interpolate(startY, 0, p),
          scale: gsap.utils.interpolate(startScale, 1, p),
        });

        if (videoRef.current) {
          gsap.set(videoRef.current, { opacity: 1 - p });
        }
      },
    });

    // ── Exit: white box + artists text scroll off, logo stays fixed ───────────
    const setTextY = gsap.quickSetter(artistsContainerRef.current, "y", "px");
    const setBoxY  = gsap.quickSetter(box, "y", "px");

    const artistsExitTrigger = ScrollTrigger.create({
      trigger:             spacer,
      start:               `top+=${vh * 1.2}px top`,
      end:                 `top+=${vh * 1.85}px top`,
      scrub:               1,
      invalidateOnRefresh: true,
      onEnter: () => {
        artistsContainerRef.current.style.pointerEvents = "none";
        handleHoverLeave();
      },
      onUpdate: (self) => {
        const p = self.progress;
        setTextY(-p * vh);
        setBoxY(-p * vh);
      },
      onLeave: () => {
        gsap.set([box, artistsContainerRef.current], { display: "none" });
        hoverImageRef.current.style.display = "none";
      },
      onEnterBack: () => {
        gsap.set([box, artistsContainerRef.current], { clearProps: "display" });
        setTextY(0);
        setBoxY(0);
        if (hasHoverRef.current) {
          artistsContainerRef.current.style.pointerEvents = "auto";
        }
      },
    });

    return () => {
      logoTrigger.kill();
      artistsExitTrigger.kill();
      box.style.willChange  = "auto";
      logo.style.willChange = "auto";
    };
  }, []);

  return (
    <>
      {/* ── Scroll spacer ───────────────────────────────────────────────────── */}
      <div ref={spacerRef} className="h-[200lvh] pointer-events-none" />

      {/* ── Video background ─────────────────────────────────────────────────
           Height overridden to frozenVH px in useEffect (Android resize jank).
      ──────────────────────────────────────────────────────────────────────── */}
      <div
        ref={videoContainerRef}
        className="fixed top-0 left-0 w-full h-lvh z-0 pointer-events-none overflow-hidden"
      >
        <video
          ref={videoRef}
          autoPlay muted loop playsInline
          className="w-full h-full object-cover"
        >
          <source src="/video/MM Hero BG_1.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── Blur box ──────────────────────────────────────────────────────────
           width/height/scaleX/scaleY/backgroundColor: fully GSAP-managed.
           backdropFilter kept inline — removed in JS post-reveal.
      ──────────────────────────────────────────────────────────────────────── */}
      <div
        ref={boxRef}
        className="fixed top-1/2 left-1/2 z-[100] pointer-events-none"
        style={{
          backgroundColor: "rgba(255,255,255,0.35)",
          backdropFilter:  "blur(3px)",
        }}
      />

      {/* ── Logo ──────────────────────────────────────────────────────────────
           opacity:0 initial — GSAP reveals it once layout is measured.
           width/padding/transformOrigin set in JS so they never cause reflow
           during scroll; only y + scale are animated.
      ──────────────────────────────────────────────────────────────────────── */}
      <div
        id="mm-hero-animated-logo"
        ref={logoRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{
          opacity: 0,
          // Logo "contrast-aware". Ambas capas se renderizan en blanco
          // (filter invert), y este contenedor hace mix-blend difference
          // contra el backdrop de la página → negro sobre fondos claros,
          // blanco sobre cortinas oscuras, transición per-pixel automática
          // (sin JS de sync para Highlights / About / hero / lo que venga).
          //
          // No usar `isolate` — crearía un isolation group que impediría
          // al blend leer el backdrop de la página. El z-[9999] ya crea
          // stacking context propio sin bloquear el blending.
          mixBlendMode: "difference",
        }}
      >
        {/* Ghost: holds container dimensions without visible content */}
        <img
          src="/logo/Balearic Sound System Logo.svg"
          alt="" aria-hidden
          className="w-full h-auto block opacity-0 pointer-events-none"
        />

        {/* Single inverted layer — el blend difference del contenedor
            decide el color final per-pixel contra el backdrop. */}
        <div
          className="absolute pointer-events-none"
          style={{ inset: LOGO_LAYER_INSET }}
        >
          <img
            src="/logo/Balearic Sound System Logo.svg"
            alt="MM Discos"
            className="w-full h-full object-contain block invert"
          />
        </div>
      </div>

      {/* ── Hover image ───────────────────────────────────────────────────────
           display toggled via JS; clamp() values have no Tailwind equivalent.
           z-500: above white box (100), below artists text (9000).
      ──────────────────────────────────────────────────────────────────────── */}
      <img
        ref={hoverImageRef}
        alt="" aria-hidden
        className="fixed top-1/2 left-1/2 z-[500] object-cover pointer-events-none will-change-transform"
        style={{
          display: "none",
          width:   "clamp(220px, 36vmin, 420px)",
          height:  "clamp(220px, 36vmin, 420px)",
        }}
      />

      {/* ── Artists names ─────────────────────────────────────────────────────
           xPercent/yPercent/opacity/y: GSAP-managed. Width kept inline —
           min() has no direct Tailwind equivalent. Padding adds lateral
           breathing room so text never bleeds to the viewport edge.
      ──────────────────────────────────────────────────────────────────────── */}
      <div
        ref={artistsContainerRef}
        className="fixed top-1/2 left-1/2 z-[9000] pointer-events-none"
        style={{ width: "min(100%, 600px)", opacity: 0 }}
      >
        <p
          className="text-[12px] font-normal leading-[1.6] tracking-[0.12em] uppercase text-justify text-[#111] px-4"
          style={{ fontFamily: "'MyFont', sans-serif" }}
        >
          {ARTISTS.map((name, i) => (
            <span
              key={i}
              ref={(el) => { artistsSpansRef.current[i] = el; }}
              onMouseEnter={() => handleHoverEnter(name)}
              onMouseLeave={handleHoverLeave}
              className={ARTIST_IMAGE_MAP[name.toLowerCase()] ? "cursor-crosshair" : "cursor-default"}
            >
              {name}{i < ARTISTS.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>
    </>
  );
}