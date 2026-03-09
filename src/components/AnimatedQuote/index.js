import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AnimatedQuote = () => {
  useEffect(() => {
    const triggers = [];

    triggers.push(ScrollTrigger.create({
        trigger: ".balearic-soundsystem",
        start: "top bottom",
        end: "top top",
        scrub: 1,
        onUpdate: (self) => {
          const headers = document.querySelectorAll(".balearic-header");

          headers.forEach((header, i) => {
            const fromRight = i % 2 === 0; // pares → derecha; impares → izquierda
            const startX = fromRight ? 100 : -100;
            const x = startX - startX * self.progress;
            gsap.set(header, { x: `${x}%` });
          });
        },
    }));

    triggers.push(ScrollTrigger.create({
        trigger: ".balearic-soundsystem",
        start: "top top",
        end: `+=${window.innerHeight * 2}`,
        pin: true,
        scrub: 1,
        pinSpacing: false,
        onUpdate: (self) => {
          const headers = document.querySelectorAll(".balearic-header");
          const mid = Math.floor(headers.length / 2);

          if (self.progress <= 0.5) {
            const yProgress = self.progress / 0.5;

            headers.forEach((header, i) => {
              if (i < mid) {
                // Los de arriba bajan: distancia aumenta con cada elemento
                const distance = (mid - i) * 100;
                gsap.set(header, { y: `${yProgress * distance}%` });
              } else if (i > mid) {
                // Los de abajo suben: distancia aumenta con cada elemento
                const distance = (i - mid) * 100;
                gsap.set(header, { y: `${yProgress * -distance}%` });
              }
            });

          } else {
            headers.forEach((header, i) => {
              if (i < mid) {
                const distance = (mid - i) * 100;
                gsap.set(header, { y: `${distance}%` });
              } else if (i > mid) {
                const distance = (i - mid) * 100;
                gsap.set(header, { y: `${-distance}%` });
              }
            });

            const scaleProgress = (self.progress - 0.5) / 0.5;
            const minScale = window.innerWidth <= 1000 ? 0.3 : 0.1;
            const scale = 1 - scaleProgress * (1 - minScale);

            headers.forEach((header) => gsap.set(header, { scale }));
          }
        },
    }));

    return () => triggers.forEach((t) => t.kill());
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

export default AnimatedQuote;