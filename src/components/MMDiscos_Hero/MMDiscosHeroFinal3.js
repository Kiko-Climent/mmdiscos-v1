"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const isDesktop = typeof window !== "undefined" && window.innerWidth >= 720;

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

// svh de scroll para la zona de convergencia orbital
const SVH_PER_IMAGE = 15;

// Índice de la imagen que sobrevive y se hunde al vacío
const SURVIVOR_INDEX = ORBITAL_IMAGES.length - 1;

export default function MMDiscosHeroFinal3() {
  const spacerRef          = useRef(null);
  const boxRef             = useRef(null);
  const logoRef            = useRef(null);
  const videoRef           = useRef(null);
  const artistsSectionRef  = useRef(null);
  const artistsRef         = useRef(null);
  const carouselSpacerRef  = useRef(null);
  const quoteContainerRef  = useRef(null);

  // Orbital refs
  const orbitalContainerRef = useRef(null);
  const orbitalImgsRef      = useRef([]);
  const survivorRef         = useRef(null);
  const grainFlashRef       = useRef(null);

  // Flag para evitar que el sink-animation se dispare más de una vez por paso
  const sinkActiveRef = useRef(false);

  const totalImages = ORBITAL_IMAGES.length;

  const aBlurRef  = useRef(null);
  const aMorphRef = useRef(null);
  const aGlowRef  = useRef(null);

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
          if (p <= 0.4)        sharp = p / 0.4;
          else if (p <= 0.78)  sharp = 1;
          else                 sharp = 1 - (p - 0.78) / 0.22;
          const a = Math.pow(Math.max(0, 1 - sharp), 1.5);
          refs.blur.setAttribute("stdDeviation", (5 * a).toFixed(4));
          refs.morph.setAttribute("radius", (1.5 * a).toFixed(4));
          refs.glow.setAttribute("stdDeviation", (3.5 * a).toFixed(4));
        },
      });
    };

    /* ── Preload ─────────────────────────────────────────── */
    ORBITAL_IMAGES.forEach((src) => { const img = new Image(); img.src = src; });

    /* ── Orbital convergence setup ───────────────────────── */
    const imageEls = orbitalImgsRef.current.filter(Boolean);

    const centerX = vw / 2;
    const centerY = vh / 2;

    const diagonal    = Math.sqrt((vw / 2) ** 2 + (vh / 2) ** 2);
    const imgPx       = isDesktop
      ? Math.min(420, Math.round(vw * 0.22))
      : Math.min(200, Math.round(vw * 0.32));
    const startRadius = diagonal + imgPx * 0.6;

    const getAngle = (i) => (i / totalImages) * Math.PI * 2 - Math.PI / 2;

    imageEls.forEach((el) => gsap.set(el, { xPercent: -50, yPercent: -50 }));

    const SPIRAL_TURNS   = 1.5;
    const totalRotation  = SPIRAL_TURNS * Math.PI * 2;

    const setOrbitalProgress = (rawP) => {
      const p = Math.max(0, Math.min(1, rawP));

      const easedRadius = Math.pow(p, 1.3);
      const easedAngle  = Math.pow(p, 1.1);
      const easedScale  = Math.pow(p, 0.55);

      const scale = 0.08 + 0.92 * easedScale;

      imageEls.forEach((el, i) => {
        const baseAngle    = getAngle(i);
        const currentAngle = baseAngle + totalRotation * easedAngle;
        const radius       = startRadius * (1 - easedRadius);

        gsap.set(el, {
          left:  centerX + Math.cos(currentAngle) * radius,
          top:   centerY + Math.sin(currentAngle) * radius,
          scale,
        });
      });
    };

    // Posición inicial
    setOrbitalProgress(0);
    gsap.set(orbitalContainerRef.current, { opacity: 0 });

    /* ── Animación de hundimiento (survivor) ─────────────── */
    /*
     * Cuando la convergencia termina:
     * 1. Todas las imágenes excepto la survivor se desvanecen al instante.
     * 2. La survivor, ya centrada en pantalla, hace un micro-hold (escala 1)
     *    y luego se hunde hacia el fondo: scale → 0, con un ease power3.in
     *    que simula gravedad/profundidad. Nada de flash ni efectos extra —
     *    el hundimiento limpio es más brutal que cualquier artificio.
     * 3. El grain flash (overlay blanco semitransparente) hace un único parpadeo
     *    al inicio del hundimiento — como un frame quemado de película.
     */
    const triggerSinkAnimation = () => {
      if (sinkActiveRef.current) return;
      sinkActiveRef.current = true;

      const others   = imageEls.filter((_, i) => i !== SURVIVOR_INDEX);
      const survivor = survivorRef.current;
      if (!survivor) return;

      // Aseguramos visibilidad del container durante la animación
      gsap.set(orbitalContainerRef.current, { opacity: 1 });

      // Las demás desaparecen bruscamente
      gsap.set(others, { opacity: 0 });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(orbitalContainerRef.current, { opacity: 0 });
          // Reset para si el usuario hace scroll back
          gsap.set(others, { opacity: 1 });
          gsap.set(survivor, { scale: 1, opacity: 1 });
          sinkActiveRef.current = false;
        },
      });

      // Flash de un frame: proyector analógico
      if (grainFlashRef.current) {
        tl.fromTo(
          grainFlashRef.current,
          { opacity: 0 },
          { opacity: 0.22, duration: 0.07, ease: "none", yoyo: true, repeat: 1 }
        );
      }

      // Micro-hold: la imagen respira un frame antes de caer
      tl.to(survivor, {
        scale: 1.02,
        duration: 0.12,
        ease: "power1.out",
      }, "<0.04");

      // Hundimiento: cae hacia el fondo hasta desaparecer
      // scale → 0  (se empequeñece como si se alejara al infinito)
      // opacity: fade suave en la última parte del recorrido
      tl.to(survivor, {
        scale:   0,
        opacity: 0,
        duration: 0.9,
        ease: "power3.in",
      });
    };

    /* ── Visibilidad orbital ─────────────────────────────── */
    const showOrbital = () =>
      gsap.to(orbitalContainerRef.current, { opacity: 1, duration: 0.5, ease: "power2.out" });

    const hideOrbital = () => {
      // Solo ocultamos sin animación si el sink ya terminó o no ha empezado
      if (!sinkActiveRef.current) {
        gsap.set(orbitalContainerRef.current, { opacity: 0 });
      }
    };

    /* ── ScrollTrigger orbital ───────────────────────────── */
    const orbitalTrigger = ScrollTrigger.create({
      trigger:             artistsRef.current,
      start:               "top 95%",
      endTrigger:          carouselSpacerRef.current,
      end:                 "bottom top",
      scrub:               2.5,
      invalidateOnRefresh: true,
      onLeave:             triggerSinkAnimation,  // convergencia completa → hundimiento
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

    /* ── MÓVIL ───────────────────────────────────────────── */
    if (!isDesktop) {
      const mBoxW       = vw * 0.82;
      const mBoxH       = mBoxW * (9 / 16);
      const endLogoW    = 160;
      const endLogoLeft = (vw - endLogoW) / 2;

      gsap.set(box, {
        width: mBoxW, height: mBoxH,
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "rgba(255,255,255,0.35)",
      });
      gsap.set(logo, {
        width: mBoxW,
        left:  (vw - mBoxW) / 2,
        top:   vh / 2 - mBoxH / 2,
        padding: "1.5rem",
        opacity: 1,
      });

      const mobileTrigger = ScrollTrigger.create({
        trigger: spacer,
        start:   "top top",
        end:     `+=${vh}px`,
        scrub:   1,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(box, {
            width:  gsap.utils.interpolate(mBoxW, vw, p),
            height: gsap.utils.interpolate(mBoxH, vh, p),
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: `rgba(255,255,255,${gsap.utils.interpolate(0.35, 1, p)})`,
          });
          gsap.set(logo, {
            top:   gsap.utils.interpolate(vh / 2 - mBoxH / 2, 0, p),
            left:  gsap.utils.interpolate((vw - mBoxW) / 2, endLogoLeft, p),
            width: gsap.utils.interpolate(mBoxW, endLogoW, p),
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
        mobileTrigger.kill();
        orbitalTrigger.kill();
        orbitalVisibilityTrigger.kill();
        t1?.kill();
        t2?.kill();
      };
    }

    /* ── DESKTOP ─────────────────────────────────────────── */
    const boxW    = box.offsetWidth;
    const boxH    = box.offsetHeight;
    const boxLeft = (vw - boxW) / 2;
    const boxTop  = (vh - boxH) / 2;

    gsap.set(logo, {
      left:    boxLeft,
      width:   boxW,
      padding: "2.5rem",
      top:     "auto",
      bottom:  vh - (boxTop + boxH),
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

    const logoTrigger = ScrollTrigger.create({
      trigger: spacer,
      start:   "top top",
      end:     `+=${vh}px`,
      scrub:   1,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(box, {
          width:           gsap.utils.interpolate(boxW, vw, p),
          height:          gsap.utils.interpolate(boxH, vh, p),
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

      {/* ── Box blanco ───────────────────────────────────────── */}
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

      {/* ── Logo ─────────────────────────────────────────────── */}
      <div ref={logoRef} style={{ position: "fixed", zIndex: 9999, pointerEvents: "none", opacity: 0 }}>
        <img
          src="/logo/Balearic Sound System Logo.svg"
          alt="MM Discos"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      {/* ── Orbital images ───────────────────────────────────── */}
      <div
        ref={orbitalContainerRef}
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100%", height: "100svh",
          zIndex: 8000,
          pointerEvents: "none",
          opacity: 0,
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
              position: "absolute",
              width:       "clamp(140px, 22vw, 420px)",
              aspectRatio: "1 / 1",
              willChange:  "transform, left, top",
            }}
          >
            <img
              src={src}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        ))}

        {/* Flash de un frame — proyector analógico */}
        <div
          ref={grainFlashRef}
          style={{
            position: "absolute",
            inset: 0,
            background: "#ffffff",
            opacity: 0,
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Artistas: primer bloque de texto ─────────────────── */}
      <section
        ref={artistsSectionRef}
        style={{
          position: "relative", zIndex: 10000,
          width: "100%", minHeight: "100svh",
          display: "flex", justifyContent: "center",
          alignItems: "center", padding: "2.5rem 0",
        }}
      >
        <p
          ref={artistsRef}
          style={{
            width: isDesktop ? "70%" : "90%",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(1.4rem, 2.8vw, 3.2rem)",
            fontWeight: 700, lineHeight: 1.05,
            letterSpacing: "0.01em",
            textTransform: "lowercase", textAlign: "center",
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

      {/* ── Orbital spacer ───────────────────────────────────── */}
      <div
        ref={carouselSpacerRef}
        style={{ height: `${totalImages * SVH_PER_IMAGE}svh`, pointerEvents: "none" }}
      />

      {/* ── Gap ──────────────────────────────────────────────── */}
      <div style={{ height: "60svh", pointerEvents: "none" }} />

      {/* ── Cita ─────────────────────────────────────────────── */}
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
            width: isDesktop ? "65%" : "90%",
            display: "flex", flexDirection: "column", gap: "1rem",
            filter: "url(#morph-quote)",
          }}
        >
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(1.4rem, 2.8vw, 3.2rem)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "0.01em",
            textTransform: "lowercase",
            textAlign: "left",
          }}>
            {"We played without rules, without thinking about styles or what would come next. One track could be slow, the next dark, then something pop or an impossible guitar, but it all made sense in that moment. The dancefloor didn't ask for coherence, it asked for emotion — and as long as people stayed there, smiling and lost, you knew you were doing it right."}
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