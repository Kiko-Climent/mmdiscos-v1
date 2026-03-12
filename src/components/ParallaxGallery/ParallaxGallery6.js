"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
  { speed: 0, rows: [
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

// En mobile solo usamos las columnas 1, 2 (central/video) y 3
// índices del array COLS: 1, 2, 3
const MOBILE_COL_INDICES = [1, 2, 3];

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

    const isMobile = () => window.innerWidth < 768;

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

    const trigger = ScrollTrigger.create({
      trigger: spacer,
      start: "top bottom",
      end:   "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        const p       = self.progress;
        const mobile  = isMobile();
        const maxScale = mobile ? 3 : 2.65;

        wrapper.style.transform = `translate(-50%, -50%) scale(${1 + p * maxScale})`;

        sides.forEach((col, i) => {
          if (!col) return;
          // En mobile los refs están mapeados a MOBILE_COL_INDICES
          const colData = mobile ? COLS[MOBILE_COL_INDICES[i]] : COLS[i];
          if (colData && colData.speed !== 0) {
            // Parallax más suave en mobile
            const speed = mobile ? colData.speed * 0.5 : colData.speed;
            col.style.transform = `translateY(${p * speed}px)`;
          }
        });

        // Video — en mobile escala más suave para no salirse
        const videoScale = mobile ? 1.5 - p * 0.4 : 2 - p * 0.85;
        video.style.transform = `scale(${videoScale})`;
      },
    });

    return () => {
      trigger.kill();
      revealTrigger.kill();
    };
  }, []);

  // ── Decide qué columnas renderizar ───────────────────────────────────────
  // Usamos CSS para ocultar las columnas exteriores en mobile — así
  // los refs siguen siendo los mismos y el useEffect no se complica.
  // Las columnas 0 y 4 tienen display:none en mobile vía className.

  return (
    <>
      <div ref={galleryRef} style={S.sticky}>
        <div
          ref={wrapperRef}
          style={S.wrapper}
          // En mobile: wrapper más estrecho para que las 3 cols llenen bien
          className="parallax-wrapper"
        >
          {COLS.map((col, colIndex) => {
            // En mobile ocultamos la primera y última columna
            const mobileHidden = colIndex === 0 || colIndex === 4;

            return (
              <div
                key={colIndex}
                ref={(el) => { sideColRefs.current[colIndex] = el; }}
                style={S.col}
                className={mobileHidden ? "mobile-hidden-col" : ""}
              >
                {col.rows.map((rowImgs, rowIndex) => {
                  const isVideoSlot = colIndex === 2 && rowIndex === 1;

                  return (
                    <div key={rowIndex} style={S.cell}>
                      {isVideoSlot ? (
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
            );
          })}
        </div>
      </div>

      {/* Gap y ancho del wrapper ajustados en mobile vía style tag */}
      <style>{`
        @media (max-width: 767px) {
          .mobile-hidden-col { display: none !important; }
          .parallax-wrapper  {
            width: 100vw !important;
            gap: 0.15em !important;
          }
          .parallax-wrapper > div {
            gap: 0.15em !important;
          }
        }
      `}</style>

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
    top: 0, left: 0,
    width: "100vw", height: "100vh",
    backgroundColor: "#fff",
    overflow: "hidden",
    zIndex: 0,
    clipPath: "inset(100% 0 0 0)",
  },
  wrapper: {
    position: "absolute",
    top: "50%", left: "50%",
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
  imgPair: {
    width: "100%", height: "100%",
    display: "flex", flexDirection: "row",
    gap: "0.15em",
  },
  imgHalf: {
    flex: 1, height: "100%",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  fillContain: {
    width: "100%", height: "100%",
    objectFit: "contain",
    display: "block",
    backgroundColor: "#fff",
  },
  fill: {
    width: "100%", height: "100%",
    objectFit: "cover",
    display: "block",
  },
};