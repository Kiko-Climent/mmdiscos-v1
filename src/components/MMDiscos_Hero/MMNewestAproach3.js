"use client";

import { useEffect, useRef } from "react";

const COL1_IMGS = [
  "/Celex - cover.jpg",
  "/corben_peachland_cover.jpg",
  "/Daichi - cover.jpg",
  "/Factory Edits - cover.jpg",
];
const COL2_IMGS = ["/img1.jpg", "/img2.jpg", "/img3.jpg", "/img4.jpg"];
const COL3_IMGS = ["/img5.jpg", "/MMD039.png", "/MMD040_Cover-1.jpg", "/MMD040-2.png"];
const COL4_IMGS = ["/morira - cover.png", "/statues.jpeg", "/img9.jpg", "/img3.jpg"];

const ARTISTS = `Asa Tate, Daichi, Nic Jalusi, Pleasure Voyage, Mogwaa, Statues, Mori Ra,
Longhair, Kross Section, Komodo, Marvin & Guy, Distance, Guillaume,
Pontcho, Saturn, Komodo, Corben, Bonnie & Klein, Celex, Florin Büchel,
NairLess, Hal Incandenza, Volta Cab, Coyote, Marcello Giordani, Albion,
Serasso, Atlantic Brain, Jaisiel, Trepanado, Ruf Dug, Chida, Franz Scala,
Sankt Göran, The.Deal, A Beat Disciple, Jakob Mäder, Da Silva`;

const STATEMENT = `MM DISCOS IS A RECORD LABEL BASED BETWEEN BERLIN AND BARCELONA, 
FOUNDED AND POWERED BY MOON & MANN. FREE FROM STYLISTIC BOUNDARIES AND GENRE LIMITATIONS, 
THE LABEL HAS CONSISTENTLY CHAMPIONED A DISTINCTIVE SOUND WHERE MUSIC SPEAKS FOR ITSELF — DEEPLY INSPIRED BY THE SUEÑO IBICENCO AND THE SPIRIT OF THE MEDITERRANEAN.`;

export default function MMNewestAproach3() {
  const cleanupRef = useRef(null);
  const aboutHeaderRef = useRef(null);

  useEffect(() => {
    let gsap, ScrollTrigger, Lenis;

    async function init() {
      const gsapMod = await import("gsap");
      const { ScrollTrigger: ST } = await import("gsap/ScrollTrigger");
      const LenisMod = await import("lenis");

      gsap = gsapMod.gsap ?? gsapMod.default;
      ScrollTrigger = ST;
      Lenis = LenisMod.default ?? LenisMod.Lenis;

      gsap.registerPlugin(ScrollTrigger);

      // ── Lenis ────────────────────────────────────────────────────────────
      const lenis = new Lenis();
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      const heroImgEl = document.querySelector(".mm-hero-img");

      // ── Hero pin: imagen escala hacia abajo desde el primer scroll ───────
      // Pin de 1.5 screens — suficiente para un scale-down cinematico.
      // pinSpacing: false para que la sección about controle su propio offset.
      ScrollTrigger.create({
        trigger: ".mm-hero",
        start: "top top",
        end: `+=${window.innerHeight * 1.5}`,
        pin: true,
        pinSpacing: false,
        scrub: 1,
        onUpdate(self) {
          const p = self.progress;
          const targetSize = 150;
          const scaleX = gsap.utils.interpolate(1, targetSize / window.innerWidth, p);
          const scaleY = gsap.utils.interpolate(1, targetSize / window.innerHeight, p);
          gsap.set(heroImgEl, { scaleX, scaleY });
        },
      });

      // ── About columns parallax ───────────────────────────────────────────
      const aboutCols = [
        { selector: "#mm-col-1", y: -1400 },
        { selector: "#mm-col-2", y: -700 },
        { selector: "#mm-col-3", y: -700 },
        { selector: "#mm-col-4", y: -1400 },
      ];
      aboutCols.forEach(({ selector, y }) => {
        gsap.to(selector, {
          y,
          scrollTrigger: {
            trigger: ".mm-about",
            start: "top bottom",
            end: `+=${window.innerHeight * 4}`,
            scrub: true,
          },
        });
      });

      // ── Second video: debajo del about-header → full viewport ───────────
      const secondVideoWrap = document.querySelector(".mm-second-video-wrap");
      const aboutHeaderEl = aboutHeaderRef.current;
      const aboutSectionEl = document.querySelector(".mm-about");

      gsap.set(aboutHeaderEl, { xPercent: -50, yPercent: -50 });

      const aboutRect = aboutSectionEl.getBoundingClientRect();
      const headerRect = aboutHeaderEl.getBoundingClientRect();

      const headerBottomInSection = headerRect.bottom - aboutRect.top;
      const videoInitialLeft = aboutRect.width / 2 - 75;
      const videoInitialTop = headerBottomInSection + 55;

      gsap.set(secondVideoWrap, {
        top: videoInitialTop,
        left: videoInitialLeft,
        width: 150,
        height: 150,
      });

      gsap.fromTo(
        secondVideoWrap,
        {
          width: 150,
          height: 150,
          top: videoInitialTop,
          left: videoInitialLeft,
        },
        {
          width: window.innerWidth,
          height: window.innerHeight,
          top: 0,
          left: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ".mm-about",
            start: "top top",
            end: `+=${window.innerHeight * 2}`,
            pin: true,
            pinSpacing: true,
            scrub: 1,
          },
        }
      );

      // ── About header: viaja hacia arriba mientras el segundo video se expande ──
      gsap.to(aboutHeaderEl, {
        y: -window.innerHeight * 1.2,
        ease: "none",
        scrollTrigger: {
          trigger: ".mm-about",
          start: "top top",
          end: `+=${window.innerHeight * 1.2}`,
          scrub: 1,
        },
      });

      cleanupRef.current = () => {
        lenis.destroy();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    }

    init();
    return () => cleanupRef.current?.();
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
        #mm-col-1 { transform: translateY(1000px); }
        #mm-col-2 { transform: translate(-225px, 500px); }
        #mm-col-3 { transform: translate(225px, 500px); }
        #mm-col-4 { transform: translateY(1000px); }

        .mm-about-header {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 40%;
          text-align: center;
          pointer-events: none;
        }

        /* ── Segundo vídeo ── */
        .mm-second-video-wrap {
          position: absolute;
          overflow: hidden;
          will-change: width, height, top, left;
          z-index: 2;
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
          text-transform: lowercase;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: left;
          text-indent: 6rem;
          padding: 4rem;
        }

        /* ── Typography ── */
        .mm-about h3,
        .mm-outro p {
          font-weight: 400;
          letter-spacing: -0.05rem;
          line-height: 1.15;
        }
        .mm-about h3 { font-size: clamp(0.85rem, 1.2vw, 1.1rem); line-height: 1.7; max-width: 60ch; }
        .mm-outro p  { font-size: clamp(0.85rem, 1.2vw, 1.1rem); line-height: 1.7; max-width: 60ch; }

        @media (max-width: 1000px) {
          .mm-about-header { width: 100%; padding: 2rem; }
          .mm-about-imgs { padding: 2rem; }
          .mm-img-thumb { width: 75px; height: 75px; opacity: 0.25; filter: saturate(0); }
          #mm-col-2 { transform: translateY(500px); }
          #mm-col-3 { transform: translateY(500px); }
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
          <p>{ARTISTS}</p>
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
