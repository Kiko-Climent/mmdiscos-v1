import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getResponsiveVideoSources } from "@/lib/videoSources";

const FOOTER_VIDEO = getResponsiveVideoSources("/video/smokers.mp4");

const STATEMENT =
  "MM DISCOS IS A RECORD LABEL BASED BETWEEN BERLIN AND BARCELONA, FOUNDED AND POWERED BY MOON & MANN. FREE FROM STYLISTIC BOUNDARIES AND GENRE LIMITATIONS, THE LABEL HAS CONSISTENTLY CHAMPIONED A DISTINCTIVE SOUND WHERE MUSIC SPEAKS FOR ITSELF — DEEPLY INSPIRED BY THE SUEÑO IBICENCO AND THE SPIRIT OF THE MEDITERRANEAN.";

const LINKS = [
  { word: "soundcloud", href: "https://soundcloud.com/mmdiscos" },
  { word: "instagram", href: "https://www.instagram.com/mm.discos/" },
  { word: "bandcamp", href: "https://mmdiscos.bandcamp.com/" },
  { word: "contact", href: "mailto:moonandmann@gmail.com" },
];

const PILE_BOTTOM_OFFSET = 14;
const EXPLODE_THRESHOLD = 0.45;
const EXPLODE_RELEASE = 0.4;
const LAYOUT_THRESHOLD = 0.58;
const LAYOUT_RELEASE = 0.52;
const ABOUT_NAV_PROGRESS = 0.43;

const HEADLINE_FONT = "'Favorit', sans-serif";
const HEADLINE_LINE_HEIGHT = 0.8;
const HEADLINE_LETTER_SPACING = "-0.05em";
const HEADLINE_LINES = 3;
const MIN_VIDEO_PX = 220;
const VIDEO_MIN_SHARE = 0.48;
const HEADLINE_SCALE = 0.92;
const HEADLINE_SCALE_MOBILE = 0.99;
const MOBILE_MAX_WIDTH = 720;
const PAGE_GUTTER = "0.75rem"; // NewNav px-3
const CHAR_PILE_PAD = "2.75rem";
const META_VIDEO_GAP = 8;
const VIDEO_HEADLINE_GAP = 12;
const VIDEO_HEADLINE_GAP_MOBILE = 10;
const DESKTOP_TOP_EXTRA = "2rem";
const MOBILE_TOP_BREATHING = "4.5rem";

