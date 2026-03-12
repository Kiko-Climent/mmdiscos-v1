"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DataReleases } from "../data";
import DetailView2 from "../tools/DetailView2";

gsap.registerPlugin(ScrollTrigger);

const MMHeroWithReleases4 = () => {
  const ReleaseImages = DataReleases.slice(0, 14);

  const spacerRef = useRef(null);
  const boxRef    = useRef(null);
  const logoRef   = useRef(null);
  const videoRef  = useRef(null);

  const sectionRef      = useRef(null);
  const [detail, setDetail]   = useState(null);
  const activeIndexRef        = useRef(0);
  const imageStateRef         = useRef({});
  const detailActiveRef       = useRef(false);

  // ── Ref/Year display ──────────────────────────────────────────────────────
  const refLabelRef  = useRef(null);
  const yearLabelRef = useRef(null);
  const labelsVisible = useRef(false);
  const [activeRef,    setActiveRef]    = useState(DataReleases[0]?.ref    ?? "");
  const [activeYear,   setActiveYear]   = useState(DataReleases[0]?.year   ?? "");
  const [activeFormat, setActiveFormat] = useState(DataReleases[0]?.format ?? "");
  const [activeVinyl,  setActiveVinyl]  = useState(DataReleases[0]?.vinyl  ?? "");

  const showLabels = () => {
    if (labelsVisible.current) return;
    labelsVisible.current = true;
    [refLabelRef.current, yearLabelRef.current].forEach(el => {
      if (el) gsap.to(el, { opacity: 1, duration: 0.5, ease: "power2.out" });
    });
  };

  const hideLabels = () => {
    if (!labelsVisible.current) return;
    labelsVisible.current = false;
    [refLabelRef.current, yearLabelRef.current].forEach(el => {
      if (el) gsap.to(el, { opacity: 0, duration: 0.3, ease: "power2.in" });
    });
  };

  const updateLabels = (rel) => {
    // Cambio instantáneo con el scroll
    setActiveRef(rel?.ref    ?? "");
    setActiveYear(rel?.year  ?? "");
    setActiveFormat(rel?.format ?? "");
    setActiveVinyl(rel?.vinyl   ?? "");
  };
  // ─────────────────────────────────────────────────────────────────────────

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
    const activeImg = spotlightImages[index];
    const imgRect   = activeImg ? activeImg.getBoundingClientRect() : null;

    spotlightImages.forEach((imgEl, i) => { imageStateRef.current[i] = captureImageState(imgEl); });

    setDetail({ ...item, imgRect });
    activeIndexRef.current = index;
    detailActiveRef.current = true;

    const activeDisplay = section.querySelector(".artist-active");
    if (activeDisplay) gsap.to(activeDisplay, { opacity: 0, duration: 0.18, pointerEvents: "none" });

    const artistWrapper = section.querySelector(".artist-list-wrapper");
    if (artistWrapper) {
      artistWrapper.style.pointerEvents = "none";
      gsap.to(artistWrapper, { opacity: 0, duration: 0.4, ease: "power2.inOut" });
    }

    // Ocultar ref y year al entrar en detalle
    hideLabels();

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
    if (artistWrapper) {
      artistWrapper.style.pointerEvents = "auto";
      gsap.to(artistWrapper, { opacity: 1, duration: 0.4, ease: "power2.inOut" });
    }

    const spotlightImages = Array.from(section.querySelectorAll(".spotlight-img"));
    spotlightImages.forEach((imgEl, i) => {
      const s = imageStateRef.current[i];
      if (s) gsap.to(imgEl, {
        duration: 0.6, ease: "power2.inOut",
        transform: s.transform, filter: s.filter,
        opacity: parseFloat(s.opacity), zIndex: parseInt(s.zIndex),
      });
    });

    // Mostrar ref y year al cerrar detalle
    showLabels();
    gsap.delayedCall(0.65, () => { detailActiveRef.current = false; });
  };

  useEffect(() => {
    const box     = boxRef.current;
    const logo    = logoRef.current;
    const spacer  = spacerRef.current;
    const section = sectionRef.current;
    if (!box || !logo || !spacer || !section) return;

    const getViewport = () => ({ vw: window.innerWidth, vh: window.innerHeight });

    const getBoxDimensions = (vw, vh) => {
      const isDesktop = vw >= 720;
      const boxW = isDesktop ? vw * 0.35 : vw * 0.85;
      const boxH = isDesktop ? boxW * (9 / 16) : boxW * (3 / 4);
      return { boxW, boxH, boxLeft: (vw - boxW) / 2, boxTop: (vh - boxH) / 2, isDesktop };
    };

    const getTotalLogoHeight = (logoWidth) => {
      gsap.set(logo, { width: logoWidth });
      return logo.getBoundingClientRect().height;
    };

    const initBoxAndLogo = () => {
      const { vw, vh } = getViewport();
      const { boxW, boxH, boxLeft, boxTop, isDesktop } = getBoxDimensions(vw, vh);
      if (!isDesktop) gsap.set(box, { width: boxW, height: boxH });
      const logoPadding = isDesktop ? "2.5rem" : "1.25rem";
      gsap.set(logo, { left: boxLeft, width: boxW, padding: logoPadding, top: boxTop + boxH / 2, bottom: "auto", opacity: 1 });
      const logoHeight = getTotalLogoHeight(boxW);
      gsap.set(logo, { top: boxTop + (boxH - logoHeight) / 2 });
    };

    initBoxAndLogo();

    const { vw, vh } = getViewport();
    const isDesktop   = vw >= 720;
    const HERO_SCROLL = vh * 1.5;
    const endWidth    = isDesktop ? 250 : 160;
    let heroTrigger;

    const applyHeroProgress = (p) => {
      const { vw: vwNow, vh: vhNow } = getViewport();
      const { boxW: bW, boxH: bH, boxLeft: bL, boxTop: bT } = getBoxDimensions(vwNow, vhNow);
      const currentWidth = gsap.utils.interpolate(bW, endWidth, p);
      const logoHeight   = getTotalLogoHeight(currentWidth);
      const startTopNow  = bT + (bH - logoHeight) / 2;
      const endLeftNow   = (vwNow - endWidth) / 2;

      gsap.set(box, {
        width:           gsap.utils.interpolate(bW, vwNow, p),
        height:          gsap.utils.interpolate(bH, vhNow, p),
        backgroundColor: `rgba(255,255,255,${gsap.utils.interpolate(0.35, 1, p)})`,
      });
      gsap.set(logo, {
        top:   gsap.utils.interpolate(startTopNow, 0, p),
        left:  gsap.utils.interpolate(bL, endLeftNow, p),
        width: gsap.utils.interpolate(bW, endWidth, p),
      });
      if (videoRef.current) gsap.set(videoRef.current, { opacity: 1 - p });
    };

    heroTrigger = ScrollTrigger.create({
      trigger: spacer, start: "top top", end: `+=${HERO_SCROLL}`, scrub: 1,
      onUpdate: (self) => applyHeroProgress(self.progress),
    });

    const spotlightImages   = section.querySelectorAll(".spotlight-img");
    const baseRotations     = [5, -3, 3.5, -1];
    const totalScrollImages = vh * (0.8 + spotlightImages.length * 0.12);

    const stackTrigger = ScrollTrigger.create({
      trigger: section, start: "top top", end: `+=${totalScrollImages}`,
      scrub: 0.5, pin: true,
      onEnter: () => {
        gsap.to(box, { opacity: 0, duration: 0.25 });
        if (videoRef.current) gsap.set(videoRef.current, { opacity: 0 });
      },
      onLeaveBack: () => { gsap.to(box, { opacity: 1, duration: 0.25 }); },
      onUpdate: (self) => {
        if (detailActiveRef.current) return;
        const progress = self.progress;
        spotlightImages.forEach((img, index) => {
          const spread      = 0.5 / spotlightImages.length;
          const startOffset = index * spread;
          const endOffset   = startOffset + 0.35;
          let lp = (progress - startOffset) / (endOffset - startOffset);
          lp = Math.min(Math.max(lp, 0), 1);
          const eased    = 1 - Math.pow(1 - lp, 3);
          const rotation = baseRotations[index % baseRotations.length];
          gsap.set(img, { transform: `translate3d(-50%, ${350 - eased * 400}%, 0) rotate(${rotation}deg)` });
        });
      },
    });

    const artistWrapper       = section.querySelector(".artist-list-wrapper");
    const artistContainer     = section.querySelector(".artist-scroll-container");
    const artistItems         = gsap.utils.toArray(section.querySelectorAll(".artist-item"));
    const activeArtistDisplay = section.querySelector(".artist-active");

    if (artistContainer) artistContainer.style.overflowY = "hidden";
    const totalInnerScroll  = (artistContainer?.scrollHeight ?? 0) - (artistContainer?.clientHeight ?? 0);
    const totalScrollLength = totalInnerScroll + vh * 1.5;

    const secondTrigger = ScrollTrigger.create({
      trigger: section,
      start:   () => stackTrigger.end,
      end:     () => `+=${totalScrollLength}`,
      scrub: 1, pin: true,
      onEnter: () => {
        if (artistWrapper)       gsap.to(artistWrapper,       { opacity: 1, duration: 1 });
        if (activeArtistDisplay) gsap.to(activeArtistDisplay, { opacity: 1, duration: 0.5 });
        showLabels();
      },
      onLeave: () => {
        if (activeArtistDisplay) gsap.to(activeArtistDisplay, { opacity: 0, duration: 0.5 });
        hideLabels();
      },
      onEnterBack: () => {
        if (artistWrapper)       gsap.to(artistWrapper,       { opacity: 1, duration: 0.5 });
        if (activeArtistDisplay) gsap.to(activeArtistDisplay, { opacity: 1, duration: 0.5 });
        showLabels();
      },
      onLeaveBack: () => {
        if (artistWrapper)       gsap.to(artistWrapper,       { opacity: 0, duration: 0.5 });
        if (activeArtistDisplay) gsap.to(activeArtistDisplay, { opacity: 0, duration: 0.5 });
        hideLabels();
      },
      onUpdate: (self) => {
        if (detailActiveRef.current) return;
        if (artistContainer) artistContainer.scrollTop = self.progress * totalInnerScroll;
      },
    });

    let prevClosestIndex = -1;
    if (artistContainer) {
      artistContainer.addEventListener("scroll", () => {
        if (detailActiveRef.current) return;
        const containerRect = artistContainer.getBoundingClientRect();
        const centerY       = containerRect.top + containerRect.height / 2;
        let closestIndex    = 0;
        let minDistance     = Infinity;

        artistItems.forEach((el, index) => {
          const rect     = el.getBoundingClientRect();
          const distance = Math.abs(centerY - (rect.top + rect.height / 2));
          if (distance < minDistance) { closestIndex = index; minDistance = distance; }
        });

        artistItems.forEach((el, i) => el.classList.toggle("active-item", i === closestIndex));

        if (closestIndex !== prevClosestIndex) {
          prevClosestIndex = closestIndex;

          // Actualizar ref y year con fade simple
          const rel = DataReleases[closestIndex];
          if (rel) updateLabels(rel);

          spotlightImages.forEach((img, i) => {
            gsap.to(img, {
              zIndex: i === closestIndex ? 10 : 1,
              scale:  i === closestIndex ? 1.05 : 1,
              duration: 0.25, ease: "power2.out", force3D: true,
            });
          });
        }

        if (activeArtistDisplay)
          activeArtistDisplay.innerText = artistItems[closestIndex]?.innerText ?? "";
      });
    }

    section.querySelectorAll(".artist-item").forEach((el, i) => {
      el.onclick = () => {
        if (el.classList.contains("active-item")) openDetail(DataReleases[i], i);
      };
    });

    const exitTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: section, start: () => secondTrigger.end, end: "+=1500", scrub: true, pin: true,
      },
    });

    exitTimeline.to(artistWrapper, { opacity: 0, duration: 0.5 });
    spotlightImages.forEach((img, index) => {
      exitTimeline.to(img, { y: -vh - 100, duration: 1, ease: "power1.inOut", force3D: true }, index / spotlightImages.length);
    });

    // ── Mask: cortina pinta el logo de blanco al pasar (solo en About) ─────────
    const aboutSection = document.querySelector(".about-section");
    const logoBlackRef = logoRef.current?.querySelector(".logo-layer-black");
    const logoWhiteRef = logoRef.current?.querySelector(".logo-layer-white");
    const updateLogoMask = () => {
      if (!aboutSection || !logo || !logoBlackRef || !logoWhiteRef) return;
      const curtainTop = aboutSection.getBoundingClientRect().top;
      const vh = window.innerHeight;
      // Antes de About (cortina abajo del viewport): logo negro (sin invert)
      if (curtainTop > vh) {
        logoBlackRef.style.clipPath = "inset(0 0 0 0)";
        logoWhiteRef.style.clipPath = "inset(100% 0 0 0)";
        return;
      }
      const logoRect = logo.getBoundingClientRect();
      const logoTop = logoRect.top;
      const logoBottom = logoRect.bottom;
      const logoHeight = logoBottom - logoTop;
      let cutPercent;
      if (curtainTop <= logoTop) cutPercent = 0;
      else if (curtainTop >= logoBottom) cutPercent = 100;
      else cutPercent = ((curtainTop - logoTop) / logoHeight) * 100;
      logoBlackRef.style.clipPath = `inset(0 0 ${100 - cutPercent}% 0)`;
      logoWhiteRef.style.clipPath = `inset(${cutPercent}% 0 0 0)`;
    };
    const logoCurtainTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: 0,
      end: "max",
      scrub: 0,
      onUpdate: updateLogoMask,
    });
    updateLogoMask();

    let resizeTimeout = null;
    const onResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resizeTimeout = null;
        ScrollTrigger.refresh();
        if (heroTrigger?.isActive) applyHeroProgress(heroTrigger.progress);
        updateLogoMask();
      }, 80);
    };

    window.addEventListener("resize", onResize);
    const vv = window.visualViewport;
    if (vv) vv.addEventListener("resize", onResize);

    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      window.removeEventListener("resize", onResize);
      if (vv) vv.removeEventListener("resize", onResize);
      heroTrigger?.kill();
      stackTrigger.kill();
      secondTrigger.kill();
      logoCurtainTrigger?.kill();
      if (exitTimeline.scrollTrigger) exitTimeline.scrollTrigger.kill();
    };
  }, []);

  return (
    <>
      <div ref={spacerRef} style={{ height: "150vh", pointerEvents: "none" }} />

      <div ref={videoRef} style={{
        position: "fixed", top: 0, left: 0,
        width: "100%", height: "100dvh", minHeight: "100vh",
        pointerEvents: "none", overflow: "hidden", zIndex: 1,
      }}>
        <video autoPlay muted loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }}>
          <source src="/video/MM Hero BG_1.mp4" type="video/mp4" />
        </video>
      </div>

      <div ref={boxRef} style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "35%", aspectRatio: "16/9",
        backgroundColor: "rgba(255,255,255,0.35)",
        backdropFilter: "blur(3px)",
        pointerEvents: "none", zIndex: 5,
      }} />

      <div ref={logoRef} style={{ position: "fixed", zIndex: 9999, pointerEvents: "none", opacity: 0 }}>
        <img
          src="/logo/Balearic Sound System Logo.svg"
          alt=""
          aria-hidden
          className="logo-sizer"
          style={{ width: "100%", height: "auto", display: "block", opacity: 0, pointerEvents: "none" }}
        />
        <div className="logo-layer-black" style={{ position: "absolute", inset: 0 }}>
          <img src="/logo/Balearic Sound System Logo.svg" alt="" aria-hidden
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
        </div>
        <div className="logo-layer-white" style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <img src="/logo/Balearic Sound System Logo.svg" alt="MM Discos"
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", filter: "invert(1)" }} />
        </div>
      </div>

      {/* Izquierda — year + ref, centrado vertical — solo desktop */}
      <div
        ref={refLabelRef}
        className="hidden md:flex"
        style={{
          position: "fixed", left: "1.5rem", top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20, opacity: 0, pointerEvents: "none",
          flexDirection: "column", gap: "0px",
        }}
      >
        <span className="text-releases-sm uppercase text-neutral-500">{activeYear}</span>
        <span className="text-releases-sm uppercase text-neutral-500">{activeRef}</span>
      </div>

      {/* Derecha — format + vinyl (si existe), centrado vertical — solo desktop */}
      {/* Derecha — format + vinyl, centrado vertical — solo desktop */}
      <div
        ref={yearLabelRef}
        className="hidden md:flex"
        style={{
          position: "fixed", right: "1.5rem", top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20, opacity: 0, pointerEvents: "none",
          flexDirection: "column", alignItems: "flex-end", gap: "0px",
        }}
      >
        <span className="text-releases-sm uppercase text-neutral-500">{activeFormat}</span>
        <span
          className="text-releases-sm uppercase text-neutral-500"
          style={{ opacity: activeVinyl ? 1 : 0 }}
        >
          {activeVinyl || "\u00A0"}
        </span>
      </div>

      <section
        ref={sectionRef}
        className="center-section relative w-full min-h-[100svh] p-4 overflow-hidden bg-transparent"
        style={{ zIndex: 10 }}
      >
        <div className="spotlight-images absolute inset-0 pointer-events-none z-[10]">
          {ReleaseImages.map((item, index) => {
            const name = item.image.split("/").pop().split(".")[0];
            return (
              <div key={index}
                className="spotlight-img absolute top-1/2 left-1/2 w-[clamp(14rem,48vw,26rem)] aspect-[1/1] overflow-hidden z-[1]"
                style={{ transform: "translate3d(-50%, 350%, 0)", willChange: "transform" }}
              >
                <picture style={{ display: "contents" }}>
                  <source srcSet={`/img-opt/${name}.avif`} type="image/avif" />
                  <source srcSet={`/img-opt/${name}.webp`} type="image/webp" />
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover"
                    loading="eager" decoding="async" />
                </picture>
              </div>
            );
          })}
        </div>

        <div className="artist-list-wrapper absolute inset-0 z-[5] opacity-0 pointer-events-auto">
          <div className="artist-scroll-container absolute top-0 w-full h-full no-scrollbar pt-[50svh] pb-[50svh]">
            <div className="flex flex-col items-center">
              {DataReleases.map((item, i) => (
                <div key={i}
                  className="artist-item text-[clamp(1.2rem,2.8vw,3.2rem)] uppercase text-neutral-500 h-[40px] flex items-center justify-center transition-all duration-200 cursor-pointer"
                >
                  {item.artist}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="artist-active absolute top-1/2 left-1/2 z-[50] -translate-x-1/2 -translate-y-1/2 text-[clamp(1.2rem,2.8vw,3.2rem)] text-white pointer-events-none" />

        <div id="detail-mode" className="absolute inset-0 z-[200] pointer-events-none" aria-hidden={!detail}>
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

export default MMHeroWithReleases4;