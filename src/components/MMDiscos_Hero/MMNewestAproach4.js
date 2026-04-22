"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const COL1_IMGS = [
  "/Celex - cover.jpg",
  "/corben_peachland_cover.jpg",
  "/Daichi - cover.jpg",
  "/Factory Edits - cover.jpg",
];
const COL2_IMGS = ["/img1.jpg", "/img2.jpg", "/img3.jpg", "/img4.jpg"];
const COL3_IMGS = ["/img5.jpg", "/MMD039.png", "/MMD040_Cover-1.jpg", "/MMD040-2.png"];
const COL4_IMGS = ["/morira - cover.png", "/statues.jpeg", "/img9.jpg", "/img3.jpg"];

const ALFREDOS_QUOTE = `We played without rules, without thinking about styles or what would come next. One track could be slow, the next dark, then something pop or an impossible guitar, but it all made sense in that moment. The dancefloor didn't ask for coherence, it asked for emotion — and as long as people stayed there, smiling and lost, you knew you were doing it right.`;

const STATEMENT = `MM DISCOS IS A RECORD LABEL BASED BETWEEN BERLIN AND BARCELONA, 
FOUNDED AND POWERED BY MOON & MANN. FREE FROM STYLISTIC BOUNDARIES AND GENRE LIMITATIONS, 
THE LABEL HAS CONSISTENTLY CHAMPIONED A DISTINCTIVE SOUND WHERE MUSIC SPEAKS FOR ITSELF — DEEPLY INSPIRED BY THE SUEÑO IBICENCO AND THE SPIRIT OF THE MEDITERRANEAN.`;

