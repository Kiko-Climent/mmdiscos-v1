"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SLIDES = [
  {
    title: "Pelagos EP",
    img: "/MMD042_Cover.jpg",
    ref: "mmd042",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
  {
    title: "Brahmaputra EP",
    img: "/MMD041_Cover.jpg",
    ref: "mmd041",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
  {
    title: "Socarrat vol.1",
    img: "/MMD040_Cover-1.jpg",
    ref: "mmd040.1",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
  {
    title: "Deamwalker EP",
    img: "/img4.jpg",
    ref: "mmd036",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
  {
    title: "Socarrat vol.2",
    img: "/MMD040-2.png",
    ref: "mmd040.2",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
  {
    title: "Eternal Sunset EP",
    img: "/MMD039.png",
    ref: "mmd039",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
  {
    title: "Club Solsticio EP",
    img: "/MMD038.png",
    ref: "mmd038",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
];

const ALFREDOS_QUOTE = `We played without rules, without thinking about styles or what would come next. One track could be slow, the next dark, then something pop or an impossible guitar, but it all made sense in that moment. The dancefloor didn't ask for coherence, it asked for emotion — and as long as people stayed there, smiling and lost, you knew you were doing it right.`;

const HEADLINE_FONT = "'Favorit', sans-serif";

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export default function Highlights2_1Desktop() {
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
  const textBoxRef = useRef(null);
  const quoteTextRef = useRef(null);
  const quoteTextWhiteRef = useRef(null);
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

      // Dimensiones base para el dual-layer del quote.
      // offsetWidth/Height ignoran el scale(0) del videoWrap → tamaño final.
      // Estas medidas alimentan el clip-path inset de la capa blanca
      // para que solo se vea blanca donde el video la cubre.
      const videoBaseW = videoWrapRef.current
        ? videoWrapRef.current.offsetWidth
        : 0;
      const videoBaseH = videoWrapRef.current
        ? videoWrapRef.current.offsetHeight
        : 0;
      const textBoxW = textBoxRef.current ? textBoxRef.current.offsetWidth : 0;
      const textBoxH = textBoxRef.current ? textBoxRef.current.offsetHeight : 0;

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
          if (quoteTextWhiteRef.current) {
            // La capa blanca acompaña a la negra en opacity + translate.
            quoteTextWhiteRef.current.style.opacity = String(textP);
            quoteTextWhiteRef.current.style.transform = `translate3d(0, ${(1 - textP) * 18}px, 0)`;
          }
          if (bottomMetaRef.current) {
            bottomMetaRef.current.style.opacity = String(metaP);
            bottomMetaRef.current.style.transform = `translate3d(0, ${(1 - metaP) * 8}px, 0)`;
          }

          // ── Fase video ──────────────────────────────────────────
          // Crece detrás del texto vía scale (GPU). En paralelo, la
          // capa blanca del quote se desclipa exactamente al footprint
          // del video — fuera del video el texto es negro sobre blanco,
          // dentro del video es blanco sobre vídeo. Contraste perfecto
          // sin mix-blend ni shifts cromáticos.
          const vEased = easeInOutCubic(vp);
          if (videoWrapRef.current) {
            const vOpacity = clamp01(vp / 0.15);
            videoWrapRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${vEased})`;
            videoWrapRef.current.style.opacity = String(vOpacity);
          }
          if (quoteTextWhiteRef.current && textBoxW && textBoxH) {
            const curW = videoBaseW * vEased;
            const curH = videoBaseH * vEased;
            const insetX = Math.max(0, (textBoxW - curW) / 2);
            const insetY = Math.max(0, (textBoxH - curH) / 2);
            quoteTextWhiteRef.current.style.clipPath = `inset(${insetY}px ${insetX}px ${insetY}px ${insetX}px)`;
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
              {SLIDES.map((s) => (
                <div
                  key={s.img}
                  className="hl-img relative w-full aspect-square"
                >
                  <img
                    src={s.img}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="w-[clamp(220px,26vw,360px)]">
            <p
              ref={copyRef}
              className="hl-copy text-[18px] leading-[1.55] text-black"
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

        {/* ── Editorial overlay ─────────────────────────────────────
            Tras el split: dos rules cruzan la interfaz, quote
            centrado emerge, video crece progresivamente detrás del
            texto, y firma centrada al fondo. */}
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

          {/* Stage central — video detrás (DOM order), quote delante */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Video — absolute centrado, GPU scale */}
            <div
              ref={videoWrapRef}
              aria-hidden
              className="absolute top-1/2 left-1/2 overflow-hidden will-change-[transform,opacity]"
              style={{
                width: "clamp(280px, 30vw, 460px)",
                aspectRatio: "16 / 9",
                transform: "translate3d(-50%, -50%, 0) scale(0)",
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

            {/* Quote dual-layer:
                - capa negra siempre legible sobre blanco
                - capa blanca encima, clipada al footprint del video
                Resultado: texto siempre con contraste, sin mix-blend. */}
            <div className="relative w-[min(86vw,72rem)] px-6 lg:px-10 text-center">
              <div ref={textBoxRef} className="relative">
                <p
                  ref={quoteTextRef}
                  className="hl-quote-text text-black will-change-[transform,opacity]"
                  style={{
                    fontFamily: HEADLINE_FONT,
                    fontSize: "clamp(1.5rem, 3.4vw, 3.25rem)",
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    lineHeight: 0.98,
                    textTransform: "lowercase",
                    opacity: 0,
                  }}
                >
                  {ALFREDOS_QUOTE}
                </p>
                <p
                  ref={quoteTextWhiteRef}
                  aria-hidden
                  className="hl-quote-text absolute inset-0 text-white will-change-[transform,opacity,clip-path]"
                  style={{
                    fontFamily: HEADLINE_FONT,
                    fontSize: "clamp(1.5rem, 3.4vw, 3.25rem)",
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    lineHeight: 0.98,
                    textTransform: "lowercase",
                    opacity: 0,
                    clipPath: "inset(50% 50% 50% 50%)",
                  }}
                >
                  {ALFREDOS_QUOTE}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div ref={grainRef} className="hl-grain" aria-hidden />
      </section>
    </div>
  );
}
