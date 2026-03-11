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
    { label: "ig",  href: "https://www.instagram.com/mmdiscos/" },
    { label: "bc",   href: "https://www.bandcamp.com/mmdiscos" },
    { label: "sc", href: "https://www.soundcloud.com/mmdiscos" },
    { label: "contact",    href: "https://www.soundcloud.com/mmdiscos" },
  ];

// Ajusta este valor (0–1) para afinar cuándo aparece el footer.
// 0.92 = cuando el 92% del texto ya ha aparecido (última palabra casi en su sitio)
const FOOTER_THRESHOLD = 0.97;

export default function AboutSection3() {
  const sectionRef   = useRef(null);
  const wordsRef     = useRef([]);
  const copyrightRef = useRef(null);
  const linksRef     = useRef([]);

  // Rastrea si el footer ya está visible para evitar re-disparos
  const footerVisible = useRef(false);

  useEffect(() => {
    let gsapCtx;

    const init = async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      if (!section) return;

      const wordEls   = wordsRef.current.filter(Boolean);
      const footerEls = [copyrightRef.current, ...linksRef.current].filter(Boolean);

      // ── Estado inicial ─────────────────────────────────────────────────────
      gsap.set(wordEls, {
        x: window.innerWidth + 400,
        opacity: 0.15,
        filter: "blur(8px)",
      });

      gsap.set(footerEls, {
        opacity: 0,
        filter: "blur(60px)",
        willChange: "filter, opacity",
      });

      const animDistance = wordEls.length * 65;

      // ── Helpers ────────────────────────────────────────────────────────────
      const showFooter = () => {
        if (footerVisible.current) return;
        footerVisible.current = true;
        gsap.killTweensOf(footerEls);
        gsap.to(footerEls, {
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.6,
          ease: "power3.out",
          stagger: { each: 0.1 },
          onComplete: () => {
            gsap.set(footerEls, { willChange: "auto" });
          },
        });
      };

      const hideFooter = () => {
        if (!footerVisible.current) return;
        footerVisible.current = false;
        gsap.killTweensOf(footerEls);
        gsap.set(footerEls, { willChange: "filter, opacity" });
        gsap.to(footerEls, {
          opacity: 0,
          filter: "blur(60px)",
          duration: 1.0,
          ease: "power2.in",
          stagger: { each: 0.08, from: "end" }, // desaparece dcha → izqda
        });
      };

      gsapCtx = gsap.context(() => {

        // ── Pin ──────────────────────────────────────────────────────────────
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: `+=${animDistance}`,
          pin: true,
          anticipatePin: 1,
        });

        // ── Texto about (scrubbed) + onUpdate para detectar el umbral ────────
        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 15%",
            end: `+=${animDistance}`,
            scrub: 1,
            onUpdate: (self) => {
              if (self.progress >= FOOTER_THRESHOLD) {
                showFooter();
              } else {
                hideFooter();
              }
            },
          },
        }).to(wordEls, {
          x: 0,
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          stagger: { each: 0.1 },
        });

      }, section);
    };

    init();
    return () => gsapCtx?.revert();
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
            MM Discos © 2026
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