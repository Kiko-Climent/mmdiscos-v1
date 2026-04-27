import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SLIDES = [
  {
    title: "Socarrat vol.1",
    img: "/img4.jpg",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
  {
    title: "Deamwalker EP",
    img: "/MMD038.png",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
  {
    title: "Socarrat vol.2",
    img: "/MMD039.png",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
  {
    title: "Eternal Sunset EP",
    img: "/MMD040_Cover-1.jpg",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
  {
    title: "Club Solsticio EP",
    img: "/MMD040-2.png",
    copy: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum deserunt soluta, consequatur sit et tenetur facilis ex ab voluptatibus possimus voluptatem doloribus delectus.",
  },
];

export default function Highlights() {
  const rootRef = useRef(null);
  const stickyRef = useRef(null);
  const indicatorRef = useRef(null);
  const stripRef = useRef(null);
  const copyRef = useRef(null);
  const counterRef = useRef(null);
  const progressRef = useRef(null);
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
      const stickyHeight = window.innerHeight * total;

      // ScrollTrigger principal: pinea la sección durante 5 viewports.
      // start "top top" → empieza al alinear la sección con el viewport.
      // end +=stickyHeight → 5 vh de scroll para los 5 slides.
      ScrollTrigger.create({
        trigger: sticky,
        start: "top top",
        end: `+=${stickyHeight}`,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Progress bar: scaleY 0→1 sobre el progreso completo.
          gsap.set(progressRef.current, {
            scaleY: self.progress,
            force3D: true,
          });

          // Índice derivado de self.progress (0→1) en vez de medir offsets
          // del DOM: cuando ScrollTrigger pinea inserta un spacer y el
          // offsetTop deja de ser fiable. progress*total mapea linealmente
          // a los slides y es inmune a layout shifts de componentes previos.
          let activeIndex = Math.floor(self.progress * total);
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
                <p className="uppercase font-semibold leading-none text-[36px] md:text-[60px]">
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
      </section>

      <section className="hl-outro relative w-screen h-screen flex justify-center items-center bg-white">
        <p className="uppercase font-semibold text-[30px] leading-none py-1 px-1 bg-black text-white">
          Your next section goes here
        </p>
      </section>
    </div>
  );
}