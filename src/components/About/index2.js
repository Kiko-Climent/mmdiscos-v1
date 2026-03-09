"use client";

import { useEffect, useRef } from "react";
import BlurReveal from "@/components/tools/BlurReveal";

const RAW_TEXT = `RECORD LABEL BASED BETWEEN BERLIN AND BARCELONA, FOUNDED AND POWERED BY da silva AND DJ KATAH, ALSO KNOWN AS MOON & MANN. ESTABLISHED IN 2015, MM DISCOS HAS GROWN INTO A PLATFORM AND CREATIVE HOME FOR BOTH EMERGING TALENTS AND ESTABLISHED ARTISTS. FREE FROM STYLISTIC BOUNDARIES AND GENRE LIMITATIONS, THE LABEL HAS CONSISTENTLY CHAMPIONED A DISTINCTIVE SOUND WHERE MUSIC SPEAKS FOR ITSELF — DEEPLY INSPIRED BY THE SUEÑO IBICENCO AND THE SPIRIT OF THE MEDITERRANEAN.`;

const WORDS = RAW_TEXT.split(" ");

export default function AboutSection2() {
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

      gsap.set(wordEls, {
        x: window.innerWidth + 400,
        opacity: 0.15,
        filter: "blur(8px)",
      });

      const animDistance = wordEls.length * 65;

      gsapCtx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: `+=${animDistance}`,
          pin: true,
          anticipatePin: 1,
        });

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

        {/* Footer — BlurReveal entra cuando el usuario llega al final del scroll */}
        <div className="about-footer about-text absolute bottom-0 left-0 w-full flex flex-col justify-between px-6 pb-4">
          <BlurReveal
            trigger="scroll"
            threshold={0.8}   // espera a que el footer esté casi visible
            delay={0}
            duration={1.4}
            blurAmount={40}
            className="block"
          >
            MM Discos©2026
          </BlurReveal>

          <div className="flex flex-row justify-between gap-6">
            {[
              { label: "instagram", href: "https://www.instagram.com/mmdiscos/" },
              { label: "bandcamp",  href: "https://www.bandcamp.com/mmdiscos" },
              { label: "soundcloud",href: "https://www.soundcloud.com/mmdiscos" },
              { label: "contact",   href: "https://www.soundcloud.com/mmdiscos" },
            ].map(({ label, href }, idx) => (
              <BlurReveal
                key={label}
                trigger="scroll"
                threshold={0.8}
                delay={0.1 + idx * 0.07}  // cascada sutil entre links
                duration={1.2}
                blurAmount={35}
                className="block"
              >
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              </BlurReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}