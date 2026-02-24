// components/HeroVideo.jsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function HeroVideo() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let ScrollTrigger;
    import("gsap/dist/ScrollTrigger").then((mod) => {
      ScrollTrigger = mod.default;
      gsap.registerPlugin(ScrollTrigger);

      const video = videoRef.current;
      const container = containerRef.current;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const finalSize = 500;

      // Escala para que el video pase de full viewport a 500x500
      const scaleX = finalSize / vw;
      const scaleY = finalSize / vh;

      // Animación GSAP
      gsap.to(video, {
        scaleX: scaleX,
        scaleY: scaleY,
        x: () => vw / 2 - finalSize / 2,
        y: () => vh / 2 - finalSize / 2,
        transformOrigin: "top left",
        ease: "power1.out",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=100", // poco scroll
          scrub: true,
        },
      });
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-screen"
      style={{ minHeight: "200vh" }} // altura suficiente para scroll
    >
      <video
        ref={videoRef}
        src="/video/Video MM Header.mp4"
        autoPlay
        muted
        loop
        className="fixed top-0 left-0 w-screen h-screen object-cover will-change-transform"
      />
    </div>
  );
}
