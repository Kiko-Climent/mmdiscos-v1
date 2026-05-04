"use client";

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

export default function Highlights2Desktop() {
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
  const quoteRef = useRef(null);
  const quoteTextRef = useRef(null);
  const slugRef = useRef(null);
  const grainRef = useRef(null);
  const videoWrapRef = useRef(null);
  const videoRef = useRef(null);
  const itemsRef = useRef([]);

  useLayoutEffect(() => {
    // Variante desktop — si el viewport es móvil, el otro componente está
    // activo y este no debe registrar triggers.
    if (window.innerWidth <= 900) return;
  
    const sticky = stickyRef.current;
    const items = itemsRef.current.filter(Boolean);
    if (!sticky || items.length === 0) return;

    let currentIndex = 0;
    let copyTween = null;

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
      const quoteRange = vh * 0.6;
      const videoRange = vh * 0.75;
      const totalRange = slidesRange + splitRange + quoteRange + videoRange;

      const slidePhaseEnd = slidesRange / totalRange;
      const splitPhaseEnd = (slidesRange + splitRange) / totalRange;
      const quotePhaseEnd = (slidesRange + splitRange + quoteRange) / totalRange;

      ScrollTrigger.create({
        trigger: sticky,
        start: "top top",
        end: `+=${totalRange}`,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;

          const sp = clamp01(p / slidePhaseEnd);
          const splitp = clamp01((p - slidePhaseEnd) / (splitPhaseEnd - slidePhaseEnd));
          const qp = clamp01((p - splitPhaseEnd) / (quotePhaseEnd - splitPhaseEnd));
          const vp = clamp01((p - quotePhaseEnd) / (1 - quotePhaseEnd));

          gsap.set(progressRef.current, { scaleY: sp, force3D: true });

          const barCollapse = clamp01(splitp / 0.7);
          const rawColP = splitp;
          const colP =
            rawColP < 0.5
              ? 4 * rawColP * rawColP * rawColP
              : 1 - Math.pow(-2 * rawColP + 2, 3) / 2;
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
          if (quoteRef.current) {
            quoteRef.current.style.opacity = String(splitp);
          }
          if (grainRef.current) {
            grainRef.current.style.opacity = String(Math.sin(splitp * Math.PI) * 0.18);
          }

          if (quoteTextRef.current) {
            quoteTextRef.current.style.opacity = String(qp);
            quoteTextRef.current.style.transform = `translate3d(0, ${(1 - qp) * 16}px, 0)`;
          }
          if (slugRef.current) {
            const sgp = clamp01((qp - 0.55) / 0.45);
            slugRef.current.style.opacity = String(sgp);
            slugRef.current.style.transform = `translate3d(0, ${(1 - sgp) * 8}px, 0)`;
          }

          if (videoWrapRef.current) {
            const v = 50 * (1 - vp);
            videoWrapRef.current.style.clipPath = `inset(${v}% ${v}% ${v}% ${v}%)`;
          }

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
        className="hl-sticky relative w-screen h-screen bg-white overflow-hidden"
      >
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

        <div
          ref={imagePanelRef}
          className="hl-panel absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center gap-10 px-6 z-[1]"
        >
          <div className="hl-img-wrapper relative aspect-square w-[clamp(220px,26vw,360px)] overflow-hidden">
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

          <div className="w-[clamp(220px,26vw,360px)]">
            <p
              ref={copyRef}
              className="hl-copy text-[18px] leading-[1.55] text-black"
            >
              {SLIDES[0].copy}
            </p>
          </div>
        </div>

        <div ref={progressBarRef} className="hl-progress-bar">
          <div ref={progressRef} className="hl-progress" />
        </div>

        <div ref={indexRef} className="hl-index">
          <span ref={counterRef}>1</span>
          <span className="hl-separator" />
          <span>{SLIDES.length}</span>
        </div>

        <div ref={quoteRef} className="hl-quote opacity-0">
          <div className="absolute left-0 right-0 bottom-0 px-6 pb-6 flex items-start gap-8">
            <div ref={quoteTextRef} className="w-3/5 will-change-transform">
              <p className="hl-quote-text text-[clamp(1.5rem,3.4vw,3.25rem)]">
                {ALFREDOS_QUOTE}
              </p>
              <p ref={slugRef} className="hl-slug mt-5 text-[12px]">
                — Alfredo · Amnesia, Ibiza 1987
              </p>
            </div>

            <div className="ml-auto flex justify-end w-1/4 max-w-[360px]">
              <div ref={videoWrapRef} className="hl-video-wrap w-full" aria-hidden>
                <video
                  ref={videoRef}
                  className="hl-video w-full aspect-video object-cover block"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                >
                  <source src="/video/Video MM Header.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>

        <div ref={grainRef} className="hl-grain" aria-hidden />
      </section>
    </div>
  );
}