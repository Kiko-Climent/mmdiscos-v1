"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CENTER_W = "28vw";
const SIDE_W   = "14vw";
const GAP      = "0.8em";

const SIDE_COLS = [
  { imgs: ["/img1.jpg",  "/img2.jpg",  "/img3.jpg",  "/img4.jpg",  "/img5.jpg"] },
  { imgs: ["/statues.jpeg", "/Celex - cover.jpg", "/MMD040-2.png", "/img9.jpg", "/img10.jpg"] },
  { imgs: ["/MMD039_Artwork Promo Full.png", "/img2.jpg", "/morira - cover.png", "/img1.jpg", "/MMD039_Artwork Promo Full.png"] },
  { imgs: ["/statues.jpeg", "/img3.jpg", "/img4.jpg", "/img5.jpg", "/img6.jpg"] },
];

// negativo = sube, positivo = baja
const PARALLAX_SPEEDS = [-280, 180, -180, 280];

export default function ParallaxGallery4() {
  const wrapperRef      = useRef(null);
  const spacerRef       = useRef(null);
  const galleryRef      = useRef(null);
  const sideColRefs     = useRef([]);
  const centerTopRef    = useRef(null);
  const centerBottomRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const spacer  = spacerRef.current;
    const gallery = galleryRef.current;
    const sides   = sideColRefs.current;
    if (!wrapper || !spacer || !gallery) return;

    // GSAP gestiona el matrix completo — nunca mezclar con style.transform
    gsap.set(wrapper, { xPercent: -50, yPercent: -50, scale: 1 });

    // ── Reveal: galería entra desde abajo ──────────────────────────────
    const revealTrigger = ScrollTrigger.create({
      trigger: spacer,
      start: "top bottom",
      end:   "top top",
      scrub: 1,
      onUpdate: (self) => {
        gallery.style.clipPath = `inset(${(1 - self.progress) * 100}% 0 0 0)`;
      },
    });

    // ── Zoom + parallax ────────────────────────────────────────────────
    const mainTrigger = ScrollTrigger.create({
      trigger: spacer,
      start: "top bottom",
      end:   "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        const p        = self.progress;
        const maxScale = window.innerWidth < 900 ? 4 : 2.65;

        // Zoom del wrapper (grid entero)
        gsap.set(wrapper, { scale: 1 + p * maxScale });

        // Columnas laterales — parallax clásico
        sides.forEach((col, i) => {
          if (col) gsap.set(col, { y: p * PARALLAX_SPEEDS[i] });
        });

        // Imagen superior del centro → sale hacia arriba
        // Imagen inferior del centro → sale hacia abajo
        // El zoom ya las empuja bastante; el translateY extra
        // garantiza que estén fuera de pantalla antes de terminar
        if (centerTopRef.current) {
          gsap.set(centerTopRef.current,    { y: p * -250 });
        }
        if (centerBottomRef.current) {
          gsap.set(centerBottomRef.current, { y: p *  250 });
        }
      },
    });

    return () => {
      mainTrigger.kill();
      revealTrigger.kill();
    };
  }, []);

  return (
    <>
      <div ref={galleryRef} style={{ ...S.sticky, clipPath: "inset(100% 0 0 0)" }}>

        {/*
          ── Capa 1: Video ──────────────────────────────────────────────
          absolute + inset:0 + object-fit:cover = siempre 100vw×100vh.
          No depende de ningún scale. Resize gestionado por CSS.
          z-index: 0 (debajo del grid).
        */}
        <video
          autoPlay muted loop playsInline
          style={S.videoBg}
        >
          <source src="/video/Video MM Header.mp4" type="video/mp4" />
        </video>

        {/*
          ── Capa 2: Grid ───────────────────────────────────────────────
          Fondo transparente — el video se ve a través del hueco central.
          Solo las celdas con imagen tienen backgroundColor blanco.
          z-index: 1 (encima del video).
        */}
        <div ref={wrapperRef} style={S.wrapper}>

          {/* Columnas laterales izquierda */}
          {SIDE_COLS.slice(0, 2).map((col, i) => (
            <div
              key={i}
              ref={(el) => { sideColRefs.current[i] = el; }}
              style={S.sideCol}
            >
              {col.imgs.map((src, j) => (
                <div key={j} style={S.squareCell}>
                  {src && <img src={src} alt="" style={S.containImg} />}
                </div>
              ))}
            </div>
          ))}

          {/*
            ── Columna central ──────────────────────────────────────────
            3 filas: imagen arriba | hueco video | imagen abajo
            - flex:1 para imágenes → 25vh cada una
            - flex:2 para el hueco  → 50vh
            Al escalar 2.65×:
              imágenes top/bottom → centros a ±100vh del viewport → off screen ✓
              hueco → 50vh × 2.65 = 132vh → cubre el viewport en altura ✓
            El ancho del hueco: 28vw × 2.65 = 74vw (no cubre los 100vw
            pero los 13vw laterales son zonas sin grid → el video se ve) ✓
          */}
          <div style={S.centerCol}>

            {/* Imagen superior — sale hacia arriba con scroll */}
            <div ref={centerTopRef} style={S.centerImgCell}>
              <img src="/img4.jpg" alt="" style={S.fill} />
            </div>

            {/*
              Hueco transparente — el video de la Capa 1 se ve aquí.
              Sin backgroundColor, sin overflow:hidden.
            */}
            <div style={S.centerVideoSlot} />

            {/* Imagen inferior — sale hacia abajo con scroll */}
            <div ref={centerBottomRef} style={S.centerImgCell}>
              <img src="/img12.jpg" alt="" style={S.fill} />
            </div>

          </div>

          {/* Columnas laterales derecha */}
          {SIDE_COLS.slice(2).map((col, i) => (
            <div
              key={i + 2}
              ref={(el) => { sideColRefs.current[i + 2] = el; }}
              style={S.sideCol}
            >
              {col.imgs.map((src, j) => (
                <div key={j} style={S.squareCell}>
                  {src && <img src={src} alt="" style={S.containImg} />}
                </div>
              ))}
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
  // Contenedor fixed — crea stacking context propio
  sticky: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    overflow: "hidden",   // clips todo lo que salga del viewport
    zIndex: 0,
    // Sin backgroundColor: el video lo ocupa todo
  },

  // ── Video: ocupa el 100% del contenedor fixed siempre ──────────────
  videoBg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",   // CSS gestiona resize, sin ningún JS
    display: "block",
    zIndex: 0,
  },

  // ── Grid: encima del video ──────────────────────────────────────────
  wrapper: {
    position: "absolute",
    top: "50%",
    left: "50%",
    // transform gestionado 100% por GSAP (xPercent/yPercent/scale)
    width: `calc(${SIDE_W} * 4 + ${CENTER_W} + ${GAP} * 4)`,
    height: "100vh",
    display: "grid",
    gridTemplateColumns: `${SIDE_W} ${SIDE_W} ${CENTER_W} ${SIDE_W} ${SIDE_W}`,
    gap: GAP,
    alignItems: "center",
    willChange: "transform",
    overflow: "visible",
    zIndex: 1,
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
    backgroundColor: "#ffffff",   // fondo opaco — tapa el video
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
    // Sin overflow:hidden — las imágenes necesitan salir del viewport
  },

  // Imagen arriba / abajo del centro
  // flex:1 → 25vh (con flex:2 para el video slot)
  centerImgCell: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    backgroundColor: "#ffffff",   // fondo opaco — tapa el video
    willChange: "transform",
    flexShrink: 0,
  },

  // El hueco transparente donde se ve el video
  // flex:2 → 50vh; × 2.65 scale = 132vh → cubre el viewport ✓
  centerVideoSlot: {
    flex: 2,
    minHeight: 0,
    // Sin backgroundColor → transparente → video visible
    // Sin overflow:hidden
  },

  fill: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
};