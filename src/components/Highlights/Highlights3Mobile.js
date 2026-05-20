"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getResponsiveVideoSources } from "@/lib/videoSources";

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
const optBase = (base) => `/img-opt/v2/${base}__balanced`;
const buildSrcSet = (base, ext) =>
  `${optBase(base)}-720.${ext} 720w, ${optBase(base)}-960.${ext} 960w, ${optBase(base)}-1280.${ext} 1280w`;
// Móvil: imagen renderiza a min(55vw, 220px). 55vw alcanza 220px a partir
// de ~400px de viewport — por encima quedamos clavados en 220px CSS.
const SLIDER_IMG_SIZES = "(min-width: 400px) 220px, 55vw";

const ALFREDOS_QUOTE = `We played without rules, without thinking about styles or what would come next. One track could be slow, the next dark, then something pop or an impossible guitar, but it all made sense in that moment. The dancefloor didn't ask for coherence, it asked for emotion — and as long as people stayed there, smiling and lost, you knew you were doing it right.`;
const QUOTE_WORDS = ALFREDOS_QUOTE.split(" ");

const META_TEXT = "— Alfredo · Amnesia · Ibiza 1987";
const META_CHARS = Array.from(META_TEXT);

const HEADER_VIDEO = getResponsiveVideoSources("/video/Video MM Header.mp4");

const HEADLINE_FONT = "'Favorit', sans-serif";

