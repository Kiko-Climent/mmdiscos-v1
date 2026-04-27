import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const STATEMENT =
  "MM DISCOS IS A RECORD LABEL BASED BETWEEN BERLIN AND BARCELONA, FOUNDED AND POWERED BY MOON & MANN. FREE FROM STYLISTIC BOUNDARIES AND GENRE LIMITATIONS, THE LABEL HAS CONSISTENTLY CHAMPIONED A DISTINCTIVE SOUND WHERE MUSIC SPEAKS FOR ITSELF — DEEPLY INSPIRED BY THE SUEÑO IBICENCO AND THE SPIRIT OF THE MEDITERRANEAN.";

export default function AboutFinal() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const paragraphRef = useRef(null);
  const stageRef = useRef(null);

  const wordsRef = useRef([]);
  const charsRef = useRef([]);
  const rafRef = useRef(null);
  const explodedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const sticky = stickyRef.current;
    const paragraph = paragraphRef.current;
    const stage = stageRef.current;
    if (!sticky || !paragraph || !stage) return;

    const wordEls = Array.from(paragraph.querySelectorAll(".about-final-word"));
    wordsRef.current = wordEls;

    const cleanupStage = () => {
      while (stage.firstChild) stage.removeChild(stage.firstChild);
      charsRef.current = [];
    };

    const stopRaf = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const tick = () => {
      const g = 0.55;
      const damping = 0.55;
      const horizFriction = 0.86;
      let active = false;

      const chars = charsRef.current;
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (c.resting) continue;
        active = true;

        c.vy += g;
        c.x += c.vx;
        c.y += c.vy;
        c.rot += c.vrot;

        if (c.y >= c.floorY) {
          c.y = c.floorY;
          if (Math.abs(c.vy) < 1.2) {
            c.vy = 0;
            c.vx *= horizFriction;
            c.vrot *= 0.7;
            if (Math.abs(c.vx) < 0.08 && Math.abs(c.vrot) < 0.005) {
              c.resting = true;
            }
          } else {
            c.vy = -c.vy * damping;
            c.vx *= 0.9;
            c.vrot *= 0.85;
          }
        }

        c.el.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(
          2
        )}px, 0) rotate(${c.rot.toFixed(3)}rad)`;
      }

      if (active) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        for (let i = 0; i < chars.length; i++) {
          chars[i].el.style.willChange = "auto";
        }
      }
    };

    const explode = () => {
      if (explodedRef.current) return;
      explodedRef.current = true;
      cleanupStage();

      const stickyRect = sticky.getBoundingClientRect();
      const floorOffset = 12;

      const fragment = document.createDocumentFragment();
      const pending = [];

      wordEls.forEach((word) => {
        const text = word.textContent || "";
        if (!text.trim()) return;
        const wRect = word.getBoundingClientRect();
        const wordTop = wRect.top - stickyRect.top;
        const wordLeft = wRect.left - stickyRect.left;
        const wordHeight = wRect.height;
        const chars = [...text];
        const charWidth = wRect.width / chars.length;

        chars.forEach((ch, i) => {
          if (ch === " ") return;
          const span = document.createElement("span");
          span.className = "about-final-char";
          span.textContent = ch;
          span.style.left = `${wordLeft + i * charWidth}px`;
          span.style.top = `${wordTop}px`;
          fragment.appendChild(span);

          pending.push({
            el: span,
            x: 0,
            y: 0,
            vx: (Math.random() - 0.5) * 9,
            vy: -Math.random() * 4 - 1.5,
            rot: 0,
            vrot: (Math.random() - 0.5) * 0.35,
            floorY: stickyRect.height - floorOffset - wordTop - wordHeight,
            resting: false,
          });
        });

        word.style.opacity = "0";
      });

      stage.appendChild(fragment);
      charsRef.current = pending;

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const resetExplosion = () => {
      if (!explodedRef.current) return;
      explodedRef.current = false;
      stopRaf();
      cleanupStage();
      wordEls.forEach((w) => {
        w.style.opacity = "1";
      });
    };

    const ctx = gsap.context(() => {
      wordEls.forEach((w) => gsap.set(w, { color: "#c8c8c8" }));

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sticky,
          start: "top top",
          end: () => `+=${window.innerHeight * 4}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (self.progress >= 0.7 && !explodedRef.current) {
              explode();
            } else if (self.progress < 0.65 && explodedRef.current) {
              resetExplosion();
            }
          },
        },
      });

      const shuffled = [...wordEls];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      shuffled.forEach((w) => {
        tl.to(
          w,
          { color: "#0f0f0f", duration: 0.1, ease: "power2.inOut" },
          Math.random() * 0.9
        );
      });
      tl.to({}, { duration: 1.5 });
    }, sectionRef);

    return () => {
      stopRaf();
      cleanupStage();
      ctx.revert();
      explodedRef.current = false;
    };
  }, []);

  const tokens = STATEMENT.split(/(\s+)/);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-white text-black"
    >
      <div
        ref={stickyRef}
        className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-white"
      >
        <div
          ref={stageRef}
          className="about-final-stage absolute inset-0 pointer-events-none"
          aria-hidden="true"
        />
        <p
          ref={paragraphRef}
          className="relative w-[min(100%,600px)] mx-auto px-6 text-justify lowercase font-normal"
          style={{
            fontSize: "0.875rem",
            letterSpacing: "0.12em",
            lineHeight: 1.4,
            textIndent: "6rem",
          }}
        >
          {tokens.map((tok, i) =>
            /^\s+$/.test(tok) ? (
              <span key={i}>{tok}</span>
            ) : (
              <span key={i} className="about-final-word">
                {tok}
              </span>
            )
          )}
        </p>
      </div>
    </section>
  );
}