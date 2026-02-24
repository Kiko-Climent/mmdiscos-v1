"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";

export default function ComingSoon3() {
  const videoRef = useRef(null);
  const [showText, setShowText] = useState(false); // <-- control de visibilidad
  const scrollRef = useRef(0);
  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;
  const finalSize = 500;

  useEffect(() => {
    const video = videoRef.current;

    // Video full viewport inicial
    gsap.set(video, {
      position: "fixed",
      top: 0,
      left: 0,
      width: vw,
      height: vh,
    });

    const handleWheel = (e) => {
      scrollRef.current += e.deltaY;

      if (scrollRef.current > 10) {
        // Scroll hacia abajo → reducir video y mostrar texto
        gsap.to(video, {
          width: finalSize,
          height: finalSize,
          x: (vw - finalSize) / 2,
          y: (vh - finalSize) / 2,
          ease: "power1.out",
          duration: 0.3,
        });
        setShowText(true);
      } else if (scrollRef.current <= 0) {
        // Scroll hacia arriba → full viewport y ocultar texto
        scrollRef.current = 0;
        gsap.to(video, {
          width: vw,
          height: vh,
          x: 0,
          y: 0,
          ease: "power1.out",
          duration: 0.3,
        });
        setShowText(false);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <video
        ref={videoRef}
        src="/video/Video MM Header.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="object-cover will-change-transform z-10"
      />

      {/* Texto que aparece solo al escalar */}
      {showText && (
        <div className="fixed bottom-4 right-[9.66rem] -translate-y-1/2 w-full text-gray-300 z-11">
          <div className="flex flex-col text-8xl uppercase leading-[4.54rem] justify-end items-end">
            <h1 className="translate-x-23">https://</h1>
            <h1 className="translate-x-20">mmdiscos.</h1>
            <h1 className="-translate-x-2">bandcamp.com/</h1>
          </div>
        </div>
      )}
    </div>
  );
}
