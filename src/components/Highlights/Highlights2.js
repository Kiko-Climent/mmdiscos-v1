import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SLIDES = [
  {
    title: "Socarrat vol.1",
    img: "/MMD040_Cover-1.jpg",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
  {
    title: "Deamwalker EP",
    img: "/img4.jpg",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
  {
    title: "Socarrat vol.2",
    img: "/MMD040-2.png",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
  {
    title: "Eternal Sunset EP",
    img: "/MMD039.png",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
  {
    title: "Club Solsticio EP",
    img: "/MMD038.png",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
];

const ALFREDOS_QUOTE = `We played without rules, without thinking about styles or what would come next. One track could be slow, the next dark, then something pop or an impossible guitar, but it all made sense in that moment. The dancefloor didn't ask for coherence, it asked for emotion — and as long as people stayed there, smiling and lost, you knew you were doing it right.`;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function Highlights() {
  const rootRef = useRef(null);
  const stickyRef = useRef(null);
  const indicatorRef = useRef(null);
  const stripRef = useRef(null);
  const copyRef = useRef(null);
  const counterRef = useRef(null);
  const progressRef = useRef(null);
  const curtainRef = useRef(null);
  const quoteRef = useRef(null);
  const videoWrapRef = useRef(null);
  const videoRef = useRef(null);
  const itemsRef = useRef([]);

  // Lenis y ScrollTrigger se configuran en pages/index.js (scrollerProxy
  // en desktop, normalizeScroll en móvil). Aquí solo creamos triggers —
  // heredan el scroller global por ScrollTrigger.defaults.
  useLayoutEffect(() => {
    const sticky = stickyRef.current;
    const items = itemsRef.current.filter(Boolean);
    if (!sticky || items.length === 0) return;

    let currentIndex = 0;
    let copyTween = null;

    const ctx = gsap.context(() => {
      // ── Medición de anchuras del indicator ──────────────────────────
      // Nodo oculto que clona los estilos tipográficos para medir cada
      // título sin reflow del layout real.
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

      // Altura real de cada item (responsive-safe).
      const itemHeight = items[0].getBoundingClientRect().height;

      // Altura real de cada imagen del strip — clave para que la
      // traslación encaje píxel-perfect con cualquier viewport.
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
      const slidesRange = vh * total;       // 5 viewports — fase de slides
      const curtainRange = vh * 1;          // 1 viewport — apertura cortina
      const quoteRange = vh * 0.5;          // 0.5 viewport — fade-in quote
      const videoRange = vh * 0.75;         // 0.75 viewport — reveal video
      const totalRange = slidesRange + curtainRange + quoteRange + videoRange;

      // Límites en progress (0→1).
      const slidePhaseEnd = slidesRange / totalRange;
      const curtainPhaseEnd = (slidesRange + curtainRange) / totalRange;
      const quotePhaseEnd = (slidesRange + curtainRange + quoteRange) / totalRange;

      // ScrollTrigger principal: pinea durante slides + cortina + quote.
      // El elemento sigue pineado hasta que el quote llega a opacidad 1,
      // momento en que la outro (negro estático con quote) toma el relevo
      // de forma seamless.
      ScrollTrigger.create({
        trigger: sticky,
        start: "top top",
        end: `+=${totalRange}`,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;

          // Sub-progresos por fase, cada uno normalizado 0→1.
          const sp = clamp01(p / slidePhaseEnd);
          const cp = clamp01((p - slidePhaseEnd) / (curtainPhaseEnd - slidePhaseEnd));
          const qp = clamp01((p - curtainPhaseEnd) / (quotePhaseEnd - curtainPhaseEnd));
          const vp = clamp01((p - quotePhaseEnd) / (1 - quotePhaseEnd));

          // Progress bar: scaleY ligado a la fase de slides. Llega a 1
          // exacto al terminar los slides — coincide visualmente con el
          // estado inicial de la cortina (60% alto, centrado).
          gsap.set(progressRef.current, { scaleY: sp, force3D: true });

          // Cortina: polígono de 4 puntos parametrizado para un reveal
          // tipo "blade sweep" diagonal. Editorial / digital — los bordes
          // se sesgan durante la apertura (skew pico en t=0.5) y vuelven
          // a vertical al cerrar, garantizando alineación final perfecta.
          //
          // t=0   → degenerado en (50%,20%)–(50%,80%) ≡ silueta del bar.
          // t=0.5 → paralelogramo inclinado.
          // t=1   → rectángulo full-screen con overshoot lateral del 5%.
          if (curtainRef.current) {
            const t = cp;
            const halfW = 55 * t;
            const skew = Math.sin(t * Math.PI) * 8;
            const topY = 20 * (1 - t);
            const botY = 100 - 20 * (1 - t);
            const tlx = 50 - halfW - skew;
            const trx = 50 + halfW - skew;
            const brx = 50 + halfW + skew;
            const blx = 50 - halfW + skew;
            curtainRef.current.style.clipPath = `polygon(${tlx}% ${topY}%, ${trx}% ${topY}%, ${brx}% ${botY}%, ${blx}% ${botY}%)`;
          }

          // Quote: opacidad ligada a la fase post-cortina.
          if (quoteRef.current) {
            quoteRef.current.style.opacity = String(qp);
          }

          // Video: reveal con clip-path center-out (mismo patrón que la
          // cortina por coherencia visual). Arranca en (50% 50% 50% 50%)
          // → invisible (rect de área 0 en el centro) y se expande hasta
          // (0 0 0 0) — visible completo.
          if (videoWrapRef.current) {
            const v = 50 * (1 - vp);
            videoWrapRef.current.style.clipPath = `inset(${v}% ${v}% ${v}% ${v}%)`;
          }

          // Índice derivado de la fase de slides (no del progress total)
          // para que el último slide se mantenga durante cortina + quote.
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

          gsap.to(counterRef.current, {
            innerText: activeIndex + 1,
            snap: { innerText: 1 },
            duration: 0.3,
            ease: "power3.out",
            overwrite: true,
          });

          // Copy fade-out → swap → fade-in. Una sola referencia killable
          // para que un scroll rápido no encadene tweens fantasma.
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

      // Refresh tras montar: por si las imágenes aún no habían cargado
      // cuando medimos imgHeight.
      ScrollTrigger.refresh();
    }, rootRef);

    return () => {
      if (copyTween) copyTween.kill();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="hl-root w-full bg-white">
      <section
        ref={stickyRef}
        className="hl-sticky relative w-screen h-screen flex flex-col md:flex-row bg-white overflow-hidden"
      >
        {/* COL 1 — lista de títulos */}
        <div className="flex-1 flex flex-col items-center justify-start md:justify-center pt-[18%] md:pt-0 gap-8">
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
                <p className="uppercase font-semibold leading-none text-[36px] md:text-[2.75rem]">
                  {s.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* COL 2 — imagen + copy */}
        <div className="flex-1 flex flex-row md:flex-col items-center justify-center gap-6 md:gap-10 px-6">
          <div className="hl-img-wrapper relative aspect-square w-1/3 md:w-[clamp(220px,26vw,360px)] overflow-hidden">
            <div ref={stripRef} className="hl-service-img w-full">
              {SLIDES.map((s) => (
                <div key={s.img} className="hl-img relative w-full aspect-square">
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

          <div className="w-1/2 md:w-[clamp(220px,26vw,360px)]">
            <p
              ref={copyRef}
              className="hl-copy text-[14px] md:text-[18px] leading-[1.55] text-black"
            >
              {SLIDES[0].copy}
            </p>
          </div>
        </div>

        <div className="hl-progress-bar">
          <div ref={progressRef} className="hl-progress" />
        </div>

        <div className="hl-index">
          <span ref={counterRef}>1</span>
          <span className="hl-separator" />
          <span>{SLIDES.length}</span>
        </div>

        {/* Cortina negra que se abre desde el progress bar. z-index alto
            para cubrir todo el contenido del sticky cuando se expande. */}
        <div ref={curtainRef} className="hl-curtain" aria-hidden />

        {/* Quote sobre la cortina. Layout: fila full-width centrada en
            vertical; texto (4/6) y video (2/6) alineados por el bottom.
            Padding lateral 1rem (pl-4 / pr-4) y gap interno 1rem
            (pr-4 en el texto) — tres separaciones idénticas. */}
        <div ref={quoteRef} className="hl-quote">
          <div className="flex w-full items-start">
            <div className="w-4/6 pl-4 pr-4 pb-4">
              <p>{ALFREDOS_QUOTE}</p>
            </div>
            <div
              ref={videoWrapRef}
              className="hl-video-wrap w-2/6 pr-4 pt-4"
              aria-hidden
            >
              <video
                ref={videoRef}
                className="hl-video w-full aspect-video object-cover block"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              >
                {/* TODO: reemplazar por la ruta real del video. */}
                <source src="/video/Video MM Header.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}