"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Configuración de imágenes ──────────────────────────────────────────────
// top: posición vertical | width: tamaño | rotation: inclinación | delay: stagger
const IMAGE_CONFIG = [
  { src: "/img12.jpg",                         side: "left",  top: "8vh",  width: "18vw", rotation: -4, delay: 0    },
  { src: "/MMD038.png",                        side: "left",  top: "34vh", width: "20vw", rotation:  3, delay: 0.12 },
  { src: "/MMD040_Cover-1.jpg",                side: "left",  top: "60vh", width: "16vw", rotation: -2, delay: 0.06 },
  { src: "/morira - cover.png",                side: "left",  top: "78vh", width: "15vw", rotation:  5, delay: 0.18 },
  { src: "/img13.jpg",                         side: "right", top: "5vh",  width: "19vw", rotation:  4, delay: 0.08 },
  { src: "/MMD039_Artwork Promo Full.png",     side: "right", top: "28vh", width: "17vw", rotation: -3, delay: 0.15 },
  { src: "/MMD039.png",                        side: "right", top: "52vh", width: "20vw", rotation:  2, delay: 0.04 },
  { src: "/MMD040-2.png",                      side: "right", top: "70vh", width: "15vw", rotation: -5, delay: 0.2  },
  { src: "/statues.jpeg",                      side: "right", top: "86vh", width: "14vw", rotation:  3, delay: 0.1  },
];