export default function AboutFooter2() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const paragraphRef = useRef(null);
  const stageRef = useRef(null);

  const editorialRef = useRef(null);
  const frameRef = useRef(null);
  const metaRef = useRef(null);
  const videoWrapRef = useRef(null);
  const videoRef = useRef(null);
  const headlineRef = useRef(null);
  const headlineWrapRef = useRef(null);
  const headlineLinesRef = useRef([]);
  const linksRef = useRef(null);
  const probeRef = useRef(null);

  const wordsRef = useRef([]);
  const charsRef = useRef([]);
  const revealTlRef = useRef(null);
  const rafRef = useRef(null);
  const explodedRef = useRef(false);
  const editorialRevealedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const section = sectionRef.current;
    if (!section) return;

    const updateNavOffset = () => {
      const nav =
        document.getElementById("mm-new-nav") ||
        document.getElementById("mm-global-menu-pills");
      if (!nav) return;
      const rect = nav.getBoundingClientRect();
      const cs = window.getComputedStyle(nav);
      const padBottom = parseFloat(cs.paddingBottom) || 0;
      const visualBottom = rect.bottom - padBottom;
      const bottom = Math.max(60, visualBottom);
      section.style.setProperty("--mm-nav-bottom", `${bottom}px`);
    };

    updateNavOffset();
    window.addEventListener("resize", updateNavOffset);

    let ro;
    const nav =
      document.getElementById("mm-new-nav") ||
      document.getElementById("mm-global-menu-pills");
    if (nav && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updateNavOffset);
      ro.observe(nav);
    }

    return () => {
      window.removeEventListener("resize", updateNavOffset);
      if (ro) ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fitLayout = () => {
      const frame = frameRef.current;
      const h1 = headlineRef.current;
      const probe = probeRef.current;
      const meta = metaRef.current;
      const links = linksRef.current;
      if (!frame || !h1 || !probe) return;

      const contentW = frame.clientWidth;
      const contentH = frame.clientHeight;
      if (contentW <= 0 || contentH <= 0) return;

      const isMobile = window.innerWidth < MOBILE_MAX_WIDTH;
      const headlineScale = isMobile ? HEADLINE_SCALE_MOBILE : HEADLINE_SCALE;
      const videoHeadlineGap = isMobile
        ? VIDEO_HEADLINE_GAP_MOBILE
        : VIDEO_HEADLINE_GAP;

      const headlineWrap = headlineWrapRef.current;
      if (headlineWrap) {
        headlineWrap.style.marginTop = `${videoHeadlineGap}px`;
      }

      const editorial = editorialRef.current;
      if (editorial) {
        editorial.style.paddingTop = `calc(var(--mm-nav-bottom, 5.5rem) + ${
          isMobile ? MOBILE_TOP_BREATHING : DESKTOP_TOP_EXTRA
        })`;
      }

      if (links) {
        links.style.position = "";
        links.style.alignSelf = "";
        links.style.marginTop = "0";
      }

      const probeSize = 100;
      probe.style.fontSize = `${probeSize}px`;
      const probeW = probe.getBoundingClientRect().width;
      if (probeW <= 0) return;

      const sizeW = ((contentW - 1) / probeW) * probeSize * headlineScale;
      const metaH = (meta?.offsetHeight || 0) + META_VIDEO_GAP;
      const minVideo = Math.max(MIN_VIDEO_PX, contentH * VIDEO_MIN_SHARE);
      const maxHeadlineH = Math.max(
        36,
        contentH - metaH - minVideo - videoHeadlineGap
      );
      const sizeH = maxHeadlineH / (HEADLINE_LINES * HEADLINE_LINE_HEIGHT);
      const fontSize = Math.max(18, Math.min(sizeW, sizeH));

      h1.style.marginLeft = "0px";
      h1.style.fontSize = `${fontSize}px`;

      const medLine = headlineLinesRef.current[1];
      const textNode = medLine?.firstChild;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const range = document.createRange();
        range.setStart(textNode, 0);
        range.setEnd(textNode, 1);
        const glyphLeft = range.getBoundingClientRect().left;
        const frameLeft = frame.getBoundingClientRect().left;
        const inset = glyphLeft - frameLeft;
        if (inset > 0.4) {
          h1.style.marginLeft = `${-inset}px`;
        }
      }
    };

    fitLayout();

    const frame = frameRef.current;
    let ro;
    if (frame && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(fitLayout);
      ro.observe(frame);
    }

    window.addEventListener("resize", fitLayout);

    if (document.fonts) {
      document.fonts.ready.then(fitLayout);
    }

    return () => {
      window.removeEventListener("resize", fitLayout);
      if (ro) ro.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const sticky = stickyRef.current;
    const paragraph = paragraphRef.current;
    const stage = stageRef.current;
    const section = sectionRef.current;
    if (!sticky || !paragraph || !stage || !section) return;

    const linksFromY = window.innerWidth < MOBILE_MAX_WIDTH ? -8 : 12;
    const meta = metaRef.current;
    const videoWrap = videoWrapRef.current;
    const video = videoRef.current;
    const headlineLines = headlineLinesRef.current.filter(Boolean);
    const links = linksRef.current;

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
    };

    const stopRaf = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const killRevealTl = () => {
      if (revealTlRef.current) {
        revealTlRef.current.kill();
        revealTlRef.current = null;
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

        setTransform(c.el, c.x, c.y, c.rot);
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

    const hideEditorial = (silent = false) => {
      if (!editorialRevealedRef.current && !silent) return;
      editorialRevealedRef.current = false;
      killRevealTl();

      if (video) video.pause();

      if (silent) {
        gsap.set(meta, { opacity: 0, y: -8 });
        gsap.set(videoWrap, { clipPath: "inset(0 0 0 100%)" });
        gsap.set(headlineLines, { opacity: 0, y: 16, filter: "blur(18px)" });
        gsap.set(links, { opacity: 0, y: linksFromY, pointerEvents: "none" });
        return;
      }

      gsap.to(headlineLines, {
        opacity: 0,
        y: 16,
        filter: "blur(18px)",
        duration: 0.45,
        ease: "power2.in",
        stagger: 0.04,
        overwrite: true,
      });
      gsap.to(links, {
        opacity: 0,
        y: linksFromY,
        duration: 0.35,
        ease: "power2.in",
        overwrite: true,
        pointerEvents: "none",
      });
      gsap.to(videoWrap, {
        clipPath: "inset(0 0 0 100%)",
        duration: 0.6,
        ease: "power2.in",
        overwrite: true,
      });
      gsap.to(meta, {
        opacity: 0,
        y: -8,
        duration: 0.35,
        ease: "power2.in",
        overwrite: true,
      });
    };

    const resetExplosion = () => {
      if (!explodedRef.current) return;
      hideEditorial(true);
      explodedRef.current = false;
      stopRaf();
      cleanupStage();
      wordEls.forEach((w) => {
        w.style.opacity = "1";
      });
    };

    const revealEditorial = (delay = 0) => {
      if (editorialRevealedRef.current) return;
      editorialRevealedRef.current = true;
      killRevealTl();

      if (video) {
        video.play().catch(() => {});
      }

      const tl = gsap.timeline({ delay });

      tl.to(
        meta,
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        0
      );
      tl.to(
        videoWrap,
        { clipPath: "inset(0 0 0 0%)", duration: 1.1, ease: "expo.out" },
        0.12
      );
      tl.to(
        headlineLines,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.0,
          ease: "power3.out",
          stagger: 0.12,
        },
        0.28
      );
      tl.to(
        links,
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          pointerEvents: "auto",
        },
        0.55
      );

      revealTlRef.current = tl;
    };

    let removeNavAboutListener = null;

    const ctx = gsap.context(() => {
      wordEls.forEach((w) => gsap.set(w, { color: "#c8c8c8" }));
      gsap.set(meta, { opacity: 0, y: -8 });
      gsap.set(videoWrap, { clipPath: "inset(0 0 0 100%)" });
      gsap.set(headlineLines, { opacity: 0, y: 16, filter: "blur(18px)" });
        gsap.set(links, { opacity: 0, y: linksFromY, pointerEvents: "none" });

      const onMobile = window.innerWidth < MOBILE_MAX_WIDTH;
      const measureSvh = () => {
        const probe = document.createElement("div");
        probe.style.cssText =
          "position:fixed;top:0;left:0;width:0;height:100svh;pointer-events:none;visibility:hidden";
        document.body.appendChild(probe);
        const h = probe.getBoundingClientRect().height;
        probe.remove();
        return h;
      };
      const vh = onMobile ? Math.round(measureSvh()) : window.innerHeight;

      // En móvil el pin de GSAP entra un frame tarde: el párrafo sigue
      // subiendo (más allá del centro) y luego el pin lo devuelve.
      // Sticky nativo bloquea en top:0 el mismo frame que el scroll.
      // El panel pinta 100dvh (llena la pantalla con o sin barra); el
      // copy se ancla a 50svh, el mismo eje que la marca de agua.
      if (onMobile) {
        sticky.style.position = "sticky";
        sticky.style.top = "0px";
        sticky.style.height = "100dvh";
        section.style.height = `${vh * 4.5}px`;
        paragraph.style.position = "absolute";
        paragraph.style.top = "50svh";
        paragraph.style.left = "50%";
        paragraph.style.transform = "translate(-50%, -50%)";
        paragraph.style.width = "100%";
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: onMobile ? section : sticky,
          start: "top top",
          end: onMobile ? "bottom bottom" : () => `+=${window.innerHeight * 3.5}`,
          pin: !onMobile,
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
              p >= LAYOUT_THRESHOLD &&
              explodedRef.current &&
              !editorialRevealedRef.current
            ) {
              revealEditorial(0.15);
            } else if (p < LAYOUT_RELEASE && editorialRevealedRef.current) {
              hideEditorial(false);
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

      const aboutTrigger = tl.scrollTrigger;
      const onNavAbout = () => {
        if (!aboutTrigger) return;
        ScrollTrigger.refresh();
        const start = Number(aboutTrigger.start);
        const end = Number(aboutTrigger.end);
        if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start)
          return;
        const targetY = start + (end - start) * ABOUT_NAV_PROGRESS;
        window.dispatchEvent(
          new CustomEvent("mm-scroll-to", { detail: { y: targetY } })
        );
      };
      window.addEventListener("mm-nav-about", onNavAbout);
      removeNavAboutListener = () =>
        window.removeEventListener("mm-nav-about", onNavAbout);

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => {
      if (removeNavAboutListener) removeNavAboutListener();
      stopRaf();
      killRevealTl();
      cleanupStage();
      ctx.revert();
      sticky.style.position = "";
      sticky.style.top = "";
      sticky.style.height = "";
      section.style.height = "";
      paragraph.style.position = "";
      paragraph.style.top = "";
      paragraph.style.left = "";
      paragraph.style.transform = "";
      paragraph.style.width = "";
      explodedRef.current = false;
      editorialRevealedRef.current = false;
    };
  }, []);

  const tokens = STATEMENT.split(/(\s+)/);

  return (
    <section
      ref={sectionRef}
      className="about-footer relative w-full bg-white text-black"
    >
      <div
        ref={stickyRef}
        className="relative z-[2] w-full h-screen overflow-hidden flex items-center justify-center"
      >
        <div
          ref={stageRef}
          className="about-final-stage absolute inset-0 pointer-events-none z-30"
          aria-hidden="true"
        />

        <ul
          ref={linksRef}
          className="absolute z-40 m-0 p-0 list-none flex flex-col items-end text-right will-change-transform top-0 right-0 px-3 pt-2.5 min-[720px]:top-auto min-[720px]:right-3 min-[720px]:bottom-[2.75rem] min-[720px]:px-0 min-[720px]:pt-0"
          style={{ opacity: 0, pointerEvents: "none" }}
        >
          {LINKS.map((link) => (
            <li key={link.word}>
              <a
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  link.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="block uppercase text-[18px] font-semibold tracking-[-0.06em] leading-[1.05] text-black no-underline whitespace-nowrap hover:opacity-45 transition-opacity duration-150"
              >
                {link.word}
              </a>
            </li>
          ))}
        </ul>

        <div
          ref={editorialRef}
          className="absolute inset-0 z-20 pointer-events-none text-black"
          style={{
            paddingTop: `calc(var(--mm-nav-bottom, 5.5rem) + ${DESKTOP_TOP_EXTRA})`,
            paddingBottom: CHAR_PILE_PAD,
            paddingLeft: PAGE_GUTTER,
            paddingRight: PAGE_GUTTER,
          }}
        >
          <div ref={frameRef} className="flex flex-col w-full h-full min-h-0">
            <p
              ref={metaRef}
              className="m-0 uppercase shrink-0 will-change-transform"
              style={{
                fontFamily: HEADLINE_FONT,
                fontSize: "clamp(9px, 0.85vw, 12px)",
                letterSpacing: "0.04em",
                lineHeight: 1.2,
                opacity: 0,
                marginBottom: META_VIDEO_GAP,
              }}
            >
              Independent record label — est.2015 berlin | barcelona
            </p>

            <div
              ref={videoWrapRef}
              className="relative w-full flex-1 min-h-0 overflow-hidden will-change-[clip-path]"
              style={{ clipPath: "inset(0 0 0 100%)" }}
            >
              <video
                ref={videoRef}
                muted
                loop
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover object-[center_64%]"
              >
                <source media="(max-width: 719px)" src={FOOTER_VIDEO.mobile} type="video/mp4" />
                <source media="(max-width: 1279px)" src={FOOTER_VIDEO.tablet} type="video/mp4" />
                <source src={FOOTER_VIDEO.desktop} type="video/mp4" />
                <source src={FOOTER_VIDEO.fallback} type="video/mp4" />
              </video>
            </div>

            <div
              ref={headlineWrapRef}
              className="relative shrink-0 flex flex-col"
            >
              <h1
                ref={headlineRef}
                className="uppercase m-0 font-semibold"
                style={{
                  fontFamily: HEADLINE_FONT,
                  lineHeight: HEADLINE_LINE_HEIGHT,
                  letterSpacing: HEADLINE_LETTER_SPACING,
                  fontSize: "18px",
                }}
              >
                <span
                  ref={(el) => (headlineLinesRef.current[0] = el)}
                  className="block whitespace-nowrap will-change-[transform,opacity,filter]"
                  style={{ opacity: 0 }}
                >
                  Living the
                </span>
                <span
                  ref={(el) => (headlineLinesRef.current[1] = el)}
                  className="block whitespace-nowrap will-change-[transform,opacity,filter]"
                  style={{ opacity: 0 }}
                >
                  Mediterranean
                </span>
                <span
                  ref={(el) => (headlineLinesRef.current[2] = el)}
                  className="block whitespace-nowrap will-change-[transform,opacity,filter]"
                  style={{ opacity: 0 }}
                >
                  Dream 24/7
                </span>
              </h1>
            </div>
          </div>

          <span
            ref={probeRef}
            aria-hidden
            className="absolute uppercase font-semibold pointer-events-none whitespace-nowrap"
            style={{
              fontFamily: HEADLINE_FONT,
              letterSpacing: HEADLINE_LETTER_SPACING,
              lineHeight: HEADLINE_LINE_HEIGHT,
              visibility: "hidden",
              left: 0,
              top: 0,
            }}
          >
            Mediterranean
          </span>
        </div>

        <p
          ref={paragraphRef}
          className="relative z-10 w-full max-w-[600px] px-4 md:px-0 text-justify lowercase font-normal"
          style={{
            fontSize: "0.875rem",
            letterSpacing: "0.03em",
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
