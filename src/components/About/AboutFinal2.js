import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


const STATEMENT =
  "MM DISCOS IS A RECORD LABEL BASED BETWEEN BERLIN AND BARCELONA, FOUNDED AND POWERED BY MOON & MANN. FREE FROM STYLISTIC BOUNDARIES AND GENRE LIMITATIONS, THE LABEL HAS CONSISTENTLY CHAMPIONED A DISTINCTIVE SOUND WHERE MUSIC SPEAKS FOR ITSELF — DEEPLY INSPIRED BY THE SUEÑO IBICENCO AND THE SPIRIT OF THE MEDITERRANEAN.";

const LINKS = [
  { num: "01", word: "soundcloud", href: "#" },
  { num: "02", word: "instagram", href: "#" },
  { num: "03", word: "bandcamp", href: "#" },
  { num: "04", word: "contact", href: "#" },
];

const PILE_BOTTOM_OFFSET = 16;
const EXPLODE_THRESHOLD = 0.45;
const EXPLODE_RELEASE = 0.4;
const RECRUIT_THRESHOLD = 0.7;
const RECRUIT_RELEASE = 0.66;

const HEADLINE_FONT = "'Favorit', sans-serif";

export default function AboutFinal2() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const paragraphRef = useRef(null);
  const stageRef = useRef(null);

  const editorialRef = useRef(null);
  const topMetaLeftRef = useRef(null);
  const topMetaRightRef = useRef(null);
  const topRuleRef = useRef(null);
  const bottomRuleRef = useRef(null);
  const bottomMetaRef = useRef(null);
  const photoRef = useRef(null);
  const h1LinesRef = useRef([]);
  const linkSlotsRef = useRef([]);
  const linkRowsRef = useRef([]);

  const wordsRef = useRef([]);
  const charsRef = useRef([]);
  const linkElsRef = useRef([]);
  const recruitTweensRef = useRef([]);
  const rafRef = useRef(null);
  const explodedRef = useRef(false);
  const recruitedRef = useRef(false);
  const editorialRevealedRef = useRef(false);

  // Dynamic measurement: anchor content right below the global Menu2 nav
  useEffect(() => {
    if (typeof window === "undefined") return;
    const section = sectionRef.current;
    if (!section) return;

    const updateNavOffset = () => {
      const menu = document.getElementById("mm-global-menu-pills");
      if (!menu) return;
      const rect = menu.getBoundingClientRect();
      const bottom = Math.max(60, rect.bottom);
      section.style.setProperty("--mm-nav-bottom", `${bottom}px`);
    };

    updateNavOffset();
    window.addEventListener("resize", updateNavOffset);

    let ro;
    const menu = document.getElementById("mm-global-menu-pills");
    if (menu && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updateNavOffset);
      ro.observe(menu);
    }

    return () => {
      window.removeEventListener("resize", updateNavOffset);
      if (ro) ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const sticky = stickyRef.current;
    const paragraph = paragraphRef.current;
    const stage = stageRef.current;
    if (!sticky || !paragraph || !stage) return;

    const topMetaLeft = topMetaLeftRef.current;
    const topMetaRight = topMetaRightRef.current;
    const topRule = topRuleRef.current;
    const bottomRule = bottomRuleRef.current;
    const bottomMeta = bottomMetaRef.current;
    const photo = photoRef.current;
    const h1Lines = h1LinesRef.current.filter(Boolean);
    const linkRows = linkRowsRef.current.filter(Boolean);
    const linkSlots = linkSlotsRef.current.filter(Boolean);

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

    const buildCharWidthMap = () => {
      const alphabet = "abcdefghijklmnopqrstuvwxyz";
      const map = {};
      const fragment = document.createDocumentFragment();
      const probes = [];
      for (const ch of alphabet) {
        const probe = document.createElement("span");
        probe.className = "about-final-char";
        probe.textContent = ch;
        probe.style.visibility = "hidden";
        probe.style.position = "absolute";
        fragment.appendChild(probe);
        probes.push({ ch, probe });
      }
      stage.appendChild(fragment);
      for (const { ch, probe } of probes) {
        map[ch] = probe.getBoundingClientRect().width || 8;
        stage.removeChild(probe);
      }
      return map;
    };

    const recruitForLinks = () => {
      if (recruitedRef.current) return;
      recruitedRef.current = true;

      const stickyRect = sticky.getBoundingClientRect();
      const charWidthMap = buildCharWidthMap();
      const claimed = new Set();

      LINKS.forEach((link, idx) => {
        const slot = linkSlots[idx];
        const row = linkRows[idx];
        if (!slot || !row) return;

        const slotRect = slot.getBoundingClientRect();
        const slotX = slotRect.left - stickyRect.left;
        const slotY = slotRect.top - stickyRect.top;

        const wordChars = [];
        let cumX = slotX;

        for (let i = 0; i < link.word.length; i++) {
          const letter = link.word[i];
          const thisCharW = charWidthMap[letter] ?? 8;

          let chosenIdx = -1;
          for (let j = 0; j < charsRef.current.length; j++) {
            const c = charsRef.current[j];
            if (claimed.has(j) || c.recruited) continue;
            if (c.ch === letter) {
              chosenIdx = j;
              break;
            }
          }

          if (chosenIdx !== -1) {
            claimed.add(chosenIdx);
            const c = charsRef.current[chosenIdx];
            c.restingSnapshot = { x: c.x, y: c.y, rot: c.rot };
            c.recruited = true;
            c.resting = true;

            const targetX = cumX;
            const targetY = slotY;
            const dx = targetX - c.initialLeft;
            const dy = targetY - c.initialTop;

            const proxy = { x: c.x, y: c.y, rot: c.rot };
            const tween = gsap.to(proxy, {
              x: dx,
              y: dy,
              rot: 0,
              duration: 1.1,
              ease: "power3.inOut",
              delay: idx * 0.04,
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

          cumX += thisCharW;
        }

        if (wordChars.length) {
          const minX = wordChars[0].targetX;
          const maxX = cumX;
          const a = document.createElement("a");
          a.className = "about-final-link";
          a.href = link.href;
          if (link.href.startsWith("http")) {
            a.target = "_blank";
            a.rel = "noopener noreferrer";
          }
          a.setAttribute("aria-label", link.word);
          a.style.left = `${minX - 6}px`;
          a.style.top = `${slotY - 6}px`;
          a.style.width = `${maxX - minX + 12}px`;
          a.style.height = `${slotRect.height + 12}px`;
          a.style.opacity = "0";
          stage.appendChild(a);
          linkElsRef.current.push(a);
          gsap.to(a, { opacity: 1, duration: 0.5, delay: 0.7 + idx * 0.04 });

          gsap.to(row, {
            opacity: 1,
            x: 0,
            duration: 0.7,
            delay: idx * 0.08,
            ease: "power3.out",
          });
        }
      });

      revealEditorial(0.3);
    };

    const reverseRecruit = (silent = false) => {
      if (!recruitedRef.current) return;
      recruitedRef.current = false;
      killRecruitTweens();
      if (silent) {
        gsap.set([topMetaLeft, topMetaRight], { opacity: 0, y: -8 });
        gsap.set([topRule, bottomRule], { scaleX: 0 });
        gsap.set(photo, { clipPath: "inset(0 0 0 100%)" });
        gsap.set(h1Lines, { opacity: 0, y: 16, filter: "blur(18px)" });
        gsap.set(linkRows, { opacity: 0, x: 12 });
        editorialRevealedRef.current = false;
      } else {
        hideEditorial();
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

    const revealEditorial = (delay = 0) => {
      if (editorialRevealedRef.current) return;
      editorialRevealedRef.current = true;

      const tl = gsap.timeline({ delay });

      tl.to(
        [topRule, bottomRule],
        { scaleX: 1, duration: 0.9, ease: "expo.out", stagger: 0.05 },
        0
      );
      tl.to(
        [topMetaLeft, topMetaRight],
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
        },
        0.05
      );
      tl.to(
        photo,
        { clipPath: "inset(0 0 0 0%)", duration: 1.1, ease: "expo.out" },
        0.2
      );
      tl.to(
        h1Lines,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.0,
          ease: "power3.out",
          stagger: 0.12,
        },
        0.4
      );

      recruitTweensRef.current.push(tl);
    };

    const hideEditorial = () => {
      if (!editorialRevealedRef.current) return;
      editorialRevealedRef.current = false;

      gsap.to(h1Lines, {
        opacity: 0,
        y: 16,
        filter: "blur(18px)",
        duration: 0.45,
        ease: "power2.in",
        stagger: 0.04,
        overwrite: true,
      });
      gsap.to(linkRows, {
        opacity: 0,
        x: 12,
        duration: 0.35,
        ease: "power2.in",
        overwrite: true,
      });
      gsap.to(photo, {
        clipPath: "inset(0 0 0 100%)",
        duration: 0.6,
        ease: "power2.in",
        overwrite: true,
      });
      gsap.to([topMetaLeft, topMetaRight], {
        opacity: 0,
        y: -8,
        duration: 0.35,
        ease: "power2.in",
        overwrite: true,
      });
      gsap.to([topRule, bottomRule], {
        scaleX: 0,
        duration: 0.5,
        ease: "power2.in",
        overwrite: true,
      });
    };

    const ctx = gsap.context(() => {
      wordEls.forEach((w) => gsap.set(w, { color: "#c8c8c8" }));
      gsap.set([topMetaLeft, topMetaRight], { opacity: 0, y: -8 });
      gsap.set([topRule, bottomRule], {
        scaleX: 0,
        transformOrigin: "left center",
      });
      gsap.set(photo, { clipPath: "inset(0 0 0 100%)" });
      gsap.set(h1Lines, { opacity: 0, y: 16, filter: "blur(18px)" });
      gsap.set(linkRows, { opacity: 0, x: 12 });

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
      editorialRevealedRef.current = false;
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
          className="about-final-stage absolute inset-0 pointer-events-none z-10"
          aria-hidden="true"
        />

        <div
          ref={editorialRef}
          className="absolute inset-0 z-20 pointer-events-none text-black"
        >
          {/* Top meta — anchored just below the global Menu2 nav (measured at runtime) */}
          <div
            className="absolute left-0 right-0 px-6 lg:px-10 flex items-center justify-between text-[11px] tracking-[0.22em] uppercase"
            style={{ top: "calc(var(--mm-nav-bottom, 7rem) + 0.75rem)" }}
          >
            <div
              ref={topMetaLeftRef}
              className="flex items-center gap-2 will-change-transform"
            >
              <span className="inline-block w-1.5 h-1.5 bg-black" />
              <span>INDEPENDENT RECORD LABEL</span>
            </div>
            <div
              ref={topMetaRightRef}
              className="hidden sm:flex items-center gap-2 will-change-transform"
            >
              <span>LIVING THE MEDITERRANEAN DREAM 24/7</span>
              <span className="inline-block w-1.5 h-1.5 bg-black" />
            </div>
          </div>

          <div
            ref={topRuleRef}
            className="absolute left-0 right-0 h-px bg-black will-change-transform"
            style={{ top: "calc(var(--mm-nav-bottom, 7rem) + 2.25rem)" }}
          />
          <div
            ref={bottomRuleRef}
            className="absolute left-0 right-0 bottom-12 lg:bottom-16 h-px bg-black will-change-transform"
          />

          {/* Main brutalist grid */}
          <div
            className="absolute left-0 right-0 bottom-14 lg:bottom-24 px-6 lg:px-10 grid grid-cols-12 gap-2 lg:gap-6 items-start content-center lg:items-stretch lg:content-normal"
            style={{ top: "calc(var(--mm-nav-bottom, 7rem) + 3.25rem)" }}
          >
            {/* Headline — left, stacked */}
            <div className="col-span-12 lg:col-span-7 flex flex-col justify-center">
              <h1
                className="uppercase font-semibold leading-[0.78] tracking-[-0.05em] m-0"
                style={{
                  fontFamily: HEADLINE_FONT,
                  fontSize: "clamp(2rem, 11vw, 13rem)",
                }}
              >
                <span
                  ref={(el) => (h1LinesRef.current[0] = el)}
                  className="block will-change-[transform,opacity,filter]"
                >
                  <span className="inline-flex items-end gap-4">
                    <span>MM</span>
                    <span
                      className="font-normal normal-case opacity-80 flex flex-col leading-[1.1] whitespace-nowrap"
                      style={{
                        fontSize: "14px",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        transform: "translateY(-0.18em)",
                      }}
                    >
                      <span>EST. 2015 —</span>
                      <span>BERLIN / BARCELONA</span>
                    </span>
                  </span>
                </span>
                <span
                  ref={(el) => (h1LinesRef.current[1] = el)}
                  className="block will-change-[transform,opacity,filter]"
                >
                  Discos
                </span>
                <span
                  ref={(el) => (h1LinesRef.current[2] = el)}
                  className="block will-change-[transform,opacity,filter] text-black/70"
                >
                  ©2026
                </span>
              </h1>
            </div>

            {/* Right column: photo on top, links below — pointer events on photo + list */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-2 lg:gap-6 lg:min-h-0">
              <div
                ref={photoRef}
                className="relative w-full overflow-hidden will-change-[clip-path] h-[clamp(140px,26vh,240px)] lg:h-auto lg:flex-1 lg:min-h-0"
              >
                <Image
                  src="/amnesia.png"
                  alt="MM Discos"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover pointer-events-auto"
                />
              </div>

              <ul className="flex flex-col">
                {LINKS.map((link, idx) => (
                  <li
                    key={link.word}
                    ref={(el) => (linkRowsRef.current[idx] = el)}
                    className="group relative flex items-center gap-4 border-t border-black py-1 lg:py-2 last:border-b will-change-[transform,opacity]"
                  >
                    <span
                      className="w-6 h-6 lg:w-7 lg:h-7 rounded-full border border-black flex items-center justify-center text-[8px] lg:text-[9px] tabular-nums shrink-0 opacity-70"
                      style={{ fontFamily: HEADLINE_FONT, letterSpacing: "0.04em" }}
                    >
                      {link.num}
                    </span>
                    <span
                      ref={(el) => (linkSlotsRef.current[idx] = el)}
                      className="lowercase leading-none"
                      style={{
                        fontFamily: HEADLINE_FONT,
                        fontSize: "clamp(1rem, 4vw, 2.25rem)",
                        fontWeight: 500,
                        letterSpacing: "0",
                        position: "relative",
                        top: "0.07em",
                      }}
                    >
                      {/* placeholder reserves space; physics chars fly into this slot */}
                      <span className="invisible">{link.word}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        <p
          ref={paragraphRef}
          className="relative w-full max-w-[600px] px-4 md:px-0 text-justify lowercase font-normal"
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
