import Head from "next/head";
import Releases from "@/components/releases";
import Releases2 from "@/components/releases/index2";
import Releases3 from "@/components/releases/index3";
import Releases4 from "@/components/releases/index4";
import Releases5 from "@/components/releases/index5";
import AnimationReleases12 from "@/components/AnimationReleases/index12";
import AnimationReleases11 from "@/components/AnimationReleases/index11";
import AnimationReleases10 from "@/components/AnimationReleases/index10";
import MMHoldingScreen from "@/components/UnderConstruction/index";
import MM_Hero from "@/components/mm_hero/index";
import MM_Hero2 from "@/components/mm_hero/index2";
import MMDiscosHero from "@/components/MMDiscos_Hero/MMDiscosHero";
import MM_Hero3 from "@/components/mm_hero/index3";
import MMDiscosHero2 from "@/components/MMDiscos_Hero/MMDiscosHero2";
import ParallaxGallery2 from "@/components/ParallaxGallery/ParallaxGallery2";
import AboutSection5 from "@/components/About/index5";
import MMDiscosHero3 from "@/components/MMDiscos_Hero/MMDiscosHero3";
import MMDiscosHero4 from "@/components/MMDiscos_Hero/MMDiscosHero4";
import MMDiscosHeroFinal from "@/components/MMDiscos_Hero/MMDiscosHeroFinal";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, useState, useEffect } from "react";
import Lenis from "lenis";
import MMDiscosHeroFinal2 from "@/components/MMDiscos_Hero/MMDiscosHeroFinal2";
import MMDiscosHeroFinal3 from "@/components/MMDiscos_Hero/MMDiscosHeroFinal3";
import MMDiscosHeroFinal4 from "@/components/MMDiscos_Hero/MMDiscosHeroFinal4";
import MMHeroMobileFinal from "@/components/MMDiscos_Hero/MMHeroMobileFinal";
import MMHeroMobileFinal2 from "@/components/MMDiscos_Hero/MMHeroMobileFinal2";
import MMHeroDesktopMobile from "@/components/MMDiscos_Hero/MMHeroDesktopMobile";

gsap.registerPlugin(ScrollTrigger);

// Previene que la barra de direcciones del móvil dispare un resize
// que recalcule los puntos de ScrollTrigger mid-scroll.
ScrollTrigger.config({ ignoreMobileResize: true });

export default function Home() {
  const lenisRef = useRef(null);

  const [isMobile, setIsMobile] = useState(null);
  useEffect(() => {
    setIsMobile(window.innerWidth < 720);
  }, []);

  // useLayoutEffect: corre antes de los useEffect de los hijos, garantizando que
  // el scroll esté configurado antes de que se creen los ScrollTriggers hijos.
  //
  // ESTRATEGIA DE SCROLL POR DISPOSITIVO
  // ─────────────────────────────────────
  // Desktop  → Lenis smooth scroll + ScrollTrigger proxy.
  //             El wheel de trackpad/ratón tiene poca inercia, Lenis la añade elegante.
  //
  // Móvil    → Scroll NATIVO puro, sin Lenis.
  //             El touch nativo usa el compositor GPU del SO (hilo separado del JS),
  //             alcanzando 60/120 fps sin coste en el main thread.
  //             Lenis lo intercepta y lo mueve al JS thread → compite con GSAP → trompicones.
  //             ScrollTrigger funciona perfectamente con scroll nativo; no necesita proxy.
  useLayoutEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    // Detectamos aquí con innerWidth (no con el state isMobile, que aún es null
    // en este punto porque useEffect corre después de useLayoutEffect).
    const onMobile = window.innerWidth < 720;

    /* ── MÓVIL: scroll nativo ────────────────────────────────── */
    if (onMobile) {
      // lagSmoothing(0): evita que el ticker de GSAP frene cuando la pestaña pierde foco
      // y luego "salte" al recuperarla; relevante en móvil donde el SO suspende pestañas.
      gsap.ticker.lagSmoothing(0);

      // normalizeScroll: toma el control del scroll para que la barra de direcciones
      // del navegador no cause cambios de tamaño que desajusten los triggers.
      // Efecto secundario: la barra de direcciones permanece visible siempre.
      ScrollTrigger.normalizeScroll(true);

      ScrollTrigger.refresh();
      return () => {
        ScrollTrigger.normalizeScroll(false);
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
    ScrollTrigger.refresh();

    lenis.on("scroll", ScrollTrigger.update);
    const rafCb = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(rafCb);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(rafCb);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.scrollerProxy(scroller);
      delete ScrollTrigger.defaults().scroller;
      ScrollTrigger.refresh(true);
    };
  }, []);

  return (
    <div>
      {/* <Head>
        <title>MM Discos | Balearic Soundsystem</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head> */}

      {/* Hero: mobile vs desktop */}
      {isMobile === null
        ? null
        : isMobile
          ? <MMHeroMobileFinal2 />
          : <MMDiscosHeroFinal4 />
      }
      <ParallaxGallery2 />
      <AboutSection5 />
    </div>
  );
}
