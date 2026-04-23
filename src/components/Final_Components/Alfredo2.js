"use client";

import { useEffect, useRef } from "react";

// ─── Imágenes ─────────────────────────────────────────────────────────────────

const COL1_IMGS = [
  "/Celex - cover.jpg",
  "/corben_peachland_cover.jpg",
  "/Daichi - cover.jpg",
  "/Factory Edits - cover.jpg",
];
const COL2_IMGS = ["/img1.jpg", "/img2.jpg", "/img3.jpg", "/img4.jpg"];
const COL3_IMGS = ["/img5.jpg", "/MMD039.png", "/MMD040_Cover-1.jpg", "/MMD040-2.png"];
const COL4_IMGS = ["/morira - cover.png", "/statues.jpeg", "/img9.jpg", "/img3.jpg"];

// ─── Textos ───────────────────────────────────────────────────────────────────

const ALFREDOS_QUOTE = `We played without rules, without thinking about styles or what would come next. One track could be slow, the next dark, then something pop or an impossible guitar, but it all made sense in that moment. The dancefloor didn't ask for coherence, it asked for emotion — and as long as people stayed there, smiling and lost, you knew you were doing it right.`;

const STATEMENT = `MM DISCOS IS A RECORD LABEL BASED BETWEEN BERLIN AND BARCELONA, FOUNDED AND POWERED BY MOON & MANN. FREE FROM STYLISTIC BOUNDARIES AND GENRE LIMITATIONS, THE LABEL HAS CONSISTENTLY CHAMPIONED A DISTINCTIVE SOUND WHERE MUSIC SPEAKS FOR ITSELF — DEEPLY INSPIRED BY THE SUEÑO IBICENCO AND THE SPIRIT OF THE MEDITERRANEAN.`;

// ─── Configuración de animaciones ────────────────────────────────────────────

/** Duración de cada animación de escala en viewport-heights. */
const PIN_MULTIPLIER = 1.5;

/** Tamaño compartido (en px) entre el final del video 1 y el inicio del video 2. */
const TARGET_THUMB_PX = 300;

/**
 * DESKTOP — 4 columnas.
 * initialX/Y: posición de entrada (GSAP set).
 * scrollY: desplazamiento total del parallax.
 */
const DESKTOP_COLS_CONFIG = [
  { imgs: COL1_IMGS, initialX: 0,    initialY: 1000, scrollY: -500 },
  { imgs: COL2_IMGS, initialX: -225, initialY: 500,  scrollY: -250 },
  { imgs: COL3_IMGS, initialX:  225, initialY: 500,  scrollY: -250 },
  { imgs: COL4_IMGS, initialX: 0,    initialY: 1000, scrollY: -500 },
];

/**
 * MOBILE — 2 columnas.
 * Columna A (izq): imágenes del col 1 + col 3 intercaladas.
 * Columna B (der): imágenes del col 2 + col 4 intercaladas.
 * Parallax asimétrico para que las columnas se muevan a distinta velocidad.
 */