// Wrapper "mask" para el reveal Locomotive char-level. padding + margin
// negativo absorben descendentes (g, p, y) sin alterar la métrica visual
// aunque el lineHeight sea muy cerrado.
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
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export default function Highlights3Mobile() {
  const rootRef = useRef(null);
  const stickyRef = useRef(null);
  const contentFrameRef = useRef(null);
  const copyWrapRef = useRef(null);
  const indicatorRef = useRef(null);
  const stripRef = useRef(null);
  const copiesRef = useRef([]);
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

  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShouldLoadVideo(window.innerWidth <= 900);
  }, []);

  useLayoutEffect(() => {
    // Escalado proporcional al alto de viewport — mismo patrón que el
    // original mobile. ScrollTrigger.config({ignoreMobileResize:true})
    // global evita recálculo al toggle de la URL bar.
    if (window.innerWidth > 900) return;
    const frame = contentFrameRef.current;
    if (!frame) return;

    const layoutH = window.innerHeight;
    const compact = clamp(layoutH / 760, 0.86, 1);
    frame.style.setProperty("--hl-mobile-top-pad", `${Math.round(100 * compact)}px`);
    frame.style.setProperty("--hl-mobile-gap", `${Math.round(18 * compact)}px`);
    frame.style.setProperty("--hl-mobile-panel-gap", `${Math.round(16 * compact)}px`);
    frame.style.setProperty("--hl-mobile-title-max", `${Math.round(26 * compact)}px`);
    frame.style.setProperty("--hl-mobile-image-max", `${Math.round(220 * compact)}px`);
    frame.style.setProperty("--hl-mobile-copy-max", `${Math.round(360 * compact)}px`);
    frame.style.setProperty("--hl-mobile-progress-max", `${Math.round(420 * compact)}px`);
  }, []);

  useLayoutEffect(() => {
    // Variante móvil — si el viewport es desktop no registramos triggers.
    if (window.innerWidth > 900) return;

    const sticky = stickyRef.current;
    const items = itemsRef.current.filter(Boolean);
    if (!sticky || items.length === 0) return;

    let currentIndex = 0;
    let removeManifestoListener = null;

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

      // ── Reveal timelines (Locomotive-style, char-level + liquid) ─
      // Mobile-tuned vs desktop:
      //   · blur radius más pequeño (5px / 2px) — la GPU móvil paga
      //     mucho más caro el filter; con 1 solo filter por padre el
      //     coste es asumible incluso en gama media.
      //   · scaleY un punto más conservador (1.16 / 1.08) — el texto
      //     es más pequeño, deformaciones grandes se ven ruidosas.
      //   · stagger un punto más amplio (0.012 / 0.024) — wave más
      //     legible en pantallas pequeñas.
      const quoteCharEls = quoteTextRef.current
        ? Array.from(quoteTextRef.current.querySelectorAll(".hl-q-char"))
        : [];
      const metaCharEls = bottomMetaRef.current
        ? Array.from(bottomMetaRef.current.querySelectorAll(".hl-m-char"))
        : [];

      gsap.set(quoteCharEls, {
        yPercent: 130,
        scaleY: 1.16,
        force3D: true,
      });
      gsap.set(quoteTextRef.current, { filter: "blur(5px)" });
      gsap.set(metaCharEls, {
        yPercent: 130,
        scaleY: 1.08,
        force3D: true,
      });
      gsap.set(bottomMetaRef.current, { filter: "blur(2px)" });

      const charDuration = 1.0;
      const charStagger = 0.012;
      const totalQuoteWave =
        charDuration + Math.max(0, quoteCharEls.length - 1) * charStagger;

      const quoteRevealTl = gsap.timeline({ paused: true });
      quoteRevealTl
        .to(
          quoteCharEls,
          {
            yPercent: 0,
            scaleY: 1,
            duration: charDuration,
            ease: "expo.out",
            stagger: charStagger,
            force3D: true,
          },
          0
        )
        .to(
          quoteTextRef.current,
          {
            filter: "blur(0px)",
            duration: totalQuoteWave,
            ease: "power2.out",
          },
          0
        );

      const metaDuration = 0.65;
      const metaStagger = 0.024;
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

      // ── Phase budget (mobile) ──────────────────────────────────────
      //  1. slides     — un viewport por slide                    (scrub)
      //  2. split      — paneles ±100vh, crossbar colapsa         (scrub)
      //  3. videoGrow  — vídeo expande desde el centro            (scrub)
      //  4. videoRecede — vídeo retrocede + reglas + quote + firma (scrub)
      //
      // Rangos un punto más cortos que desktop. Mobile scroll es más
      // costoso para el usuario → menos vh para misma narrativa.
      const total = SLIDES.length;
      const vh = window.innerHeight;
      const slidesRange = vh * total;
      const splitRange = vh * 0.8;
      const growRange = vh * 0.8;
      const recedeRange = vh * 0.6;
      const totalRange = slidesRange + splitRange + growRange + recedeRange;

      const slidePhaseEnd = slidesRange / totalRange;
      const splitPhaseEnd = (slidesRange + splitRange) / totalRange;
      const growPhaseEnd =
        (slidesRange + splitRange + growRange) / totalRange;
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
          const gp = clamp01(
            (p - splitPhaseEnd) / (growPhaseEnd - splitPhaseEnd)
          );
          const rp = clamp01((p - growPhaseEnd) / (1 - growPhaseEnd));

          // Crossbar horizontal — fill scaleX desde la izquierda.
          gsap.set(progressRef.current, { scaleX: sp, force3D: true });

          // ── Fase split ──────────────────────────────────────────
          // Paneles ±100vh (Y), crossbar horizontal colapsa por
          // extremos (inset X), índice fade.
          const barCollapse = clamp01(splitp / 0.7);
          const colP = easeInOutCubic(splitp);
          const counterOp = clamp01((0.55 - splitp) / 0.55);

          if (listPanelRef.current) {
            listPanelRef.current.style.transform = `translate3d(0, ${-100 * colP}vh, 0)`;
          }
          if (imagePanelRef.current) {
            imagePanelRef.current.style.transform = `translate3d(0, ${100 * colP}vh, 0)`;
          }
          if (progressBarRef.current) {
            const inset = 50 * barCollapse;
            progressBarRef.current.style.clipPath = `inset(0% ${inset}% 0% ${inset}%)`;
          }
          if (indexRef.current) {
            indexRef.current.style.opacity = String(counterOp);
          }
          if (grainRef.current) {
            grainRef.current.style.opacity = String(
              Math.sin(splitp * Math.PI) * 0.18
            );
          }

          // ── Fase videoGrow (gp) — scrubbed ──────────────────────
          // Vídeo expande desde el centro: scale 0 → 1.
          const grow = easeInOutCubic(gp);
          const growOpacity = clamp01(gp / 0.12);

          // ── Fase videoRecede (rp) — scrubbed con cascade ────────
          // Vídeo NO desaparece — queda al fondo como capa atmosférica
          // (scale 0.5, opacity 0.6). Reglas, quote y firma entran en
          // cascade dentro del mismo scrub. "Golpe" se siente por el
          // rango corto + easings agresivos. Lenis aporta inercia.
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

          // Quote y firma → progress() de sus TL paused (revela
          // char-level con blur líquido global). textP / metaP linear
          // a propósito: la curva expo.out vive dentro de cada TL.
          const textP = clamp01((rp - 0.4) / 0.55);
          quoteRevealTl.progress(textP);

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

          copiesRef.current.forEach((p, i) => {
            if (!p) return;
            gsap.to(p, {
              opacity: i === activeIndex ? 1 : 0,
              y: i === activeIndex ? 0 : 10,
              duration: 0.35,
              ease: "power3.out",
              overwrite: true,
              force3D: true,
            });
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
      if (removeManifestoListener) removeManifestoListener();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="hl-root w-full bg-white">
      <section
        ref={stickyRef}
        className="hl-sticky relative w-screen h-[100lvh] bg-white overflow-hidden"
      >
        {/* Contenedor único — todo centrado, layout stacked mobile */}
        <div
          ref={contentFrameRef}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 z-[1]"
          style={{
            paddingTop: "var(--hl-mobile-top-pad, 100px)",
            paddingBottom: "var(--hl-mobile-bottom-pad, 26px)",
            gap: "var(--hl-mobile-gap, 18px)",
          }}
        >
          {/* Grupo superior — titles + counter. Sube en split. */}
          <div
            ref={listPanelRef}
            className="hl-panel flex flex-col items-center"
            style={{ gap: "var(--hl-mobile-panel-gap, 16px)" }}
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
                  <p
                    className="uppercase font-semibold leading-none"
                    style={{ fontSize: "clamp(19px, 4.8vw, var(--hl-mobile-title-max, 26px))" }}
                  >
                    {s.title}
                  </p>
                </div>
              ))}
            </div>

            <div ref={indexRef} className="hl-counter-mobile hl-counter-mobile--ref">
              <span ref={counterRef}>{SLIDES[0].ref}</span>
            </div>
          </div>

          {/* Crossbar horizontal — colapsa por extremos en split */}
          <div
            ref={progressBarRef}
            className="hl-progress-bar-h relative w-full max-w-[420px] h-px bg-[#e0e0e0] z-[2] pointer-events-none"
            style={{ maxWidth: "var(--hl-mobile-progress-max, 420px)" }}
          >
            <div ref={progressRef} className="hl-progress-h" />
          </div>

          {/* Grupo inferior — imagen + copy. Baja en split. */}
          <div
            ref={imagePanelRef}
            className="hl-panel flex flex-col items-center"
            style={{ gap: "var(--hl-mobile-panel-gap, 16px)" }}
          >
            <div
              className="hl-img-wrapper relative aspect-square overflow-hidden"
              style={{ width: "min(55vw, var(--hl-mobile-image-max, 220px))" }}
            >
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
                        src={`${optBase(s.base)}-720.webp`}
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

            <div
              ref={copyWrapRef}
              className="w-full grid"
              style={{ maxWidth: "var(--hl-mobile-copy-max, 360px)" }}
            >
              {SLIDES.map((s, i) => (
                <p
                  key={s.ref}
                  ref={(el) => {
                    copiesRef.current[i] = el;
                  }}
                  className="hl-copy text-[clamp(13px,3.6vw,15px)] leading-tight text-black text-center will-change-[transform,opacity]"
                  style={{
                    gridArea: "1 / 1",
                    opacity: i === 0 ? 1 : 0,
                  }}
                >
                  {s.copy}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* ── Editorial overlay (mobile) ────────────────────────────
            En grow el vídeo es solo; en recede el vídeo retrocede
            mientras reglas + quote (word-containers / char-masks) +
            firma (char-masks) entran con liquid blur global. */}
        <div
          ref={quoteRef}
          className="absolute inset-0 z-[3] pointer-events-none text-black"
        >
          {/* Top horizontal rule */}
          <div
            ref={topRuleRef}
            className="absolute left-0 right-0 top-[6.5rem] h-px bg-black origin-left will-change-transform"
            style={{ transform: "scaleX(0)" }}
          />

          {/* Bottom horizontal rule */}
          <div
            ref={bottomRuleRef}
            className="absolute left-0 right-0 bottom-[3.75rem] h-px bg-black origin-left will-change-transform"
            style={{ transform: "scaleX(0)" }}
          />

          {/* Firma — chars-as-masks (reveal char-level con blur) */}
          <div
            ref={bottomMetaRef}
            className="absolute left-1/2 -translate-x-1/2 bottom-6 text-[10px] tracking-[0.22em] uppercase font-medium whitespace-nowrap"
            style={{ fontFamily: HEADLINE_FONT, lineHeight: 1.1 }}
          >
            {META_CHARS.map((c, i) => (
              <span key={i} style={MASK_STYLE}>
                <span className="hl-m-char inline-block">
                  {c === " " ? " " : c}
                </span>
              </span>
            ))}
          </div>

          {/* Quote — word-containers + char-masks dentro. lineHeight
              0.96 (algo más relajado que desktop por menor cuerpo de
              letra), padding del mask absorbe descendentes. */}
          <div
            className="absolute inset-0 flex items-center justify-center px-4"
            style={{ paddingTop: "6.5rem", paddingBottom: "3.75rem" }}
          >
            <div className="relative w-full max-w-[480px] text-center">
              <p
                ref={quoteTextRef}
                className="hl-quote-text text-black"
                style={{
                  fontFamily: HEADLINE_FONT,
                  fontSize: "clamp(20px, 5.5vw, 30px)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  lineHeight: 0.96,
                  textTransform: "lowercase",
                }}
              >
                {QUOTE_WORDS.map((w, i) => (
                  <Fragment key={i}>
                    <span className="inline-block">
                      {Array.from(w).map((c, ci) => (
                        <span key={ci} style={MASK_STYLE}>
                          <span className="hl-q-char inline-block will-change-transform">
                            {c}
                          </span>
                        </span>
                      ))}
                    </span>
                    {i < QUOTE_WORDS.length - 1 ? " " : ""}
                  </Fragment>
                ))}
              </p>
            </div>
          </div>
        </div>

        {/* Vídeo — z[2] (detrás del overlay z[3] pero sobre el slider
            z[1]). Tamaño mobile: clamp(220px, 75vw, 360px), 16:9. */}
        <div
          ref={videoWrapRef}
          aria-hidden
          className="absolute overflow-hidden will-change-[transform,opacity] z-[2]"
          style={{
            top: "50%",
            left: "50%",
            width: "clamp(220px, 75vw, 360px)",
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
            preload={shouldLoadVideo ? "auto" : "none"}
          >
            {shouldLoadVideo ? (
              <>
                <source media="(max-width: 719px)" src={HEADER_VIDEO.mobile} type="video/mp4" />
                <source media="(max-width: 1279px)" src={HEADER_VIDEO.tablet} type="video/mp4" />
                <source src={HEADER_VIDEO.desktop} type="video/mp4" />
                <source src={HEADER_VIDEO.fallback} type="video/mp4" />
              </>
            ) : null}
          </video>
        </div>

        <div ref={grainRef} className="hl-grain" aria-hidden />
      </section>
    </div>
  );
}
