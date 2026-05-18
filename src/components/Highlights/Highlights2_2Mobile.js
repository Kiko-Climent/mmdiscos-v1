"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SLIDES = [
  {
    title: "Pelagos EP",
    img: "/MMD042_Cover.jpg",
    ref: "mmd042",
    copy: "Gritty basslines, sharp percussion and 80s-leaning house crossed with Balearic flashes, dub pressure and proto-trance heat. Four cuts caught between peak-time progressive and introspective drift.",
  },
  {
    title: "Brahmaputra EP",
    img: "/MMD041_Cover.jpg",
    ref: "mmd041",
    copy: "Gritty basslines, sharp percussion and 80s-leaning house crossed with Balearic flashes, dub pressure and proto-trance heat. Four cuts caught between peak-time progressive and introspective drift",
  },
  {
    title: "Socarrat vol.1",
    img: "/MMD040_Cover-1.jpg",
    ref: "mmd040.1",
    copy: "A decade of MM Discos, condensed. Volume one drifts from mid-tempo grooves to house-driven heat, threaded with a Balearic pulse. No trends, no labels — just the freewheeling spirit that defined us from day one.",
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
    copy: "The Socarrat continues. Volume II spans dark-Balearic moods, kraut-infused drifts, spatial post-Italo journeys, electronic funk and tropical psychedelia — a cosmic tutti-frutti charting ten years of MM Discos at full tilt.",
  },
  {
    title: "Eternal Sunset EP",
    img: "/MMD039.png",
    ref: "mmd039",
    copy: "Nic Jalusi distills his '90s-leaning house on Eternal Sunset — Italian dream house, Kwaito and dub textures, African-synth heat and late-night breaks. A sun-soaked cocktail for living rooms and dancefloors alike.",
  },
];

const ALFREDOS_QUOTE = `We played without rules, without thinking about styles or what would come next. One track could be slow, the next dark, then something pop or an impossible guitar, but it all made sense in that moment. The dancefloor didn't ask for coherence, it asked for emotion — and as long as people stayed there, smiling and lost, you knew you were doing it right.`;

