"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const GAP = "1.5em";

// 5 columnas — laterales: 5 imágenes cuadradas apiladas
//            — central:   img / video / img (sin tocar)
const COLS = [
  { type: "side", imgs: ["/img1.jpg",  "/img2.jpg",  "/img3.jpg",  "/img4.jpg",  "/img5.jpg"]  },
  { type: "side", imgs: ["/img6.jpg",  "/img7.jpg",  "/img8.jpg",  "/img9.jpg",  "/img10.jpg"] },
  { type: "center", rows: [["/img11.jpg"], [null], ["/img12.jpg"]] },
  { type: "side", imgs: ["/img13.jpg", "/img14.jpg", "/img15.jpg", "/img16.jpg", "/img1.jpg"]  },
  { type: "side", imgs: ["/img2.jpg",  "/img3.jpg",  "/img4.jpg",  "/img5.jpg",  "/img6.jpg"]  },
];

export default function ParallaxGallery2() {
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
        sides.forEach((col) => {
          if (col) col.style.transform = `translateY(${p * 300}px)`;
        });
        video.style.transform = `scale(${2 - p * 0.85})`;
      },
    });

    return () => { trigger.kill(); revealTrigger.kill(); };
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
                // Columna lateral — centra verticalmente el stack de 5 cuadrados
                <div
                  key={colIndex}
                  ref={(el) => { sideColRefs.current[si] = el; }}
                  style={S.sideCol}
                >
                  {col.imgs.map((src, i) => (
                    // Celda cuadrada: width = 100% de la col, height = mismo valor via aspectRatio
                    <div key={i} style={S.squareCell}>
                      <img
                        src={src}
                        alt=""
                        style={S.containImg}
                      />
                    </div>
                  ))}
                </div>
              );
            }

            // Columna central — igual que el original
            return (
              <div key={colIndex} style={S.centerCol}>
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
                              filter: "grayscale(100%)",
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
        style={{ width: "100vw", height: "600vh", pointerEvents: "none" }}
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
    backgroundColor: "#000",
    overflow: "hidden",
    zIndex: 0,
  },

  wrapper: {
    position: "absolute",
    top: "50%", left: "50%",
    transform: "translate(-50%, -50%) scale(1)",
    width: "160vw",
    height: "100vh",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",   // alinea verticalmente al centro las columnas laterales
    gap: GAP,
    willChange: "transform",
    overflow: "hidden",
  },

  // Lateral — no estira al alto, se centra; las celdas definen su propia altura
  sideCol: {
    flex: 0.5,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "center",  // stack centrado verticalmente
    gap: GAP,
    willChange: "transform",
    overflow: "hidden",
  },

  // Cuadrado: width = 100% de la columna, height = mismo valor
  squareCell: {
    width: "100%",
    aspectRatio: "1 / 1",
    flexShrink: 0,
    overflow: "hidden",
    backgroundColor: "#000",
  },

  // contain para portadas de vinilo — sin recortes
  containImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
    backgroundColor: "#000",
  },

  // Central — sigue ocupando el 100% del alto
  centerCol: {
    flex: "none",
    width: "28vw",
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