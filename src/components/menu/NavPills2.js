"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

const NavPills2 = ({ visible, logoRef }) => {
  const releasesRef = useRef(null);
  const statementRef = useRef(null);
  const rafRef       = useRef(null);

  // ── Align pills beside logo, vertically centered — always ────────────
  const alignToLogo = useCallback(() => {
    const logo      = logoRef?.current;
    const releases  = releasesRef.current;
    const statement = statementRef.current;
    if (!logo || !releases || !statement) return;

    const rect    = logo.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const GAP     = 10;

    gsap.set(releases, {
      top:      centerY,
      right:    window.innerWidth - rect.left + GAP,
      left:     "auto",
      xPercent: 0,
      yPercent: -50,
      x: 0, y: 0,
    });

    gsap.set(statement, {
      top:      centerY,
      left:     rect.right + GAP,
      right:    "auto",
      xPercent: 0,
      yPercent: -50,
      x: 0, y: 0,
    });
  }, [logoRef]);

  useEffect(() => {
    const loop = () => {
      alignToLogo();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [alignToLogo]);

  // ── Show / hide ───────────────────────────────────────────────────────
  useEffect(() => {
    const els = [releasesRef.current, statementRef.current].filter(Boolean);
    if (!els.length) return;

    if (visible) {
      gsap.killTweensOf(els);
      gsap.to(els, {
        opacity: 1,
        filter: "blur(0px)",
        pointerEvents: "auto",
        duration: 0.45,
        ease: "power3.out",
        stagger: 0.08,
      });
    } else {
      gsap.killTweensOf(els);
      gsap.to(els, {
        opacity: 0,
        filter: "blur(4px)",
        pointerEvents: "none",
        duration: 0.25,
        ease: "power2.in",
        stagger: { each: 0.05, from: "end" },
      });
    }
  }, [visible]);

  const pillBase = {
    display:              "inline-flex",
    alignItems:           "center",
    justifyContent:       "center",
    // clamp: más pequeño en móvil, tamaño normal en desktop
    padding:              "clamp(0.28rem, 0.9vw, 0.45rem) clamp(0.7rem, 1.8vw, 1.35rem)",
    borderRadius:         "999px",
    background:           "rgba(255,255,255,0.18)",
    backdropFilter:       "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color:                "#1a1a1a",
    fontSize:             "clamp(0.5rem, 0.75vw, 0.78rem)",
    fontFamily:           "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontWeight:           500,
    letterSpacing:        "0.12em",
    textTransform:        "uppercase",
    textDecoration:       "none",
    cursor:               "pointer",
    userSelect:           "none",
    opacity:              0,
    filter:               "blur(4px)",
    pointerEvents:        "none",
    position:             "fixed",
    whiteSpace:           "nowrap",
    zIndex:               10000,
    transition:           "background 0.2s ease, border-color 0.2s ease",
  };

  const hoverIn  = (e) => {
    e.currentTarget.style.background  = "rgba(255,255,255,0.38)";
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.65)";
  };
  const hoverOut = (e) => {
    e.currentTarget.style.background  = "rgba(255,255,255,0.18)";
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)";
  };

  return (
    <>
      <a ref={releasesRef} href="#releases" style={pillBase}
        onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
        releases
      </a>
      <a ref={statementRef} href="#statement" style={pillBase}
        onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
        statement
      </a>
    </>
  );
};

export default NavPills2;