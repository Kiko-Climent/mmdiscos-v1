"use client";

import { useEffect, useRef } from "react";

// ─── SVGs ─────────────────────────────────────────────────────────────────────

const COL1_SVGS = [
  "/label/MMBall00.svg",
  "/label/MMBall01.svg",
  "/label/MMBall02.svg",
  "/label/MMBall03.svg",
  "/label/MMBall04.svg",
  "/label/MMBall05.svg",
  "/label/MMBall06.svg",
];

const COL2_SVGS = [
  "/label/MMBall07.svg",
  "/label/MMBall08.svg",
  "/label/MMBall09.svg",
  "/label/MMBall010.svg",
  "/label/MMBall011.svg",
  "/label/MMBall012.svg",
  "/label/MMBall013.svg",
];

// ─── Textos ───────────────────────────────────────────────────────────────────

const ALFREDOS_QUOTE = `We played without rules, without thinking about styles or what would come next. One track could be slow, the next dark, then something pop or an impossible guitar, but it all made sense in that moment. The dancefloor didn't ask for coherence, it asked for emotion — and as long as people stayed there, smiling and lost, you knew you were doing it right.`;

const STATEMENT = `MM DISCOS IS A RECORD LABEL BASED BETWEEN BERLIN AND BARCELONA, FOUNDED AND POWERED BY MOON & MANN. FREE FROM STYLISTIC BOUNDARIES AND GENRE LIMITATIONS, THE LABEL HAS CONSISTENTLY CHAMPIONED A DISTINCTIVE SOUND WHERE MUSIC SPEAKS FOR ITSELF — DEEPLY INSPIRED BY THE SUEÑO IBICENCO AND THE SPIRIT OF THE MEDITERRANEAN.`;

// ─── Configuración ────────────────────────────────────────────────────────────

const PIN_MULTIPLIER = 1.5;
const TARGET_THUMB_PX = 300;

// Fuerza de desplazamiento en px cuando hay colisión
const COLLISION_FORCE = 32;

// ─── Utilidad de colisión ─────────────────────────────────────────────────────

