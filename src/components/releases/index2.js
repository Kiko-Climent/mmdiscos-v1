import { useEffect, useRef, useState } from "react";
import { DataReleases } from "@/components/data";

const Releases2 = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const itemHeight = 40;

  const extendedData = [...DataReleases, ...DataReleases, ...DataReleases];
  const middleOffset = DataReleases.length;

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = middleOffset * itemHeight;
    }
  }, []);

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
  }, []);

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* Scrollable de nombres (todos los elementos para scroll infinito) */}
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
                className={`flex items-center justify-center text-3xl font-semibold uppercase scale-100 transition-all duration-300 ${
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
    </div>



  );
};

export default Releases2;
