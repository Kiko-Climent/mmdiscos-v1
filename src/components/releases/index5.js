"use client";
import { useEffect, useRef, useState } from "react";
import { DataReleases2 } from "../data/index2";

const itemHeight = 40;
const imageSize = 500;

export default function ReleasesWithVideo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0); // estado para altura de ventana
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const videoRef = useRef(null);

  // Guardar altura de ventana en el cliente
  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  // Ajuste de paddings
  useEffect(() => {
    if (!containerRef.current || !windowHeight) return;

    const offset = windowHeight / 2 - imageSize / 2;
    containerRef.current.style.paddingTop = `${offset}px`;
    const bottomPadding = windowHeight - offset - itemHeight;
    containerRef.current.style.paddingBottom = `${bottomPadding}px`;
  }, [windowHeight]);

  // Animación del video fullscreen → 500x500
  useEffect(() => {
    if (!windowHeight) return;
    (async () => {
      const gsapModule = await import("gsap");
      const gsap = gsapModule.default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      if (!videoRef.current || !containerRef.current) return;

      gsap.fromTo(
        videoRef.current,
        { width: "100vw", height: "100vh" },
        {
          width: `${imageSize}px`,
          height: `${imageSize}px`,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: `${imageSize}px`,
            scrub: true,
          },
        }
      );
    })();
  }, [windowHeight]);

  // Scroll: detectar item activo
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
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
            closestIndex = index + 1; // +1 porque el primer item es el video
          }
        }
      });

      setActiveIndex(closestIndex);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  if (!windowHeight) return null; // esperar a que tengamos la altura

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white text-white">
      {/* Lista scrollable */}
      <div ref={containerRef} className="h-full overflow-y-scroll no-scrollbar">
        <div className="flex flex-col items-center">
          {/* Video fullscreen */}
          <div
            ref={videoRef}
            className="flex items-center justify-center"
            style={{ height: windowHeight }}
          >
            <video
              src={DataReleases2[0].image}
              autoPlay
              muted
              loop
              playsInline
              className="object-cover w-full h-full"
            />
          </div>

          {/* Resto de releases */}
          {DataReleases2.slice(1).map((release, index) => {
            const isActive = index + 1 === activeIndex;
            return (
              <div
                key={index}
                ref={(el) => (itemRefs.current[index] = el)}
                style={{ height: itemHeight }}
                className={`flex items-center justify-center text-3xl uppercase transition-all duration-300 ${
                  isActive ? "opacity-0" : "text-gray-500"
                }`}
              >
                {release.artist}
              </div>
            );
          })}
        </div>
      </div>

      {/* Imagen fija en centro */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {activeIndex === 0 ? null : (
          <img
            src={DataReleases2[activeIndex].image}
            alt={DataReleases2[activeIndex].artist}
            className="w-[500px] h-[500px] object-contain"
          />
        )}
      </div>

      {/* Nombre activo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {activeIndex === 0 ? null : (
          <div className="text-3xl uppercase">
            {DataReleases2[activeIndex].artist}
          </div>
        )}
      </div>
    </div>
  );
}
