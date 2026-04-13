"use client";

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import gsap from "gsap";

const NavPills3 = forwardRef(({ visible, logoRef, onReleasesClick, onStatementClick }, ref) => {
  const releasesRef       = useRef(null);
  const statementRef      = useRef(null);
  const releasesWhiteRef  = useRef(null);
  const statementWhiteRef = useRef(null);
  const rafRef            = useRef(null);

  // ── Expone updateCurtain al padre ─────────────────────────────────────
  useImperativeHandle(ref, () => ({
    updateCurtain(aboutTop, viewportHeight, aboutBottom) {
      const pills = [
        { dark: releasesRef.current,  white: releasesWhiteRef.current },
        { dark: statementRef.current, white: statementWhiteRef.current },
      ];

      pills.forEach(({ dark, white }) => {
        if (!dark || !white) return;
        const rect       = dark.getBoundingClientRect();
        const pillTop    = rect.top;
        const pillBottom = rect.bottom;
        const pillHeight = pillBottom - pillTop;

        let cutPercent;
        // About ya salió por arriba del viewport: no forzar capa blanca (texto blanco invisible)
        if (typeof aboutBottom === "number" && aboutBottom < 0) {
          cutPercent = 100;
        } else if (aboutTop > viewportHeight || pillHeight === 0) {
          cutPercent = 100; // cortina aún no llegó
        } else if (aboutTop <= pillTop) {
          cutPercent = 0;   // cortina ya cubrió todo el pill
        } else if (aboutTop >= pillBottom) {
          cutPercent = 100; // cortina aún no llegó al pill
        } else {
          // porcentaje desde arriba del pill hasta donde llegó la cortina
          cutPercent = ((aboutTop - pillTop) / pillHeight) * 100;
        }

        // La capa blanca se revela de arriba hacia abajo igual que el logo
        dark.style.clipPath  = `inset(0 0 ${100 - cutPercent}% 0)`;
        white.style.clipPath = `inset(${cutPercent}% 0 0 0)`;
      });
    },
  }));

  // ── Align (mismo RAF loop, ahora cubre las 4 capas) ──────────────────
  const alignToLogo = useCallback(() => {
    const logo      = logoRef?.current;
    const releases  = releasesRef.current;
    const statement = statementRef.current;
    const relW      = releasesWhiteRef.current;
    const stW       = statementWhiteRef.current;
    if (!logo || !releases || !statement) return;

    const rect    = logo.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const GAP     = 4;

    const posR = { top: centerY, right: window.innerWidth - rect.left + GAP, left: "auto", xPercent: 0, yPercent: -50, x: 0, y: 0 };
    const posS = { top: centerY, left: rect.right + GAP, right: "auto", xPercent: 0, yPercent: -50, x: 0, y: 0 };

    gsap.set(releases,  posR);
    gsap.set(statement, posS);
    gsap.set(relW,      posR);
    gsap.set(stW,       posS);
  }, [logoRef]);

  useEffect(() => {
    const loop = () => { alignToLogo(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [alignToLogo]);

  // ── Show / hide — aplica a las 4 capas ───────────────────────────────
  useEffect(() => {
    const els = [
      releasesRef.current, statementRef.current,
      releasesWhiteRef.current, statementWhiteRef.current,
    ].filter(Boolean);
    if (!els.length) return;

    if (visible) {
      gsap.killTweensOf(els);
      gsap.to(els, { opacity: 1, filter: "blur(0px)", pointerEvents: "auto", duration: 0.45, ease: "power3.out", stagger: 0.08 });
    } else {
      gsap.killTweensOf(els);
      gsap.to(els, { opacity: 0, filter: "blur(4px)", pointerEvents: "none", duration: 0.25, ease: "power2.in", stagger: { each: 0.05, from: "end" } });
    }
  }, [visible]);

  const pillBase = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "clamp(0.22rem, 0.75vw, 0.38rem) clamp(0.6rem, 1.5vw, 1.15rem)",
    borderRadius: "999px",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    fontSize: "clamp(0.42rem, 0.62vw, 0.68rem)",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase",
    textDecoration: "none", cursor: "pointer", userSelect: "none",
    opacity: 0, filter: "blur(4px)",
    position: "fixed", whiteSpace: "nowrap",
    transition: "background 0.2s ease",
  };

  const buttonReset = {
    border: "none",
    margin: 0,
    WebkitAppearance: "none",
    appearance: "none",
  };

  const darkPill = {
    ...pillBase,
    ...buttonReset,
    background: "rgba(255,255,255,0.18)",
    color: "#1a1a1a",
    zIndex: 10000,
    pointerEvents: "auto",
  };

  const whitePill = {
    ...pillBase,
    background: "transparent",
    color: "#ffffff",
    zIndex: 10001,
    pointerEvents: "none",           // interacción solo en la capa dark
    clipPath: "inset(100% 0 0 0)",   // oculta al inicio
  };

  const hoverIn  = (e) => { e.currentTarget.style.background = "rgba(255,255,255,0.38)"; };
  const hoverOut = (e) => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; };

  return (
    <>
      {/* Botones: <a href="#"> hace que el navegador salte al inicio (tests#) */}
      <button type="button" ref={releasesRef} style={darkPill} onMouseEnter={hoverIn} onMouseLeave={hoverOut} onClick={() => onReleasesClick?.()}>releases</button>
      <button type="button" ref={statementRef} style={darkPill} onMouseEnter={hoverIn} onMouseLeave={hoverOut} onClick={() => onStatementClick?.()}>statement</button>

      {/* Capa white — revelada por clip-path */}
      <span ref={releasesWhiteRef} style={whitePill} aria-hidden>releases</span>
      <span ref={statementWhiteRef} style={whitePill} aria-hidden>statement</span>
    </>
  );
});

NavPills3.displayName = "NavPills3";
export default NavPills3;