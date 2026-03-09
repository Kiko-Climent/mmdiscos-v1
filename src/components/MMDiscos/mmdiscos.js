"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/all";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, Flip);

const PROJECTS = [
  { name: "Human Form Study",   src: "/img1.jpg"  },
  { name: "Interior Light",     src: "/img2.jpg"  },
  { name: "Project 21",         src: "/img3.jpg"  },
  { name: "Shadow Portraits",   src: "/img4.jpg"  },
  { name: "Everyday Objects",   src: "/img5.jpg"  },
  { name: "Unit 07 Care",       src: "/img6.jpg"  },
  { name: "Motion Practice",    src: "/img7.jpg"  },
  { name: "Noonlight Series",   src: "/img8.jpg"  },
  { name: "Material Stillness", src: "/img9.jpg"  },
  { name: "Quiet Walk",         src: "/img10.jpg" },
];

/*
  Z-index stack
  ─────────────
  0  → video (fixed, fondo)
  1  → caja frosted (fixed)
  2  → logo (dentro de la caja)
  10 → logo pinned (fuera de la caja, encima de todo)
  20 → spotlight section (pasa por encima del video y la caja al hacer pin)
*/

const logoBaseStyle = {
  position: "absolute",
  bottom: "0",
  left: "50%",
  transform: "translateX(-50%)",
  width: "100%",
  padding: "2.5rem",
  pointerEvents: "all",
  zIndex: 2,
};

const logoPinnedStyle = {
  position: "fixed",
  bottom: "unset",
  top: "0",
  left: "0",
  transform: "translateX(0)",
  width: "250px",
  padding: "1rem 2.5rem",
  pointerEvents: "all",
  zIndex: 10,
};

