import { useEffect } from "react";
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

gsap.registerPlugin(ScrollTrigger);


export default function Tests() {
  useEffect(() => {
    history.scrollRestoration = "manual"; // desactiva la restauración del navegador
    window.scrollTo(0, 0);
  
    const lenis = new Lenis();
    lenis.scrollTo(0, { immediate: true });
    lenis.on("scroll", ScrollTrigger.update);
    const rafCb = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(rafCb);
    gsap.ticker.lagSmoothing(0);
  
    return () => {
      gsap.ticker.remove(rafCb);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      {/* <MMHeroIntro />
      <AnimationReleases12 /> */}
      {/* <MMHeroReleasesNew3 /> */}
      <MMHeroWithReleases3 />
      {/* <ParallaxGallery /> */}
      {/* <ParallaxGallery2 /> */}
      <ParallaxGallery4 />
      <AboutSection3 />
      {/* <AnimatedQuote /> */}
      {/* <Footer /> */}
    </>
  );
}
