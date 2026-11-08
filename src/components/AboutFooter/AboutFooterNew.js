import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Imperial_Script } from "next/font/google";
import { getResponsiveVideoSources } from "@/lib/videoSources";

const imperialScript = Imperial_Script({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

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

const META_FONT = "'Favorit', sans-serif";
const HEADLINE_FONT = imperialScript.style.fontFamily;
const HEADLINE_LETTER_SPACING = "0em";
// Desktop: "Living the" / "Mediterranean Dream" — Mobile: 3 líneas.
// El doble nbsp replica el ml-[0.12em] extra entre "Mediterranean" y "Dream".
const HEADLINE_LINES = ["Living the", "Mediterranean  Dream"];
const HEADLINE_LINES_MOBILE = ["Living the", "Mediterranean", "Dream"];
// Interlineado apretado como en el prototipo: las mayúsculas de una línea
// llegan casi a la base de la anterior.
const HEADLINE_LINE_HEIGHT = 0.68;
const MEASURE_SIZE = 100;
const MIN_VIDEO_PX = 220;
const VIDEO_MIN_SHARE = 0.4;
// 1 = la tinta toca exactamente los bordes de la foto.
const HEADLINE_SCALE = 1;
const HEADLINE_SCALE_MOBILE = 1;

let measureCtx = null;
function measureInk(text) {
  if (!measureCtx) measureCtx = document.createElement("canvas").getContext("2d");
  measureCtx.font = `400 ${MEASURE_SIZE}px ${HEADLINE_FONT}`;
  const m = measureCtx.measureText(text);
  return {
    left: m.actualBoundingBoxLeft,
    right: m.actualBoundingBoxRight,
    w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
    advance: m.width,
    ascent: m.actualBoundingBoxAscent,
    descent: m.actualBoundingBoxDescent,
    fontAscent: m.fontBoundingBoxAscent,
    fontDescent: m.fontBoundingBoxDescent,
  };
}
const META_HEADLINE_GAP = 6;
const META_FONT_SIZE_MOBILE = "clamp(9px, 0.85vw, 12px)";
const META_FONT_SIZE_DESKTOP = "clamp(7.5px, 0.65vw, 11px)";
const MOBILE_MAX_WIDTH = 720;
const PAGE_GUTTER = "0.75rem"; // NewNav px-3
const CHAR_PILE_PAD = "2.75rem";
const VIDEO_HEADLINE_GAP = 12;
const VIDEO_HEADLINE_GAP_MOBILE = 10;
const DESKTOP_TOP_EXTRA = "2rem";
const MOBILE_TOP_BREATHING = "4rem";
// Encuadre mobile de la foto: proporción del contenedor y franja vertical
// del vídeo (0 = arriba, 1 = abajo) que se muestra, con el zoom de siempre.
const MOBILE_PHOTO_ASPECT = 1.25;
const MOBILE_CROP_TOP = 0.16;
const MOBILE_CROP_BOTTOM = 0.85;
const VIDEO_SOURCE_ASPECT = 5 / 4; // smokers.mp4 2700×2160
const NAV_DIM_COLOR = "rgba(0,0,0,0.16)";
const NAV_FULL_COLOR = "#000000";

export default function AboutFooterNew() {
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
      const meta = metaRef.current;
      const links = linksRef.current;
      if (!frame || !h1) return;

      const contentW = frame.clientWidth;
      const contentH = frame.clientHeight;
      if (contentW <= 0 || contentH <= 0) return;

      const isMobile = window.innerWidth < MOBILE_MAX_WIDTH;
      const headlineScale = isMobile ? HEADLINE_SCALE_MOBILE : HEADLINE_SCALE;
      const videoHeadlineGap = isMobile
        ? VIDEO_HEADLINE_GAP_MOBILE
        : VIDEO_HEADLINE_GAP;

      // Desktop: subencabezado mucho más pequeño y centrado en el hueco
      // entre foto y titular (mismo aire arriba y abajo), como el prototipo.
      const metaGap = isMobile
        ? META_HEADLINE_GAP
        : Math.round(Math.min(26, Math.max(12, window.innerWidth * 0.013)));
      if (meta) {
        meta.style.fontSize = isMobile
          ? META_FONT_SIZE_MOBILE
          : META_FONT_SIZE_DESKTOP;
        meta.style.marginTop = `${isMobile ? videoHeadlineGap : metaGap}px`;
      }
      if (headlineWrapRef.current) {
        headlineWrapRef.current.style.marginTop = `${metaGap}px`;
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

      // Mobile: foto de alto fijo recortada al encuadre del diseño (sin
      // tejado, menos muro) manteniendo el zoom, y bloque centrado en
      // foto+subencabezado arriba y titular centrado debajo. Desktop: foto flexible.
      const videoWrap = videoWrapRef.current;
      const video = videoRef.current;
      let mobileVideoH = 0;
      if (videoWrap && video) {
        if (isMobile) {
          mobileVideoH = Math.round(contentW / MOBILE_PHOTO_ASPECT);
          videoWrap.style.flex = "0 0 auto";
          videoWrap.style.height = `${mobileVideoH}px`;
          const span = MOBILE_CROP_BOTTOM - MOBILE_CROP_TOP;
          Object.assign(video.style, {
            inset: "auto",
            left: "50%",
            top: `${(-MOBILE_CROP_TOP / span) * 100}%`,
            height: `${100 / span}%`,
            width: "auto",
            maxWidth: "none",
            aspectRatio: String(VIDEO_SOURCE_ASPECT),
            transform: "translateX(-50%)",
          });
          // Foto + subencabezado arriba; el titular se centra en el
          // espacio libre que queda debajo.
          if (headlineWrapRef.current) {
            headlineWrapRef.current.style.flex = "1 1 auto";
            headlineWrapRef.current.style.justifyContent = "center";
          }
        } else {
          videoWrap.style.flex = "";
          videoWrap.style.height = "";
          Object.assign(video.style, {
            inset: "",
            left: "",
            top: "",
            height: "",
            width: "",
            maxWidth: "",
            aspectRatio: "",
            transform: "",
          });
          if (headlineWrapRef.current) {
            headlineWrapRef.current.style.flex = "";
            headlineWrapRef.current.style.justifyContent = "";
          }
        }
      }

      // Medimos la TINTA real de la script (swashes incluidos) con canvas,
      // no el advance width: así el titular llega exactamente a los bordes
      // de la foto sin salirse, y las líneas no se pisan.
      const lines = isMobile ? HEADLINE_LINES_MOBILE : HEADLINE_LINES;
      const ink = lines.map(measureInk);
      const widest = ink.reduce((a, b) => (b.w > a.w ? b : a));
      if (widest.w <= 0) return;

      const lineHeight = HEADLINE_LINE_HEIGHT;

      // Lo que la tinta sobresale de la caja de línea (arriba / abajo).
      const { fontAscent, fontDescent } = ink[0];
      const halfLeading =
        (lineHeight * MEASURE_SIZE - fontAscent - fontDescent) / 2;
      const padTopEm = Math.max(
        0,
        (ink[0].ascent - fontAscent - halfLeading) / MEASURE_SIZE
      );
      const last = ink[ink.length - 1];
      const padBottomEm = Math.max(
        0,
        (last.descent - fontDescent - halfLeading) / MEASURE_SIZE
      );

      const sizeW = ((contentW - 1) / widest.w) * MEASURE_SIZE * headlineScale;
      const metaH =
        (meta?.offsetHeight || 0) + (isMobile ? videoHeadlineGap : metaGap) + metaGap;
      const minVideo = isMobile
        ? mobileVideoH
        : Math.max(MIN_VIDEO_PX, contentH * VIDEO_MIN_SHARE);
      const maxHeadlineH = Math.max(36, contentH - metaH - minVideo);
      const sizeH =
        maxHeadlineH / (lines.length * lineHeight + padTopEm + padBottomEm);
      const fontSize = Math.max(18, Math.min(sizeW, sizeH));

      // text-align centra la caja de avance; corregimos para centrar la tinta.
      const inkShift =
        ((widest.advance - (widest.right - widest.left)) / 2 / MEASURE_SIZE) *
        fontSize;

      h1.style.fontSize = `${fontSize}px`;
      h1.style.lineHeight = String(lineHeight);
      h1.style.paddingTop = `${padTopEm}em`;
      h1.style.paddingBottom = `${padBottomEm}em`;
      h1.style.transform = `translateX(${inkShift.toFixed(2)}px)`;
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

    const navEls = () => document.querySelectorAll("#mm-new-nav a");
    const dimNav = (silent = false) => {
      const els = navEls();
      if (!els.length) return;
      if (silent) gsap.set(els, { color: NAV_DIM_COLOR });
      else
        gsap.to(els, {
          color: NAV_DIM_COLOR,
          duration: 0.85,
          ease: "power3.out",
          overwrite: true,
        });
    };
    const restoreNav = (silent = false) => {
      const els = navEls();
      if (!els.length) return;
      if (silent) gsap.set(els, { color: NAV_FULL_COLOR });
      else
        gsap.to(els, {
          color: NAV_FULL_COLOR,
          duration: 0.45,
          ease: "power2.in",
          overwrite: true,
        });
    };

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
        restoreNav(true);
        window.dispatchEvent(new Event("mm-home-watermark-show"));
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
      restoreNav(false);
      window.dispatchEvent(new Event("mm-home-watermark-show"));
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
      dimNav(false);

      window.dispatchEvent(new Event("mm-home-watermark-hide"));

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
      restoreNav(true);
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
          className="fixed top-0 right-0 z-[9999] m-0 p-0 list-none flex flex-col items-end text-right will-change-transform px-3 pt-2.5"
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

            <p
              ref={metaRef}
              className="m-0 uppercase shrink-0 text-center will-change-transform"
              style={{
                fontFamily: META_FONT,
                fontSize: META_FONT_SIZE_MOBILE,
                letterSpacing: "0.04em",
                lineHeight: 1.2,
                opacity: 0,
                marginTop: VIDEO_HEADLINE_GAP,
              }}
            >
              Independent record label — est.2015 berlin | barcelona
            </p>

            <div
              ref={headlineWrapRef}
              className="relative shrink-0 flex flex-col items-center"
              style={{ marginTop: META_HEADLINE_GAP }}
            >
              <h1
                ref={headlineRef}
                className="m-0 font-normal text-center"
                style={{
                  fontFamily: HEADLINE_FONT,
                  fontWeight: 400,
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
                {/* Desktop: "Mediterranean Dream" en una línea; mobile: dos */}
                <span className="block whitespace-nowrap">
                  <span
                    ref={(el) => (headlineLinesRef.current[1] = el)}
                    className="block min-[720px]:inline-block will-change-[transform,opacity,filter]"
                    style={{ opacity: 0 }}
                  >
                    Mediterranean
                  </span>{" "}
                  <span
                    ref={(el) => (headlineLinesRef.current[2] = el)}
                    className="block min-[720px]:inline-block min-[720px]:ml-[0.12em] will-change-[transform,opacity,filter]"
                    style={{ opacity: 0 }}
                  >
                    Dream
                  </span>
                </span>
              </h1>
            </div>
          </div>
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
