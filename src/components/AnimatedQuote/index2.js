import { useEffect } from "react";

const AnimatedQuote2 = () => {
  useEffect(() => {
    let gsap, ScrollTrigger, Lenis;

    const loadAnimations = async () => {
      gsap = (await import("gsap")).default;
      ScrollTrigger = (await import("gsap/ScrollTrigger")).ScrollTrigger;
      Lenis = (await import("lenis")).default;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis();
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      /* ============================================================
         1) ANIMACIÓN PARA N SVGs → ENTRADA DESDE LADOS ALTERNADOS
         ============================================================ */
      ScrollTrigger.create({
        trigger: ".balearic-soundsystem",
        start: "top bottom",
        end: "top top",
        scrub: 1,
        onUpdate: (self) => {
          const headers = document.querySelectorAll(".balearic-header");

          headers.forEach((header, i) => {
            const fromRight = i % 2 === 0;
            const startX = fromRight ? 100 : -100;
            const x = startX - startX * self.progress;
            gsap.set(header, { x: `${x}%` });
          });
        },
      });

      /* ============================================================
         2) SEGUNDA FASE → CONVERGENCIA AL CENTRO + SCALE FINAL
         ============================================================ */
      ScrollTrigger.create({
        trigger: ".balearic-soundsystem",
        start: "top top",
        end: `+=${window.innerHeight * 2}`,
        pin: true,
        scrub: 1,
        pinSpacing: false,
        onUpdate: (self) => {
          const headers = document.querySelectorAll(".balearic-header");
          const totalHeaders = headers.length;
          const mid = (totalHeaders - 1) / 2;

          if (self.progress <= 0.5) {
            // Primera mitad: convergencia hacia el centro
            const convergenceProgress = self.progress / 0.5;

            headers.forEach((header, i) => {
              // Calcular posición vertical inicial (apilados)
              const distanceFromCenter = i - mid;
              const initialY = distanceFromCenter * 100; // Cada uno a 100% de distancia
              
              // Convergen hacia y: 0 (centro)
              const y = initialY - initialY * convergenceProgress;
              gsap.set(header, { y: `${y}%` });
            });
          } else {
            // Segunda mitad: todos en el centro + escala
            const scaleProgress = (self.progress - 0.5) / 0.5;
            const minScale = window.innerWidth <= 1000 ? 0.3 : 0.1;
            const scale = 1 - scaleProgress * (1 - minScale);

            headers.forEach((header) => {
              gsap.set(header, { 
                y: "0%",
                scale 
              });
            });
          }
        },
      });
    };

    loadAnimations();
  }, []);

  return (
    <div className="about-page">
      <section className="about-section h-screen flex items-center justify-center px-6">
      </section>

      <section className="balearic-soundsystem relative h-screen flex flex-col justify-center items-center overflow-hidden">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="balearic-header w-[100%] overflow-hidden">
            <img src="/svg/BALEARIC SOUND SYSTEM.svg" className="object-cover w-full h-full" />
          </div>
        ))}
      </section>

      <section className="about-section-final h-[300vh] flex items-center justify-center px-6">
      </section>
    </div>
  );
};

export default AnimatedQuote2;