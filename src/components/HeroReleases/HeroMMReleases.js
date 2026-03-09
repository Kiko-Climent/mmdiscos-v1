"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

// ─── Data ────────────────────────────────────────────────────────────────────
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

// ─── Component ───────────────────────────────────────────────────────────────
export default function HeroMMReleases() {
  const spotlightRef       = useRef(null);
  const projectIndexRef    = useRef(null);
  const projectImgsRef     = useRef([]);
  const imagesContainerRef = useRef(null);
  const projectNamesRef    = useRef([]);
  const namesContainerRef  = useRef(null);

  useEffect(() => {
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    const spotlightEl     = spotlightRef.current;
    const projectIndexEl  = projectIndexRef.current;
    const imagesContainer = imagesContainerRef.current;
    const namesContainer  = namesContainerRef.current;
    const projectImgs     = projectImgsRef.current;
    const projectNames    = projectNamesRef.current;
    const totalCount      = projectNames.length;

    const spotlightHeight  = spotlightEl.offsetHeight;
    const spotlightPadding = parseFloat(getComputedStyle(spotlightEl).padding);
    const indexHeight      = projectIndexEl.offsetHeight;
    const containerHeight  = namesContainer.offsetHeight;
    const imagesHeight     = imagesContainer.offsetHeight;

    const moveDistanceIndex  = spotlightHeight - spotlightPadding * 2 - indexHeight;
    const moveDistanceNames  = spotlightHeight - spotlightPadding * 2 - containerHeight;
    const moveDistanceImages = window.innerHeight - imagesHeight;
    const imgActivation      = window.innerHeight / 2;

    const trigger = ScrollTrigger.create({
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
        gsap.set(projectIndexEl, { y: progress * moveDistanceIndex });
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
            color: pp > 0 && pp < 1 ? "#000" : "#b0b0b0",
          });
        });
      },
    });

    return () => {
      trigger.kill();
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <style>{`
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        h1 {
          text-transform: uppercase;
          font-size: clamp(3rem, 5vw, 7rem);
          font-weight: 400;
          line-height: 1;
        }
        p {
          font-size: 1.5rem;
          font-weight: 500;
          line-height: 1.25;
        }
        section {
          position: relative;
          width: 100%;
          height: 100svh;
          padding: 2rem;
          overflow: hidden;
        }
        .intro,
        .outro {
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .project-images {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 35%;
          padding: 50svh 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          z-index: -1;
        }
        .project-img {
          width: 100%;
          aspect-ratio: 1 / 1;
          opacity: 0.5;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .project-names {
          position: absolute;
          right: 2rem;
          bottom: 2rem;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .project-names p {
          color: #b0b0b0;
          transition: color 0.3s ease;
        }
        .project-index h1,
        .project-images,
        .project-names p {
          will-change: transform;
        }
        @media (max-width: 1000px) {
          .project-images {
            width: calc(100% - 4rem);
            gap: 25svh;
          }
          .project-names p {
            color: #000 !important;
          }
        }
      `}</style>

      {/* ── Intro ── */}
      <section className="intro">
        <p>A collection of selected works</p>
      </section>

      {/* ── Spotlight ── */}
      <section className="spotlight" ref={spotlightRef}>
        <div className="project-index">
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

      {/* ── Outro ── */}
      <section className="outro">
        <p>Scroll complete</p>
      </section>
    </>
  );
}