const HEADLINE_FONT = "'Favorit', sans-serif";

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export default function Highlights2_1Mobile() {
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
  const textBoxRef = useRef(null);
  const quoteTextRef = useRef(null);
  const quoteTextWhiteRef = useRef(null);
  const bottomMetaRef = useRef(null);
  const videoWrapRef = useRef(null);
  const videoRef = useRef(null);

  useLayoutEffect(() => {
    // Escalado proporcional al alto de viewport. Se ejecuta una vez al
    // montar; con ScrollTrigger.config({ignoreMobileResize:true}) global
    // no necesitamos reaccionar al toggle de la URL bar — la sección usa
    // 100svh y siempre cabe en el viewport visible.
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

      // Dimensiones base para el dual-layer del quote.
      // En vez de asumir que el centro del texto y el centro del video
      // coinciden (puede haber desajustes por padding, fonts, vh dinámico
      // en mobile), MEDIMOS la posición real de ambos en viewport y
      // calculamos los insets desde esas coordenadas. Más robusto.
      //
      // - videoBaseW: ancho del wrapper (offsetWidth ignora scale(0)).
      // - videoBaseH: derivado de width × 9/16 para clavarlo al aspect
      //   CSS sin discrepancias de subpíxel.
      // - El centro del video (en viewport) coincide con el centro del
      //   sticky porque el wrapper es absolute top-1/2 left-1/2 con
      //   translate(-50%, -50%) y origin center.
      const VIDEO_ASPECT_W = 16;
      const VIDEO_ASPECT_H = 9;
      const videoBaseW = videoWrapRef.current
        ? videoWrapRef.current.offsetWidth
        : 0;
      const videoBaseH = (videoBaseW * VIDEO_ASPECT_H) / VIDEO_ASPECT_W;

      // Medidas en viewport coords. textBox no tiene transforms al
      // hacer setup → getBoundingClientRect devuelve su layout real.
      const textRect = textBoxRef.current
        ? textBoxRef.current.getBoundingClientRect()
        : { left: 0, top: 0, width: 0, height: 0 };
      const sectionRect = sticky.getBoundingClientRect();
      const videoCx = sectionRect.left + sectionRect.width / 2;
      const videoCy = sectionRect.top + sectionRect.height / 2;

      // Centro del video en coordenadas locales del textBox.
      const videoCxLocal = videoCx - textRect.left;
      const videoCyLocal = videoCy - textRect.top;
      const textBoxW = textRect.width;
      const textBoxH = textRect.height;

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

          // Crossbar horizontal — fill scaleX desde la izquierda.
          gsap.set(progressRef.current, { scaleX: sp, force3D: true });

          // ── Fase split ──────────────────────────────────────────
          // Mismo ritmo que desktop pero en portrait: paneles ±vh y
          // crossbar colapsa horizontal (extremos→centro).
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

          // ── Fase editorial / quote (qp) ─────────────────────────
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
            quoteTextRef.current.style.transform = `translate3d(0, ${(1 - textP) * 14}px, 0)`;
          }
          if (quoteTextWhiteRef.current) {
            quoteTextWhiteRef.current.style.opacity = String(textP);
            quoteTextWhiteRef.current.style.transform = `translate3d(0, ${(1 - textP) * 14}px, 0)`;
          }
          if (bottomMetaRef.current) {
            bottomMetaRef.current.style.opacity = String(metaP);
            bottomMetaRef.current.style.transform = `translate3d(0, ${(1 - metaP) * 8}px, 0)`;
          }

          // ── Fase video ──────────────────────────────────────────
          // Mismo dual-layer del desktop: video escala desde el
          // centro (GPU), capa blanca del quote se desclipa al
          // footprint actual del video → contraste perfecto fuera
          // y dentro sin mix-blend.
          const vEased = easeInOutCubic(vp);
          if (videoWrapRef.current) {
            const vOpacity = clamp01(vp / 0.15);
            videoWrapRef.current.style.transform = `translate3d(-50%, -50%, 0) scale(${vEased})`;
            videoWrapRef.current.style.opacity = String(vOpacity);
          }
          if (quoteTextWhiteRef.current && textBoxW && textBoxH) {
            // El video crece desde su centro (videoCx, videoCy) en viewport.
            // Convertimos sus bounds actuales a coordenadas locales del
            // textBox para clipar la capa blanca exactamente al footprint.
            const curW = videoBaseW * vEased;
            const curH = videoBaseH * vEased;
            const top = videoCyLocal - curH / 2;
            const left = videoCxLocal - curW / 2;
            const right = videoCxLocal + curW / 2;
            const bottom = videoCyLocal + curH / 2;
            const insetTop = Math.max(0, top);
            const insetLeft = Math.max(0, left);
            const insetBottom = Math.max(0, textBoxH - bottom);
            const insetRight = Math.max(0, textBoxW - right);
            quoteTextWhiteRef.current.style.clipPath = `inset(${insetTop}px ${insetRight}px ${insetBottom}px ${insetLeft}px)`;
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
            // Altura fija por slide para un stepping 100% determinista.
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
        className="hl-sticky relative w-screen h-[100svh] bg-white overflow-hidden"
      >
        {/* Contenedor único — todo centrado en la interface
            (mismo patrón que Highlights2Mobile original). */}
        <div
          ref={contentFrameRef}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 z-[1]"
          style={{
            paddingTop: "max(calc(env(safe-area-inset-top) + var(--hl-mobile-top-pad, 100px)), 6.25rem)",
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

          {/* Crossbar horizontal — colapsa por extremos en split. */}
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

        {/* ── Editorial overlay (brutalist, mobile) ─────────────────
            Tras el split: dos rules cruzan la interfaz, quote
            centrado emerge con dual-layer (negro fuera del video,
            blanco dentro), video crece detrás, firma centrada al fondo. */}
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

          {/* Firma — centrada al fondo */}
          <div
            ref={bottomMetaRef}
            className="absolute left-1/2 -translate-x-1/2 bottom-6 text-[10px] tracking-[0.22em] uppercase font-medium opacity-0 will-change-[transform,opacity] whitespace-nowrap"
            style={{ fontFamily: HEADLINE_FONT }}
          >
            — Alfredo · Amnesia · Ibiza 1987
          </div>

          {/* Stage central — video detrás (DOM order), quote delante */}
          <div className="absolute inset-0 flex items-center justify-center px-4">
            {/* Video — centrado absoluto, GPU scale.
                Tamaño portrait: ~75vw cap a 360 — proporcional al
                stage del original (que era 100vw - 1rem - menu). */}
            <div
              ref={videoWrapRef}
              aria-hidden
              className="absolute top-1/2 left-1/2 overflow-hidden will-change-[transform,opacity]"
              style={{
                width: "clamp(220px, 75vw, 360px)",
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
                - capa blanca encima, clipada al footprint del video */}
            <div className="relative w-full max-w-[480px] text-center">
              <div ref={textBoxRef} className="relative">
                <p
                  ref={quoteTextRef}
                  className="hl-quote-text text-black will-change-[transform,opacity]"
                  style={{
                    fontFamily: HEADLINE_FONT,
                    fontSize: "clamp(20px, 5.5vw, 30px)",
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.0,
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
                    fontSize: "clamp(20px, 5.5vw, 30px)",
                    fontWeight: 400,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.0,
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
