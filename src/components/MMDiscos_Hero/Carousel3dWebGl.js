"use client";

/**
 * CarouselStrip
 * ─────────────────────────────────────────────────────────────────────
 * Una cinta vertical centrada con las imágenes apiladas en columna.
 * El scroll mueve la columna con inercia (lerp) y un ligero stretch
 * en el eje Y proporcional a la velocidad, como una cinta física real.
 *
 * API imperativa (ref):
 *   ref.current.setProgress(0–1, instant?)
 *   ref.current.setVelocity(px/s)   ← opcional, refuerza el stretch
 *
 * Sin Three.js, sin shaders. Solo CSS + GSAP ticker.
 */

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import gsap from "gsap";

const LERP        = 0.072;   // 0 = máxima inercia, 1 = instantáneo
const MAX_STRETCH = 0.10;    // deformación máxima scaleY (±10 %)
const GAP         = 4;       // px entre imágenes

const Carousel3dWebGl = forwardRef(function Carousel3dWebGl({ images }, ref) {
  const containerRef = useRef(null);
  const columnRef    = useRef(null);
  const targetY      = useRef(0);
  const currentY     = useRef(0);

  // ── Calcula el Y objetivo para un progress dado ──────────────────
  const computeY = (progress) => {
    const c = containerRef.current;
    const col = columnRef.current;
    if (!c || !col) return 0;

    const containerH = c.offsetHeight;
    const imageH     = (col.offsetHeight - GAP * (images.length - 1)) / images.length;
    const step       = imageH + GAP;
    const activeCenter = progress * (images.length - 1) * step + imageH / 2;
    return containerH / 2 - activeCenter;
  };

  // ── API imperativa ───────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    setProgress(p, instant = false) {
      const ty = computeY(p);
      targetY.current = ty;
      if (instant) {
        currentY.current = ty;
        if (columnRef.current) {
          gsap.set(columnRef.current, { y: ty, scaleY: 1 });
        }
      }
    },
  }));

  // ── Ticker: lerp + stretch ───────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const col = columnRef.current;
      if (!col) return;

      const prev = currentY.current;
      const next = prev + (targetY.current - prev) * LERP;
      currentY.current = next;

      // El "tirón" entre donde está y donde va → stretch
      const delta   = targetY.current - next;
      const stretch = gsap.utils.clamp(-MAX_STRETCH, MAX_STRETCH, delta / 320);

      gsap.set(col, {
        y: next,
        scaleY: 1 + stretch,
        transformOrigin: "center center",
      });
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        // Fade suave en los extremos — la cinta "emerge" del vacío
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
      }}
    >
      {/* Columna de imágenes */}
      <div
        ref={columnRef}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: `${GAP}px`,
          willChange: "transform",
        }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                // Sin filtros — colores originales
              }}
            />
          </div>
        ))}
      </div>

      {/* Spotlight: oscurece sutilmente lo que no está en el centro */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 100% 22% at 50% 50%, transparent 0%, rgba(0,0,0,0.18) 100%)",
        }}
      />
    </div>
  );
});

export default Carousel3dWebGl;