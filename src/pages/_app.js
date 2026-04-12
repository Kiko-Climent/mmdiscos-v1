import "@/styles/globals.css";
import "@/styles/about.css";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import NavPills3 from "@/components/menu/NavPills3";

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
