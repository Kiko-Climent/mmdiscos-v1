"use client";

import { useEffect, useRef } from "react";

// ─── Constantes ───────────────────────────────────────────────────────────────

const COL1_IMGS = [
  "/Celex - cover.jpg",
  "/corben_peachland_cover.jpg",
  "/Daichi - cover.jpg",
  "/Factory Edits - cover.jpg",
];
const COL2_IMGS = ["/img1.jpg", "/img2.jpg", "/img3.jpg", "/img4.jpg"];
const COL3_IMGS = ["/img5.jpg", "/MMD039.png", "/MMD040_Cover-1.jpg", "/MMD040-2.png"];
const COL4_IMGS = ["/morira - cover.png", "/statues.jpeg", "/img9.jpg", "/img3.jpg"];

const ALFREDOS_QUOTE = `We played without rules, without thinking about styles or what would come next. One track could be slow, the next dark, then something pop or an impossible guitar, but it all made sense in that moment. The dancefloor didn't ask for coherence, it asked for emotion — and as long as people stayed there, smiling and lost, you knew you were doing it right.`;

const STATEMENT = `MM DISCOS IS A RECORD LABEL BASED BETWEEN BERLIN AND BARCELONA, FOUNDED AND POWERED BY MOON & MANN. FREE FROM STYLISTIC BOUNDARIES AND GENRE LIMITATIONS, THE LABEL HAS CONSISTENTLY CHAMPIONED A DISTINCTIVE SOUND WHERE MUSIC SPEAKS FOR ITSELF — DEEPLY INSPIRED BY THE SUEÑO IBICENCO AND THE SPIRIT OF THE MEDITERRANEAN.`;

/**
 * Cuántos viewport-heights permanece pinneada cada sección de video mientras anima.
 * Un mismo valor asegura que ambas animaciones duran lo mismo.
 */
const PIN_MULTIPLIER = 1.5;

/** Tamaño en px que comparten el final del video 1 y el inicio del video 2. */
const TARGET_THUMB_PX = 300;

/**
 * Config por columna del about:
 *   initialX/Y → posición de partida (set por GSAP, no CSS)
 *   scrollY    → cuánto se mueve en el parallax
 */
const COLS_CONFIG = [
  { imgs: COL1_IMGS, initialX: 0,    initialY: 1000, scrollY: -500 },
  { imgs: COL2_IMGS, initialX: -225, initialY: 500,  scrollY: -250 },
  { imgs: COL3_IMGS, initialX:  225, initialY: 500,  scrollY: -250 },
  { imgs: COL4_IMGS, initialX: 0,    initialY: 1000, scrollY: -500 },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Alfredo() {
  const heroRef       = useRef(null);
  const heroImgRef    = useRef(null);
  const aboutRef      = useRef(null);
  const colRefs       = useRef([]);
  const videoTwoRef    = useRef(null);   // sección del segundo video
  const videoTwoImgRef = useRef(null);   // contenedor que GSAP escala

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

        // ── Posiciones iniciales de columnas del about ─────────────────────
        COLS_CONFIG.forEach(({ initialX, initialY }, i) => {
          gsap.set(colRefs.current[i], { x: initialX, y: initialY });
        });

        // ── Estado inicial del segundo video (mismo thumb que el final del primero)
        // Se hace con gsap.set antes de crear el ScrollTrigger para evitar flash.
        gsap.set(videoTwoImgRef.current, {
          scaleX: TARGET_THUMB_PX / window.innerWidth,
          scaleY: TARGET_THUMB_PX / window.innerHeight,
        });

        // ── Video 1: fullscreen → thumb ────────────────────────────────────
        ScrollTrigger.create({
          trigger: heroRef.current,
          start: "top top",
          end: `+=${window.innerHeight * PIN_MULTIPLIER}px`,
          pin: true,
          pinSpacing: false,
          scrub: 1,
          onUpdate({ progress: p }) {
            gsap.set(heroImgRef.current, {
              scaleX: gsap.utils.interpolate(1, TARGET_THUMB_PX / window.innerWidth,  p),
              scaleY: gsap.utils.interpolate(1, TARGET_THUMB_PX / window.innerHeight, p),
            });
          },
        });

        // ── About: parallax de columnas ────────────────────────────────────
        COLS_CONFIG.forEach(({ scrollY }, i) => {
          gsap.to(colRefs.current[i], {
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

        // ── Video 2: thumb → fullscreen ────────────────────────────────────
        ScrollTrigger.create({
          trigger: videoTwoRef.current,
          start: "top top",
          end: `+=${window.innerHeight * PIN_MULTIPLIER}px`,
          pin: true,
          pinSpacing: true,  // ← true para que el outro no solape
          scrub: 1,
          onUpdate({ progress: p }) {
            gsap.set(videoTwoImgRef.current, {
              scaleX: gsap.utils.interpolate(TARGET_THUMB_PX / window.innerWidth,  1, p),
              scaleY: gsap.utils.interpolate(TARGET_THUMB_PX / window.innerHeight, 1, p),
            });
          },
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
          line-height: 1.6;
          text-transform: lowercase;
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
        @media (max-width: 1000px) {
          .mm-about-header { width: 100% !important; padding: 2rem; }
          .mm-img-thumb    { width: 75px !important; height: 75px !important; opacity: 0.25; filter: saturate(0); }
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
        mt-[100svh] → espacio manual bajo el hero pinneado (pinSpacing: false).
        h-[150svh]  → más altura = más tiempo de parallax antes de llegar al video 2.
        Ajusta h-[*] si quieres más o menos duración del parallax.
      */}
      <section
        ref={aboutRef}
        className="relative w-full h-[150svh] flex justify-center items-center mt-[100svh]"
      >
        <div className="absolute inset-0 flex justify-between items-center p-16">
          {COLS_CONFIG.map(({ imgs }, colIdx) => (
            <div
              key={colIdx}
              ref={(el) => { colRefs.current[colIdx] = el; }}
              className="relative h-[125%] flex flex-col justify-around"
              style={{ willChange: "transform" }}
            >
              {imgs.map((src, i) => (
                <div key={i} className="mm-img-thumb w-[125px] h-[125px] overflow-hidden shrink-0">
                  <img src={src} alt="" className="w-full h-full object-cover block" />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mm-about-header absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/5 text-center pointer-events-none">
          <p>{ALFREDOS_QUOTE}</p>
        </div>
      </section>

      {/* ── VIDEO 2: thumb → fullscreen ───────────────────────────────────── */}
      <section ref={videoTwoRef} className="relative w-full h-svh overflow-hidden">
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
      <section className="relative w-full min-h-svh bg-[#cecec6] flex justify-center items-center p-16">
        <p className="mm-outro-text">{STATEMENT}</p>
      </section>
    </>
  );
}