"use client";

import { useEffect, useRef } from "react";
import CopyrightSVG from "../Footer/CopyrightSVG"; // ajusta el path si es necesario

const RAW_TEXT = `RECORD LABEL BASED BETWEEN BERLIN AND BARCELONA, FOUNDED AND POWERED BY MOON & MANN. FREE FROM STYLISTIC BOUNDARIES AND GENRE LIMITATIONS, THE LABEL HAS CONSISTENTLY CHAMPIONED A DISTINCTIVE SOUND WHERE MUSIC SPEAKS FOR ITSELF — DEEPLY INSPIRED BY THE SUEÑO IBICENCO AND THE SPIRIT OF THE MEDITERRANEAN. ESTABLISHED IN 2015.`;

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

export default function AboutSection7() {
  const sectionRef    = useRef(null);
  const innerRef      = useRef(null);  // about-inner — recibe padding-top dinámico
  const wordsRef      = useRef([]);
  const copyrightRef  = useRef(null); // imperative handle de CopyrightSVG
  const linksRef      = useRef([]);
  const linksWrapRef  = useRef(null);

  // ── Safe zone: nunca solapar con logo + menú ──────────────────────────
  useEffect(() => {
    const applyLogoSafeZone = () => {
      const logoEl = document.getElementById("mm-global-logo");
      const inner  = innerRef.current;
      if (!logoEl || !inner) return;
      const { bottom } = logoEl.getBoundingClientRect();
      // Breathing room de 24px sobre el borde inferior del logo+menú
      inner.style.paddingTop = `${bottom + 24}px`;
    };

    applyLogoSafeZone();
    window.addEventListener("resize", applyLogoSafeZone);
    return () => window.removeEventListener("resize", applyLogoSafeZone);
  }, []);

  // ── GSAP scroll animations ─────────────────────────────────────────────
  useEffect(() => {
    let cleanup = () => {};

    const init = async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      if (!section) return;

      const wordEls   = wordsRef.current.filter(Boolean);
      // linksWrap se anima con gsap igual que antes
      const linkEls   = linksRef.current.filter(Boolean);
      const animDistance = wordEls.length * 65;

      let phase = "entry";
      let triggers = [];
      const killAll = () => { triggers.forEach(t => t?.kill()); triggers = []; };

      const setInitial = () => {
        gsap.killTweensOf([...wordEls, ...linkEls]);
        gsap.set(wordEls,  { x: window.innerWidth + 400, opacity: 0.15, filter: "blur(8px)" });
        gsap.set(linkEls,  { opacity: 0, filter: "blur(60px)" });
        copyrightRef.current?.setHidden();
      };

      const freezeAtEnd = () => {
        gsap.killTweensOf(wordEls);
        gsap.set(wordEls, { x: 0, opacity: 1, filter: "blur(0px)" });
      };

      const showFooter = () => {
        // SVG con efecto orgánico
        copyrightRef.current?.reveal(1.8);
        // Links con el blur habitual
        gsap.killTweensOf(linkEls);
        gsap.to(linkEls, {
          opacity: 1, filter: "blur(0px)", duration: 1.4, ease: "power3.out",
          stagger: { each: 0.1 },
          delay: 0.3, // ligero delay para que salgan después del SVG
        });
      };

      const hideFooter = () => {
        copyrightRef.current?.hide(0.55);
        gsap.killTweensOf(linkEls);
        gsap.to(linkEls, {
          opacity: 0, filter: "blur(60px)", duration: 0.45, ease: "power2.in",
          stagger: { each: 0.05, from: "end" },
        });
      };

      const runFastExit = (onDone) => {
        phase = "exiting";
        gsap.killTweensOf(wordEls);
        hideFooter();
        gsap.to(wordEls, {
          opacity: 0, filter: "blur(14px)",
          duration: 0.5, ease: "power2.in",
          stagger: { each: 0.006, from: "end" },
          onComplete: onDone,
        });
      };

      const buildExitPhase = () => {
        killAll();
        phase = "exited";

        gsap.set(wordEls, { x: 0, opacity: 0, filter: "blur(14px)" });
        gsap.set(linkEls, { opacity: 0, filter: "blur(60px)" });
        copyrightRef.current?.setHidden();

        const shortPin = ScrollTrigger.create({
          trigger: section,
          start:   "top top",
          end:     `+=${EXIT_SCROLL}`,
          pin:     true,
          anticipatePin: 1,
        });

        const reentryWatcher = ScrollTrigger.create({
          trigger: section,
          start:   "top bottom",
          onEnter: () => {
            if (phase !== "exited") return;
            killAll();
            setTimeout(() => buildEntryPhase(), 80);
          },
        });

        triggers = [shortPin, reentryWatcher];
      };

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
            if (self.progress >= FOOTER_THRESHOLD) {
              reachedEnd = true;
              showFooter();
            } else if (!reachedEnd) {
              hideFooter();
            }

            if (reachedEnd && self.direction === -1 && phase === "entry") {
              freezeAtEnd();
              scrub.kill();
              pin.kill();
              triggers = [];
              runFastExit(() => buildExitPhase());
            }
          },
        });

        triggers = [pin, scrub];
      };

      buildEntryPhase();
      cleanup = () => { killAll(); gsap.killTweensOf([...wordEls, ...linkEls]); };
    };

    init();
    return () => cleanup();
  }, []);

  return (
    <section id="statement" ref={sectionRef} className="about-section relative">
      <div className="about-inner" ref={innerRef}>

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

        <div className="about-footer w-full flex flex-col pb-4 gap-0.5">
          {/* SVG con efecto de revelación orgánica */}
          <div className="px-5 md:px-8">
            <CopyrightSVG ref={copyrightRef} />
          </div>

          {/* Links sociales — mismo padding que CopyrightSVG para alineación perfecta */}
          <div className="flex flex-row justify-between px-5 md:px-8">
            {FOOTER_LINKS.map(({ label, href }, idx) => (
              <a
                key={`d-${label}`}
                ref={(el) => { linksRef.current[idx] = el; }}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="about-text hidden md:inline"
                style={{ opacity: 0 }}
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
                className="about-text inline md:hidden"
                style={{ opacity: 0 }}
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