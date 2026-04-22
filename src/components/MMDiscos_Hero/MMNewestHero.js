"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Constants (must match globals.css .mm-global-logo-nav) ───────────────────
const LOGO_END_WIDTH_DESKTOP  = 250;
const LOGO_END_WIDTH_MOBILE   = 200;
const LOGO_FIT_FACTOR         = 0.96;
const LOGO_PADDING            = "1rem 2.5rem 2.5rem";
const LOGO_LAYER_INSET        = "1rem 2.5rem 2.5rem 2.5rem";

// ── Artist → release image map ────────────────────────────────────────────────
// Artists with own releases use their cover. Artists appearing only in
// tracklists (Factory, Socarrat compilations) map to the compilation cover.
// Keys are lowercase for case-insensitive lookup.
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

export default function MMNewestHero() {
  const spacerRef           = useRef(null);
  const videoContainerRef   = useRef(null);
  const videoRef            = useRef(null);
  const boxRef              = useRef(null);
  const logoRef             = useRef(null);
  const artistsContainerRef = useRef(null);
  const artistsSpansRef     = useRef([]);
  const hoverImageRef       = useRef(null);

  // ── Hover handlers — defined in component body so JSX can reference them ────
  // clipPath wipe: no opacity, purely geometric — enter grows up from bottom,
  // exit snaps up. Single <img> element, src swapped on each hover.
  const handleHoverEnter = (name) => {
    const src = ARTIST_IMAGE_MAP[name.toLowerCase()];
    if (!src || !hoverImageRef.current) return;
    hoverImageRef.current.src = src;
    hoverImageRef.current.style.display = "block";
    gsap.killTweensOf(hoverImageRef.current);
    gsap.fromTo(hoverImageRef.current,
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

    // Freeze viewport dims on mount — prevents address-bar resize jank on Android
    const vh       = window.innerHeight;
    const vw       = window.innerWidth;
    const isMobile = vw < 720;

    if (videoContainerRef.current) {
      videoContainerRef.current.style.height = `${vh}px`;
    }

    // ── Box initial visual size ───────────────────────────────────────────────
    // Desktop: small centered rectangle (30% × 16:9)
    // Mobile:  wider rectangle (88% × 16:9) — still has the "framing" feel
    const boxInitW  = isMobile ? vw * 0.88 : vw * 0.30;
    const boxInitH  = boxInitW * (9 / 16);
    const startScaleX = boxInitW / vw;
    const startScaleY = boxInitH / vh;

    // End position of the logo — matches CSS .mm-global-logo-nav
    const endLogoW    = isMobile ? LOGO_END_WIDTH_MOBILE : LOGO_END_WIDTH_DESKTOP;
    const endLogoLeft = (vw - endLogoW) / 2;  // = calc(50% - endLogoW/2)

    // ── Promote to GPU composited layers before any animation ─────────────────
    // will-change tells the compositor to create a dedicated layer now,
    // eliminating the first-frame promotion cost during the scrub.
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

    // ── Logo: measure rendered size to compute startScale/startY ─────────────
    // We set layout props via style (never GSAP-animated), then only animate
    // y + scale — pure GPU transform, zero layout reflow during scroll.
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

      // fitScale: most-constrained axis → logo always fits inside blur box
      startScale    = Math.min(B.width / L.width, B.height / L.height) * LOGO_FIT_FACTOR;
      const scaledH = L.height * startScale;
      // Vertically center logo within box
      startY        = B.top + (B.height - scaledH) / 2;
      gsap.set(logo, { y: startY, scale: startScale });
    };

    syncLogo();
    // Double rAF: wait for browser layout to settle before measuring + refreshing
    requestAnimationFrame(() => {
      syncLogo();
      ScrollTrigger.refresh();
    });

    // ── Artists: invisible until reveal ──────────────────────────────────────
    const spans = artistsSpansRef.current.filter(Boolean);
    gsap.set(artistsContainerRef.current, { xPercent: -50, yPercent: -50, opacity: 0 });
    gsap.set(spans, { opacity: 0 });

    // ── Hover image: center via GSAP transform, preload all mapped covers ─────
    gsap.set(hoverImageRef.current, {
      xPercent: -50,
      yPercent: -50,
      scale:    1,
      force3D:  true,
    });
    Object.values(ARTIST_IMAGE_MAP).forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    // ── Reveal: fires the frame logo settles at top (scrollTrigger onLeave) ──
    const revealArtists = () => {
      window.dispatchEvent(new Event("mm-hero-logo-settled"));

      // Box is fully opaque → backdrop-filter is painting but invisible → remove it
      box.style.backdropFilter       = "none";
      box.style.webkitBackdropFilter = "none";

      // Free GPU layers — continuous transform animation is over
      box.style.willChange  = "auto";
      logo.style.willChange = "auto";

      // Video buried under opaque white — pause + hide to free decode thread
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.style.display = "none";
      }

      gsap.set(artistsContainerRef.current, { opacity: 1 });
      // Enable hover — pointer events off during scroll, on when names are live
      artistsContainerRef.current.style.pointerEvents = "auto";

      gsap.fromTo(
        spans,
        { opacity: 0 },
        {
          opacity:  1,
          duration: 0.85,
          ease:     "power3.out",
          stagger:  { each: 0.04, from: "random" },
        }
      );
    };

    // ── Reset: fires when user scrolls back above the logo trigger ───────────
    const resetHero = () => {
      window.dispatchEvent(new Event("mm-hero-logo-reset"));

      // Kill hover image immediately — no hover while animating back
      artistsContainerRef.current.style.pointerEvents = "none";
      handleHoverLeave();

      // Ensure overlays are visible again (may have been hidden by exit trigger)
      gsap.set([box, logo], { clearProps: "display,opacity" });

      // Re-promote layers for the reverse scrub
      box.style.willChange  = "transform, background-color";
      logo.style.willChange = "transform";
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
    // Covers exactly one viewport height of scroll so the transition feels
    // deliberate — not too snappy, not too slow.
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

        // Video fades out as box fills the screen
        if (videoRef.current) {
          gsap.set(videoRef.current, { opacity: 1 - p });
        }
      },
    });

    // ── Exit: box + text scroll up, logo stays fixed at top ─────────────────
    // Logo never moves after settling — it becomes the persistent nav logo,
    // exactly as in MMDiscosHeroFinal4. Only the white box and artists text
    // scroll off; the logo remains at y:0 for the rest of the page session.
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
        setBoxY (-p * vh);
      },
      onLeave: () => {
        gsap.set([box, artistsContainerRef.current], { display: "none" });
        hoverImageRef.current.style.display = "none";
      },
      onEnterBack: () => {
        gsap.set([box, artistsContainerRef.current], { clearProps: "display" });
        setTextY(0);
        setBoxY(0);
        artistsContainerRef.current.style.pointerEvents = "auto";
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
      {/* ── Scroll spacer ─────────────────────────────────────────────────────
           200svh total:
           · 0 → 100vh  : logo animation (scrub)
           · 100 → 130vh : artists fully visible
           · 130 → 180vh : artists fade out
           · 180 → 200vh : clean exit buffer before next section
      ────────────────────────────────────────────────────────────────────── */}
      <div ref={spacerRef} style={{ height: "200svh", pointerEvents: "none" }} />

      {/* ── Video background ─────────────────────────────────────────────────
           Height set to frozenVH in px via useEffect to prevent Android
           address-bar resize from showing a white gap at the bottom.
      ─────────────────────────────────────────────────────────────────── */}
      <div
        ref={videoContainerRef}
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          width:         "100%",
          height:        "100svh",
          zIndex:        0,
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

      {/* ── Blur box ─────────────────────────────────────────────────────────
           width/height/transform: 100% GSAP-managed (scaleX/scaleY).
           Only backdropFilter + backgroundColor declared here — GSAP takes over
           backgroundColor during the scrub, backdropFilter removed post-reveal.
      ─────────────────────────────────────────────────────────────────── */}
      <div
        ref={boxRef}
        style={{
          position:        "fixed",
          top:             "50%",
          left:            "50%",
          backgroundColor: "rgba(255,255,255,0.35)",
          backdropFilter:  "blur(3px)",
          zIndex:          100,
          pointerEvents:   "none",
        }}
      />

      {/* ── Logo ─────────────────────────────────────────────────────────────
           top:0/left:0 anchor the transform origin.
           opacity:0 in CSS — GSAP sets it to 1 once layout is measured.
           Two logo layers (black + white) for the About-section curtain reveal
           in _app.js (white layer revealed via clipPath inset animation).
      ─────────────────────────────────────────────────────────────────── */}
      <div
        id="mm-hero-animated-logo"
        ref={logoRef}
        style={{
          position:      "fixed",
          top:           0,
          left:          0,
          zIndex:        9999,
          pointerEvents: "none",
          opacity:       0,
          isolation:     "isolate",
        }}
      >
        {/* Ghost image — fixes container dimensions without visible content */}
        <img
          src="/logo/Balearic Sound System Logo.svg"
          alt="" aria-hidden
          style={{ width: "100%", height: "auto", display: "block", opacity: 0, pointerEvents: "none" }}
        />

        {/* Black layer */}
        <div
          className="logo-layer-black"
          style={{
            position:      "absolute",
            inset:         LOGO_LAYER_INSET,
            pointerEvents: "none",
            clipPath:      "inset(0 0 0 0)",
          }}
        >
          <img
            src="/logo/Balearic Sound System Logo.svg"
            alt="" aria-hidden
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        </div>

        {/* White (inverted) layer — revealed by About curtain */}
        <div
          className="logo-layer-white"
          style={{
            position:      "absolute",
            inset:         LOGO_LAYER_INSET,
            zIndex:        1,
            pointerEvents: "none",
            clipPath:      "inset(100% 0 0 0)",
          }}
        >
          <img
            src="/logo/Balearic Sound System Logo.svg"
            alt="MM Discos"
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", filter: "invert(1)" }}
          />
        </div>
      </div>

      {/* ── Hover image ─────────────────────────────────────────────────────
           Single element — src swapped on hover, clipPath animates in/out.
           z-index 500: above white box (100), below artists text (9000) so
           names float over the cover. pointerEvents none — never intercepts.
      ─────────────────────────────────────────────────────────────────── */}
      <img
        ref={hoverImageRef}
        alt=""
        aria-hidden
        style={{
          position:      "fixed",
          top:           "50%",
          left:          "50%",
          zIndex:        500,
          display:       "none",
          width:         "clamp(220px, 36vmin, 420px)",
          height:        "clamp(220px, 36vmin, 420px)",
          objectFit:     "cover",
          pointerEvents: "none",
          willChange:    "transform",
        }}
      />

      {/* ── Artists names ────────────────────────────────────────────────────
           Fixed + centered via GSAP xPercent/yPercent (-50/-50) set in useEffect.
           Each name is a span so GSAP stagger can target them individually.
           pointerEvents toggled in revealArtists / resetHero.
      ─────────────────────────────────────────────────────────────────── */}
      <div
        ref={artistsContainerRef}
        style={{
          position:      "fixed",
          top:           "50%",
          left:          "50%",
          width:         "min(100%, 600px)",
          zIndex:        9000,
          pointerEvents: "none",
          opacity:       0,
        }}
      >
        <p
          style={{
            fontFamily:    "'MyFont', sans-serif",
            fontSize:      "12px",
            fontWeight:    400,
            lineHeight:    1.6,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textAlign:     "justify",
            color:         "#111",
          }}
        >
          {ARTISTS.map((name, i) => (
            <span
              key={i}
              ref={(el) => { artistsSpansRef.current[i] = el; }}
              onMouseEnter={() => handleHoverEnter(name)}
              onMouseLeave={handleHoverLeave}
              style={{ cursor: ARTIST_IMAGE_MAP[name.toLowerCase()] ? "crosshair" : "default" }}
            >
              {name}{i < ARTISTS.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>
    </>
  );
}
