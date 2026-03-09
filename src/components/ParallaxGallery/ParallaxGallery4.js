"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Ajusta solo estos valores
const CENTER_W  = "28vw";   // ancho columna central
const SIDE_W    = "14vw";   // ancho columnas laterales
const GAP       = "0.8em";
const COLS = [
  { type: "side", imgs: ["/img1.jpg",  "/img2.jpg",  "/img3.jpg",  "/img4.jpg",  "/img5.jpg"]  },
  { type: "side", imgs: ["/statues.jpeg",  "/Celex - cover.jpg",  "/MMD040-2.png",  "/img9.jpg",  "/img10.jpg"] },
  { type: "center", rows: [["/img4.jpg"], [null], ["/img12.jpg"]] },
  { type: "side", imgs: ["/MMD039_Artwork Promo Full.png", "/MMD039_Artwork Promo Full.png", , "/img2.jpg","/morira - cover.png", "/img1.jpg"]  },
  { type: "side", imgs: ["/statues.jpeg",  "/img3.jpg",  "/img4.jpg",  "/img5.jpg",  "/img6.jpg"]  },
];

export default function ParallaxGallery4() {
  const wrapperRef   = useRef(null);
  const spacerRef    = useRef(null);
  const galleryRef   = useRef(null);
  const sideColRefs  = useRef([]);
  const mainVideoRef = useRef(null);
  const centerColRef  = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const spacer  = spacerRef.current;
    const gallery = galleryRef.current;
    const video   = mainVideoRef.current;
    const sides   = sideColRefs.current;
    if (!wrapper || !spacer || !video) return;

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
        const p        = self.progress;
        const maxScale = window.innerWidth < 900 ? 4 : 2.65;
        wrapper.style.transform = `translate(-50%, -50%) scale(${1 + p * maxScale})`;

        // Cada columna lateral se mueve a distinta velocidad y dirección
        // índices: 0=izq exterior, 1=izq interior, 2=der interior, 3=der exterior
        const parallax = [
          `translateY(${-p * 280}px)`,   // izq exterior — sube rápido
          `translateY(${p  * 180}px)`,   // izq interior — baja lento
          `translateY(${-p * 180}px)`,   // der interior — sube lento
          `translateY(${p  * 280}px)`,   // der exterior — baja rápido
        ];
        sides.forEach((col, i) => {
          if (col) col.style.transform = parallax[i];
        });

        video.style.transform = `scale(${2 - p * 0.85})`;
      },
    });

    // Centra la columna central verticalmente en el viewport
    // independientemente del tamaño de pantalla
    const centerCol = centerColRef.current;
    const alignCenter = () => {
      if (!centerCol) return;
      const colRect  = centerCol.getBoundingClientRect();
      const colCenterY = colRect.top + colRect.height / 2;
      const vpCenterY  = window.innerHeight / 2;
      const offset     = vpCenterY - colCenterY - 100;
      centerCol.style.marginTop = `${offset}px`;
    };

    alignCenter();
    window.addEventListener("resize", alignCenter);

    return () => {
      trigger.kill();
      revealTrigger.kill();
      window.removeEventListener("resize", alignCenter);
    };
  }, []);

  let sideIdx = 0;

  return (
    <>
      <div ref={galleryRef} style={{ ...S.sticky, clipPath: "inset(100% 0 0 0)" }}>
        <div ref={wrapperRef} style={S.wrapper}>

          {COLS.map((col, colIndex) => {
            const isCenter = col.type === "center";
            const si = !isCenter ? sideIdx++ : null;

            if (!isCenter) {
              return (
                <div
                  key={colIndex}
                  ref={(el) => { sideColRefs.current[si] = el; }}
                  style={S.sideCol}
                >
                  {col.imgs.map((src, i) => (
                    <div key={i} style={S.squareCell}>
                      <img src={src} alt="" style={S.containImg} />
                    </div>
                  ))}
                </div>
              );
            }

            return (
              <div key={colIndex} ref={centerColRef} style={S.centerCol}>
                {col.rows.map((row, rowIndex) => {
                  const isVideoSlot = rowIndex === 1;
                  return (
                    <div key={rowIndex} style={S.centerRow}>
                      {isVideoSlot ? (
                        <div style={S.centerCell}>
                          <video
                            ref={mainVideoRef}
                            autoPlay muted loop playsInline
                            style={{
                              ...S.fill,
                              transform: "scale(2)",
                              willChange: "transform",
                              transformOrigin: "center center",
                            //   filter: "grayscale(100%)",
                            }}
                          >
                            <source src="/video/Video MM Header.mp4" type="video/mp4" />
                          </video>
                        </div>
                      ) : (
                        row.map((src, i) => (
                          <div key={i} style={S.centerCell}>
                            {src && <img src={src} alt="" style={S.fill} />}
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

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
    top: 0, left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "#ffffff",
    overflow: "hidden",
    zIndex: 0,
  },

  wrapper: {
    position: "absolute",
    top: "50%", left: "50%",
    transform: "translate(-50%, -50%) scale(1)",
    width: `calc(${SIDE_W} * 4 + ${CENTER_W} + ${GAP} * 4)`,
    height: "100vh",
    display: "grid",
    gridTemplateColumns: `${SIDE_W} ${SIDE_W} ${CENTER_W} ${SIDE_W} ${SIDE_W}`,
    gap: GAP,
    alignItems: "center",
    willChange: "transform",
    overflow: "visible",
  },

  sideCol: {
    display: "flex",
    flexDirection: "column",
    gap: GAP,
    willChange: "transform",
  },

  squareCell: {
    width: "100%",
    aspectRatio: "1 / 1",
    flexShrink: 0,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },

  containImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
    backgroundColor: "#ffffff",
  },

  centerCol: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: GAP,
    overflow: "hidden",
  },

  centerRow: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    overflow: "hidden",
  },

  centerCell: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },

  fill: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
};