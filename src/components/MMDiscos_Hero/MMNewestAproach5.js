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

const STATEMENT = `MM DISCOS IS A RECORD LABEL BASED BETWEEN BERLIN AND BARCELONA, FOUNDED AND POWERED BY MOON & MANN. FREE FROM STYLISTIC BOUNDARIES AND GENRE LIMITATIONS, THE LABEL HAS CONSISTENTLY CHAMPIONED A DISTINCTIVE SOUND WHERE MUSIC SPEAKS FOR ITSELF — DEEPLY INSPIRED BY THE SUEÑO IBICENCO AND THE SPIRIT OF THE MEDITERRANEAN.`;

export default function MMNewestAproach5() {
  const spacerRef = useRef(null);
  const imgRef    = useRef(null);
  const colsRef   = useRef(null);
  const col1Ref   = useRef(null);
  const col2Ref   = useRef(null);
  const col3Ref   = useRef(null);
  const col4Ref   = useRef(null);
  const textRef   = useRef(null);
  const videoRef  = useRef(null);

  useEffect(() => {
    const vw       = window.innerWidth;
    const vh       = window.innerHeight;
    const isMobile = vw < 720;

    const img    = imgRef.current;
    const cols   = colsRef.current;
    const col1   = col1Ref.current;
    const col2   = col2Ref.current;
    const col3   = col3Ref.current;
    const col4   = col4Ref.current;
    const text   = textRef.current;
    const video  = videoRef.current;
    const spacer = spacerRef.current;

    if (!img || !cols || !col1 || !col2 || !col3 || !col4 || !text || !video || !spacer) return;

    // ── Scroll distance: set spacer to exact px so ScrollTrigger never re-calculates
    //    against svh (which changes as the mobile address bar shows/hides)
    const scrollDist = isMobile ? vh * 4 : vh * 4.5;
    spacer.style.height = `${scrollDist}px`;

    // ── Hero image thumbnail: square crop, centered in viewport
    const finalW      = isMobile ? Math.round(vw * 0.55) : Math.round(vw * 0.18);
    const finalH      = finalW;
    const finalScaleX = finalW  / vw;
    const finalScaleY = finalH  / vh;

    // ── Exit Y: translate up so the thumbnail's bottom edge clears the viewport top.
    //    With transform-origin at center, the visual center starts at vh/2.
    //    Center after translate = vh/2 + exitY. Bottom = center + finalH/2.
    //    We want bottom < 0:  vh/2 + exitY + finalH/2 < 0
    //    → exitY < -(vh/2 + finalH/2)
    const exitY = -(vh * 0.5 + finalH * 0.5 + 80);

    // ── Column initial & exit positions (different rates = depth parallax)
    const outerInitY =  vh * 1.2;
    const innerInitY =  vh * 0.7;
    const innerInitX = isMobile ? 0 : 225;   // inner cols converge on desktop
    const outerExitY = -vh * 1.2;
    const innerExitY = -vh * 0.7;

    // ── Video clip-path: 110/150 px box centered → full viewport
    const boxSize   = isMobile ? 110 : 150;
    const boxLeft   = Math.round((vw - boxSize) / 2);
    const boxTop    = Math.round(vh / 2 - boxSize / 2);
    const clipStart = `inset(${boxTop}px ${vw - boxLeft - boxSize}px ${vh - boxTop - boxSize}px ${boxLeft}px)`;
    const clipEnd   = "inset(0px 0px 0px 0px)";

    const ctx = gsap.context(() => {

      // ── Initial states: everything hidden until onEnter ──────────────────
      gsap.set(img,   { autoAlpha: 0, transformOrigin: "center center" });
      gsap.set(cols,  { autoAlpha: 0 });
      gsap.set(col1,  { y:  outerInitY });
      gsap.set(col4,  { y:  outerInitY });
      gsap.set(col2,  { x: -innerInitX, y: innerInitY });
      gsap.set(col3,  { x:  innerInitX, y: innerInitY });
      gsap.set(text,  { autoAlpha: 0 });
      gsap.set(video, { autoAlpha: 0, clipPath: clipStart });

      // ── Single scrubbed timeline: one ScrollTrigger, no nested pins ──────
      const tl = gsap.timeline({
        defaults: { force3D: true },
        scrollTrigger: {
          trigger: spacer,
          start:   "top top",
          end:     `+=${scrollDist}`,
          scrub:   1,
          // Show hero image + columns the moment the sequence begins
          onEnter:     () => { gsap.set(img, { autoAlpha: 1 }); gsap.set(cols, { autoAlpha: 1 }); },
          // Restore hidden state if user scrolls back above the sequence
          onLeaveBack: () => { gsap.set([img, cols, text, video], { autoAlpha: 0 }); },
        },
      });

      // ── Phase 1 (0→32): hero image scales from fullscreen → square thumbnail
      //    power2.inOut: slow start + end feels cinematic, not mechanical
      tl.to(img, {
        scaleX:   finalScaleX,
        scaleY:   finalScaleY,
        ease:     "power2.inOut",
        duration: 32,
      }, 0);

      // ── Columns: continuous bottom→top parallax throughout the sequence
      //    Different rates (outer faster) create the depth illusion.
      //    They're inside overflow:hidden so they're only visible in-viewport.
      tl.to([col1, col4], { y: outerExitY, ease: "none", duration: 100 }, 0);
      tl.to([col2, col3], { y: innerExitY, x: 0,         ease: "none", duration: 100 }, 0);

      // ── Phase 2 (25→43): quote fades in — image still scaling, creating
      //    a brief overlap that reads as "text emerging from behind the photo"
      tl.to(text, { autoAlpha: 1, ease: "power2.out", duration: 18 }, 25);

      // ── Phase 3 (32→58): thumbnail exits upward through center-top
      //    ease:none keeps velocity constant so the exit reads as intentional
      tl.to(img, { y: exitY, ease: "none", duration: 26 }, 32);

      // ── Phase 4 (52→64): video box fades in while image is still exiting
      tl.to(video, { autoAlpha: 1, ease: "power2.out", duration: 12 }, 52);

      // ── Columns + text clear the stage before the video expands (62→76)
      tl.to(cols, { autoAlpha: 0, ease: "power2.in", duration: 14 }, 62);
      tl.to(text, { autoAlpha: 0, ease: "power2.in", duration: 10 }, 65);

      // ── Phase 5 (65→100): video clip-path expands from box → full viewport
      //    power1.inOut keeps the expand feeling deliberate, not snappy
      tl.to(video, { clipPath: clipEnd, ease: "power1.inOut", duration: 35 }, 65);

    });

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <>
      <style>{`
        /* ── Column grid ─────────────────────────────────────────────────── */
        .ma5-cols {
          position: fixed;
          inset: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4rem;
          z-index: 2;
          pointer-events: none;
          overflow: hidden;         /* clips columns while off-screen */
          will-change: opacity;
        }
        .ma5-col {
          height: 130%;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          will-change: transform;
        }
        .ma5-thumb {
          width: 125px;
          height: 125px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .ma5-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* ── Quote text ──────────────────────────────────────────────────── */
        .ma5-text {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40%;
          z-index: 4;
          pointer-events: none;
          will-change: opacity;
        }
        .ma5-text p {
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.08em;
          line-height: 1.6;
          text-transform: lowercase;
          color: #111;
          text-align: center;
          margin: 0;
        }

        /* ── Outro: sits above all fixed layers ──────────────────────────── */
        .ma5-outro {
          position: relative;
          z-index: 10;
          width: 100%;
          min-height: 100svh;
          background: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 4rem;
        }
        .ma5-outro p {
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

        /* ── Mobile overrides ────────────────────────────────────────────── */
        @media (max-width: 720px) {
          .ma5-cols { padding: 1.5rem; }
          .ma5-thumb {
            width: 75px;
            height: 75px;
            opacity: 0.25;
            filter: saturate(0);
          }
          .ma5-text {
            width: 100%;
            left: 0;
            transform: translateY(-50%);
            padding: 0 24px;
          }
          .ma5-text p {
            font-size: 11px;
            text-align: left;
            letter-spacing: 0.06em;
          }
          .ma5-outro { padding: 3rem 1.5rem; }
          .ma5-outro p {
            font-size: 11px;
            letter-spacing: 0.06em;
            text-indent: 3rem;
          }
        }
      `}</style>

      {/* Spacer — single scroll driver for the whole sequence.
          Height overridden to exact px in useEffect (avoids svh mutation on mobile). */}
      <div ref={spacerRef} style={{ width: "100%", height: "400svh" }} />

      {/* Hero image — fullscreen fixed, scales to thumbnail then exits upward */}
      <div
        ref={imgRef}
        style={{
          position:      "fixed",
          inset:         0,
          zIndex:        3,
          pointerEvents: "none",
          willChange:    "transform",
        }}
      >
        <img
          src="/amnesia.png"
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      {/* Gallery columns — four-column parallax, clipped by overflow:hidden on parent */}
      <div ref={colsRef} className="ma5-cols">
        <div className="ma5-col" ref={col1Ref}>
          {COL1_IMGS.map((src, i) => (
            <div className="ma5-thumb" key={i}>
              <img src={src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
        <div className="ma5-col" ref={col2Ref}>
          {COL2_IMGS.map((src, i) => (
            <div className="ma5-thumb" key={i}>
              <img src={src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
        <div className="ma5-col" ref={col3Ref}>
          {COL3_IMGS.map((src, i) => (
            <div className="ma5-thumb" key={i}>
              <img src={src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
        <div className="ma5-col" ref={col4Ref}>
          {COL4_IMGS.map((src, i) => (
            <div className="ma5-thumb" key={i}>
              <img src={src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      {/* Alfredo's quote — fades in while image is still visible */}
      <div ref={textRef} className="ma5-text">
        <p>{ALFREDOS_QUOTE}</p>
      </div>

      {/* Video — starts as a clipped box at center, expands to full viewport */}
      <div
        ref={videoRef}
        style={{
          position:      "fixed",
          inset:         0,
          zIndex:        5,
          overflow:      "hidden",
          pointerEvents: "none",
          willChange:    "clip-path",
        }}
      >
        <video
          src="/video/Video MM Header.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      {/* Outro — white background scrolls up over all fixed layers */}
      <section className="ma5-outro">
        <p>{STATEMENT}</p>
      </section>
    </>
  );
}
