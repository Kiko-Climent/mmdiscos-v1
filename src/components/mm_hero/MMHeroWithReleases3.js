"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DataReleases } from "../data";
import BlurReveal from "../tools/BlurReveal";
import DetailView from "../tools/DetailView";
import DetailView2 from "../tools/DetailView2";

gsap.registerPlugin(ScrollTrigger);

const MMHeroWithReleases3 = () => {
  const ReleaseImages = DataReleases.slice(0, 14);

  const spacerRef = useRef(null);
  const boxRef    = useRef(null);
  const logoRef   = useRef(null);
  const videoRef  = useRef(null);

  const sectionRef      = useRef(null);
  const [detail, setDetail] = useState(null);
  const activeIndexRef  = useRef(0);
  const imageStateRef   = useRef({});
  const detailActiveRef = useRef(false);

  const captureImageState = (imgEl) => ({
    transform: window.getComputedStyle(imgEl).transform,
    filter:    window.getComputedStyle(imgEl).filter,
    opacity:   window.getComputedStyle(imgEl).opacity,
    zIndex:    window.getComputedStyle(imgEl).zIndex,
  });

  const openDetail = (item, index) => {
    const section = sectionRef.current;
    if (!section) return;

    const spotlightImages = Array.from(section.querySelectorAll(".spotlight-img"));
    spotlightImages.forEach((imgEl, i) => { imageStateRef.current[i] = captureImageState(imgEl); });

    setDetail(item);
    activeIndexRef.current = index;
    detailActiveRef.current = true;

    const activeDisplay = section.querySelector(".artist-active");
    if (activeDisplay) gsap.to(activeDisplay, { opacity: 0, duration: 0.18, pointerEvents: "none" });

    const artistWrapper = section.querySelector(".artist-list-wrapper");
    if (artistWrapper) artistWrapper.style.pointerEvents = "none";

    const total  = spotlightImages.length;
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.25;

    spotlightImages.forEach((imgEl, i) => {
      if (i === index) {
        gsap.to(imgEl, {
          duration: 0.7, ease: "power3.out",
          transform: `translate(calc(-50% + 0px), calc(-50% + 0px)) scale(1.15) rotate(0deg)`,
          zIndex: 999, filter: "none", opacity: 1,
        });
      } else {
        const angle = (i / total) * Math.PI * 2 + (Math.PI / 6) * (i % 3);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const rot = ((i % 5) - 2) * 4;
        gsap.to(imgEl, {
          duration: 0.7, ease: "power3.out",
          transform: `translate(calc(-50% + ${Math.round(x)}px), calc(-50% + ${Math.round(y)}px)) scale(0.95) rotate(${rot}deg)`,
          filter: "blur(6px)", zIndex: 5, opacity: 0.95,
        });
      }
    });
  };

  const closeDetail = () => {
    const section = sectionRef.current;
    if (!section) return;

    setDetail(null);

    const activeDisplay = section.querySelector(".artist-active");
    if (activeDisplay) gsap.to(activeDisplay, { opacity: 1, duration: 0.18 });

    const artistWrapper = section.querySelector(".artist-list-wrapper");
    if (artistWrapper) artistWrapper.style.pointerEvents = "auto";

    const spotlightImages = Array.from(section.querySelectorAll(".spotlight-img"));
    spotlightImages.forEach((imgEl, i) => {
      const s = imageStateRef.current[i];
      if (s) gsap.to(imgEl, {
        duration: 0.6, ease: "power2.inOut",
        transform: s.transform, filter: s.filter,
        opacity: parseFloat(s.opacity), zIndex: parseInt(s.zIndex),
      });
    });

    gsap.delayedCall(0.65, () => { detailActiveRef.current = false; });
  };

  useEffect(() => {
    const box    = boxRef.current;
    const logo   = logoRef.current;
    const spacer = spacerRef.current;
    const section = sectionRef.current;
    if (!box || !logo || !spacer || !section) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isDesktop = vw >= 720;

    const HERO_SCROLL = vh * 1.5;

    // ─── HERO ANIMATION ─────────────────────────────────────────────────────────
    // Misma lógica para desktop y móvil — solo cambian las dimensiones iniciales del box.
    // Desktop: 35vw × 16:9  |  Mobile: 85vw × 4:3 (más cuadrado, mejor para portrait)
    let heroTrigger;

    {
      // Forzamos el tamaño inicial del box según breakpoint ANTES de leer offsetWidth
      if (!isDesktop) {
        gsap.set(box, {
          width: vw * 0.85,
          height: (vw * 0.85) * (3 / 4), // ratio 4:3 portrait-friendly
        });
      }
      // En desktop el box ya tiene sus dimensiones del CSS (35vw, 16/9)

      const boxW    = box.offsetWidth;
      const boxH    = box.offsetHeight;
      const boxLeft = (vw - boxW) / 2;
      const boxTop  = (vh - boxH) / 2;

      // Logo padding: más comprimido en móvil
      const logoPadding = isDesktop ? "2.5rem" : "1.25rem";

      // Centramos el logo dentro del box:
      // el logo tiene el mismo ancho que el box, así que solo necesitamos
      // centrar verticalmente — top = centro del box - altura del logo / 2
      // Como aún no sabemos la altura del logo, lo posicionamos primero con
      // top provisional igual al centro del box y luego ajustamos con getBoundingClientRect
      gsap.set(logo, {
        left:    boxLeft,
        width:   boxW,
        padding: logoPadding,
        top:     boxTop + boxH / 2,   // centro vertical del box (provisional)
        bottom:  "auto",
        opacity: 1,
      });

      // Ahora leemos la altura real del logo y recentramos
      const logoRect  = logo.getBoundingClientRect();
      const startTop  = boxTop + (boxH - logoRect.height) / 2;  // centrado exacto
      gsap.set(logo, { top: startTop });

      // Estado final del logo: más pequeño en móvil
      const endWidth = isDesktop ? 250 : 160;
      const endLeft  = (vw - endWidth) / 2;
      const endTop   = 0;

      heroTrigger = ScrollTrigger.create({
        trigger: spacer,
        start:   "top top",
        end:     `+=${HERO_SCROLL}`,
        scrub:   1,
        onUpdate: (self) => {
          const p = self.progress;

          gsap.set(box, {
            width:           gsap.utils.interpolate(boxW, vw, p),
            height:          gsap.utils.interpolate(boxH, vh, p),
            backgroundColor: `rgba(255,255,255,${gsap.utils.interpolate(0.35, 1, p)})`,
          });

          gsap.set(logo, {
            top:   gsap.utils.interpolate(startTop, endTop, p),
            left:  gsap.utils.interpolate(boxLeft, endLeft, p),
            width: gsap.utils.interpolate(boxW, endWidth, p),
          });

          if (videoRef.current) {
            gsap.set(videoRef.current, { opacity: 1 - p });
          }
        },
      });
    }

    // ─── STACK ANIMATION ────────────────────────────────────────────────────────
    const spotlightImages = section.querySelectorAll(".spotlight-img");
    const baseRotations   = [5, -3, 3.5, -1];
    const totalScrollImages = vh * (0.8 + spotlightImages.length * 0.12);

    const stackTrigger = ScrollTrigger.create({
      trigger: section,
      start:   "top top",
      end:     `+=${totalScrollImages}`,
      scrub:   1,
      pin:     true,
      onEnter: () => {
        gsap.to(box, { opacity: 0, duration: 0.25 });
        gsap.set(section, { backgroundColor: "#transparent" });
        if (videoRef.current) gsap.set(videoRef.current, { opacity: 0 });
      },
      onLeaveBack: () => {
        gsap.to(box, { opacity: 1, duration: 0.25 });
        gsap.to(section, { backgroundColor: "transparent", duration: 0.25 });
      },
      onUpdate: (self) => {
        if (detailActiveRef.current) return;
        const progress = self.progress;
        spotlightImages.forEach((img, index) => {
          const totalImages = spotlightImages.length;
          const spread      = 0.5 / totalImages;
          const startOffset = index * spread;
          const endOffset   = startOffset + 0.35;
          let localProgress = (progress - startOffset) / (endOffset - startOffset);
          localProgress = Math.min(Math.max(localProgress, 0), 1);
          const eased    = 1 - Math.pow(1 - localProgress, 3);
          const rotation = baseRotations[index % baseRotations.length];
          img.dataset.rotation = rotation;
          gsap.set(img, {
            transform: `translate(-50%, ${350 - eased * 400}%) rotate(${rotation}deg)`,
          });
        });
      },
    });

    // ─── ARTIST LIST ─────────────────────────────────────────────────────────────
    const artistWrapper        = section.querySelector(".artist-list-wrapper");
    const artistContainer      = section.querySelector(".artist-scroll-container");
    const artistItems          = gsap.utils.toArray(section.querySelectorAll(".artist-item"));
    const activeArtistDisplay  = section.querySelector(".artist-active");

    if (artistContainer) artistContainer.style.overflowY = "hidden";
    const totalInnerScroll = (artistContainer?.scrollHeight ?? 0) - (artistContainer?.clientHeight ?? 0);
    const totalScrollLength = totalInnerScroll + vh * 1.5;

    const secondTrigger = ScrollTrigger.create({
      trigger: section,
      start:   () => stackTrigger.end,
      end:     () => `+=${totalScrollLength}`,
      scrub:   1,
      pin:     true,
      onEnter: () => {
        if (artistWrapper)       gsap.to(artistWrapper, { opacity: 1, duration: 1 });
        if (activeArtistDisplay) gsap.to(activeArtistDisplay, { opacity: 1, duration: 0.5 });
      },
      onLeave: () =>
        activeArtistDisplay && gsap.to(activeArtistDisplay, { opacity: 0, duration: 0.5 }),
      onEnterBack: () => {
        if (artistWrapper)       gsap.to(artistWrapper, { opacity: 1, duration: 0.5 });
        if (activeArtistDisplay) gsap.to(activeArtistDisplay, { opacity: 1, duration: 0.5 });
      },
      onLeaveBack: () => {
        if (artistWrapper)       gsap.to(artistWrapper, { opacity: 0, duration: 0.5 });
        if (activeArtistDisplay) gsap.to(activeArtistDisplay, { opacity: 0, duration: 0.5 });
      },
      onUpdate: (self) => {
        if (detailActiveRef.current) return;
        if (artistContainer) artistContainer.scrollTop = self.progress * totalInnerScroll;
      },
    });

    if (artistContainer) {
      artistContainer.addEventListener("scroll", () => {
        if (detailActiveRef.current) return;
        const containerRect = artistContainer.getBoundingClientRect();
        const centerY = containerRect.top + containerRect.height / 2;
        let closestIndex = 0;
        let minDistance  = Infinity;

        artistItems.forEach((el, index) => {
          const rect     = el.getBoundingClientRect();
          const distance = Math.abs(centerY - (rect.top + rect.height / 2));
          if (distance < minDistance) { closestIndex = index; minDistance = distance; }
        });

        artistItems.forEach((el, i) => {
          el.style.opacity   = i === closestIndex ? "1" : "0.4";
          el.style.color     = i === closestIndex ? "#000" : "#888";
          el.style.transform = i === closestIndex ? "scale(1.1)" : "scale(1)";
          el.classList.toggle("active-item", i === closestIndex);
        });

        spotlightImages.forEach((img, i) => {
          gsap.to(img, {
            zIndex: i === closestIndex ? 10 : 1,
            scale:  i === closestIndex ? 1.05 : 1,
            duration: 0.25, ease: "power2.out",
          });
        });

        if (activeArtistDisplay)
          activeArtistDisplay.innerText = artistItems[closestIndex].innerText;
      });
    }

    section.querySelectorAll(".artist-item").forEach((el, i) => {
      el.onclick = () => {
        if (el.classList.contains("active-item")) openDetail(DataReleases[i], i);
      };
    });

    // ─── EXIT ANIMATION ──────────────────────────────────────────────────────────
    const exitTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start:   () => secondTrigger.end,
        end:     "+=1500",
        scrub:   true,
        pin:     true,
      },
    });

    exitTimeline.to(artistWrapper, { opacity: 0, duration: 0.5 });
    spotlightImages.forEach((img, index) => {
      exitTimeline.to(
        img,
        { y: -vh - 100, duration: 1, ease: "power1.inOut" },
        index / spotlightImages.length
      );
    });

    return () => {
      heroTrigger?.kill();
      stackTrigger.kill();
      secondTrigger.kill();
      if (exitTimeline.scrollTrigger) exitTimeline.scrollTrigger.kill();
    };
  }, []);

  return (
    <>
      <div ref={spacerRef} style={{ height: "150vh", pointerEvents: "none" }} />

      {/* Video de fondo */}
      <div
        ref={videoRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: "100%", height: "100svh",
          pointerEvents: "none", overflow: "hidden", zIndex: 1,
        }}
      >
        <video autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }}>
          <source src="/video/MM Hero BG_1.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Box blur — tamaño inicial sobreescrito en JS para móvil */}
      <div
        ref={boxRef}
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "35%",          // desktop default — móvil lo sobreescribe en useEffect
          aspectRatio: "16/9",   // ídem
          backgroundColor: "rgba(255,255,255,0.35)",
          backdropFilter: "blur(3px)",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      {/* Logo */}
      <div
        ref={logoRef}
        style={{ position: "fixed", zIndex: 9999, pointerEvents: "none", opacity: 0 }}
      >
        <img
          src="/logo/Balearic Sound System Logo.svg"
          alt="MM Discos"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      {/* Section releases */}
      <section
        ref={sectionRef}
        className="center-section relative w-full min-h-[100svh] p-4 overflow-hidden bg-transparent"
        style={{ zIndex: 10 }}
      >
        <div className="spotlight-images absolute inset-0 pointer-events-none z-[10]">
          {ReleaseImages.map((item, index) => (
            <div
              key={index}
              className="spotlight-img absolute top-1/2 left-1/2 w-[clamp(14rem,48vw,26rem)] aspect-[1/1] -translate-x-1/2 translate-y-[350%] overflow-hidden [will-change:transform] z-[1]"
            >
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <div className="artist-list-wrapper absolute inset-0 z-[5] opacity-0 pointer-events-auto">
          <div className="artist-scroll-container absolute top-0 w-full h-full no-scrollbar pt-[50vh] pb-[50vh]">
            <div className="flex flex-col items-center">
              {DataReleases.map((item, i) => (
                <div
                  key={i}
                  className="artist-item text-[clamp(1.2rem,2.8vw,3.2rem)] uppercase text-neutral-500 h-[40px] flex items-center justify-center transition-all duration-200 cursor-pointer"
                >
                  {item.artist}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="artist-active absolute top-1/2 left-1/2 z-[50] -translate-x-1/2 -translate-y-1/2 text-[clamp(1.2rem,2.8vw,3.2rem)] text-white pointer-events-none" />

        <div
          id="detail-mode"
          className="absolute inset-0 z-[200] pointer-events-none"
          aria-hidden={!detail}
        >
          <DetailView2
            detail={detail}
            release={DataReleases[activeIndexRef.current]}
            closeDetail={closeDetail}
          />
        </div>
      </section>
    </>
  );
};

export default MMHeroWithReleases3;