"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DataReleases } from "../data";

gsap.registerPlugin(ScrollTrigger);

const AnimationReleases12 = () => {
  const ReleaseImages = DataReleases.slice(0, 14);
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
    const section = sectionRef.current;
    if (!section) return;

    const spotlightImages = section.querySelectorAll(".spotlight-img");
    const baseRotations = [5, -3, 3.5, -1];

    const totalScrollImages = window.innerHeight * (0.8 + spotlightImages.length * 0.12);

    const stackTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${totalScrollImages}`,
      scrub: 1,
      pin: true,
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

    const artistWrapper = section.querySelector(".artist-list-wrapper");
    const artistContainer = section.querySelector(".artist-scroll-container");
    const artistItems = gsap.utils.toArray(section.querySelectorAll(".artist-item"));
    const activeArtistDisplay = section.querySelector(".artist-active");

    if (artistContainer) artistContainer.style.overflowY = "hidden";
    const totalInnerScroll =
      (artistContainer?.scrollHeight ?? 0) - (artistContainer?.clientHeight ?? 0);
    const totalScrollLength = totalInnerScroll + window.innerHeight * 1.5;

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

    const vh = window.innerHeight;
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
      stackTrigger.kill();
      secondTrigger.kill();
      if (exitTimeline.scrollTrigger) exitTimeline.scrollTrigger.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="center-section relative w-full min-h-[100svh] p-4 overflow-hidden bg-white"
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
                  <div>{DataReleases[activeIndexRef.current]?.artist}</div>
                  <div>-</div>
                  <div>{DataReleases[activeIndexRef.current]?.title}</div>
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
  );
};

export default AnimationReleases12;
