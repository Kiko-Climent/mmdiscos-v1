"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

const SVH_PER_IMAGE   = 8;   // menos scroll por imagen → animación más rápida
const SURVIVOR_INDEX  = ORBITAL_IMAGES.length - 1;

// Nombres divididos para el stagger tipo FOOTER_LINKS
const ARTISTS = [
  "Asa Tate", "Daichi", "Nic Jalusi", "Pleasure Voyage", "Mogwaa", "Statues",
  "Mori Ra", "Longhair", "Kross Section", "Komodo", "Marvin & Guy", "Distance",
  "Guillaume", "Pontcho", "Saturn", "Corben", "Bonnie & Klein", "Celex",
  "Florin Büchel", "NairLess", "Hal Incandenza", "Volta Cab", "Coyote",
  "Marcello Giordani", "Albion", "Serasso", "Atlantic Brain", "Jaisiel",
  "Trepanado", "Ruf Dug", "Chida", "Franz Scala", "Sankt Göran", "The.Deal",
  "A Beat Disciple", "Jakob Mäder", "Da Silva",
];

export default function MMHeroMobileFinal() {
  /* ── Overlay refs ──────────────────────────────────────────── */
  const videoContainerRef   = useRef(null);
  const videoRef            = useRef(null);
  const boxRef              = useRef(null);
  const logoRef             = useRef(null);

  /* ── Artists text refs ─────────────────────────────────────── */
  const artistsTextRef      = useRef(null);   // contenedor fixed centrado
  const artistsSpansRef     = useRef([]);      // cada nombre como span

  /* ── Orbital refs ──────────────────────────────────────────── */
  const orbitalContainerRef = useRef(null);
  const orbitalImgsRef      = useRef([]);
  const survivorRef         = useRef(null);
  const grainFlashRef       = useRef(null);
  const sinkActiveRef       = useRef(false);

  /* ── Scroll-structure refs ─────────────────────────────────── */
  const snapBufferRef       = useRef(null);   // 100svh · absorbe el primer scroll
  const artistsProxyRef     = useRef(null);   // 100svh · trigger de salida de texto + orbital
  const carouselSpacerRef   = useRef(null);   // spacer orbital
  const quoteContainerRef   = useRef(null);   // segundo texto

  /* ── SVG filter refs (artists text) ────────────────────────── */
  const aBlurRef  = useRef(null);
  const aMorphRef = useRef(null);
  const aGlowRef  = useRef(null);

  /* ── SVG filter refs (quote) ───────────────────────────────── */
  const qBlurRef  = useRef(null);
  const qMorphRef = useRef(null);
  const qGlowRef  = useRef(null);

  const totalImages = ORBITAL_IMAGES.length;

  useEffect(() => {
    const box     = boxRef.current;
    const logo    = logoRef.current;
    const videoEl = videoRef.current;
    if (!box || !logo) return;

    /* ── Viewport congelado ──────────────────────────────────── */
    const frozenVH = window.innerHeight;
    const frozenVW = window.innerWidth;

    if (videoContainerRef.current) {
      videoContainerRef.current.style.height = `${frozenVH}px`;
    }

    const vw = frozenVW;
    const vh = frozenVH;

    /* ── Dimensiones iniciales ──────────────────────────────── */
    const mBoxW       = vw * 0.82;
    const mBoxH       = mBoxW * (9 / 16);
    const endLogoW    = 200;
    const endLogoLeft = (vw - endLogoW) / 2;

    /* ── Estado inicial: box pequeño centrado ───────────────── */
    gsap.set(box, {
      width:           mBoxW,
      height:          mBoxH,
      xPercent:        -50,
      yPercent:        -50,
      backgroundColor: "rgba(255,255,255,0.35)",
    });

    /* ── Estado inicial: logo alineado con el box ───────────── */
    gsap.set(logo, {
      top:     vh / 2 - mBoxH / 2,
      left:    (vw - mBoxW) / 2,
      width:   mBoxW,
      padding: "2.5rem",
      opacity: 1,
    });

    /* ── Estado inicial: texto artistas invisible ───────────── */
    const artistSpans = artistsSpansRef.current.filter(Boolean);
    gsap.set(artistsTextRef.current, { xPercent: -50, yPercent: -50, y: 0 });
    gsap.set(artistSpans, { opacity: 0 });
    // SVG filter arranca sin distorsión (el texto está invisible de todas formas)
    aBlurRef.current?.setAttribute("stdDeviation", "0");
    aMorphRef.current?.setAttribute("radius",       "0");
    aGlowRef.current?.setAttribute("stdDeviation",  "0");

    /* ── Preload orbital ────────────────────────────────────── */
    ORBITAL_IMAGES.forEach((src) => { const img = new Image(); img.src = src; });

    /* ── Orbital math ───────────────────────────────────────── */
    const imageEls     = orbitalImgsRef.current.filter(Boolean);
    const hero         = { vw, vh };
    const getAngle     = (i) => (i / totalImages) * Math.PI * 2 - Math.PI / 2;
    const SPIRAL_TURNS = 1.5;
    const totalRot     = SPIRAL_TURNS * Math.PI * 2;

    // Centrado una sola vez vía xPercent/yPercent (GPU transform).
    // Clip inicial: cada imagen está oculta (wipe desde la derecha).
    // La revelación NO usa opacity — clipPath wipe por imagen.
    imageEls.forEach((el) => {
      gsap.set(el, { xPercent: -50, yPercent: -50, clipPath: "inset(0% 100% 0% 0%)" });
    });

    const setOrbitalProgress = (rawP) => {
      const p        = Math.max(0, Math.min(1, rawP));
      const { vw: w, vh: h } = hero;
      const diagonal = Math.sqrt((w / 2) ** 2 + (h / 2) ** 2);

      // startR > diagonal garantiza que todas las imágenes (incluidas las del eje Y,
      // que necesitan radio > vh/2) empiezan fuera de la pantalla visible.
      // diagonal * 1.3 ≈ 605px en iPhone estándar → off-screen en todos los ángulos.
      const startR   = diagonal * 1.3;

      const eR = Math.pow(p, 1.3);
      const eA = Math.pow(p, 1.1);
      const eS = Math.pow(p, 0.55);
      const sc = 0.08 + 0.92 * eS;

      imageEls.forEach((el, i) => {
        const base  = getAngle(i);
        const angle = base + totalRot * eA;
        const r     = startR * (1 - eR);

        // x/y son CSS transform translateX/Y → 100% GPU, sin reflow de layout
        gsap.set(el, {
          x:     Math.cos(angle) * r,
          y:     Math.sin(angle) * r,
          scale: sc,
        });
      });
    };

    setOrbitalProgress(0);
    gsap.set(orbitalContainerRef.current, { opacity: 0 });

    /* ── Sink animation (survivor) ──────────────────────────── */
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
          gsap.set(others, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" });
          gsap.set(survivor, { scale: 1, opacity: 1, clipPath: "inset(0% 0% 0% 0%)" });
          sinkActiveRef.current = false;
        },
      });

      if (grainFlashRef.current) {
        tl.fromTo(
          grainFlashRef.current,
          { opacity: 0 },
          { opacity: 0.22, duration: 0.07, ease: "none", yoyo: true, repeat: 1 }
        );
      }

      tl.to(survivor, { scale: 1.02, duration: 0.12, ease: "power1.out" }, "<0.04");
      tl.to(survivor, { scale: 0, opacity: 0, duration: 0.9, ease: "power3.in" });
    };

    const showOrbital = () => {
      gsap.set(orbitalContainerRef.current, { opacity: 1 });
      gsap.fromTo(
        imageEls,
        { clipPath: "inset(0% 100% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.55,
          ease:     "expo.out",
          stagger:  { each: 0.055, from: "random" },
        }
      );
    };

    const hideOrbital = () => {
      if (!sinkActiveRef.current) {
        gsap.set(orbitalContainerRef.current, { opacity: 0 });
        gsap.set(imageEls, { clipPath: "inset(0% 100% 0% 0%)" });
      }
    };

    /* ── Snap animation (primer scroll) ─────────────────────── */
    let snapFired = false;

    const revealArtistsText = () => {
      window.dispatchEvent(new Event("mm-hero-logo-settled"));

      // ── Filtro SVG: arranca muy distorsionado y se limpia mientras aparece el texto
      aBlurRef.current?.setAttribute("stdDeviation", "7");
      aMorphRef.current?.setAttribute("radius",       "2");
      aGlowRef.current?.setAttribute("stdDeviation",  "4");

      const fProxy = { t: 0 };
      gsap.to(fProxy, {
        t:        1,
        duration: 1.4,
        ease:     "power3.out",
        onUpdate() {
          const a = 1 - fProxy.t;
          aBlurRef.current?.setAttribute("stdDeviation", (7   * a).toFixed(4));
          aMorphRef.current?.setAttribute("radius",       (2   * a).toFixed(4));
          aGlowRef.current?.setAttribute("stdDeviation",  (4   * a).toFixed(4));
        },
        onComplete() {
          aBlurRef.current?.setAttribute("stdDeviation", "0");
          aMorphRef.current?.setAttribute("radius",       "0");
          aGlowRef.current?.setAttribute("stdDeviation",  "0");
        },
      });

      // ── Nombres: aparecen en orden aleatorio (stagger from:random)
      gsap.fromTo(
        artistSpans,
        { opacity: 0 },
        {
          opacity:  1,
          duration: 0.85,
          ease:     "power3.out",
          stagger:  { each: 0.04, from: "random" },
        }
      );
    };

    const fireSnapAnimation = () => {
      if (snapFired) return;
      snapFired = true;
      window.removeEventListener("wheel",     fireSnapAnimation);
      window.removeEventListener("touchmove", fireSnapAnimation);

      const tl = gsap.timeline({ onComplete: revealArtistsText });

      // Fase 0 — video sale antes de que el blanco lo tape
      if (videoEl) {
        tl.to(videoEl, { opacity: 0, duration: 0.18, ease: "expo.in" }, 0);
      }

      // Fase 1 — box expande el ancho (corte horizontal rápido)
      tl.to(box, {
        width:    vw,
        duration: 0.22,
        ease:     "expo.out",
      }, 0);

      // Fase 2 — box abre la altura y sella con blanco opaco
      tl.to(box, {
        height:          vh,
        backgroundColor: "rgba(255,255,255,1)",
        duration:        0.38,
        ease:            "expo.out",
      }, 0.18);

      // Fase 3 — logo desliza al center-top con el mismo impulso expo
      tl.to(logo, {
        top:      0,
        left:     endLogoLeft,
        width:    endLogoW,
        duration: 0.42,
        ease:     "expo.out",
      }, 0.22);
    };

    window.addEventListener("wheel",     fireSnapAnimation, { passive: true });
    window.addEventListener("touchmove", fireSnapAnimation, { passive: true });

    // Refresca GSAP ScrollTrigger ahora que el DOM mobile está montado
    // (el hero se monta en un segundo render tras detectar isMobile)
    ScrollTrigger.refresh();

    /* ── Texto artistas: salida por el top con scrub ─────────── */
    //  trigger: artistsProxy (empieza en 60svh de scroll, dura 70svh)
    //  start:   "top top"    → proxy llega al top del viewport (scroll ≈ 60vh)
    //  end:     "bottom top" → proxy sale completamente (scroll ≈ 130vh)
    //  Durante esas 70vh el texto sube de y:0 a y:-120vh (en px, fiable con GSAP)
    const textExitTrigger = ScrollTrigger.create({
      trigger:             artistsProxyRef.current,
      start:               "top top",
      end:                 "bottom top",
      scrub:               1.5,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        // Translación hacia el top
        gsap.set(artistsTextRef.current, { y: -p * vh * 1.2 });

        // Filtro SVG — misma curva que la segunda cita en su fase de salida.
        // Exponent 0.5 (raíz cuadrada) → efecto arranca muy pronto,
        // al 25% del scroll ya estamos al 50% de distorsión máxima.
        const a = Math.pow(p, 0.5);
        aBlurRef.current?.setAttribute("stdDeviation", (9   * a).toFixed(4));
        aMorphRef.current?.setAttribute("radius",       (2.5 * a).toFixed(4));
        aGlowRef.current?.setAttribute("stdDeviation",  (5   * a).toFixed(4));
      },
      onLeaveBack: () => {
        gsap.set(artistsTextRef.current, { y: 0 });
        aBlurRef.current?.setAttribute("stdDeviation",  "0");
        aMorphRef.current?.setAttribute("radius",        "0");
        aGlowRef.current?.setAttribute("stdDeviation",   "0");
      },
    });

    /* ── ScrollTrigger orbital ───────────────────────────────── */
    const orbitalTrigger = ScrollTrigger.create({
      trigger:             artistsProxyRef.current,
      start:               "top bottom",  // empieza cuando el proxy entra en viewport
      endTrigger:          carouselSpacerRef.current,
      end:                 "bottom top",
      scrub:               1.8,           // más reactivo que 2.5
      invalidateOnRefresh: true,
      onLeave:             triggerSinkAnimation,
      onEnterBack:         showOrbital,
      onLeaveBack:         hideOrbital,
      onUpdate:            (self) => setOrbitalProgress(self.progress),
    });

    // Las imágenes se muestran en cuanto el texto empieza a salir por el top
    const orbitalVisibilityTrigger = ScrollTrigger.create({
      trigger:     artistsProxyRef.current,
      start:       "top top",
      onEnter:     showOrbital,
      onLeaveBack: hideOrbital,
    });

    /* ── Morph reveal (segundo texto / cita) ─────────────────── */
    const createMorphReveal = (el, refs) => {
      if (!el || !refs.blur || !refs.morph || !refs.glow) return null;
      refs.blur.setAttribute("stdDeviation", "5");
      refs.morph.setAttribute("radius", "1.5");
      refs.glow.setAttribute("stdDeviation", "3.5");
      gsap.set(el, { opacity: 1 });
      return ScrollTrigger.create({
        trigger: el,
        start:   "top 95%",
        end:     "top -5%",
        scrub:   5,
        onUpdate: (self) => {
          const p = self.progress;
          let sharp;
          if (p <= 0.4)        sharp = p / 0.4;
          else if (p <= 0.78)  sharp = 1;
          else                 sharp = 1 - (p - 0.78) / 0.22;
          const a = Math.pow(Math.max(0, 1 - sharp), 1.5);
          refs.blur.setAttribute("stdDeviation",  (5   * a).toFixed(4));
          refs.morph.setAttribute("radius",       (1.5 * a).toFixed(4));
          refs.glow.setAttribute("stdDeviation",  (3.5 * a).toFixed(4));
        },
      });
    };

    const quoteTrigger = createMorphReveal(quoteContainerRef.current, {
      blur:  qBlurRef.current,
      morph: qMorphRef.current,
      glow:  qGlowRef.current,
    });

    /* ── visualViewport resize (barra del navegador móvil) ───── */
    const onVVResize = () => {
      hero.vw = window.innerWidth;
      hero.vh = frozenVH;
      if (videoContainerRef.current) {
        videoContainerRef.current.style.height = `${frozenVH}px`;
      }
      ScrollTrigger.refresh();
    };
    window.visualViewport?.addEventListener("resize", onVVResize);

    return () => {
      window.removeEventListener("wheel",     fireSnapAnimation);
      window.removeEventListener("touchmove", fireSnapAnimation);
      window.visualViewport?.removeEventListener("resize", onVVResize);
      textExitTrigger.kill();
      orbitalTrigger.kill();
      orbitalVisibilityTrigger.kill();
      quoteTrigger?.kill();
    };
  }, []);

  return (
    <>
      {/* ── SVG morph filters ─────────────────────────────────── */}
      <svg
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        aria-hidden="true"
      >
        <defs>
          {/* Filtro: primer texto (artistas) */}
          <filter
            id="morph-artists-mobile"
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

          {/* Filtro: segundo texto (cita) */}
          <filter
            id="morph-quote-mobile"
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

      {/* ═══════════════════════════════════════════════════════════
          FLUJO NORMAL DE SCROLL — crea la altura de la página
          ═══════════════════════════════════════════════════════════ */}

      {/* Zona snap: 60svh absorbe scroll mientras la animación corre */}
      <div ref={snapBufferRef} style={{ height: "60svh", pointerEvents: "none" }} />

      {/* Proxy artistas: 70svh — salida del texto y arranque orbital */}
      <div ref={artistsProxyRef} style={{ height: "70svh", pointerEvents: "none" }} />

      {/* Spacer orbital */}
      <div
        ref={carouselSpacerRef}
        style={{ height: `${totalImages * SVH_PER_IMAGE}svh`, pointerEvents: "none" }}
      />

      {/* Gap */}
      <div style={{ height: "40svh", pointerEvents: "none" }} />

      {/* Cita / segundo texto */}
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
            width: "90%",
            display: "flex", flexDirection: "column", gap: "1rem",
            filter: "url(#morph-quote-mobile)",
          }}
        >
          <p style={{
            fontFamily:    "'Barlow Condensed', sans-serif",
            fontSize:      "clamp(1.3rem, 5vw, 2.2rem)",
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

      {/* ═══════════════════════════════════════════════════════════
          OVERLAYS FIJOS — siempre en pantalla, z-index gestionado
          ═══════════════════════════════════════════════════════════ */}

      {/* Video background */}
      <div
        ref={videoContainerRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: "100%", height: "100svh",   // sobreescrito a px en el effect
          // sin zIndex explícito: z:auto → pinta antes que gallery (z:0) en tree-order
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

      {/* Box blanco — crece hasta cubrir toda la pantalla en el snap */}
      <div
        ref={boxRef}
        style={{
          position:        "fixed",
          top:             "50%",
          left:            "50%",
          // transform gestionado 100% por GSAP (xPercent/yPercent)
          width:           "82vw",
          backgroundColor: "rgba(255,255,255,0.35)",
          backdropFilter:  "blur(3px)",
          pointerEvents:   "none",
          // sin zIndex explícito: z:auto → mismo grupo que video, box pinta sobre video
          // (orden en árbol DOM), y la gallery (z:0) vendrá después en el árbol y
          // pintará sobre el box — igual que en MMDiscosHeroFinal3
        }}
      />

      {/* Logo — estructura negro/blanco para la cortina del About en _app.js */}
      <div
        id="mm-hero-animated-logo"
        ref={logoRef}
        style={{
          position:  "fixed",
          zIndex:    9999,
          pointerEvents: "none",
          isolation: "isolate",
        }}
      >
        {/* Imagen fantasma que fija el tamaño del contenedor */}
        <img
          src="/logo/Balearic Sound System Logo.svg"
          alt=""
          aria-hidden
          style={{
            width:         "100%",
            height:        "auto",
            display:       "block",
            opacity:       0,
            pointerEvents: "none",
          }}
        />
        {/* Capa negra */}
        <div
          className="logo-layer-black"
          style={{
            position:  "absolute",
            inset:     "2.5rem",
            pointerEvents: "none",
            clipPath:  "inset(0 0 0 0)",
          }}
        >
          <img
            src="/logo/Balearic Sound System Logo.svg"
            alt="" aria-hidden
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        </div>
        {/* Capa blanca (invertida) — revelada por la cortina del About */}
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
            style={{
              width:        "100%",
              height:       "100%",
              objectFit:    "contain",
              display:      "block",
              filter:       "invert(1)",
            }}
          />
        </div>
      </div>

      {/* Primer texto (artistas) — fijo y centrado, sale por el top con scroll */}
      {/*
        IMPORTANTE: willChange:"transform" y filter SVG NO pueden coexistir en el mismo
        elemento en WebKit/Safari mobile (el filtro no renderiza en capas composited).
        Solución: outer div gestiona el transform (y scrub), inner div lleva el filtro SVG.
      */}
      <div
        ref={artistsTextRef}
        style={{
          position:      "fixed",
          top:           "50%",
          left:          "50%",
          width:         "90%",
          zIndex:        9000,
          pointerEvents: "none",
          willChange:    "transform",   // solo transform, sin filter aquí
        }}
      >
        {/* Inner: el filtro SVG en un elemento NO composited */}
        <div style={{ filter: "url(#morph-artists-mobile)" }}>
        <p
          style={{
            fontFamily:    "'Barlow Condensed', sans-serif",
            fontSize:      "clamp(1.1rem, 4.5vw, 1.9rem)",
            fontWeight:    700,
            lineHeight:    1.1,
            letterSpacing: "0.01em",
            textTransform: "lowercase",
            textAlign:     "center",
          }}
        >
          {ARTISTS.map((name, i) => (
            <span
              key={i}
              ref={(el) => { artistsSpansRef.current[i] = el; }}
            >
              {name}{i < ARTISTS.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
        </div>{/* /inner filter div */}
      </div>

      {/* Imágenes orbitales */}
      <div
        ref={orbitalContainerRef}
        style={{
          position:      "fixed",
          top: 0, left: 0,
          width:         "100%",
          height:        "100svh",
          zIndex:        8000,
          pointerEvents: "none",
          opacity:       0,
          willChange:    "opacity",         // fade in/out del contenedor
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
              // Ancla en el centro del contenedor — GSAP mueve con x/y (transforms, GPU)
              left:        "50%",
              top:         "50%",
              // Imágenes más grandes: de ~120px → ~280px
              width:       "clamp(200px, 56vw, 340px)",
              aspectRatio: "1 / 1",
              // Solo transform: sin reflow de left/top en cada frame
              willChange:  "transform",
            }}
          >
            <img
              src={src}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        ))}

        {/* Flash analógico de un frame */}
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
