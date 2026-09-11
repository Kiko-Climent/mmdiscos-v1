"use client";

import { Fragment, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getResponsiveVideoSources } from "@/lib/videoSources";

const ALFREDOS_QUOTE = `We played without rules, without thinking about styles or what would come next. One track could be slow, the next dark, then something pop or an impossible guitar, but it all made sense in that moment. The dancefloor didn't ask for coherence, it asked for emotion — and as long as people stayed there, smiling and lost, you knew you were doing it right.`;

// Split por palabras: cada word es inline-block para que no se rompa
// en wrap, y los espacios intermedios quedan como text-nodes (break
// points naturales que mantienen el centrado).
const QUOTE_WORDS = ALFREDOS_QUOTE.split(" ");

const META_TEXT = "— Alfredo · Amnesia · Ibiza 1987";
const META_CHARS = Array.from(META_TEXT);

const HEADLINE_FONT = "'Favorit', sans-serif";
const HEADER_VIDEO = getResponsiveVideoSources("/video/Video MM Header.mp4");
const MOBILE_MAX = 900;

// Wrapper "mask" para el reveal Locomotive: overflow:hidden contiene el
// char en yPercent 130 (debajo de la línea); el hijo translada a 0.
// padding-bottom + margin-bottom negativo da espacio para descendentes
// (g, p, y) sin alterar la métrica visual aunque el lineHeight sea muy
// cerrado.
const MASK_STYLE = {
  display: "inline-block",
  overflow: "hidden",
  verticalAlign: "bottom",
  paddingBottom: "0.24em",
  marginBottom: "-0.24em",
};

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Agrupa palabras del quote en trozos línea×lado usando el layout YA
// pintado. Clustering por proximidad de `top` (mitad de la altura de
// palabra) en vez de buckets fijos de 5px: con el body a line-height
// 0.92, un redondeo de 5px partía la misma línea en dos y esas
// palabras arrancaban en cascade distinto → se cruzaban al entrar.
function buildQuoteSegments(quoteEl) {
  const wordEls = Array.from(quoteEl.querySelectorAll(".hl-q-word"));
  const containerRect = quoteEl.getBoundingClientRect();
  const containerCenterX = containerRect.left + containerRect.width / 2;

  const wordMeta = wordEls.map((el) => {
    const r = el.getBoundingClientRect();
    return {
      el,
      top: r.top,
      centerX: r.left + r.width / 2,
    };
  });

  const sorted = [...wordMeta].sort((a, b) => a.top - b.top);
  const sampleH = sorted[0]?.el.getBoundingClientRect().height || 20;
  const threshold = Math.max(sampleH * 0.45, 6);

  const lines = [];
  sorted.forEach((w) => {
    const line = lines[lines.length - 1];
    if (line && Math.abs(w.top - line.top) <= threshold) {
      line.words.push(w);
    } else {
      lines.push({ top: w.top, words: [w] });
    }
  });

  const segments = [];
  lines.forEach((line, lineIdx) => {
    const left = [];
    const right = [];
    line.words.forEach((w) => {
      (w.centerX < containerCenterX ? left : right).push(w);
    });
    left.sort((a, b) => a.centerX - b.centerX);
    right.sort((a, b) => a.centerX - b.centerX);
    if (left.length) {
      segments.push({
        side: "L",
        lineIdx,
        words: left,
        anchorX: left[left.length - 1].centerX,
      });
    }
    if (right.length) {
      segments.push({
        side: "R",
        lineIdx,
        words: right,
        anchorX: right[0].centerX,
      });
    }
  });

  return segments;
}

