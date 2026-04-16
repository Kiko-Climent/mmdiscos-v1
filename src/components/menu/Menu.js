"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import gsap from "gsap";
import Link from "next/link";

/**
 * Menu — 3 enlaces de texto posicionados dentro del contenedor .mm-global-logo-nav,
 * justo debajo del logo. El padre (_app.js) controla la visibilidad con `visible`.
 */
const Menu = ({ visible }) => {
  const containerRef = useRef(null);
  const router = useRouter();
  const isReleases = router.pathname === "/releases";

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
      {[
        { label: "releases",  href: "/releases"  },
        { label: "index",     href: "/"           },
        { label: "statement", href: "/statement"  },
      ].map(({ label, href }) => (
        <Link
          key={label}
          href={href}
          onClick={(e) => handleLinkClick(e, label)}
          style={{
            fontFamily:     "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize:       "clamp(0.42rem, 0.62vw, 0.68rem)",
            fontWeight:     500,
            letterSpacing:  "0.12em",
            textTransform:  "uppercase",
            textDecoration: "none",
            color:          "#1a1a1a",
            cursor:         "pointer",
            userSelect:     "none",
          }}
        >
          {label}
        </Link>
      ))}
    </div>
  );
};

Menu.displayName = "Menu";
export default Menu;
