"use client";

import { useEffect } from "react";
import { DataReleases } from "../data";

const AnimationReleases = () => {
  const ReleaseImages = DataReleases.slice(0, 4);

  useEffect(() => {
    // Importaciones SOLO en cliente
    const runAnimation = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const Lenis = (await import("lenis")).default;

      gsap.registerPlugin(ScrollTrigger);

      // LENIS
      const lenis = new Lenis();
      lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);

      // POSICIONES FINALES
      const spotlightImgFinalPos = [
        [-140, -140],
        [40, -130],
        [-160, 40],
        [20, 30],
      ];

      const spotlightImages = document.querySelectorAll(".spotlight-img");

      ScrollTrigger.create({
        trigger: ".center-section",
        start: "top top",
        end: `+${window.innerHeight * 6}px`,
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;

          const initialRotations = [5, -3, 3.5, -1];
          const phaseOneStartOffsets = [0, 0.1, 0.2, 0.3];

          spotlightImages.forEach((img, index) => {
            const initialRotation = initialRotations[index];
            const phase1Start = phaseOneStartOffsets[index];
            const phase1End = Math.min(
              phase1Start + (0.45 - phase1Start) * 0.9,
              0.45
            );

            let x = -50;
            let y, rotation;

            if (progress < phase1Start) {
              y = 200;
              rotation = initialRotation;
            } else if (progress <= 0.45) {
              let phase1Progress;

              if (progress >= phase1End) {
                phase1Progress = 1;
              } else {
                const linearProgress =
                  (progress - phase1Start) / (phase1End - phase1Start);
                phase1Progress = 1 - Math.pow(1 - linearProgress, 3);
              }

              y = 200 - phase1Progress * 250;
              rotation = initialRotation;
            } else {
              y = -50;
              rotation = initialRotation;
            }

            const phaseTwoStartOffsets = [0.5, 0.55, 0.6, 0.65];
            const phase2Start = phaseTwoStartOffsets[index];
            const phase2End = Math.min(
              phase2Start + (0.95 - phase2Start) * 0.9,
              0.95
            );
            const finalX = spotlightImgFinalPos[index][0];
            const finalY = spotlightImgFinalPos[index][1];

            if (progress >= phase2Start && progress <= 0.95) {
              let phase2Progress;

              if (progress >= phase2End) {
                phase2Progress = 1;
              } else {
                const linearProgress =
                  (progress - phase2Start) / (phase2End - phase2Start);
                phase2Progress = 1 - Math.pow(1 - linearProgress, 3);
              }

              x = -50 + (finalX + 50) * phase2Progress;
              y = -50 + (finalY + 50) * phase2Progress;
              rotation = initialRotation * (1 - phase2Progress);
            } else if (progress > 0.95) {
              x = finalX;
              y = finalY;
              rotation = 0;
            }

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

export default AnimationReleases;
