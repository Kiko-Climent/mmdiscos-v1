import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


const STATEMENT =
  "MM DISCOS IS A RECORD LABEL BASED BETWEEN BERLIN AND BARCELONA, FOUNDED AND POWERED BY MOON & MANN. FREE FROM STYLISTIC BOUNDARIES AND GENRE LIMITATIONS, THE LABEL HAS CONSISTENTLY CHAMPIONED A DISTINCTIVE SOUND WHERE MUSIC SPEAKS FOR ITSELF — DEEPLY INSPIRED BY THE SUEÑO IBICENCO AND THE SPIRIT OF THE MEDITERRANEAN.";

const LINKS = [
  { word: "soundcloud", href: "#" },
  { word: "instagram", href: "#" },
  { word: "bandcamp", href: "#" },
  { word: "contact", href: "#" },
];

const PILE_BOTTOM_OFFSET = 16;
const LINK_ROW_OFFSET = 64;
const SIDE_PADDING = 16;
const EXPLODE_THRESHOLD = 0.45;
const EXPLODE_RELEASE = 0.4;
const RECRUIT_THRESHOLD = 0.7;
const RECRUIT_RELEASE = 0.66;

export default function AboutFinal() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const paragraphRef = useRef(null);
  const stageRef = useRef(null);
  const h1Ref = useRef(null);

  const wordsRef = useRef([]);
  const charsRef = useRef([]);
  const linkElsRef = useRef([]);
  const recruitTweensRef = useRef([]);
  const rafRef = useRef(null);
  const explodedRef = useRef(false);
  const recruitedRef = useRef(false);
  const h1RevealedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const sticky = stickyRef.current;
    const paragraph = paragraphRef.current;
    const stage = stageRef.current;
    const h1 = h1Ref.current;
    if (!sticky || !paragraph || !stage || !h1) return;

    const wordEls = Array.from(paragraph.querySelectorAll(".about-final-word"));
    wordsRef.current = wordEls;

    const setTransform = (el, x, y, rot) => {
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(
        2
      )}px, 0) rotate(${rot.toFixed(3)}rad)`;
    };

    const cleanupStage = () => {
      while (stage.firstChild) stage.removeChild(stage.firstChild);
      charsRef.current = [];
      linkElsRef.current = [];
    };

    const stopRaf = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const killRecruitTweens = () => {
      recruitTweensRef.current.forEach((t) => t.kill());
      recruitTweensRef.current = [];
    };

    const tick = () => {
      const g = 0.55;
      const damping = 0.55;
      const horizFriction = 0.86;
      let active = false;

      const chars = charsRef.current;
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (c.resting || c.recruited) continue;
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

        setTransform(c.el, c.x, c.y, c.rot);
      }

      if (active) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        for (let i = 0; i < chars.length; i++) {
          if (!chars[i].recruited) chars[i].el.style.willChange = "auto";
        }
      }
    };

    const explode = () => {
      if (explodedRef.current) return;
      explodedRef.current = true;
      cleanupStage();

      const stickyRect = sticky.getBoundingClientRect();
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
          const left = wordLeft + i * charWidth;
          span.style.left = `${left}px`;
          span.style.top = `${wordTop}px`;
          fragment.appendChild(span);

          pending.push({
            el: span,
            ch: ch.toLowerCase(),
            initialLeft: left,
            initialTop: wordTop,
            x: 0,
            y: 0,
            vx: (Math.random() - 0.5) * 9,
            vy: -Math.random() * 4 - 1.5,
            rot: 0,
            vrot: (Math.random() - 0.5) * 0.35,
            floorY:
              stickyRect.height - PILE_BOTTOM_OFFSET - wordTop - wordHeight,
            resting: false,
            recruited: false,
            restingSnapshot: null,
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
      reverseRecruit(true);
      explodedRef.current = false;
      stopRaf();
      cleanupStage();
      wordEls.forEach((w) => {
        w.style.opacity = "1";
      });
    };

    const measureCharWidth = () => {
      const probe = document.createElement("span");
      probe.className = "about-final-char";
      probe.textContent = "m";
      probe.style.visibility = "hidden";
      stage.appendChild(probe);
      const w = probe.getBoundingClientRect().width;
      stage.removeChild(probe);
      return w || 7;
    };

    const recruitForLinks = () => {
      if (recruitedRef.current) return;
      recruitedRef.current = true;

      const stickyRect = sticky.getBoundingClientRect();
      const charW = measureCharWidth();

      const totalChars = LINKS.reduce((acc, l) => acc + l.word.length, 0);
      const totalWordWidth = totalChars * charW;
      const availableWidth = stickyRect.width - SIDE_PADDING * 2;
      const gap =
        LINKS.length > 1
          ? (availableWidth - totalWordWidth) / (LINKS.length - 1)
          : 0;
      let cursorX = SIDE_PADDING;
      const linkRowY = stickyRect.height - LINK_ROW_OFFSET;

      const claimed = new Set();

      LINKS.forEach(({ word, href }) => {
        const wordStartX = cursorX;
        const wordChars = [];

        for (let i = 0; i < word.length; i++) {
          const letter = word[i];
          let chosenIdx = -1;
          for (let j = 0; j < charsRef.current.length; j++) {
            const c = charsRef.current[j];
            if (claimed.has(j) || c.recruited) continue;
            if (c.ch === letter) {
              chosenIdx = j;
              break;
            }
          }
          if (chosenIdx === -1) continue;
          claimed.add(chosenIdx);

          const c = charsRef.current[chosenIdx];
          c.restingSnapshot = { x: c.x, y: c.y, rot: c.rot };
          c.recruited = true;
          c.resting = true;

          const targetX = wordStartX + i * charW;
          const targetY = linkRowY;
          const dx = targetX - c.initialLeft;
          const dy = targetY - c.initialTop;

          const proxy = { x: c.x, y: c.y, rot: c.rot };
          const tween = gsap.to(proxy, {
            x: dx,
            y: dy,
            rot: 0,
            duration: 1.1,
            ease: "power3.inOut",
            onUpdate: () => {
              c.x = proxy.x;
              c.y = proxy.y;
              c.rot = proxy.rot;
              setTransform(c.el, c.x, c.y, c.rot);
            },
          });
          recruitTweensRef.current.push(tween);

          wordChars.push({ targetX, targetY });
        }

        if (wordChars.length) {
          const minX = Math.min(...wordChars.map((w) => w.targetX));
          const maxX =
            Math.max(...wordChars.map((w) => w.targetX)) + charW;
          const a = document.createElement("a");
          a.className = "about-final-link";
          a.href = href;
          if (href.startsWith("http")) {
            a.target = "_blank";
            a.rel = "noopener noreferrer";
          }
          a.setAttribute("aria-label", word);
          a.style.left = `${minX - 6}px`;
          a.style.top = `${linkRowY - 6}px`;
          a.style.width = `${maxX - minX + 12}px`;
          a.style.height = `24px`;
          a.style.opacity = "0";
          stage.appendChild(a);
          linkElsRef.current.push(a);
          gsap.to(a, { opacity: 1, duration: 0.6, delay: 0.7 });
        }

        cursorX += word.length * charW + gap;
      });

      revealH1(1.4);
    };

    const reverseRecruit = (silent = false) => {
      if (!recruitedRef.current) return;
      recruitedRef.current = false;
      killRecruitTweens();
      if (silent) {
        gsap.set(h1, { opacity: 0, filter: "blur(18px)", y: 16 });
        h1RevealedRef.current = false;
      } else {
        hideH1();
      }

      linkElsRef.current.forEach((a) => {
        if (silent) {
          a.remove();
        } else {
          gsap.to(a, {
            opacity: 0,
            duration: 0.35,
            onComplete: () => a.remove(),
          });
        }
      });
      linkElsRef.current = [];

      charsRef.current.forEach((c) => {
        if (!c.recruited || !c.restingSnapshot) return;
        const target = c.restingSnapshot;
        if (silent) {
          c.recruited = false;
          c.restingSnapshot = null;
          return;
        }
        const proxy = { x: c.x, y: c.y, rot: c.rot };
        const tween = gsap.to(proxy, {
          x: target.x,
          y: target.y,
          rot: target.rot,
          duration: 0.9,
          ease: "power3.inOut",
          onUpdate: () => {
            c.x = proxy.x;
            c.y = proxy.y;
            c.rot = proxy.rot;
            setTransform(c.el, c.x, c.y, c.rot);
          },
          onComplete: () => {
            c.recruited = false;
            c.restingSnapshot = null;
          },
        });
        recruitTweensRef.current.push(tween);
      });
    };

    const revealH1 = (delay = 0) => {
      if (h1RevealedRef.current) return;
      h1RevealedRef.current = true;
      const t = gsap.to(h1, {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 1.0,
        delay,
        ease: "power3.out",
        overwrite: true,
      });
      recruitTweensRef.current.push(t);
    };

    const hideH1 = () => {
      if (!h1RevealedRef.current) return;
      h1RevealedRef.current = false;
      gsap.to(h1, {
        opacity: 0,
        filter: "blur(18px)",
        y: 16,
        duration: 0.5,
        ease: "power2.in",
        overwrite: true,
      });
    };

    const ctx = gsap.context(() => {
      wordEls.forEach((w) => gsap.set(w, { color: "#c8c8c8" }));
      gsap.set(h1, { opacity: 0, filter: "blur(18px)", y: 16 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sticky,
          start: "top top",
          end: () => `+=${window.innerHeight * 3.5}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            if (p >= EXPLODE_THRESHOLD && !explodedRef.current) {
              explode();
            } else if (p < EXPLODE_RELEASE && explodedRef.current) {
              resetExplosion();
            }
            if (
              p >= RECRUIT_THRESHOLD &&
              explodedRef.current &&
              !recruitedRef.current
            ) {
              recruitForLinks();
            } else if (p < RECRUIT_RELEASE && recruitedRef.current) {
              reverseRecruit(false);
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
          Math.random() * 0.3
        );
      });
      tl.to({}, { duration: 2.5 });
    }, sectionRef);

    return () => {
      stopRaf();
      killRecruitTweens();
      cleanupStage();
      ctx.revert();
      explodedRef.current = false;
      recruitedRef.current = false;
      h1RevealedRef.current = false;
    };
  }, []);

  const tokens = STATEMENT.split(/(\s+)/);

  return (
    <section ref={sectionRef} className="relative w-full bg-white text-black">
      <div
        ref={stickyRef}
        className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-white"
      >
        <div
          ref={stageRef}
          className="about-final-stage absolute inset-0 pointer-events-none"
          aria-hidden="true"
        />
        <h1
          ref={h1Ref}
          className="about-final-h1 absolute inset-x-0 top-1/2 -translate-y-1/2 text-center uppercase text-black font-normal pr-6 pointer-events-none"
          style={{
            fontSize: "clamp(3.5rem, 13vw, 15rem)",
            letterSpacing: "-0.10em",
            lineHeight: 1,
            willChange: "transform, opacity, filter",
          }}
        >
          MMDiscos©2026
        </h1>
        <p
          ref={paragraphRef}
          className="relative w-[min(100%,600px)] text-justify lowercase font-normal"
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
