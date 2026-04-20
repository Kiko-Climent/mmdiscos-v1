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

/** Misma caja que `.mm-global-logo-nav` en globals.css — debe coincidir al terminar la animación. */
const GLOBAL_LOGO_PADDING = "1rem 2.5rem 2.5rem";
const GLOBAL_LOGO_LAYER_INSET = "1rem 2.5rem 2.5rem 2.5rem";

/** Ancho final del logo: desktop 250px (globals), móvil 200px (media query `.mm-global-logo-nav`). */
const LOGO_END_WIDTH_DESKTOP = 250;
const LOGO_END_WIDTH_MOBILE = 200;

/** Factor de ajuste fino sobre el fitScale (< 1 = pequeño margen interior, = 1 = toca los bordes).
 *  Se multiplica por Math.min(fitW, fitH) para que el logo encuadre perfectamente dentro del blur box. */
const LOGO_FIT_FACTOR = 0.96;

export default function MMDiscosHeroFinal5() {
  const spacerRef          = useRef(null);
  const boxRef             = useRef(null);
  const logoRef            = useRef(null);
  const videoRef           = useRef(null);
  const videoContainerRef  = useRef(null); // FIX: ref separado para el contenedor del video
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
    const videoEl = videoRef.current;
    if (!box || !logo || !spacer) return;

    // FIX 3: Congelar la altura del viewport en el primer paint, antes de que
    // cualquier scroll dinámico la modifique. Esto evita el salto que ocurre
    // en Android cuando la barra del navegador desaparece al hacer scroll.
    const frozenVH = window.innerHeight;
    const frozenVW = window.innerWidth;

    // FIX 1: Fijar la altura del contenedor del video en px (no svh) para que
    // no cambie cuando la barra del navegador se oculta, evitando la barra blanca.
    if (videoContainerRef.current) {
      videoContainerRef.current.style.height = `${frozenVH}px`;
    }

    /** Altura/anchura visibles del hero: usa el viewport congelado para evitar
     *  el re-layout cuando la barra del navegador aparece/desaparece. */
    const getHeroViewport = () => {
      if (videoEl) {
        const r = videoEl.getBoundingClientRect();
        if (r.width > 0) return { vw: r.width, vh: frozenVH };
      }
      return { vw: frozenVW, vh: frozenVH };
    };

    const hero = { ...getHeroViewport() };
    let { vw, vh } = hero;
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

    const getAngle = (i) => (i / totalImages) * Math.PI * 2 - Math.PI / 2;

    imageEls.forEach((el) => gsap.set(el, { xPercent: -50, yPercent: -50 }));

    const SPIRAL_TURNS   = 1.5;
    const totalRotation  = SPIRAL_TURNS * Math.PI * 2;

    const setOrbitalProgress = (rawP) => {
      const p = Math.max(0, Math.min(1, rawP));
      const { vw: w, vh: h } = hero;
      const diagonal = Math.sqrt((w / 2) ** 2 + (h / 2) ** 2);
      const imgPx = isDesktop
        ? Math.min(420, Math.round(w * 0.22))
        : Math.min(200, Math.round(w * 0.32));
      const startRadius = diagonal + imgPx * 0.6;

      const easedRadius = Math.pow(p, 1.3);
      const easedAngle  = Math.pow(p, 1.1);
      const easedScale  = Math.pow(p, 0.55);

      const scale = 0.08 + 0.92 * easedScale;

      imageEls.forEach((el, i) => {
        const baseAngle    = getAngle(i);
        const currentAngle = baseAngle + totalRotation * easedAngle;
        const radius       = startRadius * (1 - easedRadius);

        // x/y desde el centro (left:50%/top:50% en CSS) → GPU transform, cero layout reflow
        gsap.set(el, {
          x: Math.cos(currentAngle) * radius,
          y: Math.sin(currentAngle) * radius,
          scale,
        });
      });
    };

    // Posición inicial
    setOrbitalProgress(0);
    gsap.set(orbitalContainerRef.current, { opacity: 0 });

    /* ── Animación de hundimiento (survivor) ─────────────── */
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
          gsap.set(survivor, { scale: 1, opacity: 1 });
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

      tl.to(survivor, {
        scale: 1.02,
        duration: 0.12,
        ease: "power1.out",
      }, "<0.04");

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

    /* ── MÓVIL ─────────────────────────────────────────────
       Misma estrategia que desktop: box = vw×vh + scaleX/scaleY; logo = ancho fijo + y + scale (GPU). */
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
          width:           ww,
          height:          hh,
          xPercent:        -50,
          yPercent:        -50,
          scaleX:          mobileStartScaleX,
          scaleY:          mobileStartScaleY,
          backgroundColor: "rgba(255,255,255,0.35)",
        });

        // width/padding/transformOrigin: propiedades de layout → CSS directo, nunca animadas por GSAP
        logo.style.width           = `${endLogoW}px`;
        logo.style.padding         = GLOBAL_LOGO_PADDING;
        logo.style.transformOrigin = "top center";
        // GSAP solo para transforms (x, y, scale) y opacity
        gsap.set(logo, { x: endLogoLeft, y: 0, scale: 1, opacity: 1 });

        const B = box.getBoundingClientRect();
        const L = logo.getBoundingClientRect();
        if (B.width <= 0 || B.height <= 0 || L.width <= 0 || L.height <= 0) return;
        // fitScale: la dimensión más restrictiva controla la escala → logo siempre dentro del blur box
        mobileLogoStartScale = Math.min(B.width / L.width, B.height / L.height) * LOGO_FIT_FACTOR;
        const scaledH = L.height * mobileLogoStartScale;
        mobileLogoStartY = B.top + (B.height - scaledH) / 2;
        gsap.set(logo, { y: mobileLogoStartY, scale: mobileLogoStartScale });
      };

      const applyMobileHeroFrame = (self) => {
        const p = self.progress;
        const ww = w();
        const hh = h();

        gsap.set(box, {
          scaleX:          gsap.utils.interpolate(mobileStartScaleX, 1, p),
          scaleY:          gsap.utils.interpolate(mobileStartScaleY, 1, p),
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

        // FIX 2: Al recalcular en el resize del visualViewport, actualizamos hero
        // pero mantenemos frozenVH para que el box/logo no salten.
        // Solo actualizamos vw por si rota el dispositivo; vh siempre es frozenVH.
        const currentVW = window.innerWidth;
        hero.vw = currentVW;
        hero.vh = frozenVH;

        // FIX 1: Sincroniza también la altura del contenedor del video
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
        setOrbitalProgress(orbitalTrigger.progress);

        requestAnimationFrame(() => {
          syncMobileLogoToBlurBox();
          applyMobileHeroFrame(mobileTrigger);
          ScrollTrigger.refresh();
        });
      };

      setupMobileTrigger();

      let resizeObserver = null;
      if (videoEl && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          // FIX: el ResizeObserver del videoEl puede dispararse cuando la barra
          // del navegador cambia el layout. No recalculamos frozenVH aquí —
          // solo refrescamos ScrollTrigger para que las posiciones de scroll
          // sean correctas, sin reasignar hero.vh.
          ScrollTrigger.refresh();
        });
        resizeObserver.observe(videoEl);
      }

      // FIX 2: visualViewport.resize es el evento correcto para saber cuándo
      // la barra del navegador se oculta/muestra en Android. Actualizamos hero.vw
      // por si hay rotación, pero hero.vh siempre mantiene frozenVH.
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
        orbitalTrigger.kill();
        orbitalVisibilityTrigger.kill();
        t1?.kill();
        t2?.kill();
      };
    }

    /* ── DESKTOP ─────────────────────────────────────────── */
    // Dimensiones del box calculadas matemáticamente (no leemos offsetWidth,
    // porque GSAP va a sobreescribir width/height de todas formas).
    const boxW   = vw * 0.30;        // blur box inicial (30% del viewport)
    const boxH   = boxW * (9 / 16);  // ratio 16/9

    const endWidth = LOGO_END_WIDTH_DESKTOP;
    const endLeft  = (vw - endWidth) / 2;  // = calc(50% - 125px)

    // Box: tamaño completo fijo en el DOM, escala inicial = tamaño visual del box.
    // Animar scaleX/scaleY → GPU puro, cero width/height durante el scrub.
    const startScaleX = boxW / vw;
    const startScaleY = boxH / vh;

    gsap.set(box, {
      width:    vw,
      height:   vh,
      xPercent: -50,
      yPercent: -50,
      scaleX:   startScaleX,
      scaleY:   startScaleY,
    });

    // Logo: pivot en "top center" → el borde superior sigue exactamente a `y`,
    // y el centro horizontal siempre en vw/2 independientemente del scale.
    // Solo animamos y + scale → cero top/left/width durante el scrub.
    let startScale = boxW / endWidth;
    let startY = 0;
    const syncLogoToBlurBox = () => {
      // width/padding/transformOrigin: propiedades de layout → CSS directo, nunca animadas por GSAP
      logo.style.width           = `${endWidth}px`;
      logo.style.padding         = GLOBAL_LOGO_PADDING;
      logo.style.transformOrigin = "top center";
      // GSAP solo para transforms (x, y, scale) y opacity
      gsap.set(logo, { x: endLeft, y: 0, scale: 1, opacity: 1 });
      const B = box.getBoundingClientRect();
      const L = logo.getBoundingClientRect();
      if (B.width <= 0 || B.height <= 0 || L.width <= 0 || L.height <= 0) return;
      // fitScale: la dimensión más restrictiva controla la escala → logo siempre dentro del blur box
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
        // Box: solo scale — cero width/height — GPU composite puro
        gsap.set(box, {
          scaleX:          gsap.utils.interpolate(startScaleX, 1, p),
          scaleY:          gsap.utils.interpolate(startScaleY, 1, p),
          backgroundColor: `rgba(255,255,255,${gsap.utils.interpolate(0.35, 1, p)})`,
        });
        // Logo: solo y + scale — cero top/left/width — GPU composite puro
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
      {/*
        FIX: Se usa videoContainerRef para fijar la altura en px via JS al montar,
        evitando que 100svh cambie cuando la barra del navegador se oculta en Android
        y aparezca la barra blanca inferior.
      */}
      <div
        ref={videoContainerRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: "100%",
          height: "100svh", // sobreescrito a px en el useEffect
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
      {/* width/height/transform: gestionados 100% por GSAP (scaleX/scaleY + xPercent/yPercent) */}
      <div
        ref={boxRef}
        style={{
          position:        "fixed",
          top:             "50%",
          left:            "50%",
          backgroundColor: "rgba(255,255,255,0.35)",
          backdropFilter:  "blur(3px)",
          pointerEvents:   "none",
        }}
      />

      {/* ── Logo ─────────────────────────────────────────────── */}
      {/* top:0/left:0 anclan el origen; x/y/scale gestionados por GSAP */}
      <div
        id="mm-hero-animated-logo"
        ref={logoRef}
        style={{
          position:  "fixed",
          top:       0,
          left:      0,
          zIndex:    9999,
          pointerEvents: "none",
          opacity:   0,
          isolation: "isolate",
        }}
      >
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
        <div
          className="logo-layer-black"
          style={{ position: "absolute", inset: GLOBAL_LOGO_LAYER_INSET, pointerEvents: "none", clipPath: "inset(0 0 0 0)" }}
        >
          <img
            src="/logo/Balearic Sound System Logo.svg"
            alt=""
            aria-hidden
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        </div>
        <div
          className="logo-layer-white"
          style={{
            position: "absolute",
            inset: GLOBAL_LOGO_LAYER_INSET,
            zIndex: 1,
            pointerEvents: "none",
            clipPath: "inset(100% 0 0 0)",
          }}
        >
          <img
            src="/logo/Balearic Sound System Logo.svg"
            alt="MM Discos"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              filter: "invert(1)",
            }}
          />
        </div>
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
              position:    "absolute",
              left:        "50%",
              top:         "50%",
              // xPercent/yPercent:-50 aplicados por GSAP para centrar;
              // x/y offset aplicados por setOrbitalProgress (GPU transform, cero reflow).
              width:       "clamp(140px, 22vw, 420px)",
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
            width: isDesktop ? "calc(50% + 3.3rem)" : "calc(100% - 2rem)",
            fontFamily: "'MyFont', sans-serif",
            fontSize: isDesktop ? "clamp(0.58rem, 0.68vw, 0.74rem)" : "clamp(0.6rem, 2.2vw, 0.78rem)",
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
          position: "relative", zIndex: 9000,
          width: "100%", height: "100svh",
          display: "flex",
          justifyContent: isDesktop ? "flex-end" : "flex-start",
          alignItems: "center",
          paddingLeft: isDesktop ? "9vw" : "2rem",
          paddingRight: isDesktop ? "calc(9vw - 0.5rem)" : "2rem",
        }}
      >
        <div
          ref={quoteContainerRef}
          style={{
            width: isDesktop ? "42%" : "100%",
            display: "flex", flexDirection: "column", gap: "1.2rem",
            filter: "url(#morph-quote)",
          }}
        >
          <p style={{
            fontFamily: "'MyFont', sans-serif",
            fontSize: isDesktop ? "clamp(0.8rem, 0.95vw, 1.05rem)" : "clamp(0.82rem, 3vw, 1rem)",
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