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

/** Ancho final del logo en móvil — alineado con `.mm-global-logo-nav` (max-width: 719px) en globals.css. */
const LOGO_END_WIDTH_MOBILE = 200;
/** Factor de ajuste fino sobre el fitScale (< 1 = pequeño margen interior, = 1 = toca los bordes).
 *  Se multiplica por Math.min(fitW, fitH) para que el logo encuadre perfectamente dentro del blur box. */
const LOGO_FIT_FACTOR = 0.96;

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
  const orbitalImgsRef      = useRef([]);      // divs exteriores (posición orbital)
  const orbitalRevealRef    = useRef([]);      // divs interiores (overflow wipe)
  const survivorRef         = useRef(null);
  const grainFlashRef       = useRef(null);
  const sinkActiveRef       = useRef(false);

  /* ── Scroll-structure refs ─────────────────────────────────── */
  const snapBufferRef       = useRef(null);   // 60svh · absorbe el primer scroll
  const artistsProxyRef     = useRef(null);   // 70svh · trigger de salida de texto + orbital
  const carouselSpacerRef   = useRef(null);   // spacer orbital
  const quoteContainerRef   = useRef(null);   // segundo texto

  /* ── Snap-gate: bloquea el orbital hasta que el snap haya terminado ── */
  const snapCompletedRef    = useRef(false);  // true cuando revealArtistsText ejecuta
  const pendingOrbitalRef   = useRef(false);  // true si el orbital quiere mostrarse antes del snap

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
    const mBoxW       = vw * 0.90;
    const mBoxH       = mBoxW * (9 / 16);
    const endLogoW    = LOGO_END_WIDTH_MOBILE;
    const endLogoPad    = "1rem 2.5rem 2.5rem"; // mismo padding que .mm-global-logo-nav
    const endLogoLeft = (vw - endLogoW) / 2;

    /* ── Estado inicial: box ────────────────────────────────── */
    // Tamaño completo fijo; escala inicial = tamaño visual del box.
    // Animar scaleX/scaleY en el snap → GPU puro, cero width/height.
    const startScaleX = mBoxW / vw;
    const startScaleY = mBoxH / vh;

    gsap.set(box, {
      width:           vw,
      height:          vh,
      xPercent:        -50,
      yPercent:        -50,
      scaleX:          startScaleX,
      scaleY:          startScaleY,
      backgroundColor: "rgba(255,255,255,0.35)",
    });

    /* ── Estado inicial: logo ────────────────────────────────── */
    // width/padding/transformOrigin: propiedades de layout → CSS directo, nunca animadas por GSAP
    const syncLogoToBlurBox = () => {
      logo.style.width           = `${endLogoW}px`;
      logo.style.padding         = endLogoPad;
      logo.style.transformOrigin = "top center";
      // GSAP solo para transforms (x, y, scale) y opacity
      gsap.set(logo, { x: endLogoLeft, y: 0, opacity: 1, scale: 1 });
      const B = box.getBoundingClientRect();
      const L = logo.getBoundingClientRect();
      if (B.width <= 0 || B.height <= 0 || L.width <= 0 || L.height <= 0) return;
      // fitScale: la dimensión más restrictiva controla la escala → logo siempre dentro del blur box
      const startScale = Math.min(B.width / L.width, B.height / L.height) * LOGO_FIT_FACTOR;
      const scaledH    = L.height * startScale;
      const startY     = B.top + (B.height - scaledH) / 2;
      gsap.set(logo, { y: startY, scale: startScale });
    };
    syncLogoToBlurBox();
    // Doble RAF: asegura que el browser ha completado el layout antes de medir rects
    requestAnimationFrame(() => { syncLogoToBlurBox(); });

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

    /* ── Orbital: elementos y quickSetters ──────────────────── */
    const imageEls  = orbitalImgsRef.current.filter(Boolean);
    const revealEls = orbitalRevealRef.current.filter(Boolean);
    const hero      = { vw, vh };
    const getAngle  = (i) => (i / totalImages) * Math.PI * 2 - Math.PI / 2;
    const SPIRAL_TURNS = 1.5;
    const totalRot     = SPIRAL_TURNS * Math.PI * 2;

    // Centrado orbital: xPercent/yPercent en los divs exteriores (se setean una sola vez).
    // El reveal usa overflow:hidden + xPercent en el div interior → 100% GPU composited,
    // sin clipPath (que en iOS Safari no garantiza compositing salvo con will-change explícito).
    imageEls.forEach((el) => {
      gsap.set(el, { xPercent: -50, yPercent: -50 });
    });
    gsap.set(revealEls, { xPercent: 100 });   // todos ocultos (off-screen derecha)

    // quickSetter: escribe directo al transform cache de GSAP sin overhead de la API completa.
    // Usar gsap.set dentro de onUpdate (9 × por frame) sería ~10× más lento.
    const qsX     = imageEls.map((el) => gsap.quickSetter(el, "x", "px"));
    const qsY     = imageEls.map((el) => gsap.quickSetter(el, "y", "px"));
    const qsScale = imageEls.map((el) => gsap.quickSetter(el, "scale"));

    const setOrbitalProgress = (rawP) => {
      const p        = Math.max(0, Math.min(1, rawP));
      const { vw: w, vh: h } = hero;
      const diagonal = Math.sqrt((w / 2) ** 2 + (h / 2) ** 2);

      // startR > diagonal garantiza que todas las imágenes (incluidas las del eje Y,
      // que necesitan radio > vh/2) empiezan fuera de la pantalla visible.
      const startR = diagonal * 1.3;

      const eR = Math.pow(p, 1.3);
      const eA = Math.pow(p, 1.1);
      const eS = Math.pow(p, 0.55);
      const sc = 0.08 + 0.92 * eS;

      imageEls.forEach((_, i) => {
        const base  = getAngle(i);
        const angle = base + totalRot * eA;
        const r     = startR * (1 - eR);
        // quickSetter escribe translateX/Y/scale directo → cero overhead de parseo
        qsX[i](Math.cos(angle) * r);
        qsY[i](Math.sin(angle) * r);
        qsScale[i](sc);
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
          gsap.set(others, { opacity: 1 });
          gsap.set(survivor, { scale: 1, opacity: 1 });
          // Reveal divs: vuelven al estado de "oculto" listo para un re-enter
          gsap.set(revealEls, { xPercent: 100 });
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
      // will-change activo solo durante el reveal, no permanentemente.
      // overflow:hidden + xPercent → 100% GPU composited en iOS Safari
      revealEls.forEach((el) => { el.style.willChange = "transform"; });
      gsap.fromTo(
        revealEls,
        { xPercent: 100 },
        {
          xPercent:  0,
          duration:  0.55,
          ease:      "expo.out",
          stagger:   { each: 0.055, from: "random" },
          onComplete: () => {
            revealEls.forEach((el) => { el.style.willChange = "auto"; });
          },
        }
      );
    };

    const hideOrbital = () => {
      if (!sinkActiveRef.current) {
        gsap.set(orbitalContainerRef.current, { opacity: 0 });
        gsap.set(revealEls, { xPercent: 100 });
      }
    };

    /* ── Snap animation (primer scroll) ─────────────────────── */
    let snapFired = false;

    const revealArtistsText = () => {
      // Marcar snap como completado y disparar orbital si estaba pendiente
      snapCompletedRef.current = true;
      if (pendingOrbitalRef.current) {
        pendingOrbitalRef.current = false;
        showOrbital();
      }

      window.dispatchEvent(new Event("mm-hero-logo-settled"));

      // El snap ha terminado: la caja es opaca → el backdropFilter no aporta nada visualmente
      // pero obliga al browser a repintar toda la pantalla en cada frame de scroll → eliminarlo.
      box.style.backdropFilter        = "none";
      box.style.webkitBackdropFilter  = "none";

      // El video está enterrado bajo la caja opaca blanca → pausarlo y ocultarlo libera
      // recursos GPU (decodificación de vídeo) para el resto de animaciones de scroll.
      if (videoEl) {
        videoEl.pause();
        videoEl.style.display = "none";
      }

      // ── Filtro SVG: arranca distorsionado y se limpia mientras aparece el texto.
      aBlurRef.current?.setAttribute("stdDeviation", "4");
      aMorphRef.current?.setAttribute("radius",       "1.2");
      aGlowRef.current?.setAttribute("stdDeviation",  "2.5");

      const fProxy = { t: 0 };
      gsap.to(fProxy, {
        t:        1,
        duration: 1.4,
        ease:     "power3.out",
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

      // Fase 1 — box expande el ancho (corte horizontal rápido) via scaleX
      tl.to(box, {
        scaleX:   1,
        duration: 0.22,
        ease:     "expo.out",
      }, 0);

      // Fase 2 — box abre la altura y sella con blanco opaco via scaleY
      tl.to(box, {
        scaleY:          1,
        backgroundColor: "rgba(255,255,255,1)",
        duration:        0.38,
        ease:            "expo.out",
      }, 0.18);

      // Fase 3 — logo sube al top-center: solo y + scale (cero width/x)
      tl.to(logo, {
        y:        0,
        scale:    1,
        duration: 0.42,
        ease:     "expo.out",
      }, 0.22);
    };

    window.addEventListener("wheel",     fireSnapAnimation, { passive: true });
    window.addEventListener("touchmove", fireSnapAnimation, { passive: true });

    // Double-RAF: espera 2 frames para que el browser haya hecho layout completo
    // de los scroll spacers antes de que ScrollTrigger calcule posiciones de triggers.
    requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));

    /* ── quickSetter para la Y del texto (scrub por frame) ───── */
    // gsap.set en onUpdate = full API = parseo + normalización cada frame → lento.
    // quickSetter escribe directo al transform cache → sin overhead.
    const qsTextY = gsap.quickSetter(artistsTextRef.current, "y", "px");

    /* ── Texto artistas: salida por el top con scrub ─────────── */
    //  trigger: artistsProxy (empieza en 60svh de scroll, dura 70svh)
    //  start:   "top top"    → proxy llega al top del viewport (scroll ≈ 60vh)
    //  end:     "bottom top" → proxy sale completamente (scroll ≈ 130vh)
    const textExitTrigger = ScrollTrigger.create({
      trigger:             artistsProxyRef.current,
      start:               "top top",
      end:                 "bottom top",
      scrub:               0.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        // Translación hacia el top — quickSetter: sin overhead de parseo por frame
        qsTextY(-p * vh * 1.2);

        // Filtro SVG: arranca desde p=0, progresivo con el scroll.
        // El orbital empieza al 50% del proxy (start:"50% top"), cuando el SVG
        // lleva ~35svh de scroll y ya está claramente activo (~70% de su efecto).
        // La GPU tiene margen: el reveal orbital (overflow+xPercent) es composited
        // y ya no compite con clipPath como antes.
        const a = Math.pow(p, 0.5);
        aBlurRef.current?.setAttribute("stdDeviation", (5   * a).toFixed(4));
        aMorphRef.current?.setAttribute("radius",       (1.5 * a).toFixed(4));
        aGlowRef.current?.setAttribute("stdDeviation",  (3   * a).toFixed(4));
      },
      onLeaveBack: () => {
        qsTextY(0);
        aBlurRef.current?.setAttribute("stdDeviation",  "0");
        aMorphRef.current?.setAttribute("radius",        "0");
        aGlowRef.current?.setAttribute("stdDeviation",   "0");
      },
    });

    /* ── ScrollTrigger orbital ───────────────────────────────── */
    // start: "50% top" — el orbital arranca cuando el 50% del proxy llega al top del viewport.
    // Con artistsProxy de 80svh y snapBuffer de 5svh, eso es scroll ≈ 5 + 40 = 45svh.
    // En ese punto el textExitTrigger lleva ~40svh de progreso → SVG al ~71% (pow(0.5, 0.5)).
    // El usuario ve: texto subiendo con SVG activo → luego aparece el orbital. Fluido.
    const orbitalTrigger = ScrollTrigger.create({
      trigger:             artistsProxyRef.current,
      start:               "50% top",
      endTrigger:          carouselSpacerRef.current,
      end:                 "bottom top",
      scrub:               1.0,
      invalidateOnRefresh: true,
      onLeave:             triggerSinkAnimation,
      onEnterBack:         showOrbital,
      onLeaveBack:         hideOrbital,
      onUpdate:            (self) => setOrbitalProgress(self.progress),
    });

    // Snap-gate: el orbital se muestra solo cuando el snap ha terminado.
    // Si el usuario scrollea muy rápido y llega aquí antes del snap → se encola.
    // El orbital se dispara cuando el snap complete (ver revealArtistsText).
    const orbitalVisibilityTrigger = ScrollTrigger.create({
      trigger:     artistsProxyRef.current,
      start:       "50% top",
      onEnter: () => {
        if (snapCompletedRef.current) {
          showOrbital();
        } else {
          pendingOrbitalRef.current = true;
        }
      },
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
        scrub:   2,
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

    return () => {
      window.removeEventListener("wheel",     fireSnapAnimation);
      window.removeEventListener("touchmove", fireSnapAnimation);
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

      {/* Zona snap: 5svh — solo para evitar que el textExit dispare en el mismo instante
          que el snap. El snap se activa por evento wheel/touchmove (no por posición),
          así que no necesita un buffer largo. */}
      <div ref={snapBufferRef} style={{ height: "5svh", pointerEvents: "none" }} />

      {/* Proxy artistas: 80svh — salida completa del texto + SVG progresivo.
          El orbital arranca al 50% de este proxy (ver start:"50% top" en los triggers),
          cuando el SVG ya lleva ~35svh de scroll y está perceptiblemente activo. */}
      <div ref={artistsProxyRef} style={{ height: "80svh", pointerEvents: "none" }} />

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

      {/* Box blanco — width/height/scale gestionados 100% por GSAP */}
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

      {/* Logo — estructura negro/blanco para la cortina del About en _app.js */}
      <div
        id="mm-hero-animated-logo"
        ref={logoRef}
        style={{
          position:  "fixed",
          top:       0,
          left:      0,
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
            inset:     "1rem 2.5rem 2.5rem 2.5rem",
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
            inset:     "1rem 2.5rem 2.5rem 2.5rem",
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
          // Sin will-change permanente: conflicto compositing WebKit con SVG filter en child.
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
        </div>
      </div>

      {/* Imágenes orbitales */}
      <div
        ref={orbitalContainerRef}
        style={{
          position:      "fixed",
          inset:         0,
          zIndex:        8000,
          pointerEvents: "none",
          opacity:       0,
          // Sin will-change permanente: 9 imágenes × capa GPU → presión de memoria en móvil.
          // will-change se activa dinámicamente solo durante el reveal (ver showOrbital).
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
              width:       "clamp(200px, 56vw, 340px)",
              aspectRatio: "1 / 1",
              // overflow:hidden + xPercent en el div interior = wipe 100% GPU composited.
              // Reemplaza clipPath, que en iOS Safari no garantiza compositing sin will-change.
              overflow:    "hidden",
            }}
          >
            {/* Div interior: gestiona el wipe de reveal (xPercent 100→0) */}
            <div
              ref={(el) => { orbitalRevealRef.current[i] = el; }}
              style={{ width: "100%", height: "100%" }}
            >
              <img
                src={src}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
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
