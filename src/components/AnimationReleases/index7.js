"use client";

import { useEffect } from "react";
import { DataReleases } from "../data";

const AnimationReleases7 = () => {
  const ReleaseImages = DataReleases.slice(0, 14);

  useEffect(() => {
    const runAnimation = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const Lenis = (await import("lenis")).default;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis();
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      const spotlightImages = document.querySelectorAll(".spotlight-img");
      const baseRotations = [5, -3, 3.5, -1];
      const videoEl = document.querySelector(".spotlight-video");

      // Evita el salto al escalar la primera vez
      ScrollTrigger.addEventListener("refreshInit", () => {
        const finalVW = 25;
        const finalWidth = (finalVW / 100) * window.innerWidth;
        const finalHeight = finalWidth;
        const initialHeight = finalHeight;
        const initialWidth = initialHeight * (16 / 9);

        gsap.set(videoEl, {
          height: `${initialHeight}px`,
          width: `${initialWidth}px`,
          xPercent: -50,
          yPercent: -50,
        });
      });


      //-------------------------------------------------------------
      // 1️⃣ ESCALADO RÁPIDO DEL VIDEO — MODIFICADO SOLO ESTA PARTE
      //-------------------------------------------------------------
      const videoScroll = window.innerHeight * 0.8;
      const videoTrigger = ScrollTrigger.create({
        trigger: ".center-section",
        start: "top top",
        end: `+=${videoScroll}`,
        scrub: 1,
        pin: true,
        onUpdate: (self) => {
          const progress = self.progress;

          // === CÁLCULO REAL DEL TAMAÑO FINAL CUADRADO (25vw como tus spotlight-img) ===
          const finalVW = 25;
          const finalWidth = (finalVW / 100) * window.innerWidth;

          // El cuadrado final → ancho = alto
          const finalHeight = finalWidth;

          // Altura inicial = altura final (se mantiene siempre igual)
          const initialHeight = finalHeight;

          // Ancho inicial = 16:9 manteniendo esa altura
          const initialWidth = initialHeight * (16 / 9);

          // Interpolación 16:9 → 1:1
          const currentWidth =
            initialWidth - (initialWidth - finalWidth) * progress;

          gsap.set(videoEl, {
            height: `${initialHeight}px`,   // altura fija
            width: `${currentWidth}px`,     // solo cambia el ancho
            xPercent: -50,
            yPercent: -50,
          });
        }
      });

      //-------------------------------------------------------------
      // 2️⃣ STACK DE IMÁGENES (progresivo)
      //-------------------------------------------------------------
      const totalScrollImages = window.innerHeight * (2 + spotlightImages.length * 0.5);
      const stackTrigger = ScrollTrigger.create({
        trigger: ".center-section",
        start: () => videoTrigger.end,
        end: `+=${totalScrollImages}`,
        scrub: 1,
        pin: true,
        onUpdate: (self) => {
          const progress = self.progress;

          spotlightImages.forEach((img, index) => {
            const totalImages = spotlightImages.length;
            const spread = 0.7 / totalImages;
            const startOffset = index * spread;
            const endOffset = startOffset + 0.4;

            let localProgress = (progress - startOffset) / (endOffset - startOffset);
            localProgress = Math.min(Math.max(localProgress, 0), 1);

            const eased = 1 - Math.pow(1 - localProgress, 3);
            const rotation = baseRotations[index % baseRotations.length];
            const x = -50;
            const y = 200 - eased * 250;

            gsap.set(img, { transform: `translate(${x}%, ${y}%) rotate(${rotation}deg)` });
          });
        }
      });

      //-------------------------------------------------------------
      // ARTIST LIST + SYNC
      //-------------------------------------------------------------
      const artistWrapper = document.querySelector(".artist-list-wrapper");
      const artistContainer = document.querySelector(".artist-scroll-container");
      const artistItems = gsap.utils.toArray(".artist-item");
      const activeArtistDisplay = document.querySelector(".artist-active");

      artistContainer.style.overflowY = "hidden";
      const totalInnerScroll = artistContainer.scrollHeight - artistContainer.clientHeight;
      const totalScrollLength = totalInnerScroll + window.innerHeight * 1.5;

      const secondTrigger = ScrollTrigger.create({
        trigger: ".center-section",
        start: () => stackTrigger.end,
        end: () => "+=" + totalScrollLength,
        scrub: 1,
        pin: true,
        onEnter: () => {
          gsap.to(artistWrapper, { opacity: 1, duration: 1 });
          gsap.to(activeArtistDisplay, { opacity: 1, duration: 0.5 });
        },
        onLeave: () => gsap.to(activeArtistDisplay, { opacity: 0, duration: 0.5 }),
        onEnterBack: () => {
          gsap.to(artistWrapper, { opacity: 1, duration: 0.5 });
          gsap.to(activeArtistDisplay, { opacity: 1, duration: 0.5 });
        },
        onLeaveBack: () => {
          gsap.to(artistWrapper, { opacity: 0, duration: 0.5 });
          gsap.to(activeArtistDisplay, { opacity: 0, duration: 0.5 });
        },
        onUpdate: (self) => {
          artistContainer.scrollTop = self.progress * totalInnerScroll;
        }
      });

      //-------------------------------------------------------------
      // SINCRONIZAR ARTISTA ACTIVO + IMÁGENES
      //-------------------------------------------------------------
      artistContainer.addEventListener("scroll", () => {
        const containerRect = artistContainer.getBoundingClientRect();
        const centerY = containerRect.top + containerRect.height / 2;

        let closestIndex = 0;
        let minDistance = Infinity;

        artistItems.forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          const itemCenter = rect.top + rect.height / 2;
          const distance = Math.abs(centerY - itemCenter);

          if (distance < minDistance) {
            closestIndex = index;
            minDistance = distance;
          }
        });

        artistItems.forEach((el, i) => {
          el.style.opacity = i === closestIndex ? "1" : "0.4";
          el.style.color = i === closestIndex ? "#000" : "#888";
          el.style.transform = i === closestIndex ? "scale(1.1)" : "scale(1)";
        });

        spotlightImages.forEach((img, i) => {
          if (i === closestIndex) {
            gsap.to(img, { zIndex: 10, scale: 1.05, duration: 0.25, ease: "power2.out" });
          } else {
            gsap.to(img, { zIndex: 1, scale: 1, duration: 0.25, ease: "power2.out" });
          }
        });

        activeArtistDisplay.innerText = artistItems[closestIndex].innerText;
      });

      //-------------------------------------------------------------
      // 3️⃣ EXIT ANIMATION
      //-------------------------------------------------------------
      const vh = window.innerHeight;
      const exitTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".center-section",
          start: () => secondTrigger.end,
          end: "+=1500",
          scrub: true,
          pin: true
        }
      });

      exitTimeline.to(artistWrapper, { opacity: 0, duration: 0.5 });

      spotlightImages.forEach((img, index) => {
        const delayProgress = index / spotlightImages.length;
        exitTimeline.to(img, {
          y: -vh - 100,
          duration: 1,
          ease: "power1.inOut"
        }, delayProgress);
      });

    };

    runAnimation();
  }, []);

  return (
    <div>
      <section className="intro relative w-full min-h-[100svh] p-4 overflow-hidden bg-white flex items-center">
        <h1 className="mx-auto text-center uppercase text-[clamp(2rem,10vw,5rem)] font-medium tracking-[-0.1rem] leading-[0.9] text-[#141414]">
          living the mediterranean dream
        </h1>
      </section>

      <section className="center-section relative w-full min-h-[100svh] p-4 overflow-hidden bg-white">
        <div className="spotlight-video absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[0] overflow-hidden">
          <video src="/video/Video MM Header.mp4" autoPlay muted loop className="w-full h-full object-cover grayscale" />
        </div>

        <div className="spotlight-images absolute inset-0 pointer-events-none z-[10]">
          {ReleaseImages.map((item, index) => (
            <div
              key={index}
              className="spotlight-img absolute top-1/2 left-1/2 w-[clamp(20rem,25vw,40rem)] aspect-[1/1] -translate-x-1/2 translate-y-[200%] overflow-hidden [will-change:transform] z-[1]"
            >
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <div className="artist-list-wrapper absolute inset-0 z-[5] opacity-0 pointer-events-auto">
          <div className="artist-scroll-container absolute top-0 w-full h-full no-scrollbar pt-[50vh] pb-[50vh]">
            <div className="flex flex-col items-center">
              {DataReleases.map((item, i) => (
                <div
                  key={i}
                  className="artist-item text-3xl uppercase text-neutral-500 h-[40px] flex items-center justify-center transition-all duration-200"
                >
                  {item.artist}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="artist-active absolute top-1/2 left-1/2 z-[50] -translate-x-1/2 -translate-y-1/2 text-3xl text-white pointer-events-none" />
      </section>

      <section className="outro relative w-full min-h-[100svh] p-4 overflow-hidden bg-white flex items-center">
        <h1 className="mx-auto text-center uppercase text-[clamp(2rem,10vw,5rem)] font-medium tracking-[-0.1rem] leading-[0.9] text-[#141414]">
          too mediterranean to care
        </h1>
      </section>
    </div>
  );
};

export default AnimationReleases7;
