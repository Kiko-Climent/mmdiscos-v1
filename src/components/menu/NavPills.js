"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

// logoRef: ref del elemento logo del componente padre (MMHeroWithReleases4)
// visible: boolean que controla la visibilidad de los pills
const NavPills = ({ visible, logoRef }) => {
  const releasesRef = useRef(null);
  const aboutRef    = useRef(null);

  // Alinea los pills al centro vertical del logo en su estado actual
  const alignToLogo = useCallback(() => {
    const logo     = logoRef?.current;
    const releases = releasesRef.current;
    const about    = aboutRef.current;
    if (!logo || !releases || !about) return;

    const rect      = logo.getBoundingClientRect();
    const centerY   = rect.top + rect.height / 2;
    const logoLeft  = rect.left;
    const logoRight = rect.right;
    const GAP       = 12; // px entre el borde del logo y el pill

    // Posicionar verticalmente centrado con el logo
    // y horizontalmente pegados a sus bordes exteriores
    gsap.set(releases, {
      top:   centerY,
      right: window.innerWidth - logoLeft + GAP,
      left:  "auto",
      xPercent: 0,
      yPercent: -50,
    });

    gsap.set(about, {
      top:  centerY,
      left: logoRight + GAP,
      right: "auto",
      xPercent: 0,
      yPercent: -50,
    });
  }, [logoRef]);

  // Re-alinear en cada frame mientras el scroll/animación mueve el logo
  useEffect(() => {
    let raf;
    const loop = () => {
      alignToLogo();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [alignToLogo]);

  // Mostrar / ocultar
  useEffect(() => {
    const els = [releasesRef.current, aboutRef.current].filter(Boolean);
    if (!els.length) return;

    if (visible) {
      gsap.killTweensOf(els);
      gsap.to(els, {
        opacity: 1,
        filter: "blur(0px)",
        pointerEvents: "auto",
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.08,
      });
    } else {
      gsap.killTweensOf(els);
      gsap.to(els, {
        opacity: 0,
        filter: "blur(4px)",
        pointerEvents: "none",
        duration: 0.3,
        ease: "power2.in",
        stagger: { each: 0.05, from: "end" },
      });
    }
  }, [visible]);

  const pillStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.45rem 1.35rem",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#1a1a1a",
    fontSize: "clamp(0.6rem, 0.85vw, 0.78rem)",
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontWeight: 500,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    textDecoration: "none",
    cursor: "pointer",
    userSelect: "none",
    opacity: 0,
    filter: "blur(4px)",
    pointerEvents: "none",
    position: "fixed",
    transition: "background 0.2s ease, border-color 0.2s ease",
    whiteSpace: "nowrap",
    zIndex: 10000,
  };

  const hoverIn  = (e) => {
    e.currentTarget.style.background  = "rgba(255,255,255,0.38)";
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
  };
  const hoverOut = (e) => {
    e.currentTarget.style.background  = "rgba(255,255,255,0.18)";
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
  };

  return (
    <>
      <a
        ref={releasesRef}
        href="#releases"
        style={pillStyle}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        releases
      </a>
      <a
        ref={aboutRef}
        href="#about"
        style={pillStyle}
        onMouseEnter={hoverIn}
        onMouseLeave={hoverOut}
      >
        statement
      </a>
    </>
  );
};

export default NavPills;