"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const GAP = "1em";
const GAP_MOBILE = "0.4em"; // ← añadir esta línea

// 5 columnas — laterales: 5 imágenes cuadradas apiladas
//            — central:   img / video / img (sin tocar)
const COLS = [
  { type: "side", imgs: ["/img1.jpg",  "/img2.jpg",  "/img3.jpg",  "/img4.jpg",  "/img5.jpg"]  },
  { type: "side", imgs: ["/Factory Edits - cover.jpg",  "/img4.jpg",  "/img3.jpg",  "/img9.jpg",  "/img10.jpg"] },
  { type: "center", rows: [["/MMD040_Cover-1.jpg"], [null], ["/statues.jpeg"]] },
  { type: "side", imgs: ["/morira - cover.png", "/Celex - cover.jpg", "/MMD040-2.png", "/MMD038.png", "/img1.jpg"]  },
  { type: "side", imgs: ["/img2.jpg",  "/img3.jpg",  "/img4.jpg",  "/img5.jpg",  "/img12.jpg"]  },
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

    const isMobile = () => window.innerWidth < 768;

    // Debounce: la barra del navegador móvil dispara "resize" en cada scroll.
    // Sin debounce, ScrollTrigger.refresh() bloquearía el main thread mid-scroll.
    let resizeTimer;
    const refreshAll = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
    };

    const revealTrigger = ScrollTrigger.create({
      trigger: spacer,
      // Móvil: retrasamos el inicio al 80% del viewport para evitar que el reveal
      // solape con la quote section del hero (que termina justo antes del spacer).
      start: () => (isMobile() ? "top 80%" : "top bottom"),
      end: () => (isMobile() ? "top 15%" : "top top"),
      scrub: 1,
      invalidateOnRefresh: true,
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
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p        = self.progress;
        const mobile   = isMobile();
        const maxScale = mobile ? 4 : 2.65;
        const parallax = mobile ? 180 : 300;

        wrapper.style.transform = `translate(-50%, -50%) scale(${1 + p * maxScale})`;
        sides.forEach((col) => {
          if (col) col.style.transform = `translateY(${p * parallax}px)`;
        });
        video.style.transform = `scale(${2 - p * 0.85})`;
      },
    });

    window.addEventListener("resize", refreshAll);
    refreshAll();

    return () => {
      window.removeEventListener("resize", refreshAll);
      clearTimeout(resizeTimer);
      trigger.kill();
      revealTrigger.kill();
    };
  }, []);

  let sideIdx = 0;

  return (
    <>
      <style>{`
        .pg2-scroll-spacer {
          /* svh = small viewport height (con barra visible) → estable, no cambia al ocultarse la barra */
          height: 300svh;
        }
        @media (max-width: 767px) {
          .pg2-scroll-spacer {
            height: 140svh;
          }
          .pg2-wrapper {
            gap: ${GAP_MOBILE} !important;
            width: 200vw !important;
          }
          .pg2-side-col {
            gap: ${GAP_MOBILE} !important;
            flex: 0.35 !important;
          }
          .pg2-center-col {
            width: 36vw !important;
            gap: ${GAP_MOBILE} !important;
          }
        }
      `}</style>

      <div ref={galleryRef} style={{ ...S.sticky, clipPath: "inset(100% 0 0 0)" }}>
        <div ref={wrapperRef} style={S.wrapper} className="pg2-wrapper">
          {COLS.map((col, colIndex) => {
            const isCenter = col.type === "center";
            const si = !isCenter ? sideIdx++ : null;

            if (!isCenter) {
              return (
                <div
                  key={colIndex}
                  ref={(el) => { sideColRefs.current[si] = el; }}
                  style={S.sideCol}
                  className="pg2-side-col"
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
              <div key={colIndex} style={S.centerCol} className="pg2-center-col">
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
        className="pg2-scroll-spacer"
        style={{ width: "100vw", pointerEvents: "none" }}
      />
    </>
  );
}

const S = {
  sticky: {
    position: "fixed",
    // inset:0 → siempre cubre el viewport visible sea cual sea el tamaño de la barra del navegador.
    // Evita el parpadeo/resize que causaba height:"100vh" cuando la barra se oculta/aparece.
    inset: 0,
    backgroundColor: "#fff",
    overflow: "hidden",
    zIndex: 0,
  },
  wrapper: {
    position: "absolute",
    top: "50%", left: "50%",
    transform: "translate(-50%, -50%) scale(1)",
    width: "160vw",
    height: "100%",   // relativo al padre (sticky), que usa inset:0
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: GAP,
    willChange: "transform",
    overflow: "hidden",
  },
  sideCol: {
    flex: 0.5,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "center",
    gap: GAP,
    willChange: "transform",
    overflow: "hidden",
  },
  squareCell: {
    width: "100%",
    aspectRatio: "1 / 1",
    flexShrink: 0,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  containImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
    backgroundColor: "#fff",
  },
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