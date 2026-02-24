import { useEffect, useRef, useState } from "react";
import { DataReleases } from "@/components/data";
import { gsap } from "gsap";

const Releases3 = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const imageRef = useRef(null);
  const itemHeight = 40;

  const extendedData = [...DataReleases, ...DataReleases, ...DataReleases];
  const middleOffset = DataReleases.length;

  // Scroll inicial
  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = middleOffset * itemHeight;
  }, []);

  // Scroll infinito y activeIndex
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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

      if (closestIndex % DataReleases.length !== activeIndex) {
        setPrevIndex(activeIndex);
        setActiveIndex(closestIndex % DataReleases.length);
      }

      const totalHeight = DataReleases.length * itemHeight;
      if (scrollTop < totalHeight * 0.5) container.scrollTop += totalHeight;
      else if (scrollTop > totalHeight * 1.5) container.scrollTop -= totalHeight;
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [activeIndex]);

  // Animación clip-path polygon solo para la imagen
  useEffect(() => {
    if (imageRef.current) {
      gsap.fromTo(
        imageRef.current,
        { clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)" },
        { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 0.8, ease: "power2.out" }
      );
    }
  }, [activeIndex]);

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* Scrollable de nombres */}
      <div
        ref={containerRef}
        className="relative z-20 w-full h-full overflow-y-scroll no-scrollbar"
      >
        <div className="flex flex-col items-center py-20">
          {extendedData.map((release, index) => {
            const isActive = index % DataReleases.length === activeIndex;
            return (
              <div
                key={index}
                ref={(el) => (itemRefs.current[index] = el)}
                style={{ height: 40 }}
                className={`flex items-center justify-center text-3xl font-semibold uppercase ${
                  isActive ? "opacity-0" : "text-gray-400"
                }`}
              >
                {release.artist}
              </div>
            );
          })}
        </div>
      </div>

      {/* Imagen previa */}
      {prevIndex !== null && (
        <div className="fixed inset-0 flex items-center justify-center z-25 pointer-events-none">
          <img
            src={DataReleases[prevIndex].image}
            alt={DataReleases[prevIndex].artist}
            className="w-[500px] h-[500px] object-contain"
          />
        </div>
      )}

      {/* Imagen central animada */}
      <div className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none">
        <img
          ref={imageRef}
          src={DataReleases[activeIndex].image}
          alt={DataReleases[activeIndex].artist}
          className="w-[500px] h-[500px] object-contain"
        />
      </div>

      {/* Texto activo fijo sobre la imagen */}
      <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
        <div className="text-white text-3xl font-semibold uppercase">
          {DataReleases[activeIndex].artist}
        </div>
      </div>
    </div>
  );
};

export default Releases3;
