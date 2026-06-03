"use client";

import { Fragment, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SLIDES = [
  {
    title: "Pelagos EP",
    base: "MMD042_Cover",
    ref: "mmd042",
    copy: "James Falco's Pelagos EP lands somewhere between Amnesia Ibiza and The Haçienda — four sun-faded cuts of dub, dream house and Mediterranean afterhours heat.",
  },
  {
    title: "Brahmaputra EP",
    base: "MMD041_Cover",
    ref: "mmd041",
    copy: "Gritty basslines, sharp percussion and 80s-leaning house crossed with Balearic flashes, dub pressure and proto-trance heat. Four cuts caught between peak-time progressive and introspective drift",
  },
  {
    title: "Socarrat vol.1",
    base: "MMD040_Cover-1",
    ref: "mmd040.1",
    copy: "A decade of MM Discos, condensed. Volume one drifts from mid-tempo grooves to house-driven heat, threaded with a Balearic pulse. No trends, no labels — just the freewheeling spirit that defined us from day one.",
  },
  {
    title: "Deamwalker EP",
    base: "img4",
    ref: "mmd036",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
  {
    title: "Socarrat vol.2",
    base: "MMD040-2",
    ref: "mmd040.2",
    copy: "The Socarrat continues. Volume II spans dark-Balearic moods, kraut-infused drifts, spatial post-Italo journeys, electronic funk and tropical psychedelia — a cosmic tutti-frutti charting ten years of MM Discos at full tilt.",
  },
  {
    title: "Eternal Sunset EP",
    base: "MMD039",
    ref: "mmd039",
    copy: "Nic Jalusi distills his '90s-leaning house on Eternal Sunset — Italian dream house, Kwaito and dub textures, African-synth heat and late-night breaks. A sun-soaked cocktail for living rooms and dancefloors alike.",
  },
];

// Helpers para responsive images optimizadas (sharp → /public/img-opt/v2)
const optBase = (base) => `/img-opt/v2/${base}__balanced`;
const buildSrcSet = (base, ext) =>
  `${optBase(base)}-720.${ext} 720w, ${optBase(base)}-960.${ext} 960w, ${optBase(base)}-1280.${ext} 1280w`;
const SLIDER_IMG_SIZES = "(min-width: 1385px) 360px, 26vw";

const ALFREDOS_QUOTE = `We played without rules, without thinking about styles or what would come next. One track could be slow, the next dark, then something pop or an impossible guitar, but it all made sense in that moment. The dancefloor didn't ask for coherence, it asked for emotion — and as long as people stayed there, smiling and lost, you knew you were doing it right.`;

// Split por palabras: cada word es inline-block para que no se rompa
// en wrap, y los espacios intermedios quedan como text-nodes (break
// points naturales que mantienen el centrado).
const QUOTE_WORDS = ALFREDOS_QUOTE.split(" ");

const META_TEXT = "— Alfredo · Amnesia · Ibiza 1987";
const META_CHARS = Array.from(META_TEXT);

const HEADLINE_FONT = "'Favorit', sans-serif";

// Etiqueta inicial del index (rectángulo negro al pie del crossbar)
// durante el intro. Se intercambia por SLIDES[0].ref justo cuando el
// crossbar termina de dibujarse (ip → 1), usando el mismo fade que el
// scroll dispara al cambiar de slide.
const INTRO_INDEX_LABEL = "HIGHLIGHTS";

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
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export default function Highlights3_3Desktop_2() {
  const rootRef = useRef(null);
  const stickyRef = useRef(null);
  const indicatorRef = useRef(null);
  const stripRef = useRef(null);
  const copyRef = useRef(null);
  const counterRef = useRef(null);
  const progressRef = useRef(null);
  const progressBarRef = useRef(null);
  const indexRef = useRef(null);
  const listPanelRef = useRef(null);
  const imagePanelRef = useRef(null);
  const grainRef = useRef(null);
  const itemsRef = useRef([]);

  // Editorial overlay refs
  const quoteRef = useRef(null);
  const topRuleRef = useRef(null);
  const bottomRuleRef = useRef(null);
  const quoteTextRef = useRef(null);
  const bottomMetaRef = useRef(null);
  const videoWrapRef = useRef(null);
  const videoRef = useRef(null);

  useLayoutEffect(() => {
    if (window.innerWidth <= 900) return;

    const sticky = stickyRef.current;
    const items = itemsRef.current.filter(Boolean);
    if (!sticky || items.length === 0) return;

    let currentIndex = 0;
    let copyTween = null;
    let removeManifestoListener = null;
    // Flag de transición del label del index al cruzar ip=1 (fin del
    // intro). True = ya se hizo el swap "HIGHLIGHTS" → SLIDES[0].ref.
    // Permite también el camino inverso al volver al intro con scroll
    // back, restituyendo "HIGHLIGHTS".
    let introCounterSettled = false;

    const ctx = gsap.context(() => {
      const sample = items[0].querySelector("p");
      const cs = sample ? window.getComputedStyle(sample) : null;
      const measure = document.createElement("div");
      measure.style.cssText =
        "position:absolute;visibility:hidden;height:auto;width:auto;white-space:nowrap;left:-9999px;top:0;pointer-events:none;";
      if (cs) {
        measure.style.fontFamily = cs.fontFamily;
        measure.style.fontSize = cs.fontSize;
        measure.style.fontWeight = cs.fontWeight;
        measure.style.fontStyle = cs.fontStyle;
        measure.style.letterSpacing = cs.letterSpacing;
        measure.style.textTransform = cs.textTransform;
      }
      document.body.appendChild(measure);
      const titleWidths = items.map((el) => {
        measure.textContent = el.querySelector("p").textContent;
        return measure.offsetWidth + 8;
      });
      document.body.removeChild(measure);

      const itemHeight = items[0].getBoundingClientRect().height;
      const firstImg = stripRef.current?.querySelector(".hl-img");
      const imgHeight = firstImg ? firstImg.getBoundingClientRect().height : 0;

      gsap.set(indicatorRef.current, {
        width: titleWidths[0],
        xPercent: -50,
        left: "50%",
        height: itemHeight,
        force3D: true,
      });

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
      const quoteWordEls = quoteTextRef.current
        ? Array.from(quoteTextRef.current.querySelectorAll(".hl-q-word"))
        : [];
      const metaCharEls = bottomMetaRef.current
        ? Array.from(bottomMetaRef.current.querySelectorAll(".hl-m-char"))
        : [];

      const containerRect = quoteTextRef.current.getBoundingClientRect();
      const containerCenterX = containerRect.left + containerRect.width / 2;

      const wordMeta = quoteWordEls.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          el,
          top: r.top,
          centerX: r.left + r.width / 2,
        };
      });

      // Línea → índice (top-to-bottom). Tolerancia 5px por baseline rounding.
      const lineKeyOf = (top) => Math.round(top / 5) * 5;
      const sortedTops = [...wordMeta].sort((a, b) => a.top - b.top);
      const lineIdxMap = new Map();
      sortedTops.forEach((w) => {
        const key = lineKeyOf(w.top);
        if (!lineIdxMap.has(key)) lineIdxMap.set(key, lineIdxMap.size);
      });

      // Agrupa words por trozo: clave `${lineKey}|${side}`.
      const segmentsMap = new Map();
      wordMeta.forEach((w) => {
        const side = w.centerX < containerCenterX ? "L" : "R";
        const key = `${lineKeyOf(w.top)}|${side}`;
        if (!segmentsMap.has(key)) segmentsMap.set(key, { side, words: [] });
        segmentsMap.get(key).words.push(w);
      });

      const segments = [];
      segmentsMap.forEach((seg, key) => {
        const lineKey = Number(key.split("|")[0]);
        const lineIdx = lineIdxMap.get(lineKey) || 0;
        // Ordena por centerX para localizar el ancla seam.
        seg.words.sort((a, b) => a.centerX - b.centerX);
        // Ancla: en trozo L = rightmost (pegado al seam por la derecha),
        // en trozo R = leftmost (pegado al seam por la izquierda).
        const anchorX =
          seg.side === "L"
            ? seg.words[seg.words.length - 1].centerX
            : seg.words[0].centerX;
        segments.push({ ...seg, lineIdx, anchorX });
      });

      const offX = window.innerWidth * 0.7;
      // Spread = % del distance-al-seam que se añade como spacing
      // extra durante el vuelo. 0.12 = ~12% más espaciado, sutil.
      const SPREAD = 0.12;

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
      gsap.set(quoteTextRef.current, { filter: "blur(6px)" });
      gsap.set(metaCharEls, {
        yPercent: 130,
        scaleY: 1.1,
        force3D: true,
      });
      gsap.set(bottomMetaRef.current, { filter: "blur(3px)" });

      const segDuration = 0.7;
      const lineCascade = 0.07; // delay por línea hacia abajo

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
        quoteTextRef.current,
        {
          filter: "blur(0px)",
          duration: totalQuoteWave,
          ease: "power2.out",
        },
        0
      );

      const metaDuration = 0.7;
      const metaStagger = 0.022;
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
      //  1. intro      — paneles entran (espejo del split)        (scrub)
      //  2. slides     — un viewport por slide                    (scrub)
      //  3. split      — paneles se separan, crossbar colapsa     (scrub)
      //  4. videoGrow  — el vídeo se expande desde el centro      (scrub)
      //  5. videoRecede — vídeo retrocede + reglas + quote + firma (scrub)
      //
      // Intro DENTRO del pin (no en `top bottom → top top`). Razones:
      //  · El sticky no se mueve durante el pin, así que el transform
      //    de los paneles no se compone con el scroll del sticky →
      //    no hay rebote del contenido (cuando intro corría con el
      //    sticky entrando, el ease del transform "adelantaba" al
      //    scroll y el contenido oscilaba ±8vh antes de centrar).
      //  · El hero anterior termina su salida ANTES de que el sticky
      //    se pinee (con el spacer del hero a 185svh), evitando la
      //    cortina del listado de artistas sobre la animación.
      //
      // recedeRange deliberadamente corto (0.6 vh) → mismo recorrido
      // animado en menos scroll = sensación de "golpe" sin perder la
      // consistencia del scrub. Lenis añade la inercia que lo asienta.
      const total = SLIDES.length;
      const vh = window.innerHeight;
      const introRange = vh * 1;
      const slidesRange = vh * total;
      const splitRange = vh * 1;
      const growRange = vh * 0.9;
      const recedeRange = vh * 0.6;
      const totalRange =
        introRange + slidesRange + splitRange + growRange + recedeRange;

      const introPhaseEnd = introRange / totalRange;
      const slidePhaseEnd = (introRange + slidesRange) / totalRange;
      const splitPhaseEnd =
        (introRange + slidesRange + splitRange) / totalRange;
      const growPhaseEnd =
        (introRange + slidesRange + splitRange + growRange) / totalRange;
      const manifestoProgress = 0.995;

      // Helper: fade-swap del label del index. Mismas duraciones/eases
      // que la animación de cambio de slide existente — única fuente de
      // verdad para que el intro→mmd042, mmd042→HIGHLIGHTS y los
      // cambios de slide compartan exactamente la misma cinemática.
      const fadeCounterTo = (newText) => {
        if (!counterRef.current) return;
        gsap.killTweensOf(counterRef.current);
        gsap.to(counterRef.current, {
          opacity: 0,
          duration: 0.12,
          ease: "power2.in",
          overwrite: true,
          onComplete: () => {
            if (!counterRef.current) return;
            counterRef.current.textContent = newText;
            gsap.to(counterRef.current, {
              opacity: 1,
              duration: 0.22,
              ease: "power2.out",
              overwrite: true,
            });
          },
        });
      };

      const mainTrigger = ScrollTrigger.create({
        trigger: sticky,
        start: "top top",
        end: `+=${totalRange}`,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;

          const ip = clamp01(p / introPhaseEnd);
          const sp = clamp01(
            (p - introPhaseEnd) / (slidePhaseEnd - introPhaseEnd)
          );
          const splitp = clamp01(
            (p - slidePhaseEnd) / (splitPhaseEnd - slidePhaseEnd)
          );
          const gp = clamp01(
            (p - splitPhaseEnd) / (growPhaseEnd - splitPhaseEnd)
          );
          const rp = clamp01((p - growPhaseEnd) / (1 - growPhaseEnd));

          gsap.set(progressRef.current, { scaleY: sp, force3D: true });

          // ── Paneles: intro + split como un único gesto ──────────
          // panelFactor recorre 1 → 0 → -1 continuo a lo largo del scroll:
          //   intro:  introEased 0→1, splitEased 0      → factor 1→0
          //   slides: introEased 1,   splitEased 0      → factor 0
          //   split:  introEased 1,   splitEased 0→1    → factor 0→-1
          // listPanel = +factor → sube todo el recorrido.
          // imagePanel = -factor → baja todo el recorrido.
          const introEased = easeInOutCubic(ip);
          const splitEased = easeInOutCubic(splitp);
          const panelFactor = 1 - introEased - splitEased;

          if (listPanelRef.current) {
            listPanelRef.current.style.transform = `translate3d(0, ${100 * panelFactor}%, 0)`;
          }
          if (imagePanelRef.current) {
            imagePanelRef.current.style.transform = `translate3d(0, ${-100 * panelFactor}%, 0)`;
          }

          // ── Crossbar: intro dibuja + split colapsa ───────────────
          // Espejo proporcional del outro. El outro colapsa la barra en
          // el primer 70% de splitp (snappy → "señal" de salida); el
          // intro la dibuja en el último 70% de ip (los paneles entran
          // primero, la barra los "encierra" justo cuando aterrizan en
          // el centro). Mismo factor 0.7, misma cinemática lineal, sólo
          // invertida en el eje temporal.
          //
          // introBarInset y splitBarInset son mutuamente excluyentes:
          // durante el intro splitp=0 → splitBarInset=0; durante el
          // split ip=1 → introBarInset=0. La suma es siempre el inset
          // efectivo sin ramificaciones.
          const introBarDraw = clamp01((ip - 0.3) / 0.7);  // 0 → 1 en ip [0.3, 1]
          const barCollapse = clamp01(splitp / 0.7);
          const counterOp = clamp01((0.55 - splitp) / 0.55);

          if (progressBarRef.current) {
            const introBarInset = 50 * (1 - introBarDraw);  // 50 → 0
            const splitBarInset = 50 * barCollapse;          // 0 → 50
            const inset = introBarInset + splitBarInset;
            progressBarRef.current.style.clipPath = `inset(${inset}% 0% ${inset}% 0%)`;
          }
          if (indexRef.current) {
            indexRef.current.style.opacity = String(counterOp);
          }
          if (grainRef.current) {
            grainRef.current.style.opacity = String(
              Math.sin(splitp * Math.PI) * 0.18
            );
          }

          // ── Index label: HIGHLIGHTS ↔ SLIDES[0].ref ──────────────
          // Cruce ip=1: el crossbar terminó de dibujarse y los paneles
          // aterrizaron en el centro → swap a la primera referencia.
          // Cruce ip<1 (scroll back): restituye "HIGHLIGHTS". Mismo fade
          // que el cambio de slide vía fadeCounterTo, para que la
          // cinemática sea idéntica en ambos sentidos.
          if (ip >= 1 && !introCounterSettled) {
            introCounterSettled = true;
            fadeCounterTo(SLIDES[0].ref);
          } else if (ip < 1 && introCounterSettled) {
            introCounterSettled = false;
            fadeCounterTo(INTRO_INDEX_LABEL);
          }

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
          //   reglas:  rp 0.25 → 0.70  scaleX 0→1   (expo.out)
          //   quote:   rp 0.40 → 0.95  opacity+y     (power4-equiv)
          //   firma:   rp 0.70 → 1.00  opacity+y     (expo.out)
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

          const ruleP = easeOutExpo(clamp01((rp - 0.25) / 0.45));
          if (topRuleRef.current) {
            topRuleRef.current.style.transform = `scaleX(${ruleP})`;
          }
          if (bottomRuleRef.current) {
            bottomRuleRef.current.style.transform = `scaleX(${ruleP})`;
          }

          // Quote word reveal — cascade Locomotive scrubbed por rp.
          // textP es lineal a propósito: la curva expo.out vive dentro
          // de la TL (per-word). Componer easings aquí amortiguaría el
          // snap inicial del wave.
          const textP = clamp01((rp - 0.4) / 0.55);
          quoteRevealTl.progress(textP);

          // Signature char reveal — mismo patrón, char-level.
          const metaP = clamp01((rp - 0.7) / 0.3);
          metaRevealTl.progress(metaP);

          // ── Activación slide ────────────────────────────────────
          let activeIndex = Math.floor(sp * total);
          if (activeIndex < 0) activeIndex = 0;
          if (activeIndex >= total) activeIndex = total - 1;

          if (currentIndex === activeIndex) return;
          currentIndex = activeIndex;

          items.forEach((el) => el.classList.remove("hl-active"));
          items[activeIndex].classList.add("hl-active");

          gsap.to(indicatorRef.current, {
            y: activeIndex * itemHeight,
            width: titleWidths[activeIndex],
            duration: 0.3,
            ease: "power3.inOut",
            overwrite: true,
            force3D: true,
          });

          gsap.to(stripRef.current, {
            y: -(activeIndex * imgHeight),
            duration: 0.3,
            ease: "power3.inOut",
            overwrite: true,
            force3D: true,
          });

          fadeCounterTo(SLIDES[activeIndex].ref);

          if (copyTween) copyTween.kill();
          copyTween = gsap.to(copyRef.current, {
            opacity: 0,
            y: -12,
            duration: 0.2,
            ease: "power2.in",
            force3D: true,
            onComplete: () => {
              copyRef.current.textContent = SLIDES[activeIndex].copy;
              gsap.set(copyRef.current, { opacity: 0, y: 12 });
              copyTween = gsap.to(copyRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.3,
                ease: "power3.out",
                force3D: true,
              });
            },
          });
        },
      });

      const onManifestoNav = () => {
        const start = Number(mainTrigger.start);
        const end = Number(mainTrigger.end);
        if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return;

        const targetY = start + (end - start) * manifestoProgress;
        window.dispatchEvent(new CustomEvent("mm-scroll-to", { detail: { y: targetY } }));
      };

      window.addEventListener("mm-nav-manifesto", onManifestoNav);
      removeManifestoListener = () =>
        window.removeEventListener("mm-nav-manifesto", onManifestoNav);

      ScrollTrigger.refresh();
    }, rootRef);

    return () => {
      if (copyTween) copyTween.kill();
      if (removeManifestoListener) removeManifestoListener();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="hl-root w-full bg-white">
      <section
        ref={stickyRef}
        className="hl-sticky relative w-screen h-screen bg-white overflow-hidden"
      >
        {/* Panel lista — entra desde abajo en intro, sale hacia arriba en split */}
        <div
          ref={listPanelRef}
          className="hl-panel absolute top-0 left-0 w-1/2 h-full flex items-center justify-center z-[1]"
          style={{ transform: "translate3d(0, 100%, 0)" }}
        >
          <div className="hl-services flex flex-col items-center">
            <div ref={indicatorRef} className="hl-indicator" />
            {SLIDES.map((s, i) => (
              <div
                key={s.title}
                ref={(el) => {
                  itemsRef.current[i] = el;
                }}
                className={`hl-service ${i === 0 ? "hl-active" : ""}`}
              >
                <p className="uppercase font-semibold leading-none text-[2.75rem]">
                  {s.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Panel imagen + copy — entra desde arriba en intro, sale hacia abajo en split */}
        <div
          ref={imagePanelRef}
          className="hl-panel absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center gap-10 px-6 z-[1]"
          style={{ transform: "translate3d(0, -100%, 0)" }}
        >
          <div className="hl-img-wrapper relative aspect-square w-[clamp(220px,26vw,360px)] overflow-hidden">
            <div ref={stripRef} className="hl-service-img w-full">
              {SLIDES.map((s, i) => (
                <div
                  key={s.ref}
                  className="hl-img relative w-full aspect-square"
                >
                  <picture>
                    <source
                      type="image/avif"
                      srcSet={buildSrcSet(s.base, "avif")}
                      sizes={SLIDER_IMG_SIZES}
                    />
                    <source
                      type="image/webp"
                      srcSet={buildSrcSet(s.base, "webp")}
                      sizes={SLIDER_IMG_SIZES}
                    />
                    <img
                      src={`${optBase(s.base)}-960.webp`}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      draggable={false}
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      decoding="async"
                    />
                  </picture>
                </div>
              ))}
            </div>
          </div>

          <div className="w-[clamp(220px,26vw,360px)]">
            <p
              ref={copyRef}
              className="hl-copy text-[18px] leading-tight text-black"
            >
              {SLIDES[0].copy}
            </p>
          </div>
        </div>

        {/* Crossbar vertical — se dibuja desde el centro en intro,
            colapsa hacia el centro en split. Estado inicial colapsado
            (inset 50%) para evitar flash de barra completa antes de
            que el trigger evalúe en el primer frame. */}
        <div
          ref={progressBarRef}
          className="hl-progress-bar"
          style={{ clipPath: "inset(50% 0% 50% 0%)" }}
        >
          <div ref={progressRef} className="hl-progress" />
        </div>

        {/* Código catálogo (ref) — arranca como "HIGHLIGHTS" durante el
            intro, se intercambia por SLIDES[0].ref justo al terminar de
            dibujarse el crossbar (ip=1), y luego cambia por slide. */}
        <div ref={indexRef} className="hl-index hl-index--ref">
          <span ref={counterRef}>{INTRO_INDEX_LABEL}</span>
        </div>

        {/* ── Editorial overlay ─────────────────────────────────────
            Orden de profundidad:
              · z[2] vídeo (centrado, scale GPU)
              · z[3] reglas + quote + firma (delante del vídeo)
            En grow el vídeo es solo; en recede el vídeo retrocede
            mientras reglas y texto pintan encima. */}
        <div
          ref={quoteRef}
          className="absolute inset-0 z-[3] pointer-events-none text-black"
        >
          {/* Top horizontal rule */}
          <div
            ref={topRuleRef}
            className="absolute left-0 right-0 top-[10rem] h-px bg-black origin-left will-change-transform"
            style={{ transform: "scaleX(0)" }}
          />

          {/* Bottom horizontal rule */}
          <div
            ref={bottomRuleRef}
            className="absolute left-0 right-0 bottom-[5.5rem] h-px bg-black origin-left will-change-transform"
            style={{ transform: "scaleX(0)" }}
          />

          {/* Firma — chars-as-masks (reveal char-level estilo Locomotive) */}
          <div
            ref={bottomMetaRef}
            className="absolute left-1/2 -translate-x-1/2 bottom-8 text-[11px] tracking-[0.25em] uppercase font-medium whitespace-nowrap"
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
                  fontSize: "clamp(1.5rem, 3.4vw, 3.25rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  lineHeight: 0.92,
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
            las reglas/quote del overlay (z[3]) cuando aparecen, pero
            sigue por encima del slider (z[1]). */}
        <div
          ref={videoWrapRef}
          aria-hidden
          className="absolute overflow-hidden will-change-[transform,opacity] z-[2]"
          style={{
            top: "calc(50vh + 2.25rem)",
            left: "50%",
            width: "clamp(300px, min(54vw, calc(44vh * 16 / 9)), 700px)",
            aspectRatio: "16 / 9",
            transform: "translate(-50%, -50%) scale(0)",
            transformOrigin: "center center",
            opacity: 0,
          }}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover block"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/video/Video MM Header.mp4" type="video/mp4" />
          </video>
        </div>

        <div ref={grainRef} className="hl-grain" aria-hidden />
      </section>
    </div>
  );
}