export default function MMDiscoss() {
  const backdropRef = useRef(null);
  const bgRef       = useRef(null);
  const logoRef     = useRef(null);

  const spotlightRef       = useRef(null);
  const projectIndexRef    = useRef(null);
  const projectImgsRef     = useRef([]);
  const imagesContainerRef = useRef(null);
  const projectNamesRef    = useRef([]);
  const namesContainerRef  = useRef(null);

  useEffect(() => {
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const rafCb = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(rafCb);
    gsap.ticker.lagSmoothing(0);

    const initHeroAnimations = () => {
      const box  = bgRef.current;
      const logo = logoRef.current;
      if (!box || !logo) return;

      const isDesktop = window.innerWidth >= 720;

      if (!isDesktop) {
        Object.assign(logo.style, logoPinnedStyle);
        gsap.set(logo, { width: 250 });
        gsap.set(box,  { width: "100%", height: "100svh" });
        return;
      }

      const vpW           = window.innerWidth;
      const vpH           = window.innerHeight;
      const initialWidth  = box.offsetWidth;
      const initialHeight = box.offsetHeight;

      const state = Flip.getState(logo);
      Object.assign(logo.style, logoPinnedStyle);
      gsap.set(logo, { width: 250 });
      const flip = Flip.from(state, { duration: 1, ease: "none", paused: true });

      ScrollTrigger.create({
        trigger: backdropRef.current,
        start: "top top",
        end: `+=${vpH}px`,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(box, {
            width:           gsap.utils.interpolate(initialWidth, vpW, p),
            height:          gsap.utils.interpolate(initialHeight, vpH, p),
            backgroundColor: `rgba(249,244,235,${gsap.utils.interpolate(0.35, 1, p)})`,
          });
          flip.progress(p);
        },
      });
    };

    const initSpotlightAnimations = () => {
      const spotlightEl     = spotlightRef.current;
      const projectIndexEl  = projectIndexRef.current;
      const imagesContainer = imagesContainerRef.current;
      const namesContainer  = namesContainerRef.current;
      const projectImgs     = projectImgsRef.current;
      const projectNames    = projectNamesRef.current;
      if (!spotlightEl) return;

      const totalCount       = projectNames.length;
      const spotlightHeight  = spotlightEl.offsetHeight;
      const spotlightPadding = parseFloat(getComputedStyle(spotlightEl).padding);
      const indexHeight      = projectIndexEl.offsetHeight;
      const containerHeight  = namesContainer.offsetHeight;
      const imagesHeight     = imagesContainer.offsetHeight;

      const moveDistanceIndex  = spotlightHeight - spotlightPadding * 2 - indexHeight;
      const moveDistanceNames  = spotlightHeight - spotlightPadding * 2 - containerHeight;
      const moveDistanceImages = window.innerHeight - imagesHeight;
      const imgActivation      = window.innerHeight / 2;

      ScrollTrigger.create({
        trigger: spotlightEl,
        start: "top top",
        end: `+=${window.innerHeight * 5}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress     = self.progress;
          const currentIndex = Math.min(
            Math.floor(progress * totalCount) + 1,
            totalCount
          );

          projectIndexEl.textContent = `${String(currentIndex).padStart(2, "0")}/${String(totalCount).padStart(2, "0")}`;
          gsap.set(projectIndexEl,  { y: progress * moveDistanceIndex });
          gsap.set(imagesContainer, { y: progress * moveDistanceImages });

          projectImgs.forEach((img) => {
            const rect   = img.getBoundingClientRect();
            const active = rect.top <= imgActivation && rect.bottom >= imgActivation;
            gsap.set(img, { opacity: active ? 1 : 0.5 });
          });

          projectNames.forEach((p, index) => {
            const start = index / totalCount;
            const end   = (index + 1) / totalCount;
            const pp    = Math.max(0, Math.min(1, (progress - start) / (end - start)));
            gsap.set(p, {
              y:     -pp * moveDistanceNames,
              color: pp > 0 && pp < 1 ? "#000" : "#4a4a4a",
            });
          });
        },
      });
    };

    initHeroAnimations();
    initSpotlightAnimations();

    let timer;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
        const box  = bgRef.current;
        const logo = logoRef.current;
        if (box && logo) {
          gsap.set([box, logo], { clearProps: "all" });
          Object.assign(logo.style, logoBaseStyle);
        }
        initHeroAnimations();
        initSpotlightAnimations();
      }, 250);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.ticker.remove(rafCb);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <style>{`
        img { width: 100%; height: 100%; object-fit: cover; }
        h1 {
          text-transform: uppercase;
          font-size: clamp(3rem, 5vw, 7rem);
          font-weight: 400;
          line-height: 1;
        }
        p { font-size: 1.5rem; font-weight: 500; line-height: 1.25; }
        .project-images {
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 35%;
          padding: 50svh 0;
          display: flex; flex-direction: column;
          gap: 0.5rem;
          z-index: -1;
        }
        .project-img {
          width: 100%;
          aspect-ratio: 1 / 1;
          opacity: 0.5;
          overflow: hidden;
        }
        .project-names {
          position: absolute;
          right: 2rem; bottom: 2rem;
          display: flex; flex-direction: column;
          align-items: flex-end;
        }
        .project-names p { color: #4a4a4a; }
        .project-index h1, .project-images, .project-names p { will-change: transform; }
        @media (max-width: 1000px) {
          .project-images { width: calc(100% - 4rem); gap: 25svh; }
          .project-names p { color: #000 !important; }
        }
      `}</style>

      {/* ── INTRO: spacer que activa el hero ──────────────────────────────── */}
      <div ref={backdropRef} style={{ height: "200svh", pointerEvents: "none" }} />

      {/* Video — z-index 0, base de todo el stack */}
      <div style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100svh",
        zIndex: 0,                      // ← visible, por encima del body
        pointerEvents: "none",
        overflow: "hidden",
      }}>
        <video
          autoPlay muted loop playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        >
          <source src="/video/MM Hero BG_1.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Caja frosted — z-index 1, encima del video */}
      <div
        ref={bgRef}
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "35%", aspectRatio: "16/9",
          backgroundColor: "rgba(249,244,235,0.35)",
          backdropFilter: "blur(3px)",
          pointerEvents: "none",
          zIndex: 1,                    // ← encima del video
          willChange: "width, height",
        }}
      >
        <div ref={logoRef} style={logoBaseStyle}>
          <img src="/logo/Balearic Sound System Logo.svg" alt="MM Discos" />
        </div>
      </div>

      {/* ── SPOTLIGHT — z-index 20, cubre video+caja al entrar en escena ── */}
      <section
        ref={spotlightRef}
        style={{
          position: "relative",
          width: "100%", height: "100svh",
          padding: "2rem", overflow: "hidden",
          background: "#fff", color: "#000",
          zIndex: 20,
        }}
      >
        <div className="project-index font-mono">
          <h1 ref={projectIndexRef}>01/10</h1>
        </div>

        <div className="project-images" ref={imagesContainerRef}>
          {PROJECTS.map((project, i) => (
            <div
              key={project.src}
              className="project-img"
              ref={(el) => { if (el) projectImgsRef.current[i] = el; }}
            >
              <img src={project.src} alt={project.name} />
            </div>
          ))}
        </div>

        <div className="project-names" ref={namesContainerRef}>
          {PROJECTS.map((project, i) => (
            <p
              key={project.name}
              ref={(el) => { if (el) projectNamesRef.current[i] = el; }}
            >
              {project.name}
            </p>
          ))}
        </div>
      </section>

      {/* ── OUTRO ──────────────────────────────────────────────────────────── */}
      <section style={{
        position: "relative",
        width: "100%", height: "100svh",
        padding: "2rem", overflow: "hidden",
        background: "#fff", color: "#000",
        display: "flex", justifyContent: "center", alignItems: "center",
        textAlign: "center",
        zIndex: 20,
      }}>
        <p>Scroll complete</p>
      </section>
    </>
  );
}