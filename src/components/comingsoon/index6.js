"use client";
import { useEffect, useRef } from "react";

export default function ComingSoon6() {
  const wrapperRef = useRef(null);

  useEffect(() => {
    (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const baseVideoSize = 500;


      function updateLayout() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

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
    </div>
  );
}
