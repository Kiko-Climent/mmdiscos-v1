"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const BASE_LINKS = [
  { label: "manifesto", href: "/?focus=manifesto", disableActive: true },
  { label: "releases", href: "/releases" },
  { label: "about", href: "/about" },
];

const SUB_LINKS = [
  { label: "slider", event: "mm-releases-go-slider" },
  { label: "index", event: "mm-releases-go-index" },
];

// Con mix-blend-difference del ancestro (.mm-global-menu-pills) sobre fondos
// claros habituales, hace falta invertir los literales para la apariencia deseada:
// percibido ≈ caja negra + texto blanco; hover ≈ caja blanca + texto negro.
const BG_IDLE = "#fff";
const BG_HOVER = "#000";
const FG_IDLE = "#000";
const FG_HOVER = "#fff";
// Borde: literal #fff para que, con difference sobre fondo claro, se perciba oscuro
// (en reposo alrededor de la caja negra; en hot alrededor de la caja blanca).
const BORDER = "#fff";

const pillStyle = (bg, fg, borderColor) => ({
  width:           "clamp(56px, 16vw, 103px)",
  padding:         "clamp(0.28rem, 1vw, 0.423rem) clamp(0.14rem, 0.5vw, 0.188rem)",
  display:         "inline-flex",
  alignItems:      "flex-end",
  borderRadius:    2,
  backgroundColor: bg,
  color:           fg,
  fontSize:        "clamp(9px, 2.6vw, 11px)",
  letterSpacing:   "0.012em",
  lineHeight:      0,
  whiteSpace:      "nowrap",
  cursor:          "pointer",
  transition:      "background-color 0.2s ease-in-out, color 0.2s ease-in-out, border-color 0.2s ease-in-out",
  textDecoration:  "none",
  border:          `1px solid ${borderColor}`,
  margin:          0,
  appearance:      "none",
  textAlign:       "left",
});

const Pill = ({ active = false, href, onClick, children }) => {
  const [hover, setHover] = useState(false);
  const isHot = hover || active;
  const bg = isHot ? BG_HOVER : BG_IDLE;
  const fg = isHot ? FG_HOVER : FG_IDLE;
  const common = {
    style:        pillStyle(bg, fg, BORDER),
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
  };
  if (href) {
    return <Link href={href} {...common}>{children}</Link>;
  }
  return <button type="button" onClick={onClick} {...common}>{children}</button>;
};

const isRouteActive = (pathname, href, activeOn) => {
  const routeKey = href.split("?")[0];
  if (activeOn) return pathname === activeOn;
  return pathname === routeKey || pathname.startsWith(routeKey + "/");
};

const Menu2 = ({ visible = true }) => {
  const router = useRouter();
  const showSubLinks = router.pathname.startsWith("/releases");
  const [activeSubLink, setActiveSubLink] = useState("slider");

  useEffect(() => {
    if (!showSubLinks) return;
    setActiveSubLink("slider");
  }, [showSubLinks]);

  return (
    <nav
      aria-label="Primary"
      className={[
        "flex flex-col items-center gap-[3px]",
        "transition-opacity duration-[450ms]",
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <div className="flex items-center justify-center gap-[3px]">
        {BASE_LINKS.map(({ label, href, activeOn, disableActive }) => (
          <Pill
            key={label}
            href={href}
            active={
              disableActive
                ? false
                : isRouteActive(router.pathname, href, activeOn)
            }
          >
            {label}
          </Pill>
        ))}
      </div>

      {showSubLinks && (
        <div className="flex items-center justify-center gap-[3px]">
          {SUB_LINKS.map(({ label, event }) => (
            <Pill
              key={label}
              active={activeSubLink === label}
              onClick={() => {
                setActiveSubLink(label);
                window.dispatchEvent(new CustomEvent(event));
              }}
            >
              {label}
            </Pill>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Menu2;
