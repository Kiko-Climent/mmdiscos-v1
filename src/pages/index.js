import Head from "next/head";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Lenis from "lenis";
import AboutFinal3 from "@/components/About/AboutFinal3";
import Highlights2Wrapper from "@/components/Highlights/Highlights2Wrapper";
import MMNewestHero2Wrapper from "@/components/MMDiscos_Hero/MMNewestHero2Wrapper";

gsap.registerPlugin(ScrollTrigger);

// Previene que la barra de direcciones del móvil dispare un resize
// que recalcule los puntos de ScrollTrigger mid-scroll.
ScrollTrigger.config({ ignoreMobileResize: true });

export default function Home() {
  const router = useRouter();
  const lenisRef = useRef(null);

  const [lenisReady, setLenisReady] = useState(false);

  useLayoutEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const onMobile = window.innerWidth < 720;

    /* ── MÓVIL: scroll nativo ────────────────────────────────── */
    if (onMobile) {
      setLenisReady(true);
      gsap.ticker.lagSmoothing(0);
      ScrollTrigger.refresh();
      return () => {
        setLenisReady(false);
        ScrollTrigger.refresh(true);
      };
    }

    /* ── DESKTOP: Lenis + proxy ──────────────────────────────── */
    const lenis = new Lenis();
    lenisRef.current = lenis;
    lenis.scrollTo(0, { immediate: true });

    const scroller = document.documentElement;
    ScrollTrigger.scrollerProxy(scroller, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true, force: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });
    ScrollTrigger.defaults({ scroller });
    setLenisReady(true);
    ScrollTrigger.refresh();

    lenis.on("scroll", ScrollTrigger.update);
    const rafCb = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(rafCb);
    gsap.ticker.lagSmoothing(0);

    return () => {
      setLenisReady(false);
      gsap.ticker.remove(rafCb);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.scrollerProxy(scroller);
      ScrollTrigger.defaults({});
      ScrollTrigger.refresh(true);
    };
  }, []);

  const canRenderSections = lenisReady;

  // Reset de scroll DESPUÉS de montar las secciones. El scrollTo(0,0) del
  // useLayoutEffect de arriba corre cuando el documento aún está vacío
  // (lenisReady=false → sin secciones → altura ≈ 0), así que no tiene efecto
  // real. En móvil el navegador restaura su Y guardada justo cuando el
  // documento crece a su altura real → la home quedaba a media altura tras
  // refrescar. Aquí, ya con las secciones montadas (altura real), forzamos
  // el top. Desktop lo gestiona Lenis (lenis.scrollTo(0)), y respetamos el
  // deep-link ?focus= que tiene su propio scroll programático.
  useLayoutEffect(() => {
    if (!canRenderSections || !router.isReady) return;
    if (window.innerWidth >= 720) return;

    const focus = Array.isArray(router.query.focus)
      ? router.query.focus[0]
      : router.query.focus;
    if (focus === "manifesto" || focus === "about") return;

    let raf2 = 0;
    window.scrollTo(0, 0);
    const raf1 = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      raf2 = requestAnimationFrame(() => window.scrollTo(0, 0));
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [canRenderSections, router.isReady, router.query.focus]);

  useEffect(() => {
    const onScrollToY = (event) => {
      const targetY = Number(event?.detail?.y);
      if (!Number.isFinite(targetY)) return;

      if (lenisRef.current) {
        lenisRef.current.scrollTo(targetY, { duration: 1.1 });
        return;
      }

      window.scrollTo({ top: targetY, behavior: "smooth" });
    };

    window.addEventListener("mm-scroll-to", onScrollToY);
    return () => window.removeEventListener("mm-scroll-to", onScrollToY);
  }, []);

  useEffect(() => {
    if (!router.isReady || !canRenderSections) return;

    const focus = Array.isArray(router.query.focus)
      ? router.query.focus[0]
      : router.query.focus;
    if (focus !== "manifesto" && focus !== "about") return;

    const eventName = focus === "manifesto" ? "mm-nav-manifesto" : "mm-nav-about";

    // Cross-page desktop: la home se monta fresca y los hijos crean sus
    // pin-spacers en el mismo commit. Un único RAF no es suficiente —
    // Lenis tiene un `limit` calculado sobre el DOM aún sin pin-spacers
    // y clampa el scrollTo del target a un Y demasiado pequeño (te lleva
    // al "inicio de home"). Solución:
    //   1. Doble RAF → da un frame a los pin-spacers para integrarse.
    //   2. ScrollTrigger.refresh() → recalcula start/end con la geometría
    //      ya completa, incluyendo todos los pin-spacers.
    //   3. lenis.resize() → fuerza a Lenis a re-medir su límite del DOM.
    //   4. Dispatch del evento de navegación.
    // En mobile (sin Lenis) los pasos 2-3 son inofensivos; el fallback
    // window.scrollTo nativo siempre conoce el DOM correcto.
    let cancelled = false;
    const rafIds = [];

    rafIds.push(requestAnimationFrame(() => {
      if (cancelled) return;
      rafIds.push(requestAnimationFrame(() => {
        if (cancelled) return;
        ScrollTrigger.refresh();
        if (lenisRef.current && typeof lenisRef.current.resize === "function") {
          lenisRef.current.resize();
        }
        window.dispatchEvent(new CustomEvent(eventName));
        router.replace("/", undefined, { shallow: true, scroll: false });
      }));
    }));

    return () => {
      cancelled = true;
      rafIds.forEach((id) => cancelAnimationFrame(id));
    };
  }, [router, canRenderSections]);

  return (
    <div>
      <Head>
        <title>MM Discos | Balearic Soundsystem</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo/MM.svg" type="image/svg+xml" />
      </Head>
      {canRenderSections ? (
        <>
          <MMNewestHero2Wrapper />
          <Highlights2Wrapper />
          <AboutFinal3 />
        </>
      ) : null}
    </div>
  );
}
