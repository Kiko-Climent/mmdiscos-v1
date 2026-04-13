import "@/styles/globals.css";
import "@/styles/about.css";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import NavPills3 from "@/components/menu/NavPills3";

/** Cortina About: borde superior de `.about-section` frente al logo (misma lógica que MMHeroWithReleases6). */
function syncHeroLogoAboutCurtain(navPillsRef) {
  const about = document.querySelector(".about-section");
  const logoRoot = document.getElementById("mm-hero-animated-logo");
  const logoBlack = logoRoot?.querySelector(".logo-layer-black");
  const logoWhite = logoRoot?.querySelector(".logo-layer-white");

  const vh = window.innerHeight;

  if (about) {
    const ab = about.getBoundingClientRect();
    navPillsRef.current?.updateCurtain(ab.top, vh, ab.bottom);
  }

  if (!about || !logoRoot || !logoBlack || !logoWhite) return;

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

  const logoRef     = useRef(null);
  const navPillsRef = useRef(null);
  const [pillsVisible, setPillsVisible] = useState(!isHome);

  // Sincroniza visibilidad al cambiar de ruta
  useEffect(() => {
    setPillsVisible(!isHome);
  }, [isHome]);

  // En home: escucha eventos del hero para mostrar/ocultar las pills
  useEffect(() => {
    if (!isHome) return;

    const onSettled = () => setPillsVisible(true);
    const onReset   = () => setPillsVisible(false);

    window.addEventListener("mm-hero-logo-settled", onSettled);
    window.addEventListener("mm-hero-logo-reset",   onReset);
    return () => {
      window.removeEventListener("mm-hero-logo-settled", onSettled);
      window.removeEventListener("mm-hero-logo-reset",   onReset);
    };
  }, [isHome]);

  // Home: cortina About vs logo + pills. RAF nativo (no depende de GSAP ni de import async);
  // Lenis no dispara scroll nativo de forma fiable, así que un frame loop es lo más estable.
  useEffect(() => {
    if (!isHome) return;

    let rafId = 0;
    let stopped = false;

    const loop = () => {
      if (stopped) return;
      syncHeroLogoAboutCurtain(navPillsRef);
      rafId = requestAnimationFrame(loop);
    };

    syncHeroLogoAboutCurtain(navPillsRef);
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

  const handleReleasesClick = () => router.push("/releases");

  const handleStatementClick = () => {
    if (isHome) {
      document.getElementById("statement")?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#statement");
    }
  };

  return (
    <>
      {/* Logo global persistente — en home el hero lo controla via GSAP; en el resto ya está visible */}
      <div
        ref={logoRef}
        id="mm-global-logo"
        className="mm-global-logo-nav"
        style={{ opacity: isHome ? 0 : 1, pointerEvents: isHome ? "none" : "auto", cursor: "pointer" }}
        onClick={handleLogoClick}
      >
        <img
          src="/logo/Balearic Sound System Logo.svg"
          alt="MM Discos"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      <NavPills3
        ref={navPillsRef}
        visible={pillsVisible}
        logoRef={logoRef}
        onReleasesClick={handleReleasesClick}
        onStatementClick={handleStatementClick}
      />

      <Component {...pageProps} />
    </>
  );
}