export default function MMNewestAproach4() {
  const aboutHeaderRef = useRef(null);

  useEffect(() => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const isMobile = vw < 720;

    const heroImgEl = document.querySelector(".mm-hero-img");
    const aboutEl   = document.querySelector(".mm-about");
    const videoWrap = document.querySelector(".mm-second-video-wrap");
    const headerEl  = aboutHeaderRef.current;

    if (!heroImgEl || !aboutEl || !videoWrap || !headerEl) return;

    // Column positions: vh-relative for proportional scaling on all screens
    const outerInitY  =  vh * 1.1;
    const innerInitY  =  vh * 0.55;
    const innerInitX  =  isMobile ? 0 : 225;
    const outerFinalY = -vh * 1.55;
    const innerFinalY = -vh * 0.78;

    // Hero thumbnail: bigger on mobile for visual weight + earned scroll distance
    const heroTarget = isMobile ? Math.round(vw * 0.55) : 150;

    const ctx = gsap.context(() => {

      // ── Hero image: scales down as it scrolls away ──────────────────────
      // Mobile gets vh*1.2 scroll distance — bigger thumbnail means less travel needed.
      ScrollTrigger.create({
        trigger:    ".mm-hero",
        start:      "top top",
        end:        `+=${isMobile ? vh * 1.2 : vh * 1.5}`,
        pin:        true,
        pinSpacing: false,
        scrub:      1,
        onUpdate(self) {
          const p = self.progress;
          gsap.set(heroImgEl, {
            scaleX: gsap.utils.interpolate(1, heroTarget / vw, p),
            scaleY: gsap.utils.interpolate(1, heroTarget / vh, p),
          });
        },
      });

      // ── About columns: initial positions (vh-relative) ─────────────────
      gsap.set("#mm-col-1", { y:  outerInitY });
      gsap.set("#mm-col-4", { y:  outerInitY });
      gsap.set("#mm-col-2", { x: -innerInitX, y: innerInitY });
      gsap.set("#mm-col-3", { x:  innerInitX, y: innerInitY });

      // ── About columns parallax ──────────────────────────────────────────
      [
        { selector: "#mm-col-1", y: outerFinalY },
        { selector: "#mm-col-2", y: innerFinalY },
        { selector: "#mm-col-3", y: innerFinalY },
        { selector: "#mm-col-4", y: outerFinalY },
      ].forEach(({ selector, y }) => {
        gsap.to(selector, {
          y,
          scrollTrigger: {
            trigger: ".mm-about",
            start:   "top bottom",
            end:     `+=${isMobile ? vh * 2.5 : vh * 4}`,
            scrub:   true,
          },
        });
      });

      // ── Second video: clip-path reveal from small box → full viewport ───
      // clip-path inset() instead of animating width/height/top/left.
      // The video element sits at full viewport size from the start — only the
      // clip window grows. This eliminates the square→portrait distortion that
      // occurs when independently interpolating width and height from 1:1 to
      // the device's portrait ratio on mobile.
      gsap.set(headerEl, { xPercent: -50, yPercent: -50 });

      const aboutRect  = aboutEl.getBoundingClientRect();
      const headerRect = headerEl.getBoundingClientRect();

      // 150×150 box: horizontally centered, below header text.
      // Mobile: fixed at 62% down (clear of the centered header block).
      // Desktop: measured below the header element as before.
      const boxSize = 150;
      const boxTop  = isMobile
        ? Math.round(vh * 0.62)
        : Math.round(headerRect.bottom - aboutRect.top + 55);
      const boxLeft = Math.round((vw - boxSize) / 2);

      // Inset values: distance from each edge of the full-viewport element
      const clipT = boxTop;
      const clipL = boxLeft;
      const clipR = vw - boxLeft - boxSize;
      const clipB = vh - boxTop  - boxSize;

      const clipStart = `inset(${clipT}px ${clipR}px ${clipB}px ${clipL}px)`;
      const clipEnd   = "inset(0px 0px 0px 0px)";

      gsap.set(videoWrap, {
        top:      0,
        left:     0,
        width:    vw,
        height:   vh,
        clipPath: clipStart,
      });

      const videoScrollDist  = isMobile ? vh * 1.8 : vh * 2;
      // Header exits faster on mobile so it clears the viewport before the
      // expanding clip reaches center screen
      const headerScrollDist = isMobile ? vh * 0.5 : vh * 1.2;

      gsap.fromTo(
        videoWrap,
        { clipPath: clipStart },
        {
          clipPath: clipEnd,
          ease:     "none",
          scrollTrigger: {
            trigger:    ".mm-about",
            start:      "top top",
            end:        `+=${videoScrollDist}`,
            pin:        true,
            pinSpacing: true,
            scrub:      1,
          },
        }
      );

      // ── About header: exits upward before the expanding clip covers it ──
      gsap.to(headerEl, {
        y:    -headerScrollDist,
        ease: "none",
        scrollTrigger: {
          trigger: ".mm-about",
          start:   "top top",
          end:     `+=${headerScrollDist}`,
          scrub:   1,
        },
      });

    });

    // Refresh after all triggers are registered so pinSpacing accounts for
    // the full page height including MMNewestHero's 200svh spacer above.
    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, []);

  return (
    <>
      <style>{`
        /* ── Hero ── */
        .mm-hero {
          position: relative;
          width: 100%;
          height: 100svh;
          overflow: hidden;
        }
        .mm-hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transform-origin: center center;
          will-change: transform;
          overflow: hidden;
        }

        /* ── About ── */
        .mm-about {
          position: relative;
          width: 100%;
          height: 100svh;
          margin-top: 80svh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .mm-about-imgs {
          position: absolute;
          inset: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4rem;
        }
        .mm-imgs-col {
          position: relative;
          height: 125%;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          will-change: transform;
        }
        .mm-img-thumb {
          width: 125px;
          height: 125px;
          overflow: hidden;
          flex-shrink: 0;
        }
        /* Initial column positions set by GSAP in useEffect (vh-relative) */

        .mm-about-header {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 40%;
          text-align: center;
          pointer-events: none;
          z-index: 3;
        }

        /* ── Segundo vídeo ── */
        /* position/size/clip-path fully managed by GSAP */
        .mm-second-video-wrap {
          position: absolute;
          overflow: hidden;
          will-change: clip-path;
          z-index: 5;
        }
        .mm-second-video-wrap video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* ── Outro ── */
        .mm-outro {
          position: relative;
          width: 100%;
          min-height: 100svh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 4rem;
        }

        /* ── Typography ── */
        .mm-about-header p {
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.08em;
          line-height: 1.6;
          text-transform: lowercase;
          color: #111;
          max-width: 52ch;
          margin: 0 auto;
        }
        .mm-outro p {
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.12em;
          line-height: 1.4;
          text-transform: lowercase;
          text-align: justify;
          color: #111;
          width: min(100%, 600px);
          text-indent: 6rem;
        }

        @media (max-width: 720px) {
          .mm-about { margin-top: 60svh; }
          .mm-about-header { width: 100%; padding: 2rem; }
          .mm-about-imgs { padding: 2rem; }
          .mm-img-thumb { width: 75px; height: 75px; opacity: 0.25; filter: saturate(0); }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="mm-hero">
        <div className="mm-hero-img">
          <img
            src="/amnesia.png"
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="mm-about">
        <div className="mm-about-imgs">
          <div className="mm-imgs-col" id="mm-col-1">
            {COL1_IMGS.map((src, i) => (
              <div className="mm-img-thumb" key={i}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            ))}
          </div>
          <div className="mm-imgs-col" id="mm-col-2">
            {COL2_IMGS.map((src, i) => (
              <div className="mm-img-thumb" key={i}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            ))}
          </div>
          <div className="mm-imgs-col" id="mm-col-3">
            {COL3_IMGS.map((src, i) => (
              <div className="mm-img-thumb" key={i}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            ))}
          </div>
          <div className="mm-imgs-col" id="mm-col-4">
            {COL4_IMGS.map((src, i) => (
              <div className="mm-img-thumb" key={i}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            ))}
          </div>
        </div>
        <div className="mm-about-header" ref={aboutHeaderRef}>
          <p>{ALFREDOS_QUOTE}</p>
        </div>

        <div className="mm-second-video-wrap">
          <video
            src="/video/Video MM Header.mp4"
            autoPlay muted loop playsInline
          />
        </div>
      </section>

      {/* ── OUTRO ── */}
      <section className="mm-outro">
        <p>{STATEMENT}</p>
      </section>
    </>
  );
}
