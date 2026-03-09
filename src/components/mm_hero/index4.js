import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, Flip);

export default function MM_HeroIntro() {
  const backdropRef = useRef(null);
  const boxRef = useRef(null);
  const logoRef = useRef(null);
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis();
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const initAnimation = () => {
      const box = boxRef.current;
      const logo = logoRef.current;
      if (!box || !logo) return;

      const isDesktop = window.innerWidth >= 720;

      if (!isDesktop) {
        gsap.set(box, { width: "100%", height: "100svh" });
        logo.classList.add("top-0");
        return;
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const initialWidth = box.offsetWidth;
      const initialHeight = box.offsetHeight;

      const state = Flip.getState(logo);

      logo.classList.remove("bottom-0");
      logo.classList.add("top-0");
      gsap.set(logo, { width: 250 });

      const flip = Flip.from(state, {
        duration: 1,
        ease: "none",
        paused: true,
      });

      ScrollTrigger.create({
        trigger: backdropRef.current,
        start: "top top",
        end: `+=${viewportHeight}`,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;

          gsap.set(box, {
            width: gsap.utils.interpolate(initialWidth, viewportWidth, p),
            height: gsap.utils.interpolate(initialHeight, viewportHeight, p),
            backgroundColor: `rgba(249, 244, 235, ${gsap.utils.interpolate(
              0.35,
              1,
              p
            )})`,
          });

          flip.progress(p);
        },
      });
    };

    initAnimation();

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
        gsap.set([boxRef.current, logoRef.current], { clearProps: "all" });
        initAnimation();
      }, 250);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      {/* Spacer scroll */}
      <div ref={backdropRef} className="h-[200svh] pointer-events-none" />

      {/* Background video */}
      <div className="fixed inset-0 w-full h-[100svh] pointer-events-none overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/video/MM Hero BG_1.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Expanding box */}
      <div
        ref={boxRef}
        className="fixed top-1/2 left-1/2 
                   -translate-x-1/2 -translate-y-1/2
                   w-[35%] aspect-[16/9]
                   bg-[rgba(249,244,235,0.35)]
                   backdrop-blur-sm
                   will-change-[width,height]
                   pointer-events-none"
      >
        {/* Logo */}
        <div
          ref={logoRef}
          className="absolute bottom-0 left-1/2 
                     -translate-x-1/2
                     w-full p-10 z-10"
        >
          <img
            src="/logo/Balearic Sound System Logo.svg"
            alt="MM Discos"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </>
  );
}