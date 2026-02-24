"use client";
import { useEffect, useRef } from "react";

export default function ComingSoon7() {
  const videoRef = useRef(null);
  const textsRef = useRef(null);

  useEffect(() => {
    (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      // Animación scroll: video pasa de fullscreen → 500x500 en centro
      gsap.fromTo(
        videoRef.current,
        {
          width: "100vw",
          height: "100vh",
        },
        {
          width: "500px",
          height: "500px",
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".scroll-zone",
            start: "top top",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Mostrar los textos cuando el vídeo ya está reducido
      gsap.fromTo(
        textsRef.current,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.6,
          delay: 0.2,
          scrollTrigger: {
            trigger: ".scroll-zone",
            start: "top top",
            toggleActions: "play none none reverse",
          },
        }
      );
    })();
  }, []);

  return (
    <div className="relative w-screen h-[200vh]">
      {/* Zona de scroll */}
      <div className="scroll-zone absolute top-0 left-0 w-full h-[120vh]" />

      {/* Video centrado */}
      <div
        ref={videoRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <video
          src="/video/Video MM Header.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="object-cover w-full h-full"
        />
      </div>

      {/* Textos posicionados alrededor del cuadrado 500x500 */}
      <div
        ref={textsRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1440px] h-[900px] text-gray-300 uppercase pointer-events-none z-20"
        style={{ opacity: 0 }}
      >
        {/* https:// (arriba a la derecha del vídeo) */}
        <h1
          className="absolute text-[6rem] leading-[4.6rem]"
          style={{
            right: "calc(50% - 250px - 170px)", // centro - mitad video - margen
            bottom: "220px",
          }}
        >
          https://
        </h1>

        {/* mmdiscos. (debajo del anterior) */}
        <h1
          className="absolute text-[6rem] leading-[4.6rem]"
          style={{
            right: "calc(50% - 250px - 170px)",
            bottom: "160px",
          }}
        >
          mmdiscos.
        </h1>

        {/* bandcamp.com (alineado con la base del video) */}
        <h1
          className="absolute text-[6rem] leading-[4.6rem]"
          style={{
            left: "calc(50% - 250px + 220px)", // centro + mitad video + margen
            bottom: "80px",
          }}
        >
          bandcamp.com
        </h1>
      </div>
    </div>
  );
}
