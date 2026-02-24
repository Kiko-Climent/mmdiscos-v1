// components/HeroReleases.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { DataReleases } from "@/components/data";

export default function HeroReleases() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [showReleases, setShowReleases] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef([]);
  const itemHeight = 40;

  // Datos extendidos para scroll infinito
  const extendedData = [...DataReleases, ...DataReleases, ...DataReleases];
  const middleOffset = DataReleases.length;

  // Animación HeroVideo
  useEffect(() => {
    let ScrollTrigger;
    import("gsap/dist/ScrollTrigger").then((mod) => {
      ScrollTrigger = mod.default;
      gsap.registerPlugin(ScrollTrigger);

      const video = videoRef.current;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const finalSize = 500;

      gsap.to(video, {
        scaleX: finalSize / vw,
        scaleY: finalSize / vh,
        x: () => vw / 2 - finalSize / 2,
        y: () => vh / 2 - finalSize / 2,
        transformOrigin: "top left",
        ease: "power1.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=100",
          scrub: true,
          onUpdate: (self) => {
            // Cuando el scroll alcanza el final de la animación, mostramos Releases2
            if (self.progress >= 1) setShowReleases(true);
          },
        },
      });
    });
  }, []);

  // Inicializamos scroll infinito Releases2
  useEffect(() => {
    if (!showReleases) return;
    const container = containerRef.current;
    if (!container) return;

    container.scrollTop = middleOffset * itemHeight;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const centerY = container.offsetHeight / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      itemRefs.current.forEach((item, index) => {
        if (item) {
          const rect = item.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const itemCenter = rect.top + rect.height / 2 - containerRect.top;
          const distance = Math.abs(centerY - itemCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        }
      });

      setActiveIndex(closestIndex % DataReleases.length);

      const totalHeight = DataReleases.length * itemHeight;
      if (scrollTop < totalHeight * 0.5) {
        container.scrollTop += totalHeight;
      } else if (scrollTop > totalHeight * 1.5) {
        container.scrollTop -= totalHeight;
      }
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [showReleases]);

  return (
    <div ref={containerRef} className="relative w-screen h-[200vh]">
      {/* HeroVideo */}
      {!showReleases && (
        <video
          ref={videoRef}
          src="/video/Video MM Header.mp4"
          autoPlay
          muted
          loop
          className="fixed top-0 left-0 w-screen h-screen object-cover will-change-transform z-10"
        />
      )}

      {/* Releases2 */}
      {showReleases && (
        <>
          {/* Scrollable de nombres */}
          <div className="relative z-20 w-full h-full overflow-y-scroll no-scrollbar">
            <div className="flex flex-col items-center py-20">
              {extendedData.map((release, index) => {
                const isActive = index % DataReleases.length === activeIndex;
                return (
                  <div
                    key={index}
                    ref={(el) => (itemRefs.current[index] = el)}
                    style={{ height: itemHeight }}
                    className={`flex items-center justify-center text-3xl font-semibold uppercase transition-all duration-300 ${
                      isActive ? "opacity-0" : "text-gray-400"
                    }`}
                  >
                    {release.artist}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Imagen central */}
          <div className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none">
            <img
              src={DataReleases[activeIndex].image}
              alt={DataReleases[activeIndex].artist}
              className="w-[500px] h-[500px] object-contain"
            />
          </div>

          {/* Texto activo sobre la imagen */}
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="text-white text-3xl font-semibold uppercase">
              {DataReleases[activeIndex].artist}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
