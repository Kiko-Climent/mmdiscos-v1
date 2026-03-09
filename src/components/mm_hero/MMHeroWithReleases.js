"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DataReleases } from "../data";
import BlurReveal from "../tools/BlurReveal";

gsap.registerPlugin(ScrollTrigger);

const MMHeroWithReleases = () => {
  const ReleaseImages = DataReleases.slice(0, 14);

  // Hero refs
  const spacerRef = useRef(null);
  const boxRef = useRef(null);
  const logoRef = useRef(null);
  const videoRef = useRef(null);

  // Releases refs
  const sectionRef = useRef(null);
  const [detail, setDetail] = useState(null);
  const activeIndexRef = useRef(0);
  const imageStateRef = useRef({});
  const detailActiveRef = useRef(false);

  const captureImageState = (imgEl) => ({
    transform: window.getComputedStyle(imgEl).transform,
    filter: window.getComputedStyle(imgEl).filter,
    opacity: window.getComputedStyle(imgEl).opacity,
    zIndex: window.getComputedStyle(imgEl).zIndex,
  });

  const openDetail = (item, index) => {
    const section = sectionRef.current;
    if (!section) return;

    const spotlightImages = Array.from(section.querySelectorAll(".spotlight-img"));
    spotlightImages.forEach((imgEl, i) => {
      imageStateRef.current[i] = captureImageState(imgEl);
    });

    setDetail(item);
    activeIndexRef.current = index;
    detailActiveRef.current = true;

    const activeDisplay = section.querySelector(".artist-active");
    if (activeDisplay) gsap.to(activeDisplay, { opacity: 0, duration: 0.18, pointerEvents: "none" });

    const artistWrapper = section.querySelector(".artist-list-wrapper");
    if (artistWrapper) artistWrapper.style.pointerEvents = "none";

    const total = spotlightImages.length;
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.25;

    spotlightImages.forEach((imgEl, i) => {
      if (i === index) {
        gsap.to(imgEl, {
          duration: 0.7,
          ease: "power3.out",
          transform: `translate(calc(-50% + 0px), calc(-50% + 0px)) scale(1.15) rotate(0deg)`,
          zIndex: 999,
          filter: "none",
          opacity: 1,
        });
      } else {
        const angle = (i / total) * Math.PI * 2 + (Math.PI / 6) * (i % 3);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const rot = ((i % 5) - 2) * 4;
        gsap.to(imgEl, {
          duration: 0.7,
          ease: "power3.out",
          transform: `translate(calc(-50% + ${Math.round(x)}px), calc(-50% + ${Math.round(y)}px)) scale(0.95) rotate(${rot}deg)`,
          filter: "blur(6px)",
          zIndex: 5,
          opacity: 0.95,
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
      const savedState = imageStateRef.current[i];
      if (savedState) {
        gsap.to(imgEl, {
          duration: 0.6,
          ease: "power2.inOut",
          transform: savedState.transform,
          filter: savedState.filter,
          opacity: parseFloat(savedState.opacity),
          zIndex: parseInt(savedState.zIndex),
        });
      }
    });

    gsap.delayedCall(0.65, () => {
      detailActiveRef.current = false;
    });
  };

  useEffect(() => {
    const box = boxRef.current;
    const logo = logoRef.current;
    const spacer = spacerRef.current;
    const section = sectionRef.current;
    if (!box || !logo || !spacer || !section) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isDesktop = vw >= 720;

    // ─── HERO SCROLL DISTANCE (shared between spacer height and trigger end) ───
    const HERO_SCROLL = vh * 1.5;

    let heroTrigger;

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
        backgroundColor: "rgba(255,255,255,1)",
      });
    } else {
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

      heroTrigger = ScrollTrigger.create({
        trigger: spacer,
        start: "top top",
        end: `+=${HERO_SCROLL}`,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;

          gsap.set(box, {
            width: gsap.utils.interpolate(boxW, vw, p),
            height: gsap.utils.interpolate(boxH, vh, p),
            backgroundColor: `rgba(255,255,255,${gsap.utils.interpolate(0.35, 1, p)})`,
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
    }

    // ─── STACK ANIMATION ────────────────────────────────────────────────────────
    const spotlightImages = section.querySelectorAll(".spotlight-img");
    const baseRotations = [5, -3, 3.5, -1];
    const totalScrollImages = vh * (0.8 + spotlightImages.length * 0.12);

    const stackTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${totalScrollImages}`,
      scrub: 1,
      pin: true,
      // Hero terminó — box/video desaparecen, section pasa a blanco al instante (cubre ParallaxGallery)
      onEnter: () => {
        gsap.to(box, { opacity: 0, duration: 0.25 });
        gsap.set(section, { backgroundColor: "#ffffff" });
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
          const spread = 0.5 / totalImages;
          const startOffset = index * spread;
          const endOffset = startOffset + 0.35;
          let localProgress = (progress - startOffset) / (endOffset - startOffset);
          localProgress = Math.min(Math.max(localProgress, 0), 1);
          const eased = 1 - Math.pow(1 - localProgress, 3);
          const rotation = baseRotations[index % baseRotations.length];
          img.dataset.rotation = rotation;
          gsap.set(img, {
            transform: `translate(-50%, ${350 - eased * 400}%) rotate(${rotation}deg)`,
          });
        });
      },
    });

    // ─── ARTIST LIST ─────────────────────────────────────────────────────────────
    const artistWrapper = section.querySelector(".artist-list-wrapper");
    const artistContainer = section.querySelector(".artist-scroll-container");
    const artistItems = gsap.utils.toArray(section.querySelectorAll(".artist-item"));
    const activeArtistDisplay = section.querySelector(".artist-active");

    if (artistContainer) artistContainer.style.overflowY = "hidden";
    const totalInnerScroll =
      (artistContainer?.scrollHeight ?? 0) - (artistContainer?.clientHeight ?? 0);
    const totalScrollLength = totalInnerScroll + vh * 1.5;

    const secondTrigger = ScrollTrigger.create({
      trigger: section,
      start: () => stackTrigger.end,
      end: () => `+=${totalScrollLength}`,
      scrub: 1,
      pin: true,
      onEnter: () => {
        if (artistWrapper) gsap.to(artistWrapper, { opacity: 1, duration: 1 });
        if (activeArtistDisplay) gsap.to(activeArtistDisplay, { opacity: 1, duration: 0.5 });
      },
      onLeave: () =>
        activeArtistDisplay && gsap.to(activeArtistDisplay, { opacity: 0, duration: 0.5 }),
      onEnterBack: () => {
        if (artistWrapper) gsap.to(artistWrapper, { opacity: 1, duration: 0.5 });
        if (activeArtistDisplay) gsap.to(activeArtistDisplay, { opacity: 1, duration: 0.5 });
      },
      onLeaveBack: () => {
        if (artistWrapper) gsap.to(artistWrapper, { opacity: 0, duration: 0.5 });
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
        let minDistance = Infinity;

        artistItems.forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          const distance = Math.abs(centerY - (rect.top + rect.height / 2));
          if (distance < minDistance) {
            closestIndex = index;
            minDistance = distance;
          }
        });

        artistItems.forEach((el, i) => {
          el.style.opacity = i === closestIndex ? "1" : "0.4";
          el.style.color = i === closestIndex ? "#000" : "#888";
          el.style.transform = i === closestIndex ? "scale(1.1)" : "scale(1)";
          el.classList.toggle("active-item", i === closestIndex);
        });

        spotlightImages.forEach((img, i) => {
          gsap.to(img, {
            zIndex: i === closestIndex ? 10 : 1,
            scale: i === closestIndex ? 1.05 : 1,
            duration: 0.25,
            ease: "power2.out",
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

    // ─── EXIT ANIMATION ───────────────────────────────────────────────────────────
    const exitTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: () => secondTrigger.end,
        end: "+=1500",
        scrub: true,
        pin: true,
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
      {/* Spacer que da recorrido al hero — debe ser igual al HERO_SCROLL del trigger */}
      <div ref={spacerRef} style={{ height: "150vh", pointerEvents: "none" }} />

      {/* Video de fondo (fixed) */}
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
          zIndex: 1,
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

      {/* Caja que se expande a blanco (fixed, z-5 — detrás del section) */}
      <div
        ref={boxRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "35%",
          aspectRatio: "16/9",
          backgroundColor: "rgba(255,255,255,0.35)",
          backdropFilter: "blur(3px)",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      {/* Logo (fixed, siempre encima) */}
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

      {/* Section de releases — arranca justo tras el spacer, z-10 tapa el hero box */}
      <section
        ref={sectionRef}
        className="center-section relative w-full min-h-[100svh] p-4 overflow-hidden bg-transparent"
        style={{ zIndex: 10 }}
      >
        <div className="spotlight-images absolute inset-0 pointer-events-none z-[10]">
          {ReleaseImages.map((item, index) => (
            <div
              key={index}
              className="spotlight-img absolute top-1/2 left-1/2 w-[clamp(20rem,25vw,40rem)] aspect-[1/1] -translate-x-1/2 translate-y-[350%] overflow-hidden [will-change:transform] z-[1]"
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
                  className="artist-item text-3xl uppercase text-neutral-500 h-[40px] flex items-center justify-center transition-all duration-200 cursor-pointer"
                >
                  {item.artist}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="artist-active absolute top-1/2 left-1/2 z-[50] -translate-x-1/2 -translate-y-1/2 text-3xl text-white pointer-events-none" />

        <div
          id="detail-mode"
          className="absolute inset-0 z-[200] pointer-events-none"
          aria-hidden={!detail}
        >
          {detail && (
            <div className="absolute inset-0 flex items-center justify-start pointer-events-none">
              <div className="flex justify-between w-full px-8">

                {/* ── LEFT COLUMN ───────────────────────────────────────── */}
                <div className="flex flex-col text-releases w-1/2">
                  <div className="flex flex-col">

                    {/* Artist — aparece primero */}
                    <BlurReveal
                      trigger="mount"
                      delay={0}
                      duration={1.6}
                      blurAmount={60}
                      className="block"
                    >
                      {DataReleases[activeIndexRef.current]?.artist}
                    </BlurReveal>

                    {/* Title — un poco después */}
                    <BlurReveal
                      trigger="mount"
                      delay={0.15}
                      duration={1.6}
                      blurAmount={60}
                      className="block"
                    >
                      {DataReleases[activeIndexRef.current]?.title}
                    </BlurReveal>

                  </div>

                  {/* Tracklist — cada track entra en cascada */}
                  <div className="flex flex-col mt-4">
                    {DataReleases[activeIndexRef.current]?.tracklist?.map((track, idx) => (
                      <BlurReveal
                      key={idx}
                      trigger="mount"
                      delay={0.3 + idx * 0.06}
                      duration={1.2}
                      blurAmount={40}
                      stagger={0}
                      className="block"
                    >
                      <span className="inline-block w-18">
                        {String.fromCharCode(65 + Math.floor(idx / 4))}
                        {(idx % 4) + 1})
                      </span>
                      {track}
                    </BlurReveal>
                    ))}
                  </div>
                </div>

                {/* ── RIGHT COLUMN ──────────────────────────────────────── */}
                <div className="flex flex-col text-releases text-right uppercase items-end">

                  <BlurReveal trigger="mount" delay={0.1} duration={1.4} blurAmount={50} className="block">
                    <button
                      onClick={closeDetail}
                      className="pointer-events-auto uppercase"
                    >
                      close
                    </button>
                  </BlurReveal>

                  <BlurReveal trigger="mount" delay={0.2} duration={1.4} blurAmount={50} className="block">
                    <a
                      href={DataReleases[activeIndexRef.current]?.bandcamp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pointer-events-auto"
                    >
                      bandcamp
                    </a>
                  </BlurReveal>

                  <BlurReveal trigger="mount" delay={0.3} duration={1.4} blurAmount={50} className="block">
                    <a
                      href={DataReleases[activeIndexRef.current]?.soundcloud}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pointer-events-auto"
                    >
                      soundcloud
                    </a>
                  </BlurReveal>

                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default MMHeroWithReleases;