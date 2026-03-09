import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/all";
import Lenis from "lenis";
import { DataReleases } from "@/components/data";
import styles from "./MM_Hero.module.css";

gsap.registerPlugin(ScrollTrigger, Flip);

export default function MM_Hero() {
  const backdropRef = useRef(null);
  const bgRef = useRef(null);
  const logoRef = useRef(null);
  const lenisRef = useRef(null);
  const activeIndexRef = useRef(0);
  const imageStateRef = useRef({});
  const [detail, setDetail] = useState(null);

  const ReleaseImages = DataReleases.slice(0, 14);

  const captureImageState = (imgEl) => ({
    transform: window.getComputedStyle(imgEl).transform,
    filter: window.getComputedStyle(imgEl).filter,
    opacity: window.getComputedStyle(imgEl).opacity,
    zIndex: window.getComputedStyle(imgEl).zIndex,
  });

  const openDetail = async (item, index) => {
    const spotlightImages = Array.from(document.querySelectorAll(".spotlight-img"));
    spotlightImages.forEach((imgEl, i) => {
      imageStateRef.current[i] = captureImageState(imgEl);
    });

    setDetail(item);
    activeIndexRef.current = index;

    if (lenisRef.current) lenisRef.current.stop();

    const activeDisplay = document.querySelector(".artist-active");
    if (activeDisplay) gsap.to(activeDisplay, { opacity: 0, duration: 0.18, pointerEvents: "none" });

    const artistWrapper = document.querySelector(".artist-list-wrapper");
    if (artistWrapper) artistWrapper.style.pointerEvents = "none";

    const total = spotlightImages.length;
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.25;

    spotlightImages.forEach((imgEl, i) => {
      const rotation = imgEl.dataset?.rotation ?? 0;
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

  const closeDetail = async () => {
    setDetail(null);

    const activeDisplay = document.querySelector(".artist-active");
    if (activeDisplay) gsap.to(activeDisplay, { opacity: 1, duration: 0.18, pointerEvents: "none" });

    const artistWrapper = document.querySelector(".artist-list-wrapper");
    if (artistWrapper) artistWrapper.style.pointerEvents = "auto";

    const spotlightImages = Array.from(document.querySelectorAll(".spotlight-img"));
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

    gsap.delayedCall(0.6, () => {
      if (lenisRef.current) lenisRef.current.start();
    });
    gsap.delayedCall(0.65, () => ScrollTrigger.refresh());
  };

  useEffect(() => {
    const lenis = new Lenis();
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const rafCallback = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    // — Animación hero: caja + logo flip —
    const initHeroAnimations = () => {
      const box = bgRef.current;
      const logo = logoRef.current;
      if (!box || !logo) return;

      const isDesktop = window.innerWidth >= 720;

      if (!isDesktop) {
        logo.classList.add(styles.logoPinned);
        gsap.set(logo, { width: 250 });
        gsap.set(box, { width: "100%", height: "100vh" });
        return;
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const initialWidth = box.offsetWidth;
      const initialHeight = box.offsetHeight;

      const state = Flip.getState(logo);
      logo.classList.add(styles.logoPinned);
      gsap.set(logo, { width: 250 });
      const flip = Flip.from(state, { duration: 1, ease: "none", paused: true });

      ScrollTrigger.create({
        trigger: backdropRef.current,
        start: "top top",
        end: `+=${viewportHeight}px`,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(box, {
            width: gsap.utils.interpolate(initialWidth, viewportWidth, p),
            height: gsap.utils.interpolate(initialHeight, viewportHeight, p),
            backgroundColor: `rgba(249, 244, 235, ${gsap.utils.interpolate(0.35, 1, p)})`,
          });
          flip.progress(p);
        },
      });
    };

    // — Animación releases: stack de imágenes + lista artistas —
    const initReleasesAnimations = () => {
      const spotlightImages = document.querySelectorAll(".spotlight-img");
      const baseRotations = [5, -3, 3.5, -1];

      const totalScrollImages = window.innerHeight * (2 + spotlightImages.length * 0.5);

      const stackTrigger = ScrollTrigger.create({
        trigger: ".center-section",
        start: "top top",
        end: `+=${totalScrollImages}`,
        scrub: 1,
        pin: true,
        onUpdate: (self) => {
          const progress = self.progress;
          spotlightImages.forEach((img, index) => {
            const totalImages = spotlightImages.length;
            const spread = 0.7 / totalImages;
            const startOffset = index * spread;
            const endOffset = startOffset + 0.4;
            let localProgress = (progress - startOffset) / (endOffset - startOffset);
            localProgress = Math.min(Math.max(localProgress, 0), 1);
            const eased = 1 - Math.pow(1 - localProgress, 3);
            const rotation = baseRotations[index % baseRotations.length];
            img.dataset.rotation = rotation;
            gsap.set(img, {
              transform: `translate(-50%, ${200 - eased * 250}%) rotate(${rotation}deg)`,
            });
          });
        },
      });

      const artistWrapper = document.querySelector(".artist-list-wrapper");
      const artistContainer = document.querySelector(".artist-scroll-container");
      const artistItems = gsap.utils.toArray(".artist-item");
      const activeArtistDisplay = document.querySelector(".artist-active");

      if (artistContainer) artistContainer.style.overflowY = "hidden";
      const totalInnerScroll =
        (artistContainer?.scrollHeight ?? 0) - (artistContainer?.clientHeight ?? 0);
      const totalScrollLength = totalInnerScroll + window.innerHeight * 1.5;

      const secondTrigger = ScrollTrigger.create({
        trigger: ".center-section",
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
          if (artistContainer) artistContainer.scrollTop = self.progress * totalInnerScroll;
        },
      });

      if (artistContainer) {
        artistContainer.addEventListener("scroll", () => {
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

      document.querySelectorAll(".artist-item").forEach((el, i) => {
        el.onclick = () => {
          if (el.classList.contains("active-item")) openDetail(DataReleases[i], i);
        };
      });

      const vh = window.innerHeight;
      const exitTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".center-section",
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
          index / spotlightImages.length,
        );
      });
    };

    initHeroAnimations();
    initReleasesAnimations();

    let timer;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
        const box = bgRef.current;
        const logo = logoRef.current;
        if (!box || !logo) return;
        gsap.set([box, logo], { clearProps: "all" });
        logo.classList.remove(styles.logoPinned);
        initHeroAnimations();
        initReleasesAnimations();
      }, 250);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.ticker.remove(rafCallback);
      lenis.destroy();
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

      <div ref={bgRef} className={styles.box}>
        <div ref={logoRef} className={styles.logo}>
          <img src="/logo/Balearic Sound System Logo.svg" alt="MM Discos" />
        </div>
      </div>

      <section className="center-section relative w-full min-h-[100svh] p-4 overflow-hidden bg-[#f9f4eb]">
        <div className="spotlight-images absolute inset-0 pointer-events-none">
          {ReleaseImages.map((item, index) => (
            <div
              key={index}
              className="spotlight-img absolute top-1/2 left-1/2 w-[clamp(20rem,25vw,40rem)] aspect-[1/1] -translate-x-1/2 translate-y-[200%] overflow-hidden [will-change:transform] z-[1]"
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
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                onClick={closeDetail}
                className="pointer-events-auto absolute top-6 right-6 z-[999] bg-white/80 text-black rounded px-3 py-1"
              >
                ✕
              </button>
              <div className="flex justify-between w-full h-full items-center px-8 text-sm text-gray-600">
                <div className="flex flex-col">
                  <div className="flex flex-row gap-2">
                    <span>{DataReleases[activeIndexRef.current]?.artist}</span>
                    <span>-</span>
                    <span>{DataReleases[activeIndexRef.current]?.title}</span>
                  </div>
                  <div className="flex flex-col mt-3">
                    {DataReleases[activeIndexRef.current]?.tracklist?.map((track, idx) => (
                      <div key={idx}>
                        {String.fromCharCode(65 + Math.floor(idx / 4))}
                        {(idx % 4) + 1}) {track}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <a
                    href={DataReleases[activeIndexRef.current]?.bandcamp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto"
                  >
                    bandcamp
                  </a>
                  <a
                    href={DataReleases[activeIndexRef.current]?.soundcloud}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto"
                  >
                    soundcloud
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="outro relative w-full min-h-[100svh] p-4 overflow-hidden bg-[#f9f4eb] flex items-center">
        <h1 className="mx-auto text-center uppercase text-[clamp(2rem,10vw,5rem)] font-medium tracking-[-0.1rem] leading-[0.9] text-[#141414]">
          too mediterranean to care
        </h1>
      </section>
    </>
  );
}
