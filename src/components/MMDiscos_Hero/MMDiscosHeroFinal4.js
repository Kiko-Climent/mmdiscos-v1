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

const SVH_PER_IMAGE = 15;
const SURVIVOR_INDEX = ORBITAL_IMAGES.length - 1;

export default function MMDiscosHeroFinal4() {
  const spacerRef         = useRef(null);
  const boxRef            = useRef(null);
  const logoRef           = useRef(null);
  const videoWrapRef      = useRef(null);
  const videoRef          = useRef(null);
  const artistsSectionRef = useRef(null);
  const artistsRef        = useRef(null);
  const carouselSpacerRef = useRef(null);
  const quoteContainerRef = useRef(null);

  const orbitalContainerRef = useRef(null);
  const orbitalImgsRef      = useRef([]);
  const survivorRef         = useRef(null);
  const grainFlashRef       = useRef(null);
  const sinkActiveRef       = useRef(false);

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

    /*
     * APPROACH NUEVO — sin dependencia del viewport dinámico
     * ───────────────────────────────────────────────────────
     * El problema en Android: la barra del navegador se oculta al hacer scroll,
     * lo que cambia el valor de svh/100vh en mitad de la animación. Cualquier
     * cálculo que dependa del alto real del viewport en ese momento produce
     * saltos, desfases entre box y logo, y la franja blanca inferior.
     *
     * Solución: el box ya NO intenta cubrir el 100% del viewport.
     * En cambio, crece hasta ~90-95% del ancho manteniendo proporción 16/9.
     * El video hace fade out simultáneamente. Cuando el box es grande,
     * detrás solo queda el fondo blanco de la página — visualmente idéntico
     * a "cubrir todo", pero sin ningún cálculo que dependa de window.innerHeight
     * después del primer mount.
     *
     * El contenedor del video se fija en px (window.innerHeight al montar)
     * para que nunca cambie su tamaño aunque la barra aparezca o desaparezca.
     */

    // Captura el viewport UNA sola vez, antes de cualquier scroll.
    const VW = window.innerWidth;
    const VH = window.innerHeight;

    // Fija la altura del wrapper de video en px — nunca volverá a cambiar.
    if (videoWrapRef.current) {
      videoWrapRef.current.style.height = `${VH}px`;
    }

    const isDesk = VW >= 720;

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
          refs.blur.setAttribute("stdDeviation",  (5   * a).toFixed(4));
          refs.morph.setAttribute("radius",        (1.5 * a).toFixed(4));
          refs.glow.setAttribute("stdDeviation",   (3.5 * a).toFixed(4));
        },
      });
    };

    /* ── Preload ─────────────────────────────────────────── */
    ORBITAL_IMAGES.forEach((src) => { const img = new Image(); img.src = src; });

    /* ── Orbital setup ───────────────────────────────────── */
    const imageEls = orbitalImgsRef.current.filter(Boolean);
    const getAngle = (i) => (i / totalImages) * Math.PI * 2 - Math.PI / 2;
    imageEls.forEach((el) => gsap.set(el, { xPercent: -50, yPercent: -50 }));

    const SPIRAL_TURNS  = 1.5;
    const totalRotation = SPIRAL_TURNS * Math.PI * 2;

    const setOrbitalProgress = (rawP) => {
      const p       = Math.max(0, Math.min(1, rawP));
      const centerX = VW / 2;
      const centerY = VH / 2;
      const diagonal  = Math.sqrt((VW / 2) ** 2 + (VH / 2) ** 2);
      const imgPx     = isDesk
        ? Math.min(420, Math.round(VW * 0.22))
        : Math.min(200, Math.round(VW * 0.32));
      const startRadius = diagonal + imgPx * 0.6;

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

    setOrbitalProgress(0);
    gsap.set(orbitalContainerRef.current, { opacity: 0 });

    /* ── Sink animation ──────────────────────────────────── */
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
      tl.to(survivor, { scale: 1.02, duration: 0.12, ease: "power1.out" }, "<0.04");
      tl.to(survivor, { scale: 0, opacity: 0, duration: 0.9, ease: "power3.in" });
    };

    /* ── Orbital visibility ──────────────────────────────── */
    const showOrbital = () =>
      gsap.to(orbitalContainerRef.current, { opacity: 1, duration: 0.5, ease: "power2.out" });
    const hideOrbital = () => {
      if (!sinkActiveRef.current)
        gsap.set(orbitalContainerRef.current, { opacity: 0 });
    };

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

    /* ── MÓVIL ───────────────────────────────────────────── */
    if (!isDesk) {
      const mBoxW0 = VW * 0.82;
      const mBoxH0 = mBoxW0 * (9 / 16);

      // Destino: crece hasta casi todo el ancho pero con altura capped.
      // NO intenta llegar a VW × VH — eso causaba los problemas.
      const mBoxW1 = VW * 0.95;
      const mBoxH1 = Math.min(mBoxW1 * (9 / 16), VH * 0.82);

      const endLogoW  = 250;
      const logoLeft0 = (VW - mBoxW0) / 2;
      const logoLeft1 = (VW - endLogoW) / 2;
      const logoTop0  = VH / 2 - mBoxH0 / 2;

      gsap.set(box, {
        position: "fixed",
        top: "50%", left: "50%",
        xPercent: -50, yPercent: -50,
        width: mBoxW0, height: mBoxH0,
        backgroundColor: "rgba(255,255,255,0.35)",
        backdropFilter: "blur(3px)",
      });
      gsap.set(logo, {
        position: "fixed",
        top: logoTop0, left: logoLeft0,
        width: mBoxW0,
        padding: "2.5rem",
        opacity: 1,
      });

      const mobileTrigger = ScrollTrigger.create({
        trigger: spacer,
        start:   "top top",
        end:     `+=${VH}px`,
        scrub:   1,
        onLeave:     () => window.dispatchEvent(new Event("mm-hero-logo-settled")),
        onEnterBack: () => window.dispatchEvent(new Event("mm-hero-logo-reset")),
        onUpdate: (self) => {
          const p = self.progress;
          const w = gsap.utils.interpolate(mBoxW0, mBoxW1, p);
          const h = gsap.utils.interpolate(mBoxH0, mBoxH1, p);

          gsap.set(box, {
            width:  w,
            height: h,
            // De semitransparente a blanco sólido opaco
            backgroundColor: `rgba(255,255,255,${gsap.utils.interpolate(0.35, 1, p)})`,
            // El blur del backdrop desaparece cuando el fondo ya es opaco
            backdropFilter: `blur(${gsap.utils.interpolate(3, 0, Math.min(p / 0.7, 1))}px)`,
          });

          gsap.set(logo, {
            top:   gsap.utils.interpolate(logoTop0, 0, p),
            left:  gsap.utils.interpolate(logoLeft0, logoLeft1, p),
            width: gsap.utils.interpolate(mBoxW0, endLogoW, p),
          });

          // Video: fade out en la primera mitad del scroll para que cuando
          // el box sea grande solo quede el fondo blanco de la página detrás.
          if (videoRef.current)
            gsap.set(videoRef.current, { opacity: 1 - Math.min(p / 0.6, 1) });
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
    const boxW0    = box.offsetWidth;
    const boxH0    = box.offsetHeight;
    const boxLeft0 = (VW - boxW0) / 2;
    const boxTop0  = (VH - boxH0) / 2;

    // Destino: 90% del ancho, proporción 16/9, capped al 88% del alto.
    const boxW1 = VW * 0.9;
    const boxH1 = Math.min(boxW1 * (9 / 16), VH * 0.88);

    gsap.set(logo, {
      position: "fixed",
      left:    boxLeft0,
      width:   boxW0,
      padding: "2.5rem",
      top:     "auto",
      bottom:  VH - (boxTop0 + boxH0),
    });

    const logoRect  = logo.getBoundingClientRect();
    const startTop  = logoRect.top;
    gsap.set(logo, { top: startTop, bottom: "auto", opacity: 1 });

    const endLogoW = 250;
    const endLogoL = (VW - endLogoW) / 2;

    const logoTrigger = ScrollTrigger.create({
      trigger: spacer,
      start:   "top top",
      end:     `+=${VH}px`,
      scrub:   1,
      onLeave:     () => window.dispatchEvent(new Event("mm-hero-logo-settled")),
      onEnterBack: () => window.dispatchEvent(new Event("mm-hero-logo-reset")),
      onUpdate: (self) => {
        const p = self.progress;

        gsap.set(box, {
          width:  gsap.utils.interpolate(boxW0, boxW1, p),
          height: gsap.utils.interpolate(boxH0, boxH1, p),
          backgroundColor: `rgba(255,255,255,${gsap.utils.interpolate(0.35, 1, p)})`,
          backdropFilter: `blur(${gsap.utils.interpolate(3, 0, Math.min(p / 0.7, 1))}px)`,
        });

        gsap.set(logo, {
          top:   gsap.utils.interpolate(startTop, 0, p),
          left:  gsap.utils.interpolate(boxLeft0, endLogoL, p),
          width: gsap.utils.interpolate(boxW0, endLogoW, p),
        });

        if (videoRef.current)
          gsap.set(videoRef.current, { opacity: 1 - Math.min(p / 0.6, 1) });
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

      {/* ── Spacer ───────────────────────────────────────────── */}
      <div ref={spacerRef} style={{ height: "200svh", pointerEvents: "none" }} />

      {/*
        ── Video background ──────────────────────────────────
        videoWrapRef tiene su altura fijada en px (window.innerHeight) al montar.
        Nunca depende de svh después del primer render → sin barra blanca en Android.
      */}
      <div
        ref={videoWrapRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: "100%",
          height: "100svh", // sobreescrito a px en el useEffect
          pointerEvents: "none", overflow: "hidden",
          zIndex: 0,
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

      {/*
        ── Box blanco ────────────────────────────────────────
        Ya NO crece hasta 100vw × 100vh.
        Crece hasta ~90-95% del ancho con proporción 16/9.
        El fondo blanco de la página + el fade out del video hacen
        que visualmente parezca que "cubre todo" sin dependencia
        del alto real del viewport en cada momento.
      */}
      <div
        ref={boxRef}
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "25%", aspectRatio: "16/9",
          backgroundColor: "rgba(255,255,255,0.35)",
          backdropFilter: "blur(3px)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      {/* ── Logo ─────────────────────────────────────────────── */}
      <div
        id="mm-hero-animated-logo"
        ref={logoRef}
        style={{
          position: "fixed",
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
          style={{ position: "absolute", inset: "2.5rem", pointerEvents: "none", clipPath: "inset(0 0 0 0)" }}
        >
          <img
            src="/logo/Balearic Sound System Logo.svg"
            alt="" aria-hidden
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
        </div>
        <div
          className="logo-layer-white"
          style={{
            position: "absolute", inset: "2.5rem", zIndex: 1,
            pointerEvents: "none", clipPath: "inset(100% 0 0 0)",
          }}
        >
          <img
            src="/logo/Balearic Sound System Logo.svg"
            alt="MM Discos"
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", filter: "invert(1)" }}
          />
        </div>
      </div>

      {/* ── Orbital images ───────────────────────────────────── */}
      <div
        ref={orbitalContainerRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: "100%", height: "100svh",
          zIndex: 8000, pointerEvents: "none", opacity: 0,
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
              width: "clamp(140px, 22vw, 420px)",
              aspectRatio: "1 / 1",
              willChange: "transform, left, top",
            }}
          >
            <img
              src={src} alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        ))}
        <div
          ref={grainFlashRef}
          style={{
            position: "absolute", inset: 0,
            background: "#ffffff", opacity: 0,
            mixBlendMode: "overlay", pointerEvents: "none",
          }}
        />
      </div>

      {/* ── Artistas ─────────────────────────────────────────── */}
      <section
        ref={artistsSectionRef}
        style={{
          position: "relative", zIndex: 9000,
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
          position: "relative", zIndex: 9000,
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
            fontWeight: 700, lineHeight: 1.05,
            letterSpacing: "0.01em",
            textTransform: "lowercase", textAlign: "left",
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