"use client";

import { useEffect, useRef } from "react";

const RAW_TEXT = `RECORD LABEL BASED BETWEEN BERLIN AND BARCELONA, FOUNDED AND POWERED BY da silva AND DJ KATAH, ALSO KNOWN AS MOON & MANN. ESTABLISHED IN 2015, MM DISCOS HAS GROWN INTO A PLATFORM AND CREATIVE HOME FOR BOTH EMERGING TALENTS AND ESTABLISHED ARTISTS. FREE FROM STYLISTIC BOUNDARIES AND GENRE LIMITATIONS, THE LABEL HAS CONSISTENTLY CHAMPIONED A DISTINCTIVE SOUND WHERE MUSIC SPEAKS FOR ITSELF — DEEPLY INSPIRED BY THE SUEÑO IBICENCO AND THE SPIRIT OF THE MEDITERRANEAN.`;

const WORDS = RAW_TEXT.split(" ");

const FOOTER_LINKS = [
  { label: "instagram",  href: "https://www.instagram.com/mmdiscos/" },
  { label: "bandcamp",   href: "https://www.bandcamp.com/mmdiscos" },
  { label: "soundcloud", href: "https://www.soundcloud.com/mmdiscos" },
  { label: "contact",    href: "https://www.soundcloud.com/mmdiscos" },
];

const FOOTER_LINKS_MOBILE = [
  { label: "ig",      href: "https://www.instagram.com/mmdiscos/" },
  { label: "bc",      href: "https://www.bandcamp.com/mmdiscos" },
  { label: "sc",      href: "https://www.soundcloud.com/mmdiscos" },
  { label: "contact", href: "https://www.soundcloud.com/mmdiscos" },
];

const FOOTER_THRESHOLD = 0.97;
const EXIT_SCROLL      = 500;