const MOBILE_COLS_CONFIG = [
  {
    imgs: [COL1_IMGS[0], COL3_IMGS[0], COL1_IMGS[1], COL3_IMGS[1], COL1_IMGS[2], COL3_IMGS[2], COL1_IMGS[3], COL3_IMGS[3]],
    initialY: 500,
    scrollY: -350,
  },
  {
    imgs: [COL2_IMGS[0], COL4_IMGS[0], COL2_IMGS[1], COL4_IMGS[1], COL2_IMGS[2], COL4_IMGS[2], COL2_IMGS[3], COL4_IMGS[3]],
    initialY: 200,
    scrollY: -200,
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Alfredo2() {
  const heroRef        = useRef(null);
  const heroImgRef     = useRef(null);
  const aboutRef       = useRef(null);
  const videoTwoRef    = useRef(null);
  const videoTwoImgRef = useRef(null);

  // Refs separados para desktop y mobile
  const desktopColRefs = useRef([]);
  const mobileColRefs  = useRef([]);

  useEffect(() => {
    let gsapInstance;
    let gsapCtx;
    let lenis;
    let lenisRaf;
    let mounted = true;

    async function init() {
      const { gsap }           = await import("gsap");
      const { ScrollTrigger }  = await import("gsap/ScrollTrigger");
      const { default: Lenis } = await import("lenis");

      if (!mounted) return;

      gsapInstance = gsap;
      gsap.registerPlugin(ScrollTrigger);

      // ── Lenis ─────────────────────────────────────────────────────────────
      lenis = new Lenis();
      lenis.on("scroll", ScrollTrigger.update);
      lenisRaf = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(lenisRaf);
      gsap.ticker.lagSmoothing(0);

      gsapCtx = gsap.context(() => {

        // ── Video 1: fullscreen → thumb (común desktop + mobile) ──────────
        gsap.fromTo(
          heroImgRef.current,
          { scaleX: 1, scaleY: 1 },
          {
            scaleX: TARGET_THUMB_PX / window.innerWidth,
            scaleY: TARGET_THUMB_PX / window.innerHeight,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: `+=${window.innerHeight * PIN_MULTIPLIER}px`,
              pin: true,
              pinSpacing: false,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }
        );

        // ── Video 2: thumb → fullscreen (común desktop + mobile) ──────────
        gsap.fromTo(
          videoTwoImgRef.current,
          {
            scaleX: TARGET_THUMB_PX / window.innerWidth,
            scaleY: TARGET_THUMB_PX / window.innerHeight,
          },
          {
            scaleX: 1,
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: videoTwoRef.current,
              start: "top top",
              end: `+=${window.innerHeight * PIN_MULTIPLIER}px`,
              pin: true,
              pinSpacing: true,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }
        );

        // ── gsap.matchMedia: parallax bifurcado por breakpoint ─────────────
        const mm = gsap.matchMedia();

        // DESKTOP (> 1000px) — 4 columnas
        mm.add("(min-width: 1001px)", () => {
          DESKTOP_COLS_CONFIG.forEach(({ initialX, initialY, scrollY }, i) => {
            gsap.set(desktopColRefs.current[i], { x: initialX, y: initialY });
            gsap.to(desktopColRefs.current[i], {
              y: scrollY,
              ease: "none",
              scrollTrigger: {
                trigger: aboutRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            });
          });
        });

        // MOBILE (≤ 1000px) — 2 columnas
        mm.add("(max-width: 1000px)", () => {
          MOBILE_COLS_CONFIG.forEach(({ initialY, scrollY }, i) => {
            gsap.set(mobileColRefs.current[i], { y: initialY });
            gsap.to(mobileColRefs.current[i], {
              y: scrollY,
              ease: "none",
              scrollTrigger: {
                trigger: aboutRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            });
          });
        });

      }); // fin gsap.context
    }

    init();

    return () => {
      mounted = false;
      lenis?.destroy();
      if (gsapInstance && lenisRaf) gsapInstance.ticker.remove(lenisRaf);
      gsapCtx?.revert();
    };
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .mm-about-header p {
          font-size: 0.75rem;
          font-weight: 400;
          letter-spacing: 0.08em;
          line-height: 1.5;
          text-transform: lowercase;
          text-indent: 3rem;
        }
        .mm-outro-text {
          font-size: 0.875rem;
          font-weight: 400;
          letter-spacing: 0.12em;
          line-height: 1.4;
          text-transform: lowercase;
          text-align: justify;
          color: #111;
          width: min(100%, 600px);
          text-indent: 6rem;
        }

        /* ── Desktop columns ──────────────────────────────────────────────── */
        .mm-desktop-cols { display: flex; }
        .mm-mobile-cols  { display: none;  }

        /* ── Mobile ───────────────────────────────────────────────────────── */
        @media (max-width: 1000px) {
          .mm-desktop-cols { display: none; }
          .mm-mobile-cols  { display: flex; }

          .mm-about-header {
            width: 80% !important;
            padding: 1.5rem;
          }
        }
      `}</style>

      {/* ── VIDEO 1: fullscreen → thumb ───────────────────────────────────── */}
      <section ref={heroRef} className="relative w-full h-svh overflow-hidden">
        <div
          ref={heroImgRef}
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ transformOrigin: "center center", willChange: "transform" }}
        >
          <video
            src="/video/MM Hero BG_1.mp4"
            autoPlay muted loop playsInline
            className="w-full h-full object-cover block"
          />
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────────────────── */}
      {/*
        mt-[150svh] = PIN_MULTIPLIER × 100svh, compensa el pin sin pinSpacing.
        h-[150svh]  = recorrido de parallax de las columnas.
      */}
      <section
        ref={aboutRef}
        className="relative w-full h-[150svh] flex justify-center items-center mt-[150svh] overflow-hidden md:overflow-visible"
      >

        {/* ── DESKTOP: 4 columnas ─────────────────────────────────────────── */}
        <div className="mm-desktop-cols absolute inset-0 justify-between items-center p-16">
          {DESKTOP_COLS_CONFIG.map(({ imgs }, colIdx) => (
            <div
              key={colIdx}
              ref={(el) => { desktopColRefs.current[colIdx] = el; }}
              className="relative h-[125%] flex flex-col gap-4 justify-around"
              style={{ willChange: "transform" }}
            >
              {imgs.map((src, i) => (
                <div key={i} className="w-[250px] h-[250px] overflow-hidden shrink-0">
                  <img src={src} alt="" className="w-full h-full object-cover block" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ── MOBILE: 2 columnas ──────────────────────────────────────────── */}
        {/*
          gap-2     → separación horizontal entre columnas (8px)
          Las thumbs no tienen gap vertical → justify-start + gap-y-2
          para que las imágenes queden compactas
        */}
        <div className="mm-mobile-cols absolute inset-0 justify-center items-start gap-4 pt-0">
            {MOBILE_COLS_CONFIG.map(({ imgs }, colIdx) => (
            <div
            key={colIdx}
            ref={(el) => { mobileColRefs.current[colIdx] = el; }}
            className="relative flex flex-col gap-4"
            style={{ willChange: "transform" }}
        >
              {imgs.map((src, i) => (
                <div key={i} className="w-[170px] h-[170px] overflow-hidden shrink-0 opacity-40 saturate-0">
                  <img src={src} alt="" className="w-full h-full object-cover block" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Texto central */}
        <div className="mm-about-header absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/5 text-justify pointer-events-none">
          <p>{ALFREDOS_QUOTE}</p>
        </div>
      </section>

      {/* ── VIDEO 2: thumb → fullscreen ───────────────────────────────────── */}
      <section
        ref={videoTwoRef}
        className="relative w-full h-svh overflow-hidden isolate"
      >
        <div
          ref={videoTwoImgRef}
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ transformOrigin: "center center", willChange: "transform" }}
        >
          <video
            src="/video/Video MM Header.mp4"
            autoPlay muted loop playsInline
            className="w-full h-full object-cover block"
          />
        </div>
      </section>

      {/* ── OUTRO ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 w-full min-h-svh flex justify-center items-center p-16">
        <p className="mm-outro-text">{STATEMENT}</p>
      </section>
    </>
  );
}