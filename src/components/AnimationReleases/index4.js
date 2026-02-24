"use client";

import { useEffect } from "react";
import { DataReleases } from "../data";

const AnimationReleases4 = () => {
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

      //-------------------------------------------------------------
      // 🔵 SPOTLIGHT SCROLLTRIGGER
      //-------------------------------------------------------------
      const spotlightImages = document.querySelectorAll(".spotlight-img");
      const baseRotations = [5, -3, 3.5, -1];

      const imgTrigger = ScrollTrigger.create({
        trigger: ".center-section",
        start: "top top",
        end: `+${window.innerHeight * 6}px`,
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

            gsap.set(img, {
              transform: `translate(${x}%, ${y}%) rotate(${rotation}deg)`,
            });
          });
        }
      });

      //-------------------------------------------------------------
      // 🔵 ARTISTAS
      //-------------------------------------------------------------
      const artistWrapper = document.querySelector(".artist-list-wrapper");
      const activeImg = document.getElementById("artist-active-image");
      const activeName = document.querySelector(".artist-active-name");
      const artistContainer = document.querySelector(".artist-scroll-container");
      const artistItems = gsap.utils.toArray(".artist-item");

      activeImg.src = DataReleases[0].image;
      activeName.textContent = DataReleases[0].artist;

      artistContainer.style.overflowY = "hidden";

      const totalInnerScroll =
        artistContainer.scrollHeight - artistContainer.clientHeight;

      const totalScrollLength = totalInnerScroll + window.innerHeight * 1.5;

      //-------------------------------------------------------------
      // 🔵 2º SCROLLTRIGGER → ARTISTS
      //-------------------------------------------------------------
      const secondTrigger = ScrollTrigger.create({
        trigger: ".center-section",
        start: () => imgTrigger.end,
        end: () => "+=" + totalScrollLength,
        scrub: 1,
        pin: true,
        onEnter: () => {
          gsap.to(artistWrapper, { opacity: 1, duration: 1 });
        },
        onLeaveBack: () => {
          gsap.to(artistWrapper, { opacity: 0, duration: 0.5 });
        },
        onUpdate: (self) => {
          artistContainer.scrollTop = self.progress * totalInnerScroll;
        }
      });

      //-------------------------------------------------------------
      // 🔵 ACTIVAR ARTISTA SEGÚN CENTRADO
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

        const active = DataReleases[closestIndex];
        activeImg.src = active.image;
        activeName.textContent = active.artist;

        artistItems.forEach((el, i) => {
          el.style.opacity = i === closestIndex ? "0" : "0.4";
        });
      });

      //-------------------------------------------------------------
      // 🔵 3º SCROLLTRIGGER → CÍRCULO ORGÁNICO CON STACKING
      //-------------------------------------------------------------
      const totalImages = spotlightImages.length;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const cx = 0; // centrado horizontal relativo al transform
      const cy = 0; // centrado vertical relativo al transform
      const radius = 120; // radio pequeño para stacking central

      const circleTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".center-section",
          start: () => secondTrigger.end,
          end: "+=2000",
          scrub: true,
          pin: true,
        }
      });

      // Fade out artistas y centro
      circleTimeline.to([artistWrapper, activeImg, activeName], { opacity: 0, duration: 0.5 });

      // Animación de imágenes a círculo con stacking y variación orgánica
      spotlightImages.forEach((img, i) => {
        const angle = (i / totalImages) * 2 * Math.PI;
        const targetX = cx + radius * Math.cos(angle);
        const targetY = cy + radius * Math.sin(angle);
        const targetRotate = gsap.utils.random(-15, 15); // rotación aleatoria
        const targetScale = gsap.utils.random(0.85, 1); // escala ligera

        circleTimeline.to(img, {
          x: targetX,
          y: targetY,
          rotate: targetRotate,
          scale: targetScale,
          duration: 1,
          ease: "power1.out"
        }, 0);
      });

    };

    runAnimation();
  }, []);

  return (
    <div>
      {/* INTRO */}
      <section className="intro relative w-full min-h-[100svh] p-4 overflow-hidden bg-white flex items-center">
        <h1 className="mx-auto text-center uppercase text-[clamp(2rem,10vw,5rem)] font-medium tracking-[-0.1rem] leading-[0.9] text-[#141414]">
          living the mediterranean dream
        </h1>
      </section>

      {/* SPOTLIGHT + ARTISTS */}
      <section className="center-section relative w-full min-h-[100svh] p-4 overflow-hidden bg-white">

        {/* IMAGES */}
        <div className="spotlight-images absolute top-0 left-0 w-full h-full pointer-events-none">
          {ReleaseImages.map((item, index) => (
            <div
              key={index}
              className="spotlight-img absolute top-1/2 left-1/2 w-[clamp(20rem,25vw,40rem)] aspect-[1/1] -translate-x-1/2 translate-y-[200%] overflow-hidden [will-change:transform] z-[1]"
            >
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* ARTISTS */}
        <div className="artist-list-wrapper absolute inset-0 opacity-0 pointer-events-auto z-[5]">

          <div className="artist-center-img absolute inset-0 flex items-center justify-center pointer-events-none z-[10]">
            <div className="bg-[#edf1e8] absolute"></div>
            <img id="artist-active-image" src="" className="w-[clamp(20rem,25vw,40rem)] aspect-[1/1] object-cover absolute mix-blend-normal" />
          </div>

          <div className="artist-active-name absolute inset-0 flex items-center justify-center text-3xl uppercase tracking-tight text-white z-[20] pointer-events-none"></div>

          <div className="artist-scroll-container absolute top-0 w-full h-full no-scrollbar pt-[50vh] pb-[50vh]">
            <div className="flex flex-col items-center">
              {DataReleases.map((item, i) => (
                <div key={i} className="artist-item text-3xl uppercase text-neutral-500 h-[40px] flex items-center justify-center transition-all duration-200">
                  {item.artist}
                </div>
              ))}
            </div>
          </div>

        </div>

      </section>

      {/* OUTRO */}
      <section className="outro relative w-full min-h-[100svh] p-4 overflow-hidden bg-white flex items-center">
        <h1 className="mx-auto text-center uppercase text-[clamp(2rem,10vw,5rem)] font-medium tracking-[-0.1rem] leading-[0.9] text-[#141414]">
          too mediterranean to care
        </h1>
      </section>
    </div>
  );
};

export default AnimationReleases4;
