"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import gsap from "gsap";
import Link from "next/link";

const LINKS = [
  { label: "releases",  href: "/releases"  },
  { label: "index",     href: "/"           },
  { label: "statement", href: "/statement"  },
];

/**
 * Menu — enlaces bajo el logo. Cortina About (borde superior de `.about-section`):
 * misma lógica que NavPills3 — capa oscura + capa blanca con clip-path por enlace.
 */
const Menu = ({ visible }) => {
  const containerRef = useRef(null);
  const darkRefs     = useRef([]);
  const whiteRefs    = useRef([]);
  const router       = useRouter();
  const isHome       = router.pathname === "/";
  const isReleases   = router.pathname === "/releases";

  const handleLinkClick = (e, label) => {
    e.stopPropagation();
    if (label === "index" && isReleases) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("mm-releases-toggle-index"));
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (visible) {
      gsap.killTweensOf(container);
      gsap.to(container, {
        opacity:       1,
        filter:        "blur(0px)",
        pointerEvents: "auto",
        duration:      0.45,
        ease:          "power3.out",
      });
    } else {
      gsap.killTweensOf(container);
      gsap.to(container, {
        opacity:       0,
        filter:        "blur(4px)",
        pointerEvents: "none",
        duration:      0.25,
        ease:          "power2.in",
      });
    }
  }, [visible]);

  // Cortina blur About vs cada enlace (NavPills3.updateCurtain)
  useEffect(() => {
    const resetFullDark = () => {
      for (let i = 0; i < LINKS.length; i++) {
        const dark = darkRefs.current[i];
        const white = whiteRefs.current[i];
        if (dark) {
          dark.style.clipPath = "inset(0 0 0 0)";
        }
        if (white) {
          white.style.clipPath = "inset(100% 0 0 0)";
        }
      }
    };

    if (!isHome) {
      resetFullDark();
      return;
    }

    const sync = () => {
      const about = document.querySelector(".about-section");
      const aboutRect = about?.getBoundingClientRect();
      const aboutTop = aboutRect?.top;
      const aboutBottom = aboutRect?.bottom;
      const viewportHeight = window.innerHeight;

      for (let i = 0; i < LINKS.length; i++) {
        const dark = darkRefs.current[i];
        const white = whiteRefs.current[i];
        if (!dark || !white) continue;

        const rect = dark.getBoundingClientRect();
        const pillTop = rect.top;
        const pillBottom = rect.bottom;
        const pillHeight = pillBottom - pillTop;

        let cutPercent;

        if (!aboutRect || typeof aboutTop !== "number" || !Number.isFinite(aboutTop)) {
          cutPercent = 100;
        } else if (typeof aboutBottom === "number" && aboutBottom < 0) {
          cutPercent = 100;
        } else if (aboutTop > viewportHeight || pillHeight === 0) {
          cutPercent = 100;
        } else if (aboutTop <= pillTop) {
          cutPercent = 0;
        } else if (aboutTop >= pillBottom) {
          cutPercent = 100;
        } else {
          cutPercent = ((aboutTop - pillTop) / pillHeight) * 100;
        }

        dark.style.clipPath = `inset(0 0 ${100 - cutPercent}% 0)`;
        white.style.clipPath = `inset(${cutPercent}% 0 0 0)`;
      }
    };

    let rafId = 0;
    let stopped = false;
    const loop = () => {
      if (stopped) return;
      sync();
      rafId = requestAnimationFrame(loop);
    };

    sync();
    rafId = requestAnimationFrame(loop);

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      resetFullDark();
    };
  }, [isHome]);

  const textStyle = {
    fontFamily:    "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize:      "clamp(0.42rem, 0.62vw, 0.68rem)",
    fontWeight:    500,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  };

  return (
    <div
      ref={containerRef}
      style={{
        display:       "flex",
        gap:           "clamp(0.8rem, 1.5vw, 1.5rem)",
        opacity:       0,
        filter:        "blur(4px)",
        pointerEvents: "none",
        whiteSpace:    "nowrap",
        marginTop:     "0.4rem",
      }}
    >
      {LINKS.map(({ label, href }, idx) => (
        <Link
          key={label}
          href={href}
          onClick={(e) => handleLinkClick(e, label)}
          style={{
            ...textStyle,
            textDecoration: "none",
            color:          "transparent",
            cursor:         "pointer",
            userSelect:     "none",
          }}
        >
          <span style={{ position: "relative", display: "inline-block" }}>
            <span
              ref={(el) => { darkRefs.current[idx] = el; }}
              style={{
                ...textStyle,
                position:   "relative",
                zIndex:     1,
                color:      "#1a1a1a",
                display:    "inline-block",
                willChange: "clip-path",
              }}
            >
              {label}
            </span>
            <span
              ref={(el) => { whiteRefs.current[idx] = el; }}
              style={{
                ...textStyle,
                position:       "absolute",
                left:           0,
                top:            0,
                zIndex:         2,
                color:          "#ffffff",
                pointerEvents:  "none",
                clipPath:       "inset(100% 0 0 0)",
                display:        "inline-block",
                willChange:     "clip-path",
              }}
              aria-hidden
            >
              {label}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
};

Menu.displayName = "Menu";
export default Menu;
