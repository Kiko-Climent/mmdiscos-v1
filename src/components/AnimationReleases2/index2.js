"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const NewAnimationReleases2 = () => {
  const containerRef = useRef(null);
  const ghostPinRef = useRef(null);
  const videoWrapperRef = useRef(null);

  useEffect(() => {
    let ScrollTrigger = null;

    const loadGSAP = async () => {
      const mod = await import("gsap/ScrollTrigger");
      ScrollTrigger = mod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const ghost = ghostPinRef.current;
      const wrapper = videoWrapperRef.current;
      const container = containerRef.current;

      if (!ghost || !wrapper || !container) return;

      // Estado inicial (full size)
      gsap.set(wrapper, {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
      });

      gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top+=50", // un leve scroll activa la animación
          end: "+=1",           // no importa realmente
          pin: ghost,
          anticipatePin: 1,
          toggleActions: "play none none reverse", 
          // play: al entrar
          // reverse: al volver hacia arriba
        },
      })
      .to(wrapper, {
        clipPath: "polygon(35% 35%, 65% 35%, 65% 65%, 35% 65%)",
        duration: 1,
        ease: "power3.inOut",
      });
    };

    loadGSAP();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[300vh]">
      <div ref={ghostPinRef} className="w-full h-screen"></div>

      <div
        ref={videoWrapperRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
        style={{
          width: "70vw",
          height: "70vh",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        }}
      >
        <video
          src="/video/Video MM Header.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover grayscale"
        />
      </div>
    </div>
  );
};

export default NewAnimationReleases2;
