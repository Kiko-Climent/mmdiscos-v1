import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import MMHeroIntro from "@/components/mm_hero/MMHeroIntro";
import AnimatedQuote from "@/components/AnimatedQuote/index";
import MMHeroReleasesNew3 from "@/components/mm_hero/MMHeroReleasesNew3";
import AnimationReleases11 from "@/components/AnimationReleases/index11";
import AnimationReleases12 from "@/components/AnimationReleases/index12";
import MMHeroWithReleases from "@/components/mm_hero/MMHeroWithReleases";
import ParallaxGallery from "@/components/ParallaxGallery/ParallaxGallery";
import AboutSection from "@/components/About/index";
import Footer from "@/components/Footer/Footer";
import ParallaxGallery2 from "@/components/ParallaxGallery/ParallaxGallery2";
import ParallaxGallery3 from "@/components/ParallaxGallery/ParallaxGallery3";
import ParallaxGallery4 from "@/components/ParallaxGallery/ParallaxGallery4";
import AboutSection2 from "@/components/About/index2";
import AboutSection3 from "@/components/About/index3";
import MMHeroWithReleases3 from "@/components/mm_hero/MMHeroWithReleases3";
import ParallaxGallery5 from "@/components/ParallaxGallery/ParallaxGallery5";
import ParallaxGallery6 from "@/components/ParallaxGallery/ParallaxGallery6";
import MMHeroWithReleases4 from "@/components/mm_hero/MMHeroWithReleases4";
import AboutSection4 from "@/components/About/index4";
import MMHeroWithReleases5 from "@/components/mm_hero/MMHeroWithReleases5";
import AboutSection5 from "@/components/About/index5";
import MMHeroWithReleases6 from "@/components/mm_hero/MMHeroWithReleases6";
import MMDiscosHero4 from "@/components/MMDiscos_Hero/MMDiscosHero4";
import MMDiscosHero3 from "@/components/MMDiscos_Hero/MMDiscosHero3";
import MMDiscosHero5 from "@/components/MMDiscos_Hero/MMDiscosHero5";
import MMDiscosHeroFinal from "@/components/MMDiscos_Hero/MMDiscosHeroFinal";
import MMHeroMobileFinal from "@/components/MMDiscos_Hero/MMHeroMobileFinal";
import MMNewestAproach from "@/components/MMDiscos_Hero/MMNewestAproach";
import MMNewestAproach2 from "@/components/MMDiscos_Hero/MMNewestAproach2";
import MMNewestAproach3 from "@/components/MMDiscos_Hero/MMNewestAproach3";
import MMNewestHero from "@/components/MMDiscos_Hero/MMNewestHero";
import Alfredo from "@/components/Final_Components/Alfredo";
import Highlights from "@/components/Highlights/Highlights";
import AboutFinal from "@/components/About/AboutFinal";

gsap.registerPlugin(ScrollTrigger);


export default function Tests() {

  const lenisRef = useRef(null);

  // useLayoutEffect: antes que los useEffect de los hijos (p. ej. MMHero), para que Lenis + proxy existan cuando se crean los ScrollTriggers
  useLayoutEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

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
    <>
      {/* <MMHeroIntro />
      <AnimationReleases12 /> */}
      {/* <MMHeroReleasesNew3 /> */}
      {/* <MMHeroWithReleases4 /> */}
      {/* <MMHeroWithReleases6 lenisRef={lenisRef} /> */}
      {/* <MMDiscosHero3 /> */}
      {/* <MMHeroMobileFinal/> */}
      {/* <ParallaxGallery /> */}
      {/* <ParallaxGallery2 /> */}
      {/* <ParallaxGallery2 /> */}
      {/* <AboutSection5 /> */}
      {/* <MMNewestHero /> */}
      {/* <MMNewestAproach3 /> */}
      {/* <AnimatedQuote /> */}
      {/* <MMNewestAproach /> */}
      {/* <Alfredo /> */}
      {/* <Highlights /> */}
      <AboutFinal />
      {/* <Footer /> */}
    </>
  );
}
