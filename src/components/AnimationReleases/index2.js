"use client";

import { useEffect } from "react";
import { DataReleases } from "../data";

const AnimationReleases2 = () => {
  // usa tantas imágenes como quieras
  const ReleaseImages = DataReleases.slice(0, 14); // cámbialo cuando quieras

  useEffect(() => {
    const runAnimation = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const Lenis = (await import("lenis")).default;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis();
      lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);

      const spotlightImages = document.querySelectorAll(".spotlight-img");

      // rotaciones iniciales que se repiten
      const baseRotations = [5, -3, 3.5, -1];

      ScrollTrigger.create({
        trigger: ".center-section",
        start: "top top",
        end: `+${window.innerHeight * 6}px`,
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;

          spotlightImages.forEach((img, index) => {
            const totalImages = spotlightImages.length;

          // cada imagen ocupa un slot proporcional del scroll total
          const spread = 0.7 / totalImages; // reparte solo el 70% del scroll

          const startOffset = index * spread;
          const endOffset = startOffset + 0.4; // cada imagen tarda el 40% de su slot


            // normalizar progreso individual
            let localProgress = (progress - startOffset) / (endOffset - startOffset);
            localProgress = Math.min(Math.max(localProgress, 0), 1);

            // easing
            const eased = 1 - Math.pow(1 - localProgress, 3);

            const rotation = baseRotations[index % baseRotations.length];
            const x = -50;
            const y = 200 - eased * 250; // de 200% → -50%

            gsap.set(img, {
              transform: `translate(${x}%, ${y}%) rotate(${rotation}deg)`,
            });
          });
        },
      });
    };

    runAnimation();
  }, []);

  return (
    <div>
      {/* INTRO */}
      <section className="intro relative w-full min-h-[100svh] p-4 overflow-hidden bg-[#d7dbd2] flex items-center">
        <h1 className="mx-auto text-center uppercase text-[clamp(2rem,10vw,5rem)] font-medium tracking-[-0.1rem] leading-[0.9] text-[#141414]">
          living the mediterranean dream
        </h1>
      </section>

      {/* SPOTLIGHT SECTION */}
      <section className="center-section relative w-full min-h-[100svh] p-4 overflow-hidden bg-[#edf1e8]">
        <div className="spotlight-images absolute top-0 left-0 w-full h-full pointer-events-none">
          {ReleaseImages.map((item, index) => (
            <div
              key={index}
              className="
                spotlight-img
                absolute
                top-1/2
                left-1/2
                w-[clamp(20rem,25vw,40rem)]
                aspect-[1/1]
                -translate-x-1/2
                translate-y-[200%]
                overflow-hidden
                [will-change:transform]
                z-[1]
              "
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* OUTRO */}
      <section className="outro relative w-full min-h-[100svh] p-4 overflow-hidden bg-[#d7dbd2] flex items-center">
        <h1 className="mx-auto text-center uppercase text-[clamp(2rem,10vw,5rem)] font-medium tracking-[-0.1rem] leading-[0.9] text-[#141414]">
          too mediterranean to care
        </h1>
      </section>
    </div>
  );
};

export default AnimationReleases2;
