"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Grid idéntico al original ─────────────────────────────────────────────
// 5 columnas flex, 3 filas — cada celda tiene 2 imágenes en lugar de 1
// El video ocupa la celda central [col2, row1] — igual que el original
// speed: píxeles de parallax (0 = columna central, no se mueve)

const COLS = [
  { speed:  300, rows: [
    ["/img1.jpg",  "/img2.jpg"],
    ["/img3.jpg",  "/img4.jpg"],
    ["/img5.jpg",  "/img1.jpg"],
  ]},
  { speed: -200, rows: [
    ["/statues.jpeg",    "/Celex - cover.jpg"],
    ["/MMD040-2.png",    "/img9.jpg"],
    ["/img10.jpg",       "/statues.jpeg"],
  ]},
  { speed: 0, rows: [          // columna central — no se mueve
    ["/img4.jpg",  "/img5.jpg"],
    null,                       // ← video slot
    ["/img12.jpg", "/img3.jpg"],
  ]},
  { speed:  200, rows: [
    ["/MMD039_Artwork Promo Full.png", "/img2.jpg"],
    ["/morira - cover.png",            "/img1.jpg"],
    ["/MMD039_Artwork Promo Full.png", "/img3.jpg"],
  ]},
  { speed: -300, rows: [
    ["/statues.jpeg", "/img3.jpg"],
    ["/img4.jpg",     "/img5.jpg"],
    ["/img6.jpg",     "/statues.jpeg"],
  ]},
];

export default function ParallaxGallery6() {
  const wrapperRef   = useRef(null);
  const spacerRef    = useRef(null);
  const galleryRef   = useRef(null);
  const sideColRefs  = useRef([]);
  const mainVideoRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const spacer  = spacerRef.current;
    const gallery = galleryRef.current;
    const video   = mainVideoRef.current;
    const sides   = sideColRefs.current;
    if (!wrapper || !spacer || !video) return;

    // ── Reveal — idéntico al original ─────────────────────────────────
    const revealTrigger = ScrollTrigger.create({
      trigger: spacer,
      start: "top bottom",
      end:   "top top",
      scrub: 1,
      onUpdate: (self) => {
        if (!gallery) return;
        gallery.style.clipPath = `inset(${(1 - self.progress) * 100}% 0 0 0)`;
      },
    });

    // ── Zoom + parallax — idéntico al original ────────────────────────
    const trigger = ScrollTrigger.create({
      trigger: spacer,
      start: "top bottom",
      end:   "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        const p        = self.progress;
        const maxScale = window.innerWidth < 900 ? 4 : 2.65;

        wrapper.style.transform = `translate(-50%, -50%) scale(${1 + p * maxScale})`;

        sides.forEach((col, i) => {
          if (col && COLS[i].speed !== 0) {
            col.style.transform = `translateY(${p * COLS[i].speed}px)`;
          }
        });

        video.style.transform = `scale(${2 - p * 0.85})`;
      },
    });

    return () => {
      trigger.kill();
      revealTrigger.kill();
    };
  }, []);

  return (
    <>
      <div ref={galleryRef} style={S.sticky}>
        <div ref={wrapperRef} style={S.wrapper}>

          {COLS.map((col, colIndex) => (
            <div
              key={colIndex}
              ref={(el) => { sideColRefs.current[colIndex] = el; }}
              style={S.col}
            >
              {col.rows.map((rowImgs, rowIndex) => {
                const isVideoSlot = colIndex === 2 && rowIndex === 1;

                return (
                  <div key={rowIndex} style={S.cell}>

                    {isVideoSlot ? (
                      // ── Video — igual que en el original ─────────────
                      <video
                        ref={mainVideoRef}
                        autoPlay muted loop playsInline
                        style={{
                          ...S.fill,
                          transform: "scale(2)",
                          willChange: "transform",
                          transformOrigin: "center center",
                        }}
                      >
                        <source src="/video/Video MM Header.mp4" type="video/mp4" />
                      </video>

                    ) : rowImgs ? (
                      // ── 2 imágenes lado a lado ────────────────────────
                      <div style={S.imgPair}>
                        {rowImgs.map((src, imgIdx) => (
                          <div key={imgIdx} style={S.imgHalf}>
                            {src && <img src={src} alt="" style={S.fillContain} />}
                          </div>
                        ))}
                      </div>

                    ) : null}

                  </div>
                );
              })}
            </div>
          ))}

        </div>
      </div>

      <section
        ref={spacerRef}
        style={{ width: "100vw", height: "300vh", pointerEvents: "none" }}
      />
    </>
  );
}

const S = {
  sticky: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "#fff",
    overflow: "hidden",
    zIndex: 0,
    clipPath: "inset(100% 0 0 0)",
  },

  // Idéntico al original — 160vw, flex, sin grid
  wrapper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) scale(1)",
    width: "160vw",
    height: "100vh",
    display: "flex",
    gap: "0.6em",
    willChange: "transform",
  },

  col: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "0.6em",
    willChange: "transform",
  },

  cell: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#fff",
  },

  // 2 imágenes en fila dentro de cada celda
  imgPair: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "row",
    gap: "0.3em",
  },

  imgHalf: {
    flex: 1,
    height: "100%",
    overflow: "hidden",
    backgroundColor: "#fff",
  },

  // objectFit: contain para imágenes — no se cortan
  fillContain: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
    backgroundColor: "#fff",
  },

  // objectFit: cover solo para el video
  fill: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
};