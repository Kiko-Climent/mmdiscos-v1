import "@/styles/globals.css";
import "@/styles/about.css";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
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

  if (!Number.isFinite(cutPercent)) return;

  logoBlack.style.clipPath = `inset(0 0 ${100 - cutPercent}% 0)`;
  logoWhite.style.clipPath = `inset(${cutPercent}% 0 0 0)`;
}

export default function App({ Component, pageProps }) {
  const router  = useRouter();
  const isHome  = router.pathname === "/";

  const logoRef = useRef(null);
  const [menuVisible, setMenuVisible] = useState(!isHome);

  // ── Page transition curtain ───────────────────────────────────────────────
  const curtainRef      = useRef(null);
  const coverDoneRef    = useRef(false);
  const revealPendingRef = useRef(false);

  // Initial reveal when landing directly on /releases
  useEffect(() => {
    if (!router.pathname.startsWith("/releases")) return;
    // Small delay so FinalReleases2 / useSliderScene can register
    // the mm-page-revealed listener before we dispatch it.
    const timer = setTimeout(() => {
      if (!curtainRef.current) return;
      gsap.to(curtainRef.current, {
        yPercent: -100,
        duration: 0.85,
        ease: "expo.out",
        onComplete: () => window.dispatchEvent(new CustomEvent("mm-page-revealed")),
      });
    }, 150);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Route-change transitions — curtain only when arriving at /releases
  useEffect(() => {
    function doReveal() {
      revealPendingRef.current = false;
      gsap.to(curtainRef.current, {
        yPercent: -100,
        duration: 0.85,
        ease: "expo.out",
        onComplete: () => window.dispatchEvent(new CustomEvent("mm-page-revealed")),
      });
    }

    function onStart(url) {
      if (!url.startsWith("/releases")) return;
      coverDoneRef.current  = false;
      revealPendingRef.current = false;
      gsap.set(curtainRef.current, { yPercent: 100 });
      gsap.to(curtainRef.current, {
        yPercent: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          coverDoneRef.current = true;
          if (revealPendingRef.current) doReveal();
        },
      });
    }

    function onComplete(url) {
      if (!url.startsWith("/releases")) return;
      if (coverDoneRef.current) doReveal();
      else revealPendingRef.current = true;
    }

    function onError() {
      // Navigation cancelled — slide curtain away
      gsap.to(curtainRef.current, { yPercent: 100, duration: 0.4, ease: "power2.in" });
    }

    router.events.on("routeChangeStart",    onStart);
    router.events.on("routeChangeComplete", onComplete);
    router.events.on("routeChangeError",    onError);
    return () => {
      router.events.off("routeChangeStart",    onStart);
      router.events.off("routeChangeComplete", onComplete);
      router.events.off("routeChangeError",    onError);
    };
  }, [router.events]);

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

      {/* Page transition curtain — slides up from below to cover, then exits upward */}
      <div
        ref={curtainRef}
        aria-hidden
        style={{
          position:        "fixed",
          inset:           0,
          zIndex:          9999,
          background:      "#fff",
          pointerEvents:   "none",
          willChange:      "transform",
          // On /releases: starts covering (revealed by the initial useEffect).
          // On every other page: parked off-screen above so it's invisible.
          transform: router.pathname.startsWith("/releases")
            ? "translateY(0%)"
            : "translateY(-100%)",
        }}
      />
    </>
  );
}