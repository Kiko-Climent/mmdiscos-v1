"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Constants (must match globals.css .mm-global-logo-nav) ───────────────────
const LOGO_END_WIDTH_MOBILE = 200;
const LOGO_FIT_FACTOR       = 0.96;
const LOGO_PADDING          = "1rem 2.5rem 2.5rem";
const LOGO_LAYER_INSET      = "1rem 2.5rem 2.5rem 2.5rem";

// ── Artist list (sin hover en móvil — sin map de imágenes) ──────────────────
const ARTISTS = [
  "Asa Tate", "Daichi", "Nic Jalusi", "Pleasure Voyage", "Mogwaa", "Statues",
  "Mori Ra", "Longhair", "Kross Section", "Komodo", "Marvin & Guy", "Distance",
  "Guillaume", "Pontcho", "Saturn", "Corben", "Bonnie & Klein", "Celex",
  "Florin Büchel", "NairLess", "Hal Incandenza", "Volta Cab", "Coyote",
  "Marcello Giordani", "Albion", "Serasso", "Atlantic Brain", "Jaisiel",
  "Trepanado", "Ruf Dug", "Chida", "Franz Scala", "Sankt Göran", "The.Deal",
  "A Beat Disciple", "Jakob Mäder", "Da Silva",
];

export default function MMNewestHero2Mobile() {
  const spacerRef           = useRef(null);
  const videoContainerRef   = useRef(null);
  const videoRef            = useRef(null);
  const boxRef              = useRef(null);
  const logoRef             = useRef(null);
  const artistsContainerRef = useRef(null);
  const artistsSpansRef     = useRef([]);

  useEffect(() => {
    // Guard: variante mobile — si viewport es desktop, no hace nada.
    if (window.innerWidth >= 720) return;

    const box    = boxRef.current;
    const logo   = logoRef.current;
    const spacer = spacerRef.current;
    if (!box || !logo || !spacer) return;

    // Freeze viewport dims on mount — pixel values, no resize jank.
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    if (videoContainerRef.current) {
      videoContainerRef.current.style.height = `${vh}px`;
    }

    // ── Box initial visual size (mismo aspecto que desktop mobile-path) ──
    const boxInitW    = vw * 0.88;
    const boxInitH    = boxInitW * (9 / 16);
    const startScaleX = boxInitW / vw;
    const startScaleY = boxInitH / vh;

    const endLogoW    = LOGO_END_WIDTH_MOBILE;
    const endLogoLeft = (vw - endLogoW) / 2;

    box.style.willChange  = "transform, background-color";
    logo.style.willChange = "transform";

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

    // ── Logo: medir y colocar centrado dentro del box inicial ──────────
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

    const spans = artistsSpansRef.current.filter(Boolean);
    gsap.set(artistsContainerRef.current, { xPercent: -50, yPercent: -50, opacity: 0 });
    gsap.set(spans, { opacity: 0 });

    // ── Reveal artists tras snap ────────────────────────────────────────
    const revealArtists = () => {
      window.dispatchEvent(new Event("mm-hero-logo-settled"));

      box.style.backdropFilter        = "none";
      box.style.webkitBackdropFilter  = "none";
      box.style.willChange            = "auto";
      logo.style.willChange           = "auto";

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.style.display = "none";
      }

      gsap.set(artistsContainerRef.current, { opacity: 1 });

      gsap.fromTo(
        spans,
        { opacity: 0 },
        { opacity: 1, duration: 0.85, ease: "power3.out", stagger: { each: 0.04, from: "random" } }
      );
    };

    // ── Snap: dispara con primer wheel/touchmove ────────────────────────
    let snapFired = false;

    const fireSnap = () => {
      if (snapFired) return;
      snapFired = true;
      window.removeEventListener("wheel",     fireSnap);
      window.removeEventListener("touchmove", fireSnap);

      const tl = gsap.timeline({ onComplete: revealArtists });

      // Fase 0 — video desaparece antes de que el blanco lo tape
      if (videoRef.current) {
        tl.to(videoRef.current, { opacity: 0, duration: 0.18, ease: "expo.in" }, 0);
      }

      // Fase 1 — box abre el ancho
      tl.to(box, { scaleX: 1, duration: 0.22, ease: "expo.out" }, 0);

      // Fase 2 — box abre la altura y sella en blanco opaco
      tl.to(box, {
        scaleY:          1,
        backgroundColor: "rgba(255,255,255,1)",
        duration:        0.38,
        ease:            "expo.out",
      }, 0.18);

      // Fase 3 — logo viaja al top-center
      tl.to(logo, { y: 0, scale: 1, duration: 0.42, ease: "expo.out" }, 0.22);
    };

    window.addEventListener("wheel",     fireSnap, { passive: true });
    window.addEventListener("touchmove", fireSnap, { passive: true });

    // ── Reset si el usuario vuelve arriba del todo (scroll = 0) ─────────
    const resetTrigger = ScrollTrigger.create({
      trigger: spacer,
      start:   "top top",
      end:     "top top+=10",
      onEnterBack: () => {
        if (!snapFired) return;
        snapFired = false;
        window.addEventListener("wheel",     fireSnap, { passive: true });
        window.addEventListener("touchmove", fireSnap, { passive: true });

        window.dispatchEvent(new Event("mm-hero-logo-reset"));

        if (videoRef.current) {
          videoRef.current.style.display = "block";
          videoRef.current.style.opacity = "1";
          videoRef.current.play().catch(() => {});
        }

        box.style.backdropFilter       = "blur(3px)";
        box.style.webkitBackdropFilter = "blur(3px)";
        box.style.willChange           = "transform, background-color";
        logo.style.willChange          = "transform";

        gsap.set(box, {
          scaleX:          startScaleX,
          scaleY:          startScaleY,
          backgroundColor: "rgba(255,255,255,0.35)",
          clearProps:      "display",
        });
        gsap.set(logo, { y: startY, scale: startScale });

        gsap.to(artistsContainerRef.current, { opacity: 0, duration: 0.25, ease: "power2.in" });
        gsap.set(spans, { opacity: 0 });
      },
    });

    // ── Exit: artists + box salen por arriba — mismo rango que desktop ─
    const setTextY = gsap.quickSetter(artistsContainerRef.current, "y", "px");
    const setBoxY  = gsap.quickSetter(box, "y", "px");

    const artistsExitTrigger = ScrollTrigger.create({
      trigger:             spacer,
      start:               `top+=${vh * 1.2}px top`,
      end:                 `top+=${vh * 1.85}px top`,
      scrub:               1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        setTextY(-p * vh);
        setBoxY(-p * vh);
      },
      onLeave: () => {
        gsap.set([box, artistsContainerRef.current], { display: "none" });
      },
      onEnterBack: () => {
        gsap.set([box, artistsContainerRef.current], { clearProps: "display" });
        setTextY(0);
        setBoxY(0);
      },
    });

    return () => {
      window.removeEventListener("wheel",     fireSnap);
      window.removeEventListener("touchmove", fireSnap);
      resetTrigger.kill();
      artistsExitTrigger.kill();
      box.style.willChange  = "auto";
      logo.style.willChange = "auto";
    };
  }, []);

  return (
    <>
      <div ref={spacerRef} className="h-[200svh] pointer-events-none" />

      <div
        ref={videoContainerRef}
        className="fixed top-0 left-0 w-full h-svh z-0 pointer-events-none overflow-hidden"
      >
        <video
          ref={videoRef}
          autoPlay muted loop playsInline
          className="w-full h-full object-cover"
        >
          <source src="/video/MM Hero BG_1.mp4" type="video/mp4" />
        </video>
      </div>

      <div
        ref={boxRef}
        className="fixed top-1/2 left-1/2 z-[100] pointer-events-none"
        style={{
          backgroundColor: "rgba(255,255,255,0.35)",
          backdropFilter:  "blur(3px)",
        }}
      />

      <div
        id="mm-hero-animated-logo"
        ref={logoRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{
          opacity: 0,
          mixBlendMode: "difference",
        }}
      >
        <img
          src="/logo/Balearic Sound System Logo.svg"
          alt="" aria-hidden
          className="w-full h-auto block opacity-0 pointer-events-none"
        />
        <div className="absolute pointer-events-none" style={{ inset: LOGO_LAYER_INSET }}>
          <img
            src="/logo/Balearic Sound System Logo.svg"
            alt="MM Discos"
            className="w-full h-full object-contain block invert"
          />
        </div>
      </div>

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
              className="cursor-default"
            >
              {name}{i < ARTISTS.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>
    </>
  );
}