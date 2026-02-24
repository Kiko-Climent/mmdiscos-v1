"use client";
import { useEffect, useRef } from "react";

export default function ComingSoon4() {
  const wrapperRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const baseWidth = 1440;
      const baseHeight = 900;
      const baseVideoSize = 500;
      const baseTextSize = 6; // rem
      const baseLineHeight = 4.6; // rem
      const baseBottom = 124; // px
      const baseRight = 170; // px

      function updateLayout() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const scaleFactor = Math.min(vw / baseWidth, vh / baseHeight);

        gsap.set(wrapperRef.current, {
          width: vw,
          height: vh,
          scaleX: 1,
          scaleY: 1,
          top: "50%",
          left: "50%",
          xPercent: -50,
          yPercent: -50,
          transformOrigin: "center center",
        });

        gsap.set(textRef.current, {
          fontSize: `${baseTextSize * scaleFactor}rem`,
          lineHeight: `${baseLineHeight * scaleFactor}rem`,
          bottom: baseBottom * scaleFactor,
          right: baseRight * scaleFactor,
        });
      }

      updateLayout();
      window.addEventListener("resize", updateLayout);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".scroll-zone",
          start: "top top", // al hacer scroll sobre el div
          toggleActions: "play reverse play reverse",
        },
      });

      tl.to(wrapperRef.current, {
        width: baseVideoSize,
        height: baseVideoSize,
        duration: 0.6,
        ease: "power2.out",
      });

      tl.to(
        textRef.current,
        {
          autoAlpha: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        "<"
      );

      return () => window.removeEventListener("resize", updateLayout);
    })();
  }, []);

  return (
    <div className="relative w-screen scroll-zone h-[120vh]">
      {/* Scroll zone extra */}
      <div className="absolute top-0 left-0" />

      {/* Video */}
      <div
        ref={wrapperRef}
        className="fixed -translate-x-1/2 -translate-y-1/2 will-change-transform top-1/2 left-1/2"
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

      {/* Texto */}
      <div
        ref={textRef}
        className="fixed text-gray-300 opacity-0"
      >
        <div className="flex flex-col uppercase justify-end items-end">
          <h1 className="translate-x-[5.8rem]">https://</h1>
          <h1 className="translate-x-[5.05rem]">mmdiscos.</h1>
          <h1 className="-translate-x-[2.90rem]">bandcamp.com</h1>
        </div>
      </div>
    </div>
  );
}
