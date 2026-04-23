"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ALFREDOS_QUOTE = `We played without rules, without thinking about styles or what would come next. One track could be slow, the next dark, then something pop or an impossible guitar, but it all made sense in that moment. The dancefloor didn't ask for coherence, it asked for emotion — and as long as people stayed there, smiling and lost, you knew you were doing it right.`;

const STATEMENT = `MM DISCOS IS A RECORD LABEL BASED BETWEEN BERLIN AND BARCELONA, FOUNDED AND POWERED BY MOON & MANN. FREE FROM STYLISTIC BOUNDARIES AND GENRE LIMITATIONS, THE LABEL HAS CONSISTENTLY CHAMPIONED A DISTINCTIVE SOUND WHERE MUSIC SPEAKS FOR ITSELF — DEEPLY INSPIRED BY THE SUEÑO IBICENCO AND THE SPIRIT OF THE MEDITERRANEAN.`;

export default function MMNewestMobAp() {
  const sceneRef    = useRef(null);
  const imgRef      = useRef(null);
  const textRef     = useRef(null);
  const videoRef    = useRef(null);

  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const img       = imgRef.current;
    const text      = textRef.current;
    const videoWrap = videoRef.current;
    const scene     = sceneRef.current;
    if (!img || !text || !videoWrap || !scene) return;

    // ── Final image size: 70vw square ─────────────────────────────────────
    // "no escale tanto" = keep it relatively large, 70vw is a light reduction
    const finalW  = Math.round(vw * 0.70);
    const finalH  = finalW; // square crop
    const finalScaleX = finalW / vw;
    const finalScaleY = finalH / vh;

    // ── Text: fixed at vh*0.48 — lower half, revealed as image exits ───────
    // textTop is where the quote lives inside the pinned scene
    const textTop = Math.round(vh * 0.48);

    // ── Alignment math: at 40% progress the image bottom edge sits 32px
    //    above the text.  Image center at that moment:
    //    center = textTop - 32 - finalH/2
    //    Image natural center = vh/2, so deltaY = center - vh/2 (negative)
    const alignCenterY = textTop - 32 - finalH / 2;
    const deltaY40     = alignCenterY - vh / 2;

    // ── Video: 32px below estimated text block, clamped inside viewport ────
    const approxTextH   = Math.round(vh * 0.27); // ~180px on 667px phone
    const videoInitSize = Math.round(vw * 0.26);  // ~100px on 375px phone
    const videoInitTop  = Math.min(
      textTop + approxTextH + 32,
      vh - videoInitSize - 16 // clamp so video never starts off-screen
    );
    const videoInitLeft = Math.round((vw - videoInitSize) / 2);

    // ── Initial GSAP states ────────────────────────────────────────────────
    gsap.set(img, { scaleX: 1, scaleY: 1, y: 0, transformOrigin: "center center" });
    gsap.set(text, { top: textTop, opacity: 0 });
    gsap.set(videoWrap, {
      top:     videoInitTop,
      left:    videoInitLeft,
      width:   videoInitSize,
      height:  videoInitSize,
      opacity: 0,
    });

    // ── Timeline: 100 units over 3×vh of scroll ────────────────────────────
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger:    scene,
          start:      "top top",
          end:        `+=${vh * 3}`,
          pin:        true,
          pinSpacing: true,
          scrub:      1,
        },
      });

      // Phase 1 (0–40): image scales down + travels up until it aligns with text
      // At t=40 the image bottom edge is exactly 32px above textTop
      tl.to(img, {
        scaleX:   finalScaleX,
        scaleY:   finalScaleY,
        y:        deltaY40,
        ease:     "power2.inOut",
        duration: 40,
      });

      // Phase 2 (40–68): image continues upward and exits through the top
      // Scale stays fixed; only y continues past alignment
      tl.to(img, {
        y:    -(vh + finalH),  // guarantees full exit (center is -vh, bottom is -vh+finalH/2 which is off-screen)
        ease: "none",
        duration: 28,
      });

      // Text fades in just before alignment so it's fully visible as image clears (30–42)
      tl.to(text, { opacity: 1, ease: "power2.out", duration: 10 }, 30);

      // Video fades in as image exits (44–54)
      tl.to(videoWrap, { opacity: 1, ease: "power2.out", duration: 10 }, 44);

      // Phase 3 (68–100): video expands from small box to full viewport
      tl.to(
        videoWrap,
        {
          top:    0,
          left:   0,
          width:  vw,
          height: vh,
          ease:   "power1.inOut",
          duration: 32,
        },
        68
      );
    }, scene);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <>
      <style>{`
        /* ── Pinned scene ── */
        .mmob-scene {
          position: relative;
          width: 100%;
          height: 100svh;
          overflow: hidden;
          background: #fff;
        }

        /* Image: starts fullscreen, z-index above text so it covers until it exits */
        .mmob-img {
          position: absolute;
          inset: 0;
          transform-origin: center center;
          will-change: transform;
          z-index: 3;
        }
        .mmob-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Quote: fixed position, revealed as image exits upward */
        .mmob-text {
          position: absolute;
          left: 24px;
          right: 24px;
          opacity: 0;
          pointer-events: none;
          z-index: 1;
        }
        .mmob-text p {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.06em;
          line-height: 1.65;
          text-transform: lowercase;
          color: #111;
          margin: 0;
        }

        /* Video: starts as small square, expands to fullscreen */
        .mmob-video-wrap {
          position: absolute;
          overflow: hidden;
          opacity: 0;
          will-change: width, height, top, left;
          z-index: 2;
        }
        .mmob-video-wrap video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Outro: own viewport, white bg sits above the fullscreen video */
        .mmob-outro {
          position: relative;
          z-index: 10;
          width: 100%;
          min-height: 100svh;
          background: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 3rem 1.5rem;
        }
        .mmob-outro p {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.12em;
          line-height: 1.55;
          text-transform: uppercase;
          text-align: justify;
          color: #111;
          margin: 0;
          text-indent: 3rem;
        }
      `}</style>

      {/* ── PINNED SCENE ── */}
      <section ref={sceneRef} className="mmob-scene">
        {/* Hero image — scales down + travels up, exits through top */}
        <div ref={imgRef} className="mmob-img">
          <img src="/amnesia.png" alt="" />
        </div>

        {/* Quote — revealed as image clears, top set by GSAP */}
        <div ref={textRef} className="mmob-text">
          <p>{ALFREDOS_QUOTE}</p>
        </div>

        {/* Video — small initially, expands to fullscreen */}
        <div ref={videoRef} className="mmob-video-wrap">
          <video
            src="/video/Video MM Header.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      </section>

      {/* ── OUTRO — white bg covers video ── */}
      <section className="mmob-outro">
        <p>{STATEMENT}</p>
      </section>
    </>
  );
}
