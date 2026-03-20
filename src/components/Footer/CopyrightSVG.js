"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

/**
 * CopyrightSVG
 * Wrapper para /svg/MM Discos©2026.svg con efecto de revelación orgánica
 * inspirado en bassbcn — feTurbulence + feDisplacementMap animando un mask
 * que se revela irregularmente desde los bordes hacia el interior.
 *
 * Expone: reveal() y hide() via ref para que AboutSection los llame
 * cuando el footer debe aparecer/desaparecer.
 */
const CopyrightSVG = forwardRef(function CopyrightSVG(_, ref) {
  const containerRef = useRef(null);
  const turbRef      = useRef(null);
  const feDispRef    = useRef(null);
  const rectRef      = useRef(null); // el rect del mask que se expande
  const rafRef       = useRef(null);
  const stateRef     = useRef("hidden"); // "hidden" | "revealing" | "visible" | "hiding"

  // ── Animación de turbulencia viva (siempre corriendo) ─────────────────
  useEffect(() => {
    let t = 0;
    const tick = () => {
      t += 0.0022;
      if (turbRef.current) {
        const bfX = 0.008 + Math.sin(t * 0.6)  * 0.004;
        const bfY = 0.013 + Math.cos(t * 0.45) * 0.005;
        turbRef.current.setAttribute("baseFrequency", `${bfX.toFixed(5)} ${bfY.toFixed(5)}`);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── reveal / hide imperative API ──────────────────────────────────────
  useImperativeHandle(ref, () => ({
    reveal: (duration = 1.8) => {
      if (stateRef.current === "visible" || stateRef.current === "revealing") return;
      stateRef.current = "revealing";
      animateMask(0, 1, duration, () => { stateRef.current = "visible"; });
      animateDisplace(120, 0, duration);
      animateOpacity(0, 1, duration * 0.6);
    },
    hide: (duration = 0.7) => {
      if (stateRef.current === "hidden" || stateRef.current === "hiding") return;
      stateRef.current = "hiding";
      animateMask(1, 0, duration, () => { stateRef.current = "hidden"; });
      animateDisplace(0, 80, duration);
      animateOpacity(1, 0, duration * 0.8);
    },
    // estado visible inmediato (sin animación) para sincronizar con GSAP
    setVisible: () => {
      stateRef.current = "visible";
      if (containerRef.current) containerRef.current.style.opacity = "1";
      if (feDispRef.current)    feDispRef.current.setAttribute("scale", "0");
      setMaskProgress(1);
    },
    setHidden: () => {
      stateRef.current = "hidden";
      if (containerRef.current) containerRef.current.style.opacity = "0";
      if (feDispRef.current)    feDispRef.current.setAttribute("scale", "120");
      setMaskProgress(0);
    },
  }), []);

  // ── Helpers de animación manual (sin dep de gsap aquí) ───────────────
  const setMaskProgress = (p) => {
    // El mask es un gradiente radial que va del centro hacia los bordes
    // p=0 → todo oculto, p=1 → todo visible
    // Usamos un rect SVG con clip animado via transform scale
    if (rectRef.current) {
      // scale desde 0 hasta 1 con transform-origin center
      rectRef.current.setAttribute(
        "transform",
        `translate(500 80) scale(${p}) translate(-500 -80)`
      );
    }
  };

  const animateMask = (from, to, duration, onDone) => {
    const start = performance.now();
    const dur   = duration * 1000;
    const tick  = (now) => {
      let t = Math.min((now - start) / dur, 1);
      // easeInOutQuart para la revelación orgánica
      t = t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
      setMaskProgress(from + (to - from) * t);
      if (t < 1) requestAnimationFrame(tick);
      else onDone?.();
    };
    requestAnimationFrame(tick);
  };

  const animateDisplace = (from, to, duration) => {
    const start = performance.now();
    const dur   = duration * 1000;
    const tick  = (now) => {
      let t = Math.min((now - start) / dur, 1);
      // ease out expo
      t = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const val = from + (to - from) * t;
      if (feDispRef.current) feDispRef.current.setAttribute("scale", val.toFixed(2));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const animateOpacity = (from, to, duration) => {
    const el    = containerRef.current;
    if (!el) return;
    const start = performance.now();
    const dur   = duration * 1000;
    const tick  = (now) => {
      let t = Math.min((now - start) / dur, 1);
      t = 1 - Math.pow(1 - t, 3); // ease out cubic
      el.style.opacity = (from + (to - from) * t).toFixed(4);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", opacity: 0, willChange: "opacity" }}
    >
      {/* SVG filter definitions */}
      <svg
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        aria-hidden="true"
      >
        <defs>
          {/* Mask con forma orgánica animada */}
          <mask id="organic-reveal-mask">
            {/* Base rect blanco = visible */}
            <rect width="1000" height="160" fill="white" />
            {/* Rect negro animado que tapa — se escala desde el centro */}
            <rect
              ref={rectRef}
              x="-500" y="-80"
              width="1000" height="160"
              fill="black"
              transform="translate(500 80) scale(1) translate(-500 -80)"
            />
          </mask>

          <filter
            id="organic-reveal"
            x="-5%"  y="-20%"
            width="110%" height="140%"
            colorInterpolationFilters="sRGB"
          >
            {/* Ruido Perlin vivo */}
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.008 0.013"
              numOctaves="3"
              seed="8"
              result="noise"
            />
            {/* Desplazamiento que distorsiona los bordes de la imagen */}
            <feDisplacementMap
              ref={feDispRef}
              in="SourceGraphic"
              in2="noise"
              scale="120"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            {/* Blur muy suave para suavizar los bordes orgánicos */}
            <feGaussianBlur
              in="displaced"
              stdDeviation="0.8"
            />
          </filter>
        </defs>
      </svg>

      {/* El SVG con el filtro aplicado */}
      <img
        src="/svg/MM Discos©2026.svg"
        alt="MM Discos © 2026"
        draggable={false}
        style={{
          width:    "100%",
          height:   "auto",
          display:  "block",
          filter:   "url(#organic-reveal)",
          // El mask recorta de forma orgánica
          WebkitMaskImage: "none", // fallback
        }}
      />
    </div>
  );
});

export default CopyrightSVG;