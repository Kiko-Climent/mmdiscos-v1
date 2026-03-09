"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PROJECTS = [
  { name: "Ungaro & Phil Anker", ref: "MMD 032", src: "/img1.jpg"  },
  { name: "Mogwaa",              ref: "MMD 033", src: "/img2.jpg"  },
  { name: "Guillaume",          ref: "MMD 034", src: "/img3.jpg"  },
  { name: "Nairless",           ref: "MMD 035", src: "/img4.jpg"  },
  { name: "Pontcho",            ref: "MMD 036", src: "/img5.jpg"  },
  { name: "Nic Jalusi",         ref: "MMD 037", src: "/img6.jpg"  },
  { name: "Socarrat vol.1",     ref: "MMD 038", src: "/img7.jpg"  },
  { name: "Voyle",              ref: "MMD 039", src: "/img8.jpg"  },
  { name: "Daichi",             ref: "MMD 040", src: "/img9.jpg"  },
  { name: "Statues",            ref: "MMD 041", src: "/img10.jpg" },
];

export default function MMHeroReleasesNew() {
  const spotlightRef       = useRef(null);
  const projectImgsRef     = useRef([]);
  const imagesContainerRef = useRef(null);
  const projectNamesRef    = useRef([]);
  const namesContainerRef  = useRef(null);
  const projectRefsRef     = useRef([]);
  const refsContainerRef   = useRef(null);

  useEffect(() => {
    const spotlightEl     = spotlightRef.current;
    const imagesContainer = imagesContainerRef.current;
    const namesContainer  = namesContainerRef.current;
    const refsContainer   = refsContainerRef.current;
    const projectImgs     = projectImgsRef.current;
    const projectNames    = projectNamesRef.current;
    const projectRefs     = projectRefsRef.current;
    const totalCount      = projectNames.length;

    const spotlightPadding = parseFloat(getComputedStyle(spotlightEl).padding);
    const containerHeight  = namesContainer.offsetHeight;
    const imagesHeight     = imagesContainer.offsetHeight;

    const moveDistanceNames  = spotlightEl.offsetHeight - spotlightPadding * 2 - containerHeight;
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
        const progress = self.progress;

        gsap.set(imagesContainer, { y: progress * moveDistanceImages });

        projectImgs.forEach((img) => {
          const rect   = img.getBoundingClientRect();
          const active = rect.top <= imgActivation && rect.bottom >= imgActivation;
          gsap.set(img, { opacity: active ? 1 : 0.5 });
        });

        // Both columns share the exact same transform so they stay aligned
        projectNames.forEach((p, index) => {
          const start = index / totalCount;
          const end   = (index + 1) / totalCount;
          const pp    = Math.max(0, Math.min(1, (progress - start) / (end - start)));
          const yVal  = -pp * moveDistanceNames;
          const color = pp > 0 && pp < 1 ? "#000" : "#4a4a4a";

          gsap.set(p,              { y: yVal, color });
          gsap.set(projectRefs[index], { y: yVal, color });
        });
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <div className="releases-wrapper">
      <style>{`
        .releases-wrapper .spotlight {
          position: relative;
          width: 100%;
          height: 100svh;
          padding: 2rem;
          overflow: hidden;
          background: #fff;
          color: #000;
        }
        .releases-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .releases-wrapper p {
          text-transform: uppercase;
          font-size: 1.5rem;
          font-weight: 500;
          line-height: 1.25;
        }
        .releases-wrapper .project-images {
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
        .releases-wrapper .project-img {
          width: 100%;
          aspect-ratio: 1 / 1;
          opacity: 0.5;
          transition: opacity 0.3s ease;
          overflow: hidden;
        }

        /* ── Right column: titles ── */
        .releases-wrapper .project-names {
          position: absolute;
          right: 2rem;
          bottom: 2rem;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .releases-wrapper .project-names p {
          color: #4a4a4a;
        }

        /* ── Left column: references (mirrors right column exactly) ── */
        .releases-wrapper .project-refs {
          position: absolute;
          left: 2rem;
          bottom: 2rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .releases-wrapper .project-refs p {
          color: #4a4a4a;
          font-variant-numeric: tabular-nums;
          /* font-family: var(--font-mono, monospace); */
        }

        .releases-wrapper .project-images,
        .releases-wrapper .project-names p,
        .releases-wrapper .project-refs p {
          will-change: transform;
        }

        @media (max-width: 1000px) {
          .releases-wrapper .project-images {
            width: calc(100% - 4rem);
            gap: 25svh;
          }
          .releases-wrapper .project-names p,
          .releases-wrapper .project-refs p {
            color: #000 !important;
          }
        }
      `}</style>

      <section className="spotlight" ref={spotlightRef}>

        {/* Left column — references */}
        <div className="project-refs" ref={refsContainerRef}>
          {PROJECTS.map((project, i) => (
            <p
              key={project.ref}
              ref={(el) => { if (el) projectRefsRef.current[i] = el; }}
            >
              {project.ref}
            </p>
          ))}
        </div>

        {/* Center — images */}
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

        {/* Right column — names */}
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
    </div>
  );
}