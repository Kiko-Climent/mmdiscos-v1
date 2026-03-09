"use client";

import { useEffect, useRef } from "react";
import styles from "./MM_Hero.module.css";

export default function MM_Hero() {
  const backdropRef = useRef(null);
  const bgRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const runAnimation = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { Flip } = await import("gsap/all");
      
      gsap.registerPlugin(ScrollTrigger, Flip);

      const box = bgRef.current;
      const logo = logoRef.current;
      if (!box || !logo) return;

      const isDesktop = window.innerWidth >= 720;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const initialWidth = box.offsetWidth;
      const initialHeight = box.offsetHeight;

      if (!isDesktop) {
        gsap.set(logo, { width: 250, top: 0, bottom: "auto", padding: "1rem 2.5rem" });
        gsap.set(box, { width: "100%", height: "100vh" });
        return;
      }

      // Animación del box
      gsap.timeline({
        scrollTrigger: {
          trigger: backdropRef.current,
          start: "top top",
          end: `+=${viewportHeight}px`,
          scrub: 1,
        },
      }).to(box, {
        width: viewportWidth,
        height: viewportHeight,
        backgroundColor: "rgba(249, 244, 235, 1)",
        ease: "none",
      });

      // Animación del logo (independiente)
      gsap.timeline({
        scrollTrigger: {
          trigger: backdropRef.current,
          start: "top top",
          end: `+=${viewportHeight}px`,
          scrub: 1,
        },
      }).to(logo, {
        width: 250,
        top: 0,
        bottom: "auto",
        padding: "1rem 2.5rem",
        ease: "none",
      });
    };

    runAnimation();

    return () => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      });
    };
  }, []);

  return (
    <>
      <div ref={backdropRef} className={styles.spacer} />

      <div className={styles.videoContainer}>
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src="/video/MM Hero BG_1.mp4" type="video/mp4" />
        </video>
      </div>

      <div ref={bgRef} className={styles.box} />

      {/* Logo con z-index altísimo */}
      <div ref={logoRef} className={styles.logo}>
        <img src="/logo/Balearic Sound System Logo.svg" alt="MM Discos" />
      </div>
    </>
  );
}