export default function ManifestoNew() {
  const rootRef = useRef(null);
  const stickyRef = useRef(null);
  const quoteTextRef = useRef(null);
  const bottomMetaRef = useRef(null);
  const videoWrapRef = useRef(null);

  useLayoutEffect(() => {
    const sticky = stickyRef.current;
    const quoteEl = quoteTextRef.current;
    if (!sticky || !quoteEl || !bottomMetaRef.current) return;

    const isMobile = window.innerWidth <= MOBILE_MAX;
    let removeManifestoListener = null;

    // El pin tiene que existir en este useLayoutEffect (antes del paint y
    // antes del useEffect de AboutFinal4). Si esperamos a fonts.ready, About
    // calcula su start sobre un manifesto de 100vh sin pin-spacer y, al
    // terminar el vídeo, el scroll salta a About.
    const ctx = gsap.context(() => {
      // ── Reveal timelines ───────────────────────────────────────────
      // Quote: split por posición real (seam zigzag) Y entrada
      // segment-as-unit. Cada línea se parte en dos trozos (L/R) según
      // dónde cae el centro de cada palabra respecto al centro del
      // contenedor. Cada trozo entra como un BLOQUE ya armado: todas
      // sus palabras comparten el mismo start/duration → no se solapan
      // ni se reordenan entre sí.
      //
      // "Spread tightening" interno por trozo: durante el vuelo, las
      // palabras del trozo tienen un poquito más de separación entre
      // sí que en su posición final; al asentarse se compactan al
      // tracking natural. El ancla del spread es la palabra pegada
      // al seam (la rightmost en un trozo L, la leftmost en un trozo
      // R) → ese borde queda "fijo" y el resto del trozo se estira
      // hacia afuera durante la entrada. Con expo.out, la mayoría del
      // tightening ocurre en el último tramo del tween → "lands then
      // settles".
      //
      // Cascade vertical entre trozos (no dentro): línea superior
      // primero, descendiendo. L y R de la misma línea arrancan a la
      // par para que el seam se "cosa" simétricamente.
      //
      // Medición: las words están en su posición natural (sin gsap.set
      // previo). getBoundingClientRect ANTES del estado off-screen.
      //
      // Blur parent-level acompaña toda la wave.
      const quoteEl = quoteTextRef.current;
      const quoteWordEls = Array.from(quoteEl.querySelectorAll(".hl-q-word"));
      const metaCharEls = Array.from(
        bottomMetaRef.current.querySelectorAll(".hl-m-char")
      );

      // Tipografía/caja idénticas a Highlights3_3Desktop_2 ANTES de
      // medir. Si el wrap no es el del layout final, palabras de una
      // misma línea caen en trozos distintos y se cruzan al entrar.
      quoteEl.style.fontFamily = HEADLINE_FONT;
      quoteEl.style.fontWeight = "400";
      quoteEl.style.letterSpacing = "-0.02em";
      quoteEl.style.textTransform = "lowercase";
      quoteEl.style.fontSize = "clamp(2rem, 3.6vw, 3.4rem)";
      quoteEl.style.lineHeight = "0.90";
      quoteEl.style.padding = isMobile ? "0" : "0 clamp(1rem, 2vw, 2rem)";
      gsap.set(quoteWordEls, { clearProps: "transform,opacity" });
      const quoteBox = quoteEl.parentElement;
      const quoteFrame = quoteBox?.parentElement;
      if (isMobile) {
        if (quoteFrame) {
          quoteFrame.style.paddingTop = "6.5rem";
          quoteFrame.style.paddingBottom = "3.75rem";
        }
        if (quoteBox) {
          quoteBox.style.width = "100%";
          quoteBox.style.maxWidth = "480px";
        }
      }
      void quoteEl.offsetWidth;

      const segments = buildQuoteSegments(quoteEl);

      const offX = window.innerWidth * (isMobile ? 0.6 : 0.7);
      // Spread = % del distance-al-seam que se añade como spacing
      // extra durante el vuelo. 0.12 = ~12% más espaciado, sutil.
      const SPREAD = isMobile ? 0.1 : 0.12;

      // Estado inicial: cada word arranca off-screen del lado de su
      // trozo MÁS un offset proporcional a su distancia al seam (más
      // lejos del seam → más spread outward).
      segments.forEach((seg) => {
        const baseOff = seg.side === "L" ? -offX : offX;
        seg.words.forEach((w) => {
          const extraSpace = (w.centerX - seg.anchorX) * SPREAD;
          gsap.set(w.el, {
            x: baseOff + extraSpace,
            opacity: 0,
            force3D: true,
          });
        });
      });
      gsap.set(quoteTextRef.current, {
        filter: isMobile ? "blur(5px)" : "blur(6px)",
      });
      gsap.set(metaCharEls, {
        yPercent: 130,
        scaleY: isMobile ? 1.08 : 1.1,
        force3D: true,
      });
      gsap.set(bottomMetaRef.current, {
        filter: isMobile ? "blur(2px)" : "blur(3px)",
      });

      const segDuration = isMobile ? 0.6 : 0.7;
      const lineCascade = isMobile ? 0.06 : 0.07;

      const quoteRevealTl = gsap.timeline({ paused: true });

      // Todas las palabras de un mismo trozo comparten el mismo start
      // y la misma duración → entran como bloque. El spread se diluye
      // dentro del propio tween (cada x converge a 0 desde su initial,
      // que ya incluía el offset spread).
      segments.forEach((seg) => {
        const startTime = seg.lineIdx * lineCascade;
        seg.words.forEach((w) => {
          quoteRevealTl.to(
            w.el,
            {
              x: 0,
              opacity: 1,
              duration: segDuration,
              ease: "expo.out",
              force3D: true,
            },
            startTime
          );
        });
      });

      const totalQuoteWave = quoteRevealTl.duration();
      quoteRevealTl.to(
        quoteEl,
        {
          filter: "blur(0px)",
          duration: totalQuoteWave,
          ease: "power2.out",
        },
        0
      );

      const metaDuration = isMobile ? 0.65 : 0.7;
      const metaStagger = isMobile ? 0.024 : 0.022;
      const totalMetaWave =
        metaDuration + Math.max(0, metaCharEls.length - 1) * metaStagger;

      const metaRevealTl = gsap.timeline({ paused: true });
      metaRevealTl
        .to(
          metaCharEls,
          {
            yPercent: 0,
            scaleY: 1,
            duration: metaDuration,
            ease: "expo.out",
            stagger: metaStagger,
            force3D: true,
          },
          0
        )
        .to(
          bottomMetaRef.current,
          {
            filter: "blur(0px)",
            duration: totalMetaWave,
            ease: "power2.out",
          },
          0
        );

      // ── Phase budget ───────────────────────────────────────────────
      // Sección independiente: ya no comparte pin con Highlights.
      //  1. videoGrow   — el vídeo se expande desde el centro     (scrub)
      //  2. videoRecede — vídeo retrocede + quote + firma         (scrub)
      //
      // recedeRange deliberadamente corto (0.6 vh) → mismo recorrido
      // animado en menos scroll = sensación de "golpe" sin perder la
      // consistencia del scrub. Lenis añade la inercia que lo asienta.
      const vh = window.innerHeight;
      const growRange = vh * (isMobile ? 0.8 : 0.9);
      const recedeRange = vh * 0.6;
      const totalRange = growRange + recedeRange;
      const growPhaseEnd = growRange / totalRange;
      const manifestoProgress = 0.995;

      const mainTrigger = ScrollTrigger.create({
        trigger: sticky,
        start: "top top",
        end: `+=${totalRange}`,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          const gp = clamp01(p / growPhaseEnd);
          const rp = clamp01((p - growPhaseEnd) / (1 - growPhaseEnd));

          // ── Fase videoGrow (gp) — scrubbed ──────────────────────
          // Vídeo expande desde el centro: scale 0 → 1, opacidad rápida.
          const grow = easeInOutCubic(gp);
          const growOpacity = clamp01(gp / 0.12);

          // ── Fase videoRecede (rp) — scrubbed con cascade ────────
          // Todo tied a scroll → no hay desync posible al hacer scroll
          // back rápido. El "golpe" viene del recedeRange corto (0.6vh)
          // + easings agresivos (power4/expo.out) + stagger interno.
          //
          // Cascade (sub-rangos dentro de rp, todos en [0..1]):
          //   vídeo:   rp 0.00 → 0.55  scale 1→0.50, opacity 1→0.60
          //   quote:   rp 0.25 → 0.80  opacity+y    (power4-equiv)
          //   firma:   rp 0.70 → 1.00  opacity+y    (expo.out)
          //
          // Quote arranca en 0.25 (donde antes lo hacían las reglas
          // horizontales, ahora eliminadas) para que el reveal del
          // texto sea la señal de "arranque editorial" sin la deuda
          // visual de las líneas.
          //
          // El vídeo NO desaparece — queda al fondo a opacity 0.6 +
          // scale 0.5, dándole profundidad atmosférica al quote.
          const VIDEO_REST_SCALE = 0.5;
          const VIDEO_REST_OPACITY = 0.6;
          const recedeP = easeInOutCubic(clamp01(rp / 0.55));
          const videoScale =
            rp > 0 ? 1 - recedeP * (1 - VIDEO_REST_SCALE) : grow;
          const videoOpacity =
            rp > 0
              ? growOpacity * (1 - recedeP * (1 - VIDEO_REST_OPACITY))
              : growOpacity;

          if (videoWrapRef.current) {
            videoWrapRef.current.style.transform = `translate(-50%, -50%) scale(${videoScale.toFixed(4)})`;
            videoWrapRef.current.style.opacity = String(videoOpacity);
          }

          // Quote word reveal — cascade Locomotive scrubbed por rp.
          // textP es lineal a propósito: la curva expo.out vive dentro
          // de la TL (per-word). Componer easings aquí amortiguaría el
          // snap inicial del wave.
          const textP = clamp01((rp - 0.25) / 0.55);
          quoteRevealTl.progress(textP);

          // Signature char reveal — mismo patrón, char-level.
          const metaP = clamp01((rp - 0.7) / 0.3);
          metaRevealTl.progress(metaP);
        },
      });

      const onManifestoNav = () => {
        const start = Number(mainTrigger.start);
        const end = Number(mainTrigger.end);
        if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start)
          return;

        const targetY = start + (end - start) * manifestoProgress;
        window.dispatchEvent(
          new CustomEvent("mm-scroll-to", { detail: { y: targetY } })
        );
      };

      window.addEventListener("mm-nav-manifesto", onManifestoNav);
      removeManifestoListener = () =>
        window.removeEventListener("mm-nav-manifesto", onManifestoNav);

      ScrollTrigger.refresh();
    }, rootRef);

    return () => {
      if (removeManifestoListener) removeManifestoListener();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="manifesto-root w-full bg-white">
      <section
        ref={stickyRef}
        className="manifesto-sticky relative w-screen h-screen bg-white overflow-hidden"
      >
        {/* ── Editorial overlay ─────────────────────────────────────
            Orden de profundidad:
              · z[2] vídeo (centrado, scale GPU)
              · z[3] quote + firma (delante del vídeo)
            En grow el vídeo es solo; en recede el vídeo retrocede
            mientras texto y firma pintan encima. */}
        <div className="absolute inset-0 z-[3] pointer-events-none text-black">
          {/* Firma — chars-as-masks (reveal char-level estilo Locomotive) */}
          <div
            ref={bottomMetaRef}
            className="absolute left-1/2 -translate-x-1/2 bottom-6 min-[901px]:bottom-8 text-[10px] min-[901px]:text-[11px] tracking-[0.22em] min-[901px]:tracking-[0.25em] uppercase font-medium whitespace-nowrap"
            style={{ fontFamily: HEADLINE_FONT, lineHeight: 1.1 }}
          >
            {META_CHARS.map((c, i) => (
              <span key={i} style={MASK_STYLE}>
                <span className="hl-m-char inline-block">
                  {c === " " ? " " : c}
                </span>
              </span>
            ))}
          </div>

          {/* Quote — word-level split. Cada palabra es inline-block
              (sus chars no se separan al hacer wrap) y los espacios
              entre palabras quedan como text-nodes → break points
              naturales que mantienen el wrap centrado del layout.
              El x translate de la animación no altera el flow, solo
              desplaza el render: el "hueco" final está reservado en
              su posición centrada desde el primer frame. */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ paddingTop: "10rem", paddingBottom: "5.5rem" }}
          >
            <div className="relative w-[min(88vw,74rem)] text-center">
              <p
                ref={quoteTextRef}
                className="hl-quote-text text-black"
                style={{
                  fontFamily: HEADLINE_FONT,
                  fontSize: "clamp(2rem, 3.6vw, 3.4rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  lineHeight: 0.84,
                  textTransform: "lowercase",
                  padding: "0 clamp(1rem, 2vw, 2rem)",
                }}
              >
                {QUOTE_WORDS.map((w, i) => (
                  <Fragment key={i}>
                    <span className="hl-q-word inline-block will-change-transform">
                      {w}
                    </span>
                    {i < QUOTE_WORDS.length - 1 ? " " : ""}
                  </Fragment>
                ))}
              </p>
            </div>
          </div>
        </div>

        {/* Vídeo — centrado, scale GPU desde 0. z[2] queda detrás de
            las reglas/quote del overlay (z[3]) cuando aparecen. */}
        <div
          ref={videoWrapRef}
          aria-hidden
          className="absolute overflow-hidden will-change-[transform,opacity] z-[2] top-1/2 left-1/2 w-[clamp(220px,75vw,360px)] min-[901px]:top-[calc(50vh+2.25rem)] min-[901px]:w-[clamp(300px,min(54vw,calc(44vh*16/9)),700px)]"
          style={{
            aspectRatio: "16 / 9",
            transform: "translate(-50%, -50%) scale(0)",
            transformOrigin: "center center",
            opacity: 0,
          }}
        >
          <video
            className="w-full h-full object-cover block"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source
              media="(max-width: 719px)"
              src={HEADER_VIDEO.mobile}
              type="video/mp4"
            />
            <source
              media="(max-width: 1279px)"
              src={HEADER_VIDEO.tablet}
              type="video/mp4"
            />
            <source src={HEADER_VIDEO.desktop} type="video/mp4" />
            <source src={HEADER_VIDEO.fallback} type="video/mp4" />
          </video>
        </div>
      </section>
    </div>
  );
}
