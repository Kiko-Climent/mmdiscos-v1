"use client";

import { useEffect, useRef } from "react";

// ⚠️ Añade esto en tu globals.css:
// @import '../styles/about-section.css';
// O copia el contenido de about-section.css en tu globals.css

const RAW_TEXT = `RECORD LABEL BASED BETWEEN BERLIN AND BARCELONA, FOUNDED AND POWERED BY DA SALIVA AND DJ KATAH, ALSO KNOWN AS MOON & MANN. ESTABLISHED IN 2015, MM DISCOS HAS GROWN INTO A PLATFORM AND CREATIVE HOME FOR BOTH EMERGING TALENTS AND ESTABLISHED ARTISTS. FREE FROM STYLISTIC BOUNDARIES AND GENRE LIMITATIONS, THE LABEL HAS CONSISTENTLY CHAMPIONED A DISTINCTIVE SOUND WHERE MUSIC SPEAKS FOR ITSELF — DEEPLY INSPIRED BY THE SUEÑO IBICENCO AND THE SPIRIT OF THE MEDITERRANEAN.`;

const WORDS = RAW_TEXT.split(" ");

export default function AboutSection() {
  const sectionRef = useRef(null);
  const wordsRef = useRef([]);

  useEffect(() => {
    let gsapCtx;

    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      if (!section) return;

      const wordEls = wordsRef.current.filter(Boolean);

      // Estado inicial: fuera de pantalla a la derecha, borrosas y transparentes
      gsap.set(wordEls, {
        x: window.innerWidth + 400,
        opacity: 0.15,
        filter: "blur(8px)",
      });

      // Cuánto scroll necesita la animación completa
      const animDistance = wordEls.length * 65;

      gsapCtx = gsap.context(() => {

        // ── 1. Pin ──────────────────────────────────────────────────────────────
        // La sección se pina cuando su borde superior toca el top del viewport.
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: `+=${animDistance}`,
          pin: true,
          anticipatePin: 1,
        });

        // ── 2. Animación de palabras ────────────────────────────────────────────
        // Arranca cuando la sección está al 85% del viewport (aún entrando desde abajo).
        // "top 15%" = el top de la sección está a 15vh del borde superior del viewport,
        // es decir, la cortina/sección ha completado ~85% de su entrada.
        // Termina con el mismo desplazamiento total que el pin → todo sincronizado.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 15%",
            end: `+=${animDistance}`,
            scrub: 1,
          },
        });

        tl.to(wordEls, {
          x: 0,
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          stagger: { each: 0.1 },
        });

      }, section);
    };

    init();

    return () => {
      gsapCtx?.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="about-section relative">
        <div className="about-inner">
            <p className="about-text" aria-label={RAW_TEXT}>
          {WORDS.map((word, i) => (
            <span
              key={i}
              aria-hidden="true"
              ref={(el) => {
                wordsRef.current[i] = el;
              }}
              className="about-word"
            >
              {word}
            </span>
          ))}
        </p>
        <div className="about-footer about-text absolute bottom-0 left-0 w-full flex flex-col justify-between px-6 pb-4">
            <p className="about-text">MM Discos © 2026</p>
            <div className="flex flex-row justify-between gap-6">
                <a href="https://www.instagram.com/mmdiscos/" target="_blank" rel="noopener noreferrer">instagram</a>
                <a href="https://www.bandcamp.com/mmdiscos" target="_blank" rel="noopener noreferrer">bandcamp</a>
                <a href="https://www.soundcloud.com/mmdiscos" target="_blank" rel="noopener noreferrer">soundcloud</a>
                <a href="https://www.soundcloud.com/mmdiscos" target="_blank" rel="noopener noreferrer">contact</a>
            </div>
        </div>
      </div>
    </section>
  );
}