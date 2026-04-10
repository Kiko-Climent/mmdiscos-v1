"use client";

/**
 * MMDiscosHero4 — con CarouselStrip (cinta vertical)
 * ─────────────────────────────────────────────────────────────────────
 * Cambios respecto a la versión WebGL:
 *
 *  1. Import CarouselStrip en lugar de Carousel3DWebGL
 *  2. stripRef en lugar de carousel3DRef
 *  3. setProgress() continuo en lugar de setImage() discreto
 *  4. Contenedor del carrusel: height 85svh en vez de aspect-ratio 1/1
 *  5. onEnter/onEnterBack pasan instant=true → sin lerp en el reveal
 *  6. Contador actualizado con Math.round del progress real
 *  7. CYCLES y setImage() eliminados
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Carousel3dWebGl from "./Carousel3dWebGl";

gsap.registerPlugin(ScrollTrigger);

const CAROUSEL_IMAGES = [
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

const BLUR_START    = 10;
const BLUR_END      = 30;
const OPACITY_START = 0.05;
const OPACITY_END   = 0.16;

export default function MMDiscosHero5() {
  const spacerRef         = useRef(null);
  const boxRef            = useRef(null);
  const logoRef           = useRef(null);
  const videoRef          = useRef(null);
  const artistsRef        = useRef(null);
  const quoteContainerRef = useRef(null);

  const carouselRef      = useRef(null);
  const carouselCountRef = useRef(null);
  const stripRef         = useRef(null);   // ← API imperativa de CarouselStrip

  const totalImages = CAROUSEL_IMAGES.length;

  const aTurbRef  = useRef(null);
  const aDisplRef = useRef(null);
  const aBlurRef  = useRef(null);
  const aMorphRef = useRef(null);
  const aGlowRef  = useRef(null);
  const qTurbRef  = useRef(null);
  const qDisplRef = useRef(null);
  const qBlurRef  = useRef(null);
  const qMorphRef = useRef(null);
  const qGlowRef  = useRef(null);

  useEffect(() => {
    const box    = boxRef.current;
    const logo   = logoRef.current;
    const spacer = spacerRef.current;
    if (!box || !logo || !spacer) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isDesktop = vw >= 720;

    if (!isDesktop) {
      gsap.set(logo, { top: 0, left: 0, width: 250, padding: "1rem 2.5rem", opacity: 1 });
      gsap.set(box, { width: "100%", height: "100vh", top: 0, left: 0, transform: "none" });
      return;
    }

    const boxW    = box.offsetWidth;
    const boxH    = box.offsetHeight;
    const boxLeft = (vw - boxW) / 2;
    const boxTop  = (vh - boxH) / 2;

    gsap.set(logo, {
      left: boxLeft, width: boxW, padding: "2.5rem",
      top: "auto", bottom: vh - (boxTop + boxH),
    });

    const logoRect   = logo.getBoundingClientRect();
    const startTop   = logoRect.top;
    const startLeft  = boxLeft;
    const startWidth = boxW;
    gsap.set(logo, { top: startTop, bottom: "auto", opacity: 1 });

    const endWidth = 250;
    const endLeft  = (vw - endWidth) / 2;
    const endTop   = 0;
    gsap.set(box, { width: boxW, height: boxH });
    gsap.set(box, {
      backdropFilter: `blur(${BLUR_START}px) saturate(140%)`,
      WebkitBackdropFilter: `blur(${BLUR_START}px) saturate(140%)`,
      background: `rgba(255,255,255,${OPACITY_START})`,
    });

    // ── Logo / box ──────────────────────────────────────────────────
    const logoTrigger = ScrollTrigger.create({
      trigger: spacer,
      start: "top top",
      end: `+=${vh}px`,
      scrub: 1,
      onUpdate: (self) => {
        const p       = self.progress;
        const blur    = gsap.utils.interpolate(BLUR_START, BLUR_END, p);
        const opacity = gsap.utils.interpolate(OPACITY_START, OPACITY_END, p);
        gsap.set(box, {
          width:  gsap.utils.interpolate(boxW, vw, p),
          height: gsap.utils.interpolate(boxH, vh, p),
          backdropFilter: `blur(${blur}px) saturate(140%)`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(140%)`,
          background: `rgba(255,255,255,${opacity})`,
        });
        gsap.set(logo, {
          top:   gsap.utils.interpolate(startTop, endTop, p),
          left:  gsap.utils.interpolate(startLeft, endLeft, p),
          width: gsap.utils.interpolate(startWidth, endWidth, p),
        });
      },
    });

    // ── Helpers visibilidad ─────────────────────────────────────────
    const showCarousel = () => {
      if (carouselRef.current)
        carouselRef.current.style.clipPath = "inset(0% 0% 0% 0%)";
    };
    const hideCarousel = () => {
      if (carouselRef.current)
        carouselRef.current.style.clipPath = "inset(100% 0% 0% 0%)";
    };

    // ── Contador ────────────────────────────────────────────────────
    const updateCounter = (progress) => {
      const counter = carouselCountRef.current;
      if (!counter) return;
      const idx = Math.round(progress * (totalImages - 1));
      counter.textContent =
        `${String(idx + 1).padStart(2, "0")} / ${String(totalImages).padStart(2, "0")}`;
    };

    const quoteCarouselEnd = () => {
      const quote = quoteContainerRef.current;
      if (!quote) return "top bottom";
      const lineFromTop = Math.max(0, vh - 0.15 * quote.offsetHeight);
      return `top ${(lineFromTop / vh) * 100}%`;
    };

    // ── Carrusel trigger ────────────────────────────────────────────
    const carouselTrigger = ScrollTrigger.create({
      trigger: spacer,
      start: `top+=${vh} top`,
      endTrigger: quoteContainerRef.current || spacer,
      end: quoteCarouselEnd,
      invalidateOnRefresh: true,

      // instant=true: evita que la cinta salte desde el inicio al entrar
      onEnter: (self) => {
        showCarousel();
        stripRef.current?.setProgress(self.progress, true);
        updateCounter(self.progress);
      },
      onLeave: () => hideCarousel(),
      onEnterBack: (self) => {
        showCarousel();
        stripRef.current?.setProgress(self.progress, true);
        updateCounter(self.progress);
      },
      onLeaveBack: () => hideCarousel(),

      onUpdate: (self) => {
        stripRef.current?.setProgress(self.progress);
        updateCounter(self.progress);
      },
    });

    // ── Morph reveal — sin cambios ──────────────────────────────────
    const createMorphReveal = (el, refs) => {
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: "top 95%",
        end: "bottom 5%",
        scrub: 3.5,
        onUpdate: (self) => {
          const sharp = Math.sin(self.progress * Math.PI);
          const bf = gsap.utils.interpolate(0.006, 0.00015, sharp);
          refs.turb.setAttribute("baseFrequency", `${bf.toFixed(5)} ${(bf * 1.6).toFixed(5)}`);
          refs.displ.setAttribute("scale",        gsap.utils.interpolate(28, 0, sharp));
          refs.blur.setAttribute("stdDeviation",  gsap.utils.interpolate(12, 0, sharp));
          refs.morph.setAttribute("radius",       gsap.utils.interpolate(4,  0, sharp));
          refs.glow.setAttribute("stdDeviation",  gsap.utils.interpolate(10, 0, sharp));
        },
      });
    };

    const t1 = createMorphReveal(artistsRef.current, {
      turb: aTurbRef.current, displ: aDisplRef.current,
      blur: aBlurRef.current, morph: aMorphRef.current, glow: aGlowRef.current,
    });
    const t2 = createMorphReveal(quoteContainerRef.current, {
      turb: qTurbRef.current, displ: qDisplRef.current,
      blur: qBlurRef.current, morph: qMorphRef.current, glow: qGlowRef.current,
    });

    return () => {
      logoTrigger.kill();
      carouselTrigger.kill();
      t1?.kill();
      t2?.kill();
    };
  }, []);

  return (
    <>
      {/* ── SVG filters ───────────────────────────────────────── */}
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <defs>
          <filter id="morph-artists" x="-15%" y="-60%" width="130%" height="220%" colorInterpolationFilters="sRGB">
            <feTurbulence ref={aTurbRef} type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="2" seed="8" result="noise" />
            <feDisplacementMap ref={aDisplRef} in="SourceGraphic" in2="noise" scale="28" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur ref={aBlurRef} in="displaced" stdDeviation="12" result="blurred" />
            <feMorphology ref={aMorphRef} operator="dilate" radius="4" in="blurred" result="morphed" />
            <feGaussianBlur ref={aGlowRef} in="morphed" stdDeviation="10" result="glow" />
            <feColorMatrix in="glow" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 2.5 0" result="brightGlow" />
            <feMerge><feMergeNode in="brightGlow" /><feMergeNode in="morphed" /></feMerge>
          </filter>
          <filter id="morph-quote" x="-15%" y="-60%" width="130%" height="220%" colorInterpolationFilters="sRGB">
            <feTurbulence ref={qTurbRef} type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="2" seed="42" result="noise" />
            <feDisplacementMap ref={qDisplRef} in="SourceGraphic" in2="noise" scale="28" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur ref={qBlurRef} in="displaced" stdDeviation="12" result="blurred" />
            <feMorphology ref={qMorphRef} operator="dilate" radius="4" in="blurred" result="morphed" />
            <feGaussianBlur ref={qGlowRef} in="morphed" stdDeviation="10" result="glow" />
            <feColorMatrix in="glow" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 2.5 0" result="brightGlow" />
            <feMerge><feMergeNode in="brightGlow" /><feMergeNode in="morphed" /></feMerge>
          </filter>
        </defs>
      </svg>

      {/* ── Spacer ─────────────────────────────────────────────── */}
      <div ref={spacerRef} style={{ height: "200svh", pointerEvents: "none" }} />

      {/* ── Video ──────────────────────────────────────────────── */}
      <div
        ref={videoRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: "100%", height: "100svh",
          pointerEvents: "none", overflow: "hidden",
        }}
      >
        <video autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }}>
          <source src="/video/MM Hero BG_1.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── Box blanco ─────────────────────────────────────────── */}
      <div
        ref={boxRef}
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "35%", aspectRatio: "16/9",
          backgroundColor: "rgba(255,255,255,0.35)",
          backdropFilter: "blur(3px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Logo ───────────────────────────────────────────────── */}
      <div ref={logoRef} style={{ position: "fixed", zIndex: 9999, pointerEvents: "none", opacity: 0 }}>
        <img src="/logo/Balearic Sound System Logo.svg" alt="MM Discos" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>

      {/* ── Cinta vertical ─────────────────────────────────────── */}
      {/*
          Antes:  width: clamp(220px, 26vw, 420px)  + aspectRatio: 1/1
          Ahora:  width más estrecho + height: 85svh
          → la tira ocupa casi toda la pantalla verticalmente
      */}
      <div
        ref={carouselRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 8000,
          pointerEvents: "none",
          clipPath: "inset(100% 0% 0% 0%)",
          transition: "clip-path 0.5s cubic-bezier(0.76, 0, 0.24, 1)",
          // ── Dimensiones de la tira ──────────────────────────
          width: "clamp(160px, 18vw, 300px)",
          height: "85svh",
        }}
      >
        <Carousel3dWebGl ref={stripRef} images={CAROUSEL_IMAGES} />

        {/* Contador */}
        <div
          ref={carouselCountRef}
          style={{
            position: "absolute",
            bottom: "-1.6rem",
            right: 0,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(0,0,0,0.35)",
            lineHeight: 1,
          }}
        >
          01 / {String(totalImages).padStart(2, "0")}
        </div>
      </div>

      {/* ── Artistas ───────────────────────────────────────────── */}
      <section
        style={{
          position: "relative", zIndex: 10000,
          width: "100%", minHeight: "60svh",
          display: "flex", justifyContent: "center",
          alignItems: "center", padding: "2.5rem 0",
        }}
      >
        <p
          ref={artistsRef}
          style={{
            width: "70%",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(1.4rem, 2.8vw, 3.2rem)",
            fontWeight: 700, lineHeight: 1.05,
            letterSpacing: "0.01em",
            textTransform: "lowercase", textAlign: "center",
            color: "#ffffff",
            mixBlendMode: "difference",
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

      {/* ── Cita ───────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative", zIndex: 10000,
          width: "100%", height: "100svh",
          display: "flex", justifyContent: "center", alignItems: "center",
        }}
      >
        <div
          ref={quoteContainerRef}
          style={{
            width: "65%",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            color: "#ffffff",
            mixBlendMode: "difference",
            filter: "url(#morph-quote)",
          }}
        >
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(1.4rem, 2.8vw, 3.2rem)",
            fontWeight: 700, lineHeight: 1.05,
            letterSpacing: "0.01em",
            textTransform: "lowercase", textAlign: "left",
          }}>
            We played without rules, without thinking about styles or what would
            come next. One track could be slow, the next dark, then something pop
            or an impossible guitar, but it all made sense in that moment. The
            dancefloor didn't ask for coherence, it asked for emotion — and as
            long as people stayed there, smiling and lost, you knew you were doing
            it right.
          </p>
          <p style={{
            fontFamily: "'Host Grotesk', sans-serif",
            fontSize: "0.95rem", fontWeight: 450,
            letterSpacing: "0.04em",
            textTransform: "uppercase", textAlign: "left",
            opacity: 0.5,
          }}>
            — Dj Alfredo
          </p>
        </div>
      </section>
    </>
  );
}