export default function AboutSection4() {
  const sectionRef   = useRef(null);
  const wordsRef     = useRef([]);
  const copyrightRef = useRef(null);
  const linksRef     = useRef([]);

  useEffect(() => {
    let cleanup = () => {};

    const init = async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      if (!section) return;

      const wordEls      = wordsRef.current.filter(Boolean);
      const footerEls    = [copyrightRef.current, ...linksRef.current].filter(Boolean);
      const allEls       = [...wordEls, ...footerEls];
      const animDistance = wordEls.length * 65;

      // ── Estado: qué fase estamos ──────────────────────────────────────
      // "entry" → pin largo + scrub activo
      // "exiting" → animación de salida en curso
      // "exited" → pin corto activo, esperando re-entrada
      let phase = "entry";

      // Todos los ScrollTriggers vivos en cada momento
      let triggers = [];
      const killAll = () => { triggers.forEach(t => t?.kill()); triggers = []; };

      // ── Helpers visuales ──────────────────────────────────────────────
      const setInitial = () => {
        gsap.killTweensOf(allEls);
        gsap.set(wordEls,   { x: window.innerWidth + 400, opacity: 0.15, filter: "blur(8px)" });
        gsap.set(footerEls, { opacity: 0, filter: "blur(60px)" });
      };

      const freezeAtEnd = () => {
        gsap.killTweensOf(wordEls);
        gsap.set(wordEls, { x: 0, opacity: 1, filter: "blur(0px)" });
      };

      const showFooter = () => {
        gsap.killTweensOf(footerEls);
        gsap.to(footerEls, {
          opacity: 1, filter: "blur(0px)", duration: 1.6, ease: "power3.out",
          stagger: { each: 0.1 },
        });
      };

      const hideFooter = () => {
        gsap.killTweensOf(footerEls);
        gsap.to(footerEls, {
          opacity: 0, filter: "blur(60px)", duration: 1.0, ease: "power2.in",
          stagger: { each: 0.08, from: "end" },
        });
      };

      // ── Animación de salida blur/fade (sin x) ────────────────────────
      const runFastExit = (onDone) => {
        phase = "exiting";
        gsap.killTweensOf(allEls);

        gsap.to(footerEls, {
          opacity: 0, filter: "blur(60px)",
          duration: 0.55, ease: "power2.in",
          stagger: { each: 0.05, from: "end" },
        });

        gsap.to(wordEls, {
          opacity: 0, filter: "blur(14px)",
          duration: 0.5, ease: "power2.in",
          stagger: { each: 0.006, from: "end" },
          onComplete: onDone,
        });
      };

      // ── PIN CORTO + watcher de re-entrada ────────────────────────────
      const buildExitPhase = () => {
        killAll();
        phase = "exited";

        // Palabras ya en opacity:0, x:0, blur:14px
        gsap.set(wordEls,   { x: 0, opacity: 0, filter: "blur(14px)" });
        gsap.set(footerEls, { opacity: 0, filter: "blur(60px)" });

        // Pin corto: el usuario "gasta" EXIT_SCROLL px y sale hacia arriba
        const shortPin = ScrollTrigger.create({
          trigger: section,
          start:   "top top",
          end:     `+=${EXIT_SCROLL}`,
          pin:     true,
          anticipatePin: 1,
        });

        // Watcher: cuando la sección vuelve a entrar desde arriba
        // (usuario scrollea abajo de nuevo), reconstruir la entrada
        const reentryWatcher = ScrollTrigger.create({
          trigger: section,
          start:   "top bottom", // sección empieza a entrar por abajo del viewport
          onEnter: () => {
            if (phase !== "exited") return;
            killAll();
            // Pequeño delay para que el scroll se estabilice
            setTimeout(() => buildEntryPhase(), 80);
          },
        });

        triggers = [shortPin, reentryWatcher];
      };

      // ── PIN LARGO + SCRUB ─────────────────────────────────────────────
      const buildEntryPhase = () => {
        killAll();
        setInitial();
        ScrollTrigger.refresh();
        phase = "entry";

        let reachedEnd = false;

        const pin = ScrollTrigger.create({
          trigger: section,
          start:   "top top",
          end:     `+=${animDistance}`,
          pin:     true,
          anticipatePin: 1,
        });

        const tl = gsap.timeline({ paused: true }).to(wordEls, {
          x: 0, opacity: 1, filter: "blur(0px)", ease: "none",
          stagger: { each: 0.1 },
        });

        const scrub = ScrollTrigger.create({
          trigger:   section,
          start:     "top 15%",
          end:       `+=${animDistance}`,
          scrub:     1,
          animation: tl,
          onUpdate: (self) => {
            // Footer
            if (self.progress >= FOOTER_THRESHOLD) {
              reachedEnd = true;
              showFooter();
            } else if (!reachedEnd) {
              hideFooter();
            }

            // Interceptar scroll-back cuando ya llegamos al final
            if (reachedEnd && self.direction === -1 && phase === "entry") {
              freezeAtEnd();   // congela x:0 antes de que el scrub lo mueva
              scrub.kill();
              pin.kill();
              triggers = [];
              runFastExit(() => buildExitPhase());
            }
          },
        });

        triggers = [pin, scrub];
      };

      // Arranque
      buildEntryPhase();
      cleanup = () => { killAll(); gsap.killTweensOf(allEls); };
    };

    init();
    return () => cleanup();
  }, []);

  return (
    <section ref={sectionRef} className="about-section relative">
      <div className="about-inner">

        <p className="about-text" aria-label={RAW_TEXT}>
          {WORDS.map((word, i) => (
            <span
              key={i}
              aria-hidden="true"
              ref={(el) => { wordsRef.current[i] = el; }}
              className="about-word"
            >
              {word}
            </span>
          ))}
        </p>

        <div className="about-footer about-text absolute bottom-0 left-0 w-full flex flex-col justify-between px-6 pb-4">
          <p ref={copyrightRef} className="about-text">
            MM Discos©2026
          </p>
          <div className="flex flex-row justify-between gap-6">
            {FOOTER_LINKS.map(({ label, href }, idx) => (
              <a
                key={`d-${label}`}
                ref={(el) => { linksRef.current[idx] = el; }}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline"
              >
                {label}
              </a>
            ))}
            {FOOTER_LINKS_MOBILE.map(({ label, href }, idx) => (
              <a
                key={`m-${label}`}
                ref={(el) => { linksRef.current[4 + idx] = el; }}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline md:hidden"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}