"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

// svh de scroll por imagen — reducir para más velocidad, aumentar para más pausa
const SVH_PER_IMAGE = 15;

export default function MMDiscosHeroFinal2() {
  const spacerRef          = useRef(null);
  const boxRef             = useRef(null);
  const logoRef            = useRef(null);
  const videoRef           = useRef(null);
  const artistsSectionRef  = useRef(null);
  const artistsRef         = useRef(null);
  const carouselSpacerRef  = useRef(null);
  const quoteContainerRef  = useRef(null);

  const carouselRef      = useRef(null);
  const carouselImgRef   = useRef(null);
  const carouselCountRef = useRef(null);
  const carouselIndexRef = useRef(-1);
  const totalImages      = CAROUSEL_IMAGES.length;

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
          if (p <= 0.4) {
            sharp = p / 0.4;              // entrada: blur → nítido en el 40%
          } else if (p <= 0.78) {
            sharp = 1;                    // zona nítida larga
          } else {
            sharp = 1 - (p - 0.78) / 0.22; // salida: empieza cuando texto está alto
          }
          const a = Math.pow(Math.max(0, 1 - sharp), 1.5);
          refs.blur.setAttribute("stdDeviation", (5 * a).toFixed(4));
          refs.morph.setAttribute("radius", (1.5 * a).toFixed(4));
          refs.glow.setAttribute("stdDeviation", (3.5 * a).toFixed(4));
        },
      });
    };

    // preload
    CAROUSEL_IMAGES.forEach((src) => { const i = new Image(); i.src = src; });

    // Al mostrar: transición suave. Al esconder: instantáneo para no solapar con la cita.
    const showCarousel = () => {
      if (!carouselRef.current) return;
      carouselRef.current.style.transition = "clip-path 0.45s cubic-bezier(0.76, 0, 0.24, 1)";
      carouselRef.current.style.clipPath = "inset(0% 0% 0% 0%)";
    };
    const hideCarousel = () => {
      if (!carouselRef.current) return;
      carouselRef.current.style.transition = "none";
      carouselRef.current.style.clipPath = "inset(100% 0% 0% 0%)";
    };
    const setImage = (index) => {
      const img     = carouselImgRef.current;
      const counter = carouselCountRef.current;
      if (!img) return;
      const looped = ((index % totalImages) + totalImages) % totalImages;
      if (carouselIndexRef.current === looped) return;
      carouselIndexRef.current = looped;
      img.src = CAROUSEL_IMAGES[looped];
      if (counter) counter.textContent = `${String(looped + 1).padStart(2, "0")} / ${String(totalImages).padStart(2, "0")}`;
    };

    // ── MÓVIL ────────────────────────────────────────────────────
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
        left: (vw - mBoxW) / 2,
        top: vh / 2 - mBoxH / 2,
        padding: "1.5rem",
        opacity: 1,
      });

      const mobileTrigger = ScrollTrigger.create({
        trigger: spacer,
        start: "top top",
        end: `+=${vh}px`,
        scrub: 1,
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

      // Carousel: aparece cuando el texto de artistas ya salió completamente por arriba
      const mCarouselTrigger = ScrollTrigger.create({
        trigger: artistsSectionRef.current,
        start: "bottom top",           // sección de artistas completamente fuera por arriba
        endTrigger: carouselSpacerRef.current,
        end: "bottom top",             // spacer del carousel sale por arriba → aparece la cita
        invalidateOnRefresh: true,
        onEnter:     () => showCarousel(),
        onLeave:     () => hideCarousel(),
        onEnterBack: () => showCarousel(),
        onLeaveBack: () => hideCarousel(),
        onUpdate: (self) => {
          // Una sola pasada por todas las imágenes, sin repetición
          const idx = Math.min(Math.floor(self.progress * totalImages), totalImages - 1);
          setImage(idx);
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
        mCarouselTrigger.kill();
        t1?.kill();
        t2?.kill();
      };
    }

    // ── DESKTOP ──────────────────────────────────────────────────
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

    // Logo + box blanco → pantalla totalmente blanca
    const logoTrigger = ScrollTrigger.create({
      trigger: spacer,
      start: "top top",
      end: `+=${vh}px`,
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(box, {
          width:  gsap.utils.interpolate(boxW, vw, p),
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

    // Carousel: aparece cuando el texto de artistas ya salió completamente por arriba.
    // Una pasada completa por todas las imágenes — escala automáticamente con totalImages.
    const carouselTrigger = ScrollTrigger.create({
      trigger: artistsSectionRef.current,
      start: "bottom top",           // sección de artistas completamente fuera por arriba
      endTrigger: carouselSpacerRef.current,
      end: "bottom top",             // spacer del carousel sale → aparece la cita
      invalidateOnRefresh: true,
      onEnter:     () => showCarousel(),
      onLeave:     () => hideCarousel(),
      onEnterBack: () => showCarousel(),
      onLeaveBack: () => hideCarousel(),
      onUpdate: (self) => {
        // Una sola pasada: cada imagen ocupa 1/totalImages del recorrido
        const idx = Math.min(Math.floor(self.progress * totalImages), totalImages - 1);
        setImage(idx);
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

      {/* ── Spacer (zona sticky logo + box) ───────────────────── */}
      <div ref={spacerRef} style={{ height: "200svh", pointerEvents: "none" }} />

      {/* ── Video background ──────────────────────────────────── */}
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

      {/* ── Carrusel (fixed, cicla imágenes) ──────────────────── */}
      <div
        ref={carouselRef}
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 8000,
          pointerEvents: "none",
          clipPath: "inset(100% 0% 0% 0%)",
          width: "clamp(220px, 26vw, 420px)",
          aspectRatio: "1 / 1",
        }}
      >
        <img
          ref={carouselImgRef}
          src={CAROUSEL_IMAGES[0]}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div
          ref={carouselCountRef}
          style={{
            position: "absolute",
            bottom: "-1.6rem", right: 0,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.7rem", fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "rgba(0,0,0,0.35)", lineHeight: 1,
          }}
        >
          01 / {String(totalImages).padStart(2, "0")}
        </div>
      </div>

      {/* ── Artistas: primer bloque de texto ──────────────────── */}
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
            width: "70%",
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

      {/* ── Carousel spacer: SVH_PER_IMAGE × totalImages → escala con las imágenes */}
      <div ref={carouselSpacerRef} style={{ height: `${totalImages * SVH_PER_IMAGE}svh`, pointerEvents: "none" }} />

      {/* ── Gap: garantiza que el quote esté bajo el viewport cuando el carousel acaba */}
      <div style={{ height: "60svh", pointerEvents: "none" }} />

      {/* ── Cita: último bloque de texto ──────────────────────── */}
      <section
        style={{
          position: "relative", zIndex: 10000,
          width: "100%", height: "100svh",
          display: "flex", justifyContent: "center", alignItems: "center",
        }}
      >
        <div
          ref={quoteContainerRef}
          style={{ width: "65%", display: "flex", flexDirection: "column", gap: "1rem", filter: "url(#morph-quote)" }}
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
