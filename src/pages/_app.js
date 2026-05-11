import "@/styles/globals.css";
import "@/styles/about.css";
import "@/styles/highlights.css";
import "@/styles/aboutfinal.css";
import { useRouter } from "next/router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import Menu2 from "@/components/menu/Menu2";

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

function isReleasesUrl(url = "") {
  const path = String(url).split("#")[0].split("?")[0];
  return path.startsWith("/releases");
}

function dispatchReleasesReveal() {
  if (typeof window === "undefined") return;
  window.__MM_RELEASES_REVEALED_AT__ = Date.now();
  window.dispatchEvent(new CustomEvent("mm-page-revealed"));
}

export default function App({ Component, pageProps }) {
  const router  = useRouter();
  const isHome  = router.pathname === "/";

  const logoRef     = useRef(null);
  const logoImgRef  = useRef(null);
  const [menuVisible, setMenuVisible] = useState(!isHome);
  /** Top del bloque de pills (px) debajo del <img> del logo; inline para alinear con el layout flex anterior. */
  const [menuPillsTop, setMenuPillsTop] = useState(72);

  // ── Page transition curtain ───────────────────────────────────────────────
  const curtainRef      = useRef(null);
  const coverDoneRef    = useRef(false);
  const revealPendingRef = useRef(false);
  const routeTokenRef = useRef(0);

  // Initial reveal when landing directly on /releases
  useEffect(() => {
    if (!router.pathname.startsWith("/releases")) return;
    const killCurtainTweens = () => {
      if (!curtainRef.current) return;
      gsap.killTweensOf(curtainRef.current);
    };
    // Small delay so FinalReleases2 / useSliderScene can register
    // the mm-page-revealed listener before we dispatch it.
    const timer = setTimeout(() => {
      if (!curtainRef.current) return;
      killCurtainTweens();
      gsap.to(curtainRef.current, {
        yPercent: -100,
        duration: 0.85,
        ease: "expo.out",
        onComplete: dispatchReleasesReveal,
      });
    }, 150);
    return () => {
      clearTimeout(timer);
      killCurtainTweens();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Route-change transitions — curtain only when arriving at /releases
  useEffect(() => {
    const killCurtainTweens = () => {
      if (!curtainRef.current) return;
      gsap.killTweensOf(curtainRef.current);
    };

    function doReveal(token) {
      if (!curtainRef.current || token !== routeTokenRef.current) return;
      revealPendingRef.current = false;
      killCurtainTweens();
      gsap.to(curtainRef.current, {
        yPercent: -100,
        duration: 0.85,
        ease: "expo.out",
        onComplete: () => {
          if (token !== routeTokenRef.current) return;
          dispatchReleasesReveal();
        },
      });
    }

    function onStart(url) {
      if (!isReleasesUrl(url) || !curtainRef.current) return;
      const token = routeTokenRef.current + 1;
      routeTokenRef.current = token;
      window.__MM_RELEASES_REVEALED_AT__ = 0;
      coverDoneRef.current  = false;
      revealPendingRef.current = false;
      killCurtainTweens();
      gsap.set(curtainRef.current, { yPercent: 100 });
      gsap.to(curtainRef.current, {
        yPercent: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          if (token !== routeTokenRef.current) return;
          coverDoneRef.current = true;
          if (revealPendingRef.current) doReveal(token);
        },
      });
    }

    function onComplete(url) {
      if (!isReleasesUrl(url)) return;
      const token = routeTokenRef.current;
      if (coverDoneRef.current) doReveal(token);
      else revealPendingRef.current = true;
    }

    function onError() {
      // Navigation cancelled — slide curtain away
      window.__MM_RELEASES_REVEALED_AT__ = 0;
      killCurtainTweens();
      if (!curtainRef.current) return;
      gsap.to(curtainRef.current, { yPercent: 100, duration: 0.4, ease: "power2.in" });
    }

    router.events.on("routeChangeStart",    onStart);
    router.events.on("routeChangeComplete", onComplete);
    router.events.on("routeChangeError",    onError);
    return () => {
      router.events.off("routeChangeStart",    onStart);
      router.events.off("routeChangeComplete", onComplete);
      router.events.off("routeChangeError",    onError);
      killCurtainTweens();
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

  const PILL_ROW_GAP_PX = 3; /* equiv. gap-[3px] / mt-1 del Menu2 bajo el logo */

  useLayoutEffect(() => {
    const img = logoImgRef.current;
    if (!img) return;

    const updateTop = () => {
      const r = img.getBoundingClientRect();
      if (r.height > 0) setMenuPillsTop(r.bottom + PILL_ROW_GAP_PX);
    };

    updateTop();
    const ro = new ResizeObserver(updateTop);
    ro.observe(img);
    img.addEventListener("load", updateTop);
    window.addEventListener("resize", updateTop);
    return () => {
      ro.disconnect();
      img.removeEventListener("load", updateTop);
      window.removeEventListener("resize", updateTop);
    };
  }, []);

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
          ref={logoImgRef}
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
      </div>

      <div
        id="mm-global-menu-pills"
        className="mm-global-menu-pills"
        style={{
          top:           menuPillsTop,
          pointerEvents: menuVisible || !isHome ? "auto" : "none",
        }}
      >
        <Menu2 visible={menuVisible} />
      </div>

      <Component {...pageProps} />

      {/* Page transition curtain — slides up from below to cover, then exits upward */}
      <div
        ref={curtainRef}
        aria-hidden
        style={{
          position:        "fixed",
          inset:           0,
          zIndex:          9000,
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