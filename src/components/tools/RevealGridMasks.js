"use client";

import { useEffect, useRef } from "react";

const clipPaths = [
  "polygon(0% 0%, 33.5% 0%, 33.5% 33.5%, 0% 33.5%)",
  "polygon(33% 0%, 66.5% 0%, 66.5% 33.5%, 33% 33.5%)",
  "polygon(66% 0%, 100% 0%, 100% 33.5%, 66% 33.5%)",
  "polygon(0% 33%, 33.5% 33%, 33.5% 66.5%, 0% 66.5%)",
  "polygon(33% 33%, 66.5% 33%, 66.5% 66.5%, 33% 66.5%)",
  "polygon(66% 33%, 100% 33%, 100% 66.5%, 66% 66.5%)",
  "polygon(0% 66%, 33.5% 66%, 33.5% 100%, 0% 100%)",
  "polygon(33% 66%, 66.5% 66%, 66.5% 100%, 33% 100%)",
  "polygon(66% 66%, 100% 66%, 100% 100%, 66% 100%)",
];

export default function RevealVideoMask({ trigger, start = "top 80%" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    let gsap, ScrollTrigger;

    async function loadGSAP() {
      gsap = (await import("gsap")).default;
      ScrollTrigger = (await import("gsap/ScrollTrigger")).ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const container = containerRef.current;
      const masks = container.querySelectorAll(".video-mask");

      // Inicial: las masks cubren el video con efecto RGB
      masks.forEach((mask, index) => {
        gsap.set(mask, {
          clipPath: clipPaths[index],
          opacity: 1,
          filter: "drop-shadow(2px 0px 0 red) drop-shadow(-2px 0px 0 blue) drop-shadow(0px 2px 0 green)",
        });
      });

      const shuffled = gsap.utils.shuffle([...masks]);

      // Timeline de reveal con efecto RGB dinámico
      gsap.timeline({
        scrollTrigger: {
          trigger: trigger || container,
          start,
          toggleActions: "play none none reverse",
        },
      }).to(shuffled, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.inOut", // <--- aquí está el easing más smooth
        stagger: {
            amount: 1.2,
            from: "random",
            repeat: 2,
            yoyo: true,
        },
        onUpdate: function () {
            masks.forEach((mask) => {
                const r = Math.random() * 4 - 2;
                const g = Math.random() * 4 - 2;
                const b = Math.random() * 4 - 2;
                mask.style.filter = `drop-shadow(${r}px 0px 0 red) drop-shadow(${-r}px 0px 0 blue) drop-shadow(0px ${g}px 0 green)`;
            });
        },
    });
    
    }

    loadGSAP();
  }, [trigger, start]);

  return (
    <div ref={containerRef} className="video-reveal-container absolute inset-0">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="video-mask absolute inset-0" />
      ))}
    </div>
  );
}
