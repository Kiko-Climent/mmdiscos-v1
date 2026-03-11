"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const COLS = [
  ["/img1.jpg",  "/img2.jpg",  "/img3.jpg"],
  ["/img4.jpg",  "/img5.jpg",  "/img6.jpg"],
  ["/img7.jpg",  null,         "/img9.jpg"],
  ["/img10.jpg", "/img11.jpg", "/img12.jpg"],
  ["/img1.jpg",  "/img2.jpg",  "/img3.jpg"],
];

export default function ParallaxGallery() {
  const wrapperRef   = useRef(null);
  const spacerRef    = useRef(null);
  const galleryRef  = useRef(null);
  const sideColRefs  = useRef([]);
  const mainVideoRef = useRef(null);

  useEffect(() => {
    const wrapper  = wrapperRef.current;
    const spacer   = spacerRef.current;
    const gallery = galleryRef.current;
    const video   = mainVideoRef.current;
    const sides   = sideColRefs.current;
    if (!wrapper || !spacer || !video) return;

    // Oculto hasta que el spacer entre — luego clip-path revela como cortina (top→bottom)
    const revealTrigger = ScrollTrigger.create({
      trigger: spacer,
      start: "top bottom",   // cuando el spacer empiece a entrar
      end: "top top",       // hasta que el spacer llegue arriba
      scrub: 1,
      onUpdate: (self) => {
        if (!gallery) return;
        const p = self.progress;
        // inset(top right bottom left) — de 100% a 0% en top = revelar de arriba
        gallery.style.clipPath = `inset(${(1 - p) * 100}% 0 0 0)`;
      },
    });

    const trigger = ScrollTrigger.create({
      trigger: spacer,
      start: "top bottom",   // animación arranca cuando el spacer entra por abajo
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        const maxScale = window.innerWidth < 900 ? 4 : 2.65;

        wrapper.style.transform =
          `translate(-50%, -50%) scale(${1 + p * maxScale})`;

        sides.forEach((col) => {
          if (col) col.style.transform = `translateY(${p * 300}px)`;
        });

        video.style.transform = `scale(${2 - p * 0.85})`;
      },
    });

    return () => {
      trigger.kill();
      revealTrigger.kill();
    };
  }, []);

  const sideRef = (el, colIndex) => {
    const sideMap = { 0: 0, 1: 1, 3: 2, 4: 3 };
    if (sideMap[colIndex] !== undefined) sideColRefs.current[sideMap[colIndex]] = el;
  };

  return (
    <>
      {/* Galería fija — clip-path la oculta hasta el scroll correcto, luego revela como cortina */}
      <div ref={galleryRef} style={{ ...stickyStyle, clipPath: "inset(100% 0 0 0)" }}>
        <div ref={wrapperRef} style={wrapperStyle}>
          {COLS.map((col, colIndex) => (
            <div
              key={colIndex}
              ref={(el) => sideRef(el, colIndex)}
              style={colStyle}
            >
              {col.map((src, rowIndex) => {
                const isMainSlot = colIndex === 2 && rowIndex === 1;
                return (
                  <div key={rowIndex} style={cellStyle}>
                    {isMainSlot ? (
                      <video
                        ref={mainVideoRef}
                        autoPlay muted loop playsInline
                        style={{
                          ...fillStyle,
                          transform: "scale(2)",
                          willChange: "transform",
                          transformOrigin: "center center",
                          filter: "grayscale(100%)",
                        }}
                      >
                        <source src="/video/Video MM Header.mp4" type="video/mp4" />
                      </video>
                    ) : (
                      <img src={src} alt="" style={fillStyle} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Spacer — da el recorrido al trigger */}
      <section
        ref={spacerRef}
        style={{
          width: "100vw",
          height: "300vh",
          pointerEvents: "none",
        }}
      />
    </>
      );
    }

    const stickyStyle = {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "#ffffff",
      overflow: "hidden",
      zIndex: 0,          // debajo del section blanco de MMHeroWithReleases (z:10)
    };

    const wrapperStyle = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%) scale(1)",
      width: "160vw",
      height: "100vh",
      display: "flex",
      gap: "4em",
      willChange: "transform",
    };

    const colStyle = {
      flex: 1,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "4em",
      willChange: "transform",
    };

    const cellStyle = {
      flex: 1,
      overflow: "hidden",
      backgroundColor: "#ffffff",
    };

    const fillStyle = {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    };