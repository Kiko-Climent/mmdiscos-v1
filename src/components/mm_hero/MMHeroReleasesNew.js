"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PROJECTS = [
  { name: "Ungaro & Phil Anker",   src: "/img1.jpg"  },
  { name: "Mogwaa",     src: "/img2.jpg"  },
  { name: "Guillaume",         src: "/img3.jpg"  },
  { name: "Nairless",   src: "/img4.jpg"  },
  { name: "Pontcho",   src: "/img5.jpg"  },
  { name: "Nic Jalusi",       src: "/img6.jpg"  },
  { name: "Socarrat vol.1",    src: "/img7.jpg"  },
  { name: "Voyle",   src: "/img8.jpg"  },
  { name: "Daichi", src: "/img9.jpg"  },
  { name: "Statues",         src: "/img10.jpg" },
];

export default function MMHeroReleasesNew() {
  const spotlightRef       = useRef(null);
  const projectIndexRef    = useRef(null);
  const projectIndexNumRef = useRef(null);
  const projectImgsRef     = useRef([]);
  const imagesContainerRef = useRef(null);
  const projectNamesRef    = useRef([]);
  const namesContainerRef  = useRef(null);

  useEffect(() => {
    const spotlightEl     = spotlightRef.current;
    const projectIndexEl  = projectIndexRef.current;
    const projectIndexNum = projectIndexNumRef.current;
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

        if (projectIndexNum) {
          projectIndexNum.textContent = String(32 + currentIndex - 1).padStart(3, "0");
        }
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
            color: pp > 0 && pp < 1 ? "#000" : "#4a4a4a",
          });
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
        .releases-wrapper h1 {
          text-transform: uppercase;
          font-size: clamp(3rem, 5vw, 7rem);
          font-weight: 400;
          line-height: 0.75;
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
          transition: all 0.3s ease;
          overflow: hidden;
        }
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
          transition: color 0.3s ease;
        }
        .releases-wrapper .project-index {
          display: flex;
          flex-direction: row;
          align-items: baseline;
          gap: 0.35em;
          line-height: 0.85;
          letter-spacing: 0;
        }
        .releases-wrapper .project-index-label,
        .releases-wrapper .project-index h1 {
          font-size: clamp(2.25rem, 4vw, 5rem);
          font-weight: 400;
          text-transform: uppercase;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0;
        }
        .releases-wrapper .project-index h1,
        .releases-wrapper .project-images,
        .releases-wrapper .project-names p {
          will-change: transform;
        }
        @media (max-width: 1000px) {
          .releases-wrapper .project-images {
            width: calc(100% - 4rem);
            gap: 25svh;
          }
          .releases-wrapper .project-names p {
            color: #000 !important;
          }
        }
      `}</style>

      <section className="spotlight" ref={spotlightRef}>
        <div className="project-index font-mono" ref={projectIndexRef}>
          <span className="project-index-label">MMD</span>
          <h1 ref={projectIndexNumRef}>032</h1>
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
    </div>
  );
}