export default function MMDiscosHero() {
  const spacerRef         = useRef(null);
  const boxRef            = useRef(null);
  const logoRef           = useRef(null);
  const videoRef          = useRef(null);
  const artistsRef        = useRef(null);
  const quoteContainerRef = useRef(null);
  const imageRefs         = useRef([]);

  // SVG filter refs — artists
  const aTurbRef  = useRef(null);
  const aDisplRef = useRef(null);
  const aBlurRef  = useRef(null);
  const aMorphRef = useRef(null);
  const aGlowRef  = useRef(null);

  // SVG filter refs — quote
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
      gsap.set(box, {
        width: "100%", height: "100vh",
        top: 0, left: 0, transform: "none",
        backgroundColor: "rgba(255,255,255,1)",
      });
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

    // ── Logo / box ────────────────────────────────────────────────
    const logoTrigger = ScrollTrigger.create({
      trigger: spacer,
      start: "top top",
      end: `+=${vh}px`,
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(box, {
          width: gsap.utils.interpolate(boxW, vw, p),
          height: gsap.utils.interpolate(boxH, vh, p),
          backgroundColor: `rgba(255,255,255,${gsap.utils.interpolate(0.35, 1, p)})`,
        });
        gsap.set(logo, {
          top:   gsap.utils.interpolate(startTop, endTop, p),
          left:  gsap.utils.interpolate(startLeft, endLeft, p),
          width: gsap.utils.interpolate(startWidth, endWidth, p),
        });
        if (videoRef.current) gsap.set(videoRef.current, { opacity: 1 - p });
      },
    });

    // ── Imágenes: estado inicial (fuera de pantalla) ──────────────
    imageRefs.current.forEach((el, i) => {
      if (!el) return;
      const cfg = IMAGE_CONFIG[i];
      gsap.set(el, {
        x: cfg.side === "left" ? "-130%" : "130%",
        opacity: 0,
      });
    });

    const slideIn = () => {
      imageRefs.current.forEach((el, i) => {
        if (!el) return;
        const cfg = IMAGE_CONFIG[i];
        gsap.to(el, {
          x: "0%",
          opacity: 1,
          duration: 1.2,
          delay: cfg.delay,
          ease: "power3.out",
        });
      });
    };

    const slideOut = () => {
      imageRefs.current.forEach((el, i) => {
        if (!el) return;
        const cfg = IMAGE_CONFIG[i];
        gsap.to(el, {
          x: cfg.side === "left" ? "-130%" : "130%",
          opacity: 0,
          duration: 1,
          delay: cfg.delay * 0.5,
          ease: "power3.in",
        });
      });
    };

    // ── ScrollTrigger para entrada / salida de imágenes ───────────
    const imgTrigger = ScrollTrigger.create({
      trigger: artistsRef.current,
      start: "top 75%",
      end: "bottom 25%",
      onEnter:     () => slideIn(),
      onLeave:     () => slideOut(),
      onEnterBack: () => slideIn(),
      onLeaveBack: () => slideOut(),
    });

    // ── Morph-reveal helper ───────────────────────────────────────
    const createMorphReveal = (el, refs) => {
      if (!el || !refs.turb || !refs.displ || !refs.blur || !refs.morph || !refs.glow)
        return null;

      refs.turb.setAttribute("baseFrequency", "0.015 0.03");
      refs.displ.setAttribute("scale", "60");
      refs.blur.setAttribute("stdDeviation", "20");
      refs.morph.setAttribute("radius", "7");
      refs.glow.setAttribute("stdDeviation", "18");
      gsap.set(el, { opacity: 1 });

      return ScrollTrigger.create({
        trigger: el,
        start: "top 95%",
        end: "bottom 5%",
        scrub: 2,
        onUpdate: (self) => {
          const sharp = Math.sin(self.progress * Math.PI);

          const bf = gsap.utils.interpolate(0.015, 0.0002, sharp);
          refs.turb.setAttribute("baseFrequency", `${bf.toFixed(4)} ${(bf * 2).toFixed(4)}`);

          refs.displ.setAttribute(
            "scale",
            gsap.utils.interpolate(60, 0, sharp).toFixed(1)
          );
          refs.blur.setAttribute(
            "stdDeviation",
            gsap.utils.interpolate(20, 0, sharp).toFixed(2)
          );
          refs.morph.setAttribute(
            "radius",
            gsap.utils.interpolate(7, 0, sharp).toFixed(2)
          );
          refs.glow.setAttribute(
            "stdDeviation",
            gsap.utils.interpolate(18, 0, sharp).toFixed(2)
          );
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
      imgTrigger.kill();
      t1?.kill();
      t2?.kill();
    };
  }, []);

  return (
    <>
      {/* ── SVG filters ───────────────────────────────────────── */}
      <svg
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        aria-hidden="true"
      >
        <defs>
          <filter id="morph-artists" x="-15%" y="-60%" width="130%" height="220%" colorInterpolationFilters="sRGB">
            <feTurbulence ref={aTurbRef} type="turbulence" baseFrequency="0.015 0.03" numOctaves="3" seed="8" result="noise" />
            <feDisplacementMap ref={aDisplRef} in="SourceGraphic" in2="noise" scale="60" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur ref={aBlurRef} in="displaced" stdDeviation="20" result="blurred" />
            <feMorphology ref={aMorphRef} operator="dilate" radius="7" in="blurred" result="morphed" />
            <feGaussianBlur ref={aGlowRef} in="morphed" stdDeviation="18" result="glow" />
            <feColorMatrix in="glow" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 2.5 0" result="brightGlow" />
            <feMerge><feMergeNode in="brightGlow" /><feMergeNode in="morphed" /></feMerge>
          </filter>

          <filter id="morph-quote" x="-15%" y="-60%" width="130%" height="220%" colorInterpolationFilters="sRGB">
            <feTurbulence ref={qTurbRef} type="turbulence" baseFrequency="0.015 0.03" numOctaves="3" seed="42" result="noise" />
            <feDisplacementMap ref={qDisplRef} in="SourceGraphic" in2="noise" scale="60" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur ref={qBlurRef} in="displaced" stdDeviation="20" result="blurred" />
            <feMorphology ref={qMorphRef} operator="dilate" radius="7" in="blurred" result="morphed" />
            <feGaussianBlur ref={qGlowRef} in="morphed" stdDeviation="18" result="glow" />
            <feColorMatrix in="glow" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 2.5 0" result="brightGlow" />
            <feMerge><feMergeNode in="brightGlow" /><feMergeNode in="morphed" /></feMerge>
          </filter>
        </defs>
      </svg>

      {/* ── Spacer ────────────────────────────────────────────── */}
      <div ref={spacerRef} style={{ height: "200svh", pointerEvents: "none" }} />

      {/* ── Video ─────────────────────────────────────────────── */}
      <div
        ref={videoRef}
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100svh", pointerEvents: "none", overflow: "hidden" }}
      >
        <video autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }}>
          <source src="/video/MM Hero BG_1.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── Box blanco ────────────────────────────────────────── */}
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

      {/* ── Logo ──────────────────────────────────────────────── */}
      <div ref={logoRef} style={{ position: "fixed", zIndex: 9999, pointerEvents: "none", opacity: 0 }}>
        <img src="/logo/Balearic Sound System Logo.svg" alt="MM Discos" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>

      {/* ── Imágenes flotantes (fixed, laterales) ─────────────── */}
      {IMAGE_CONFIG.map((cfg, i) => (
        <div
          key={i}
          ref={el => (imageRefs.current[i] = el)}
          style={{
            position: "fixed",
            top: cfg.top,
            ...(cfg.side === "left"
              ? { left: i % 2 === 0 ? "0vw" : "2vw" }
              : { right: i % 2 === 0 ? "0vw" : "1.5vw" }),
            width: cfg.width,
            zIndex: 5000,
            pointerEvents: "none",
            transform: `rotate(${cfg.rotation}deg)`,
            willChange: "transform, opacity",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          }}
        >
          <img
            src={cfg.src}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      ))}

      {/* ── Artistas ──────────────────────────────────────────── */}
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
            width: "50%",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(1.4rem, 2.8vw, 3.2rem)",
            fontWeight: 700, lineHeight: 1.05,
            letterSpacing: "0.01em",
            textTransform: "lowercase", textAlign: "left",
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

      {/* ── Cita ──────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative", zIndex: 10000,
          width: "100%", height: "100svh",
          display: "flex", justifyContent: "center", alignItems: "center",
        }}
      >
        <div
          ref={quoteContainerRef}
          style={{ width: "50%", display: "flex", flexDirection: "column", gap: "1rem", filter: "url(#morph-quote)" }}
        >
          <p
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(1.4rem, 2.8vw, 3.2rem)",
              fontWeight: 700, lineHeight: 1.05,
              letterSpacing: "0.01em",
              textTransform: "lowercase", textAlign: "left",
            }}
          >
            We played without rules, without thinking about styles or what would
            come next. One track could be slow, the next dark, then something pop
            or an impossible guitar, but it all made sense in that moment. The
            dancefloor didn't ask for coherence, it asked for emotion — and as
            long as people stayed there, smiling and lost, you knew you were doing
            it right.
          </p>
          <p
            style={{
              fontFamily: "'Host Grotesk', sans-serif",
              fontSize: "0.95rem", fontWeight: 450,
              letterSpacing: "0.04em",
              textTransform: "uppercase", textAlign: "left",
              opacity: 0.5,
            }}
          >
            — Dj Alfredo
          </p>
        </div>
      </section>
    </>
  );
}