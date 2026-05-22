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

const optBase = (base) => `/img-opt/v2/${base}__balanced`;
const buildSrcSet = (base, ext) =>
  `${optBase(base)}-720.${ext} 720w, ${optBase(base)}-960.${ext} 960w, ${optBase(base)}-1280.${ext} 1280w`;
const SLIDER_IMG_SIZES = "(min-width: 400px) 220px, 55vw";

const ALFREDOS_QUOTE = `We played without rules, without thinking about styles or what would come next. One track could be slow, the next dark, then something pop or an impossible guitar, but it all made sense in that moment. The dancefloor didn't ask for coherence, it asked for emotion — and as long as people stayed there, smiling and lost, you knew you were doing it right.`;
const QUOTE_WORDS = ALFREDOS_QUOTE.split(" ");

const META_TEXT = "— Alfredo · Amnesia · Ibiza 1987";
const META_CHARS = Array.from(META_TEXT);

const HEADER_VIDEO = getResponsiveVideoSources("/video/Video MM Header.mp4");

const HEADLINE_FONT = "'Favorit', sans-serif";

// Mask wrapper sólo para la firma (char-level Locomotive). El quote
// usa reveal word-level segment-as-unit, sin masks.
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

export default function Highlights3_3Mobile() {
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
    if (window.innerWidth > 900) return;

    const sticky = stickyRef.current;
    const items = itemsRef.current.filter(Boolean);
    if (!sticky || items.length === 0) return;

    // Freeze viewport height in px to immunize against Android URL-bar
    // toggle re-resolving 100lvh mid-scroll (causes a step-down jump as
    // the flex centering recomputes). Mirrors MMNewestHero2Mobile pattern.
    const frozenH = sticky.getBoundingClientRect().height || window.innerHeight;
    sticky.style.height = `${frozenH}px`;
    if (contentFrameRef.current) {
      contentFrameRef.current.style.height = `${frozenH}px`;
    }

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

      // ── Reveal timelines ───────────────────────────────────────────
      // Quote (mobile): mismo approach que el _3 desktop — seam zigzag
      // + segment-as-unit + spread tightening — con valores tuneados
      // para pantalla pequeña:
      //   · offX más corto (60% del viewport — mobile tiene menos
      //     ancho que recorrer y un offset enorme se ve menos
      //     dramático).
      //   · SPREAD más bajo (0.10) — segmentos cortos (2-4 palabras
      //     tras el wrap mobile) → poco margen para spacing visible
      //     sin verse forzado.
      //   · blur menor (5px → 0) — la GPU mobile paga caro el filter.
      //   · segDuration ligeramente más corta y lineCascade un punto
      //     mayor (más líneas en mobile por wrap más estrecho).
      //
      // Firma: mantiene char-level Locomotive (texto corto, sin wrap).
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

      const lineKeyOf = (top) => Math.round(top / 5) * 5;
      const sortedTops = [...wordMeta].sort((a, b) => a.top - b.top);
      const lineIdxMap = new Map();
      sortedTops.forEach((w) => {
        const key = lineKeyOf(w.top);
        if (!lineIdxMap.has(key)) lineIdxMap.set(key, lineIdxMap.size);
      });

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
        seg.words.sort((a, b) => a.centerX - b.centerX);
        const anchorX =
          seg.side === "L"
            ? seg.words[seg.words.length - 1].centerX
            : seg.words[0].centerX;
        segments.push({ ...seg, lineIdx, anchorX });
      });

      const offX = window.innerWidth * 0.6;
      const SPREAD = 0.1;

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
      gsap.set(quoteTextRef.current, { filter: "blur(5px)" });
      gsap.set(metaCharEls, {
        yPercent: 130,
        scaleY: 1.08,
        force3D: true,
      });
      gsap.set(bottomMetaRef.current, { filter: "blur(2px)" });

      const segDuration = 0.6;
      const lineCascade = 0.06;

      const quoteRevealTl = gsap.timeline({ paused: true });

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
        // Mobile fast-scroll pin lag: navegador pinta el scroll en thread
        // separado y el pin engancha 1-2 frames tarde con scrolls rápidos
        // → ScrollTrigger compensa pre-renderizando el estado pinneado.
        anticipatePin: 1,
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

          gsap.set(progressRef.current, { scaleX: sp, force3D: true });

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

          const grow = easeInOutCubic(gp);
          const growOpacity = clamp01(gp / 0.12);

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

          const textP = clamp01((rp - 0.4) / 0.55);
          quoteRevealTl.progress(textP);

          const metaP = clamp01((rp - 0.7) / 0.3);
          metaRevealTl.progress(metaP);

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
        <div
          ref={contentFrameRef}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 z-[1]"
          style={{
            paddingTop: "var(--hl-mobile-top-pad, 100px)",
            paddingBottom: "var(--hl-mobile-bottom-pad, 26px)",
            gap: "var(--hl-mobile-gap, 18px)",
          }}
        >
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

          <div
            ref={progressBarRef}
            className="hl-progress-bar-h relative w-full max-w-[420px] h-px bg-[#e0e0e0] z-[2] pointer-events-none"
            style={{ maxWidth: "var(--hl-mobile-progress-max, 420px)" }}
          >
            <div ref={progressRef} className="hl-progress-h" />
          </div>

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

        <div
          ref={quoteRef}
          className="absolute inset-0 z-[3] pointer-events-none text-black"
        >
          <div
            ref={topRuleRef}
            className="absolute left-0 right-0 top-[6.5rem] h-px bg-black origin-left will-change-transform"
            style={{ transform: "scaleX(0)" }}
          />

          <div
            ref={bottomRuleRef}
            className="absolute left-0 right-0 bottom-[3.75rem] h-px bg-black origin-left will-change-transform"
            style={{ transform: "scaleX(0)" }}
          />

          <div
            ref={bottomMetaRef}
            className="absolute left-1/2 -translate-x-1/2 bottom-6 text-[10px] tracking-[0.22em] uppercase font-medium whitespace-nowrap"
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

          {/* Quote — word-level inline-block. Cada palabra es target
              indivisible; el reveal mide su posición tras layout y la
              asigna a un trozo línea×lado (seam zigzag) para entrar
              como bloque ya armado, con spread interno tightening. */}
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
