"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SLIDES = [
  {
    title: "Pelagos EP",
    base: "MMD042_Cover",
    ref: "mmd042",
    copy: "Gritty basslines, sharp percussion and 80s-leaning house crossed with Balearic flashes, dub pressure and proto-trance heat. Four cuts caught between peak-time progressive and introspective drift.",
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
// Variante "balanced" (mejor compresión global); existe "text" si en algún
// momento el cover se mostrara grande con tipografía legible.
const optBase = (base) => `/img-opt/v2/${base}__balanced`;
const buildSrcSet = (base, ext) =>
  `${optBase(base)}-720.${ext} 720w, ${optBase(base)}-960.${ext} 960w, ${optBase(base)}-1280.${ext} 1280w`;
// Desktop slider: imagen renderiza a clamp(220px, 26vw, 360px). 26vw alcanza
// 360px a partir de 1385px de viewport.
const SLIDER_IMG_SIZES = "(min-width: 1385px) 360px, 26vw";

const ALFREDOS_QUOTE = `We played without rules, without thinking about styles or what would come next. One track could be slow, the next dark, then something pop or an impossible guitar, but it all made sense in that moment. The dancefloor didn't ask for coherence, it asked for emotion — and as long as people stayed there, smiling and lost, you knew you were doing it right.`;


const HEADLINE_FONT = "'Favorit', sans-serif";

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export default function Highlights2_3_1Desktop() {
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
  const quoteStrokeRef = useRef(null);
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
    // Caches para sync filled/stroke con el video — se miden al entrar en video phase
    let videoRectCache = null;
    let textRectCache = null;
    let strokeRectCache = null;

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

      const total = SLIDES.length;
      const vh = window.innerHeight;
      const slidesRange = vh * total;
      const splitRange = vh * 1;
      const quoteRange = vh * 0.9;
      const videoRange = vh * 1.0;
      const totalRange = slidesRange + splitRange + quoteRange + videoRange;

      const slidePhaseEnd = slidesRange / totalRange;
      const splitPhaseEnd = (slidesRange + splitRange) / totalRange;
      const quotePhaseEnd =
        (slidesRange + splitRange + quoteRange) / totalRange;
      const manifestoProgress = 0.995;

      const mainTrigger = ScrollTrigger.create({
        trigger: sticky,
        start: "top top",
        end: `+=${totalRange}`,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;

          const sp = clamp01(p / slidePhaseEnd);
          const splitp = clamp01(
            (p - slidePhaseEnd) / (splitPhaseEnd - slidePhaseEnd)
          );
          const qp = clamp01(
            (p - splitPhaseEnd) / (quotePhaseEnd - splitPhaseEnd)
          );
          const vp = clamp01((p - quotePhaseEnd) / (1 - quotePhaseEnd));

          gsap.set(progressRef.current, { scaleY: sp, force3D: true });

          // ── Fase split ──────────────────────────────────────────
          const barCollapse = clamp01(splitp / 0.7);
          const colP = easeInOutCubic(splitp);
          const counterOp = clamp01((0.55 - splitp) / 0.55);

          if (listPanelRef.current) {
            listPanelRef.current.style.transform = `translate3d(0, ${-100 * colP}%, 0)`;
          }
          if (imagePanelRef.current) {
            imagePanelRef.current.style.transform = `translate3d(0, ${100 * colP}%, 0)`;
          }
          if (progressBarRef.current) {
            const inset = 50 * barCollapse;
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

          // ── Fase editorial / quote (qp) ─────────────────────────
          // 1. Rules horizontales: scaleX desde la izquierda con expo.out.
          // 2. Quote centrado: fade + translate up.
          // 3. Bottom meta (firma): stagger al final del qp.
          const ruleP = clamp01(qp / 0.42);
          const ruleEased = easeOutExpo(ruleP);
          const textP = clamp01((qp - 0.25) / 0.65);
          const metaP = clamp01((qp - 0.7) / 0.3);

          if (topRuleRef.current) {
            topRuleRef.current.style.transform = `scaleX(${ruleEased})`;
          }
          if (bottomRuleRef.current) {
            bottomRuleRef.current.style.transform = `scaleX(${ruleEased})`;
          }
          if (quoteTextRef.current) {
            quoteTextRef.current.style.opacity = String(textP);
            quoteTextRef.current.style.transform = `translate3d(0, ${(1 - textP) * 18}px, 0)`;
          }
          if (bottomMetaRef.current) {
            bottomMetaRef.current.style.opacity = String(metaP);
            bottomMetaRef.current.style.transform = `translate3d(0, ${(1 - metaP) * 8}px, 0)`;
          }

          // ── Fase video — sube desde bottom, stroke+hueco en intersección ──
          const vEased = easeOutExpo(vp);

          // Reset caches y clip-paths al volver fuera de fase
          if (vp === 0) {
            videoRectCache = null;
            textRectCache = null;
            strokeRectCache = null;
            if (quoteTextRef.current) quoteTextRef.current.style.clipPath = "none";
            if (quoteStrokeRef.current) quoteStrokeRef.current.style.clipPath = "inset(0 0 100% 0)";
          }
          // Medir posiciones una sola vez al entrar en fase
          if (vp > 0 && !videoRectCache) {
            videoRectCache = videoWrapRef.current?.getBoundingClientRect() ?? null;
            textRectCache = quoteTextRef.current?.getBoundingClientRect() ?? null;
            strokeRectCache = quoteStrokeRef.current?.getBoundingClientRect() ?? null;
          }

          if (videoWrapRef.current) {
            const clipTop = ((1 - vEased) * 100).toFixed(2);
            videoWrapRef.current.style.clipPath = `inset(${clipTop}% 0 0 0)`;
            videoWrapRef.current.style.opacity = String(clamp01(vp / 0.08));
          }

          // Sincronización filled + stroke con el área revelada del video
          if (videoRectCache && textRectCache && strokeRectCache) {
            const vR = videoRectCache;
            const tR = textRectCache;
            const sR = strokeRectCache;
            // Área revelada del video: top sube de vR.bottom → vR.top
            const revTop = vR.bottom - vEased * vR.height;
            // Intersección revelada ↔ texto
            const iTop    = Math.max(revTop,    tR.top);
            const iBottom = Math.min(vR.bottom, tR.bottom);
            const iLeft   = Math.max(vR.left,   tR.left);
            const iRight  = Math.min(vR.right,  tR.right);
            const hasInter = iTop < iBottom && iLeft < iRight;

            // Filled text: polygon con hueco en el área revelada → letras desaparecen ahí
            if (quoteTextRef.current) {
              if (hasInter) {
                const hT = Math.max(0.01, Math.min(99.99, ((iTop    - tR.top)  / tR.height) * 100));
                const hB = Math.max(0.01, Math.min(99.99, ((iBottom - tR.top)  / tR.height) * 100));
                const hL = Math.max(0.01, Math.min(99.99, ((iLeft   - tR.left) / tR.width ) * 100));
                const hR = Math.max(0.01, Math.min(99.99, ((iRight  - tR.left) / tR.width ) * 100));
                // Outer CW + inner CCW = hole (non-zero winding rule)
                quoteTextRef.current.style.clipPath =
                  `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ` +
                  `${hL.toFixed(2)}% ${hT.toFixed(2)}%, ` +
                  `${hL.toFixed(2)}% ${hB.toFixed(2)}%, ` +
                  `${hR.toFixed(2)}% ${hB.toFixed(2)}%, ` +
                  `${hR.toFixed(2)}% ${hT.toFixed(2)}%, ` +
                  `${hL.toFixed(2)}% ${hT.toFixed(2)}%)`;
              } else {
                quoteTextRef.current.style.clipPath = "none";
              }
            }

            // Stroke text: clip que muestra SOLO el área revelada del video
            if (quoteStrokeRef.current) {
              if (hasInter) {
                const inTop    = Math.max(0, iTop    - sR.top).toFixed(1);
                const inRight  = Math.max(0, sR.right  - iRight).toFixed(1);
                const inBottom = Math.max(0, sR.bottom - iBottom).toFixed(1);
                const inLeft   = Math.max(0, iLeft   - sR.left).toFixed(1);
                quoteStrokeRef.current.style.clipPath =
                  `inset(${inTop}px ${inRight}px ${inBottom}px ${inLeft}px)`;
              } else {
                quoteStrokeRef.current.style.clipPath = "inset(0 0 100% 0)";
              }
            }
          }

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

          if (counterRef.current) {
            gsap.killTweensOf(counterRef.current);
            gsap.to(counterRef.current, {
              opacity: 0,
              duration: 0.12,
              ease: "power2.in",
              overwrite: true,
              onComplete: () => {
                if (!counterRef.current) return;
                counterRef.current.textContent = SLIDES[activeIndex].ref;
                gsap.to(counterRef.current, {
                  opacity: 1,
                  duration: 0.22,
                  ease: "power2.out",
                  overwrite: true,
                });
              },
            });
          }

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
        {/* Panel lista — slides hacia arriba en split */}
        <div
          ref={listPanelRef}
          className="hl-panel absolute top-0 left-0 w-1/2 h-full flex items-center justify-center z-[1]"
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

        {/* Panel imagen + copy — slides hacia abajo en split */}
        <div
          ref={imagePanelRef}
          className="hl-panel absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center gap-10 px-6 z-[1]"
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

        {/* Crossbar vertical — colapsa en split */}
        <div ref={progressBarRef} className="hl-progress-bar">
          <div ref={progressRef} className="hl-progress" />
        </div>

        {/* Código catálogo (ref) — cambia con el slide */}
        <div ref={indexRef} className="hl-index hl-index--ref">
          <span ref={counterRef}>{SLIDES[0].ref}</span>
        </div>

        {/* ── Editorial overlay ──────────────────────────────────────
            Fase quote: rules + texto centrado.
            Fase video: video sube desde el centro, stroke text donde
            el video intersecta el quote. */}
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

          {/* Firma — centrada al fondo */}
          <div
            ref={bottomMetaRef}
            className="absolute left-1/2 -translate-x-1/2 bottom-8 text-[11px] tracking-[0.25em] uppercase font-medium opacity-0 will-change-[transform,opacity] whitespace-nowrap"
            style={{ fontFamily: HEADLINE_FONT }}
          >
            — Alfredo · Amnesia · Ibiza 1987
          </div>

          {/* Video — centrado en el stage, detrás del texto */}
          <div
            ref={videoWrapRef}
            aria-hidden
            className="absolute overflow-hidden"
            style={{
              top: "calc(50vh + 2.25rem)",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "clamp(300px, min(54vw, calc(44vh * 16 / 9)), 700px)",
              aspectRatio: "16 / 9",
              clipPath: "inset(100% 0 0 0)",
              opacity: 0,
              willChange: "clip-path, opacity",
              zIndex: 1,
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

          {/* Texto + stroke — centrados en el stage, sobre el video */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ paddingTop: "10rem", paddingBottom: "5.5rem", zIndex: 2 }}
          >
            <div className="relative w-[min(88vw,74rem)] text-center">
              {/* Texto relleno */}
              <p
                ref={quoteTextRef}
                className="hl-quote-text text-black"
                style={{
                  fontFamily: HEADLINE_FONT,
                  fontSize: "clamp(1.5rem, 3.4vw, 3.25rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  lineHeight: 0.98,
                  textTransform: "lowercase",
                  padding: "0 clamp(1rem, 2vw, 2rem)",
                  opacity: 0,
                  willChange: "transform, opacity, clip-path",
                }}
              >
                {ALFREDOS_QUOTE}
              </p>

              {/* Texto stroke — mismo contenido y bounding rect; clipeado al área revelada */}
              <p
                ref={quoteStrokeRef}
                aria-hidden
                className="absolute top-0 left-0 right-0 text-center"
                style={{
                  fontFamily: HEADLINE_FONT,
                  fontSize: "clamp(1.5rem, 3.4vw, 3.25rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  lineHeight: 0.98,
                  textTransform: "lowercase",
                  color: "transparent",
                  WebkitTextStroke: "1px black",
                  padding: "0 clamp(1rem, 2vw, 2rem)",
                  clipPath: "inset(0 0 100% 0)",
                  pointerEvents: "none",
                  willChange: "clip-path",
                }}
              >
                {ALFREDOS_QUOTE}
              </p>
            </div>
          </div>
        </div>

        <div ref={grainRef} className="hl-grain" aria-hidden />
      </section>
    </div>
  );
}
