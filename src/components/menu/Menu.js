"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/router";
import gsap from "gsap";
import Link from "next/link";

const BASE_LINKS = [
  { label: "releases", href: "/releases" },
  { label: "statement", href: "/statement" },
];

const RELEASE_EXTRA = [
  { label: "slider", event: "mm-releases-go-slider" },
  { label: "index",  event: "mm-releases-go-index"  },
];

/**
 * Menu — enlaces bajo el logo. Cortina About (borde superior de `.about-section`):
 * misma lógica que NavPills3 — capa oscura + capa blanca con clip-path por enlace.
 */
const Menu = ({ visible }) => {
  const containerRef = useRef(null);
  const darkRefs     = useRef([]);
  const whiteRefs    = useRef([]);
  const itemRefs     = useRef([]);
  const router       = useRouter();
  const isHome       = router.pathname === "/";
  const isReleases   = router.pathname === "/releases";

  const links = isReleases
    ? [BASE_LINKS[0], ...RELEASE_EXTRA, BASE_LINKS[1]]
    : BASE_LINKS;

  // FLIP step 1 — capture exact 2-item positions before each render while in base mode.
  // Runs after every render but only stores when NOT in releases (2-item layout).
  const prevPosRef = useRef(null);
  useLayoutEffect(() => {
    if (isReleases) return;
    const relEl = itemRefs.current[0]; // releases (idx 0 always)
    const stmEl = itemRefs.current[1]; // statement (idx 1 in 2-item layout)
    if (!relEl || !stmEl) return;
    prevPosRef.current = {
      releases:  relEl.getBoundingClientRect().left,
      statement: stmEl.getBoundingClientRect().left,
    };
  });

  // FLIP step 2 — when 4-item layout renders, measure new positions, invert, play.
  useLayoutEffect(() => {
    if (!isReleases || !prevPosRef.current) return;

    const releasesEl  = itemRefs.current[0];
    const sliderEl    = itemRefs.current[1];
    const indexEl     = itemRefs.current[2];
    const statementEl = itemRefs.current[3];
    if (!releasesEl || !sliderEl || !indexEl || !statementEl) return;

    const nowRel = releasesEl.getBoundingClientRect().left;
    const nowStm = statementEl.getBoundingClientRect().left;

    // Invert: put each element back at its 2-item screen position before paint
    gsap.set(releasesEl,  { x: prevPosRef.current.releases  - nowRel });
    gsap.set(statementEl, { x: prevPosRef.current.statement - nowStm });
    gsap.set([sliderEl, indexEl], { opacity: 0, filter: "blur(5px)" });

    const tl = gsap.timeline({ delay: 0.18 });
    // Releases leads by 40ms — asymmetry removes mechanical feel
    tl.to(releasesEl,  { x: 0, duration: 0.85, ease: "expo.out" }, 0)
      .to(statementEl, { x: 0, duration: 0.85, ease: "expo.out" }, 0.04)
      // New items start at 0.1s — overlap with spread creates flow
      .to([sliderEl, indexEl], {
        opacity: 1, filter: "blur(0px)",
        duration: 0.48, stagger: 0.08, ease: "power3.out",
      }, 0.1);

    return () => tl.kill();
  }, [isReleases]);

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
      for (let i = 0; i < links.length; i++) {
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

      for (let i = 0; i < links.length; i++) {
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
  }, [isHome, isReleases]);

  useEffect(() => {
    const measure = () => {
      const el = itemRefs.current[0]; // RELEASES siempre idx 0
      if (!el) return;
      const rect = el.getBoundingClientRect();
      document.documentElement.style.setProperty(
        "--mm-menu-releases-x",
        `${rect.left}px`
      );
    };
  
    // Inicial — tras commit, la posición ya es la final (excepto en FLIP).
    measure();
  
    // Re-medir tras la animación FLIP (~1s + delay 0.18s) cuando se entra
    // en /releases. En home no afecta (no hay FLIP).
    const flipSettleId = setTimeout(measure, 1200);
  
    // Re-medir en resize (rotación, cambio de orientación).
    window.addEventListener("resize", measure);
  
    return () => {
      clearTimeout(flipSettleId);
      window.removeEventListener("resize", measure);
    };
  }, [isReleases]);

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
      {links.map(({ label, href, event }, idx) => {
        const inner = (
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
                position:      "absolute",
                left:          0,
                top:           0,
                zIndex:        2,
                color:         "#ffffff",
                pointerEvents: "none",
                clipPath:      "inset(100% 0 0 0)",
                display:       "inline-block",
                willChange:    "clip-path",
              }}
              aria-hidden
            >
              {label}
            </span>
          </span>
        );

        if (href) {
          return (
            <Link
              key={label}
              ref={(el) => { itemRefs.current[idx] = el; }}
              href={href}
              style={{
                ...textStyle,
                textDecoration: "none",
                color:          "transparent",
                cursor:         "pointer",
                userSelect:     "none",
              }}
            >
              {inner}
            </Link>
          );
        }

        return (
          <span
            key={label}
            ref={(el) => { itemRefs.current[idx] = el; }}
            role="button"
            onClick={() => window.dispatchEvent(new CustomEvent(event))}
            style={{
              ...textStyle,
              color:      "transparent",
              cursor:     "pointer",
              userSelect: "none",
            }}
          >
            {inner}
          </span>
        );
      })}
    </div>
  );
};

Menu.displayName = "Menu";
export default Menu;
