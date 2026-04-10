"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function MMDiscosHero() {
  const spacerRef = useRef(null);
  const boxRef = useRef(null);
  const logoRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const box = boxRef.current;
    const logo = logoRef.current;
    const spacer = spacerRef.current;
    if (!box || !logo || !spacer) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isDesktop = vw >= 720;

    if (!isDesktop) {
      gsap.set(logo, {
        top: 0,
        left: 0,
        width: 250,
        padding: "1rem 2.5rem",
        opacity: 1,
      });
      gsap.set(box, {
        width: "100%",
        height: "100vh",
        top: 0,
        left: 0,
        transform: "none",
        backgroundColor: "rgba(255, 255, 255, 1)",
      });
      return;
    }

    const boxW = box.offsetWidth;
    const boxH = box.offsetHeight;
    const boxLeft = (vw - boxW) / 2;
    const boxTop = (vh - boxH) / 2;

    gsap.set(logo, {
      left: boxLeft,
      width: boxW,
      padding: "2.5rem",
      top: "auto",
      bottom: vh - (boxTop + boxH),
    });

    const logoRect = logo.getBoundingClientRect();
    const startTop = logoRect.top;
    const startLeft = boxLeft;
    const startWidth = boxW;

    gsap.set(logo, { top: startTop, bottom: "auto", opacity: 1 });

    const endWidth = 250;
    const endLeft = (vw - endWidth) / 2;
    const endTop = 0;

    gsap.set(box, { width: boxW, height: boxH });

    const trigger = ScrollTrigger.create({
      trigger: spacer,
      start: "top top",
      end: `+=${vh}px`,
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;

        gsap.set(box, {
          width: gsap.utils.interpolate(boxW, vw, p),
          height: gsap.utils.interpolate(boxH, vh, p),
          backgroundColor: `rgba(255, 255, 255, ${gsap.utils.interpolate(0.35, 1, p)})`,
        });

        gsap.set(logo, {
          top: gsap.utils.interpolate(startTop, endTop, p),
          left: gsap.utils.interpolate(startLeft, endLeft, p),
          width: gsap.utils.interpolate(startWidth, endWidth, p),
        });

        if (videoRef.current) {
          gsap.set(videoRef.current, { opacity: 1 - p });
        }
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <>
      {/* ── Spacer: crea el scroll space para la animación (200svh) ── */}
      <div ref={spacerRef} style={{ height: "200svh", pointerEvents: "none" }} />

      {/* ── Video de fondo ── */}
      <div
        ref={videoRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100svh",
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        >
          <source src="/video/MM Hero BG_1.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── Caja blanca que se expande a pantalla completa ── */}
      <div
        ref={boxRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "35%",
          aspectRatio: "16/9",
          backgroundColor: "rgba(255, 255, 255, 0.35)",
          backdropFilter: "blur(3px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Logo animado ── */}
      <div
        ref={logoRef}
        style={{
          position: "fixed",
          zIndex: 9999,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        <img
          src="/logo/Balearic Sound System Logo.svg"
          alt="MM Discos"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      {/* ────────────────────────────────────────────────────────────
          Contenido que scrollea sobre el fondo blanco fijo.
          position: relative + zIndex > el box para quedar encima.
          El box (fixed, blanco opaco) actúa como fondo de página.
      ──────────────────────────────────────────────────────────── */}

      {/* Sección hero — equivalente a .hero del tutorial */}
      {/* Sección hero — lista de artistas */}
        <section
        style={{
            position: "relative",
            zIndex: 10000,
            width: "100%",
            minHeight: "60svh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "2.5rem 2.5rem",
        }}
        >
        <p
            style={{
            // width: "50%",
            fontSize: "clamp(1.4rem, 2.8vw, 3.2rem)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "0.01em",
            textTransform: "lowercase",
            textAlign: "left",
            }}
        >
            Asa Tate, Daichi, Nic Jalusi, Pleasure Voyage, Mogwaa, Statues, Mori Ra,
            Longhair, Kross Section, Komodo, Marvin & Guy, Distance, Guillaume,
            Pontcho, Saturn, Komodo, Corben, Bonnie & Klein, Celex, Florin Büchel,
            NairLess, Hal Incandenza, Volta Cab, Coyote, Marcello Giordani, Albion,
            Serasso, Atlantic Brain, Jaisiel, Trepanado, Ruf Dug, Chida, Franz Scala,
            Sankt Göran, The.Deal, A Beat Disciple, Jakob Mäder, Da Silva,
        </p>
        </section>

        {/* Sección about — texto */}
        <section
        style={{
            position: "relative",
            zIndex: 10000,
            width: "100%",
            height: "100svh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "2.5rem 2.5rem",
        }}
        >
            <p
                style={{
                // width: "50%",
                fontSize: "clamp(1.4rem, 2.8vw, 3.2rem)",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "0.01em",
                textTransform: "lowercase",
                textAlign: "left",
                }}
            >
                We played without rules, without thinking about styles or what would come
                next. One track could be slow, the next dark, then something pop or an
                impossible guitar, but it all made sense in that moment. The dancefloor
                didn't ask for coherence, it asked for emotion — and as long as people
                stayed there, smiling and lost, you knew you were doing it right.
            </p>
        </section>
    </>
  );
}