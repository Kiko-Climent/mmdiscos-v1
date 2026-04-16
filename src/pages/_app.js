import "@/styles/globals.css";
import "@/styles/about.css";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Menu from "@/components/menu/Menu";

/** Cortina About: borde superior de `.about-section` frente al logo animado. */
function syncHeroLogoAboutCurtain() {
  const about = document.querySelector(".about-section");
  const logoRoot = document.getElementById("mm-hero-animated-logo");
  const logoBlack = logoRoot?.querySelector(".logo-layer-black");
  const logoWhite = logoRoot?.querySelector(".logo-layer-white");

  if (!about || !logoRoot || !logoBlack || !logoWhite) return;

  const vh = window.innerHeight;
  const ab = about.getBoundingClientRect();
  const curtainTop = ab.top;

  if (curtainTop > vh) {
    logoBlack.style.clipPath = "inset(0 0 0 0)";
    logoWhite.style.clipPath = "inset(100% 0 0 0)";
    return;
  }

  const lr = logoBlack.getBoundingClientRect();
  const logoTop = lr.top;
  const logoBottom = lr.bottom;
  const logoHeight = logoBottom - logoTop;
  if (logoHeight <= 0) return;

  let cutPercent;
  if (curtainTop <= logoTop) cutPercent = 0;
  else if (curtainTop >= logoBottom) cutPercent = 100;
  else cutPercent = ((curtainTop - logoTop) / logoHeight) * 100;

  logoBlack.style.clipPath = `inset(0 0 ${100 - cutPercent}% 0)`;
  logoWhite.style.clipPath = `inset(${cutPercent}% 0 0 0)`;
}

export default function App({ Component, pageProps }) {
  const router  = useRouter();
  const isHome  = router.pathname === "/";

  const logoRef = useRef(null);
  const [menuVisible, setMenuVisible] = useState(!isHome);

  // Sincroniza visibilidad al cambiar de ruta
  useEffect(() => {
    setMenuVisible(!isHome);
  }, [isHome]);

  // En home: escucha eventos del hero para mostrar/ocultar el menu
  useEffect(() => {
    if (!isHome) return;

    const onSettled = () => setMenuVisible(true);
    const onReset   = () => setMenuVisible(false);

    window.addEventListener("mm-hero-logo-settled", onSettled);
    window.addEventListener("mm-hero-logo-reset",   onReset);
    return () => {
      window.removeEventListener("mm-hero-logo-settled", onSettled);
      window.removeEventListener("mm-hero-logo-reset",   onReset);
    };
  }, [isHome]);

  // Home: cortina About vs logo animado. RAF nativo, más estable que eventos de scroll.
  useEffect(() => {
    if (!isHome) return;

    let rafId = 0;
    let stopped = false;

    const loop = () => {
      if (stopped) return;
      syncHeroLogoAboutCurtain();
      rafId = requestAnimationFrame(loop);
    };

    syncHeroLogoAboutCurtain();
    rafId = requestAnimationFrame(loop);

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
    };
  }, [isHome]);

  const handleLogoClick = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  return (
    <>
      {/* Logo global persistente — el div siempre visible para que Menu pueda aparecer dentro.
          En home el hero animado (#mm-hero-animated-logo) cubre visualmente este logo,
          por eso solo el <img> lleva opacity:0 en home (no el contenedor). */}
      <div
        ref={logoRef}
        id="mm-global-logo"
        className="mm-global-logo-nav"
        style={{ pointerEvents: menuVisible || !isHome ? "auto" : "none" }}
      >
        <img
          src="/logo/Balearic Sound System Logo.svg"
          alt="MM Discos"
          onClick={handleLogoClick}
          style={{
            width:        "100%",
            height:       "100%",
            objectFit:    "contain",
            opacity:      isHome ? 0 : 1,
            cursor:       "pointer",
            pointerEvents: "auto",
          }}
        />
        <Menu visible={menuVisible} />
      </div>

      <Component {...pageProps} />
    </>
  );
}
