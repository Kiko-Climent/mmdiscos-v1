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

export default function MMNewestAproach() {
  const cleanupRef = useRef(null);
  const aboutHeaderRef = useRef(null);

  useEffect(() => {
    let gsap, ScrollTrigger, SplitText, Lenis;

    async function init() {
      const gsapMod = await import("gsap");
      const { ScrollTrigger: ST } = await import("gsap/ScrollTrigger");
      const { SplitText: SPT } = await import("gsap/SplitText");
      const LenisMod = await import("lenis");

      gsap = gsapMod.gsap ?? gsapMod.default;
      ScrollTrigger = ST;
      SplitText = SPT;
      Lenis = LenisMod.default ?? LenisMod.Lenis;

      gsap.registerPlugin(ScrollTrigger, SplitText);

      // ── Lenis ────────────────────────────────────────────────────────────
      const lenis = new Lenis();
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      // ── SplitText ────────────────────────────────────────────────────────
      const heroCopySplit = SplitText.create(".mm-hero-copy h3", {
        type: "words",
        wordsClass: "mm-word",
      });

      let isHeroCopyHidden = false;
      const heroImgEl = document.querySelector(".mm-hero-img");

      // ── Hero pin + animations ────────────────────────────────────────────
      ScrollTrigger.create({
        trigger: ".mm-hero",
        start: "top top",
        end: `+=${window.innerHeight * 3.5}px`,
        pin: true,
        pinSpacing: false,
        scrub: 1,
        onUpdate(self) {
          const p = self.progress;

          const headerP = Math.min(p / 0.29, 1);
          gsap.set(".mm-hero-header", { yPercent: -headerP * 100 });

          const wordsP = Math.max(0, Math.min((p - 0.29) / 0.21, 1));
          const total = heroCopySplit.words.length;
          heroCopySplit.words.forEach((word, i) => {
            const wStart = i / total;
            const wEnd = (i + 1) / total;
            const opacity = Math.max(
              0,
              Math.min((wordsP - wStart) / (wEnd - wStart), 1)
            );
            gsap.set(word, { opacity });
          });

          if (p > 0.64 && !isHeroCopyHidden) {
            isHeroCopyHidden = true;
            gsap.to(".mm-hero-copy h3", { opacity: 0, duration: 0.2 });
          } else if (p <= 0.64 && isHeroCopyHidden) {
            isHeroCopyHidden = false;
            gsap.to(".mm-hero-copy h3", { opacity: 1, duration: 0.2 });
          }

          const imgP = Math.max(0, Math.min((p - 0.71) / 0.29, 1));
          const targetSize = 150;
          const scaleX = gsap.utils.interpolate(1, targetSize / window.innerWidth, imgP);
          const scaleY = gsap.utils.interpolate(1, targetSize / window.innerHeight, imgP);
          gsap.set(heroImgEl, { scaleX, scaleY });
        },
      });

      // ── About columns parallax ───────────────────────────────────────────
      // El about-section ahora tiene pin de 2×vh extra, así que el recorrido
      // de las columnas debe extenderse para cubrir todo ese scroll adicional.
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
      // El video vive dentro de .mm-about con position:absolute.
      // Medimos la posición del about-header para colocar el video justo debajo,
      // luego pineamos el about y escalamos el video a pantalla completa.
      const secondVideoWrap = document.querySelector(".mm-second-video-wrap");
      const aboutHeaderEl = aboutHeaderRef.current;
      const aboutSectionEl = document.querySelector(".mm-about");

      const aboutRect = aboutSectionEl.getBoundingClientRect();
      const headerRect = aboutHeaderEl.getBoundingClientRect();

      // Borde inferior del texto relativo al top de la sección about
      const headerBottomInSection = headerRect.bottom - aboutRect.top;
      // Left inicial: centrado (sin xPercent para evitar conflictos al animar)
      const videoInitialLeft = aboutRect.width / 2 - 75; // 75 = 150 / 2

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
        .mm-word { opacity: 0; }

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
        .mm-hero-header,
        .mm-hero-copy {
          position: absolute;
          inset: 0;
          padding: 4rem;
          color: #fff;
          display: flex;
          align-items: flex-end;
          will-change: transform, opacity;
          pointer-events: none;
        }

        /* ── About ── */
        .mm-about {
          position: relative;
          width: 100%;
          height: 100svh;
          margin-top: 275svh;
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

        /* Texto central de about — igual que antes */
        .mm-about-header {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40%;
          text-align: center;
          pointer-events: none;
        }

        /* ── Segundo vídeo ──
           Vive dentro de .mm-about con position:absolute.
           GSAP lo coloca debajo del about-header y lo escala a fullscreen.
        */
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
          background-color: #cecec6;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 4rem;
        }

        /* ── Typography ── */
        .mm-hero h1,
        .mm-hero h3,
        .mm-about h3,
        .mm-outro p {
          font-weight: 400;
          letter-spacing: -0.05rem;
          line-height: 1.15;
        }
        .mm-hero h1 { font-size: clamp(2rem, 5vw, 5rem); }
        .mm-hero h3 { font-size: clamp(1.4rem, 3vw, 3rem); }
        .mm-about h3 { font-size: clamp(1.4rem, 2.5vw, 3rem); }
        .mm-outro p { font-size: clamp(0.85rem, 1.2vw, 1.1rem); line-height: 1.7; max-width: 60ch; }
        .mm-hero-header h1 { width: 75%; }
        .mm-hero-copy h3 { width: 50%; }

        @media (max-width: 1000px) {
          .mm-hero-header, .mm-hero-copy { padding: 2rem; }
          .mm-hero-header h1, .mm-hero-copy h3 { width: 100%; }
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
          <video
            src="/video/MM Hero BG_1.mp4"
            autoPlay muted loop playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
        <div className="mm-hero-header">
          <h1>A study of motion unfolding inside a single frame</h1>
        </div>
        <div className="mm-hero-copy">
          <h3>{ARTISTS}</h3>
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

        {/* ── SEGUNDO VÍDEO ── position:absolute dentro del about, GSAP lo ubica bajo el header */}
        <div className="mm-second-video-wrap">
          <video
            src="/video/Video MM Header.mp4"
            autoPlay muted loop playsInline
          />
        </div>
      </section>

      {/* ── OUTRO ── */}
      <section className="mm-outro">
        <p>{ARTISTS}</p>
      </section>
    </>
  );
}