function rectsOverlap(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Alfredo4() {
  const heroRef        = useRef(null);
  const heroImgRef     = useRef(null);
  const aboutRef       = useRef(null);
  const videoTwoRef    = useRef(null);
  const videoTwoImgRef = useRef(null);
  const textRef        = useRef(null);
  const desktopColRefs = useRef([]);
  const mobileColRefs  = useRef([]);
  // Índices de caracteres que están en medio de su animación de retorno
  const cooldowns      = useRef(new Set());

  useEffect(() => {
    let gsapMod, gsapCtx, lenis, lenisRaf;
    let mounted = true;
    let charSpans = [];
    let svgImgs   = [];
    let tick = 0;

    async function init() {
      const { gsap }           = await import("gsap");
      const { ScrollTrigger }  = await import("gsap/ScrollTrigger");
      const { default: Lenis } = await import("lenis");
      if (!mounted) return;

      gsapMod = gsap;
      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis();
      lenis.on("scroll", ScrollTrigger.update);
      lenisRaf = (t) => lenis.raf(t * 1000);
      gsap.ticker.add(lenisRaf);
      gsap.ticker.lagSmoothing(0);

      // Cachear refs después de la primera render (DOM ya está listo)
      charSpans = Array.from(textRef.current?.querySelectorAll("[data-char]") ?? []);
      svgImgs = [
        ...desktopColRefs.current,
        ...mobileColRefs.current,
      ]
        .filter(Boolean)
        .flatMap((col) => Array.from(col.querySelectorAll("img")));

      gsapCtx = gsap.context(() => {

        // ── Video 1: fullscreen → thumb ──────────────────────────────────────
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

        // ── Video 2: thumb → fullscreen ──────────────────────────────────────
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

        // ── Parallax de columnas SVG ──────────────────────────────────────────
        const mm = gsap.matchMedia();

        // Desktop (> 1000px) — izq y dcha con velocidades asimétricas
        mm.add("(min-width: 1001px)", () => {
          [
            // izquierda: entra desde más abajo, barre más recorrido
            { initialY: 950, scrollY: -650 },
            // derecha: entra antes, velocidad menor
            { initialY: 600, scrollY: -400 },
          ].forEach(({ initialY, scrollY }, i) => {
            const el = desktopColRefs.current[i];
            if (!el) return;
            gsap.set(el, { y: initialY });
            gsap.to(el, {
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

        // Mobile (≤ 1000px) — 2 columnas centradas
        mm.add("(max-width: 1000px)", () => {
          [
            { initialY: 600, scrollY: -350 },
            { initialY: 280, scrollY: -200 },
          ].forEach(({ initialY, scrollY }, i) => {
            const el = mobileColRefs.current[i];
            if (!el) return;
            gsap.set(el, { y: initialY });
            gsap.to(el, {
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

        // ── Detección de colisiones ───────────────────────────────────────────
        ScrollTrigger.create({
          trigger: aboutRef.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: () => {
            // Ejecutar cada 2 frames — reduce llamadas a getBoundingClientRect
            if (++tick % 2 !== 0) return;
            if (!charSpans.length || !svgImgs.length) return;

            // Leer todos los rects PRIMERO (fase layout), luego escribir (fase paint)
            const svgRects  = svgImgs.map((el) => el.getBoundingClientRect());
            const charRects = charSpans.map((el) => el.getBoundingClientRect());

            charSpans.forEach((charEl, ci) => {
              if (cooldowns.current.has(ci)) return;
              const cr = charRects[ci];
              if (cr.width < 1) return; // span invisible (fuera de viewport o display:none)

              for (let si = 0; si < svgImgs.length; si++) {
                const sr = svgRects[si];
                if (!rectsOverlap(cr, sr)) continue;

                // Colisión detectada
                cooldowns.current.add(ci);
                const dx = (cr.left + cr.width  / 2) - (sr.left + sr.width  / 2);
                const dy = (cr.top  + cr.height / 2) - (sr.top  + sr.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                // Push rápido en dirección opuesta al centro del SVG
                gsap.to(charEl, {
                  x: (dx / dist) * COLLISION_FORCE,
                  y: (dy / dist) * COLLISION_FORCE,
                  duration: 0.1,
                  ease: "power2.out",
                  overwrite: true,
                  onComplete: () => {
                    if (!mounted) return;
                    // Retorno suave a posición original
                    gsap.to(charEl, {
                      x: 0,
                      y: 0,
                      duration: 0.55,
                      ease: "power3.out",
                      onComplete: () => cooldowns.current.delete(ci),
                    });
                  },
                });

                break; // una sola colisión por carácter por frame
              }
            });
          },
        });

      }); // fin gsap.context
    }

    init();

    return () => {
      mounted = false;
      lenis?.destroy();
      if (gsapMod && lenisRaf) gsapMod.ticker.remove(lenisRaf);
      // Matar tweens de caracteres huérfanos al desmontar
      if (gsapMod && charSpans.length) gsapMod.killTweensOf(charSpans);
      gsapCtx?.revert();
    };
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .mm-about-header p {
          font-size: 3.75rem;
          font-weight: 400;
          letter-spacing: -0.02em;
          line-height: 0.95;
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
          width: min(100%, 600px);
          text-indent: 6rem;
        }
        .mm-desktop-cols { display: block; }
        .mm-mobile-cols  { display: none;  }

        @media (max-width: 1000px) {
          .mm-desktop-cols { display: none; }
          .mm-mobile-cols  { display: flex; }
          .mm-about-header {
            width: 100% !important;
            padding: 1.5rem;
          }
          .mm-about-header p {
            font-size: 1.95rem;
            font-weight: 400;
            letter-spacing: -0.02em;
            line-height: 0.95;
            text-transform: lowercase;
            text-indent: 3rem;
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
        mt-[150svh] compensa el pin sin pinSpacing del video 1.
        h-[150svh]  da recorrido al parallax de las columnas.
      */}
      <section
        ref={aboutRef}
        className="relative w-full h-[150svh] flex justify-center items-center mt-[150svh] overflow-hidden md:overflow-visible"
      >

        {/* ── Desktop: 2 columnas SVG ─────────────────────────────────────── */}
        {/*
          left-[20%]  ≈ borde izquierdo del texto (w-3/5 centrado empieza en el 20% del viewport).
          right-[20%] ≈ borde derecho del texto.
          Los discos de 180px solapan los caracteres exteriores del párrafo cuando pasan.
          filter:invert convierte los discos blancos en negros, visibles sobre fondo claro.
        */}
        <div className="mm-desktop-cols absolute inset-0">
          <div
            ref={(el) => { desktopColRefs.current[0] = el; }}
            className="absolute left-[20%] top-0 flex flex-col gap-6"
            style={{ willChange: "transform" }}
          >
            {COL1_SVGS.map((src, i) => (
              <div
                key={i}
                className="w-[180px] h-[180px] shrink-0 opacity-60"
                style={{ filter: "invert(1)" }}
              >
                <img src={src} alt="" className="w-full h-full object-contain block" />
              </div>
            ))}
          </div>

          <div
            ref={(el) => { desktopColRefs.current[1] = el; }}
            className="absolute right-[20%] top-0 flex flex-col gap-6"
            style={{ willChange: "transform" }}
          >
            {COL2_SVGS.map((src, i) => (
              <div
                key={i}
                className="w-[180px] h-[180px] shrink-0 opacity-60"
                style={{ filter: "invert(1)" }}
              >
                <img src={src} alt="" className="w-full h-full object-contain block" />
              </div>
            ))}
          </div>
        </div>

        {/* ── Mobile: 2 columnas centradas ────────────────────────────────── */}
        <div className="mm-mobile-cols absolute inset-0 justify-center items-start gap-4">
          {[COL1_SVGS, COL2_SVGS].map((svgs, ci) => (
            <div
              key={ci}
              ref={(el) => { mobileColRefs.current[ci] = el; }}
              className="flex flex-col gap-4"
              style={{ willChange: "transform" }}
            >
              {svgs.map((src, i) => (
                <div
                  key={i}
                  className="w-[110px] h-[110px] shrink-0 opacity-40"
                  style={{ filter: "invert(1)" }}
                >
                  <img src={src} alt="" className="w-full h-full object-contain block" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ── Texto central con split por carácter ────────────────────────── */}
        {/*
          [data-char] identifica spans animables (excluye espacios inline).
          z-10 mantiene el texto encima de los SVGs; los caracteres se desplazan
          como si las bolas los empujaran desde atrás.
        */}
        <div
          ref={textRef}
          className="mm-about-header absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 text-justify pointer-events-none z-10"
        >
          <p>
            {ALFREDOS_QUOTE.split("").map((ch, i) =>
              ch === " " ? (
                <span key={i}> </span>
              ) : (
                <span
                  key={i}
                  data-char
                  style={{ display: "inline-block", willChange: "transform" }}
                >
                  {ch}
                </span>
              )
            )}
          </p>
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
      <section className="relative z-10 w-full min-h-svh flex flex-col justify-between items-center p-8">
        <div className="flex-1 flex items-center justify-center w-full">
          <p className="mm-outro-text">{STATEMENT}</p>
        </div>
        <img
          src="/svg/MM Discos©2026.2.svg"
          alt="MM Discos © 2026"
          style={{ width: "100%", filter: "invert(1)" }}
        />
      </section>
    </>
  );
}
