import { useEffect, useRef, useState } from "react";
import { DataReleases } from "@/components/data";

const itemHeight = 40; // altura de cada item

const Releases4 = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  // Ajuste de paddings
  useEffect(() => {
    if (containerRef.current) {
      const offset = window.innerHeight / 2 - itemHeight / 2;

      // Padding superior para que el primer item quede centrado
      containerRef.current.style.paddingTop = `${offset}px`;

      // Padding inferior exacto para que el último item pueda llegar al centro
      const bottomPadding = window.innerHeight - offset - itemHeight;
      containerRef.current.style.paddingBottom = `${bottomPadding}px`;
    }
  }, []);

  // Lógica de scroll para detectar el item más cercano al centro
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
            closestIndex = index;
          }
        }
      });

      setActiveIndex(closestIndex);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white text-white">
      {/* Lista scrollable */}
      <div ref={containerRef} className="h-full overflow-y-scroll no-scrollbar">
        <div className="flex flex-col items-center">
          {DataReleases.map((release, index) => {
            const isActive = index === activeIndex;
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
        <img
          src={DataReleases[activeIndex].image}
          alt={DataReleases[activeIndex].artist}
          className="w-[500px] h-[500px] object-contain"
        />
      </div>

      {/* Nombre activo en el centro */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-3xl uppercase">
          {DataReleases[activeIndex].artist}
        </div>
      </div>
    </div>
  );
};

export default Releases4;
