// src/components/MMDiscos_Hero/HeroLogoReveal.js
"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ARTISTS,
  ARTIST_COVER_BASES,
  coverUrl,
} from "@/components/MMDiscos_Hero/MMNewestHero2_1";

gsap.registerPlugin(ScrollTrigger);

const LOGO_SRC = "/logo/Balearic Sound System Logo.svg";
const VIDEO_SRC = "/video/MM Hero BG_1.mp4";

const HEADLINES = [
  "MM Discos — music for strange Mediterranean nights",
  "Disco, House, Balearic, Leftfield & everything that shouldn’t fit together",
  "Berlin · Barcelona · elsewhere - since 2015",
];

const TEXT_REVEAL = {
  duration: 0.85,
  ease: "power3.out",
  stagger: { each: 0.04, from: "random" },
};

const TEXT_HIDE = {
  duration: 0.85,
  ease: "power3.in",
  stagger: { each: 0.04, from: "random" },
};

function revealSpans(container, spans) {
  if (!container || !spans.length) return;
  gsap.killTweensOf([container, spans]);
  gsap.set(container, { opacity: 1 });
  gsap.fromTo(spans, { opacity: 0 }, { opacity: 1, ...TEXT_REVEAL });
}

function hideSpans(container, spans) {
  if (!container || !spans.length) return;
  gsap.killTweensOf([container, spans]);
  gsap.set(container, { opacity: 1 });
  gsap.to(spans, {
    opacity: 0,
    ...TEXT_HIDE,
    onComplete: () => gsap.set(container, { opacity: 0 }),
  });
}

// Punto de tinta sólida (pierna derecha de la 1ª M). 50%/50% cae en el hueco
// entre las dos M y el zoom dejaría un agujero. El centro visual del arte
// (bounding box) no coincide con ese punto: en reposo centramos el bbox y el
// zoom crece alrededor de la tinta, que queda unos px a la izquierda del
// centro — sin interpolar mask-position, así el logo no se desplaza.
const ANCHOR_X = 0.469;
const ANCHOR_Y = 0.517;
const VISUAL_X = 0.497;
const VISUAL_Y = 0.502;
const LOGO_ASPECT = 88 / 197;

// Reposo compartido: el inicial baja de 72vw/600px; el de artistas sube
// de 28vw/180px. El zoom sigue interpolando hasta el mismo endW (~45×).
const LOGO_REST_VW = 0.44;
const LOGO_REST_MAX = 360;

// Swipe entre secciones: hay que cubrir este % del viewport
// (la franja inferior) para comprometer el cambio.
const SWIPE_COMMIT = 0.3;
const SWIPE_IDLE_MS = 70;

export default function HeroLogoReveal() {
  const spacerRef = useRef(null);
  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const scrollCueRef = useRef(null);
  const copyRef = useRef(null);
  const copySpansRef = useRef([]);
  const holdRef = useRef(null);
  const artistsFrameRef = useRef(null);
  const artistsContainerRef = useRef(null);
  const artistsSpansRef = useRef([]);
  const hoverImageRef = useRef(null);
  const logoMarkRef = useRef(null);
  const hasHoverRef = useRef(false);

  const handleHoverEnter = (name) => {
    if (!hasHoverRef.current) return;
    const base = ARTIST_COVER_BASES[name.toLowerCase()];
    const img = hoverImageRef.current;
    if (!base || !img) return;
    img.onerror = () => {
      img.onerror = null;
      img.src = coverUrl(base, "webp");
    };
    img.src = coverUrl(base, "avif");
    img.style.display = "block";
    gsap.killTweensOf(img);
    gsap.fromTo(
      img,
      { scale: 1.05 },
      { scale: 1, duration: 0.28, ease: "power2.out" },
    );
  };

  const handleHoverLeave = () => {
    if (!hoverImageRef.current) return;
    gsap.killTweensOf(hoverImageRef.current);
    hoverImageRef.current.style.display = "none";
  };

  useLayoutEffect(() => {
    const video = videoRef.current;
    const spacer = spacerRef.current;
    const stage = stageRef.current;
    if (!video || !spacer || !stage) return;

    // Frame de swipe: 100lvh (barra Android oculta) para que vídeo y
    // artistas midan lo mismo y no queden recortes. El logo, en cambio,
    // se centra en el viewport visible (svh) — si usamos lvh, en Samsung
    // entra con la barra de Chrome y el símbolo queda demasiado abajo.
    const onMobile = window.innerWidth < 720;
    const hold = holdRef.current;

    const measureUnitVh = (unit) => {
      const probe = document.createElement("div");
      probe.style.cssText =
        `position:fixed;top:0;left:0;width:0;height:100${unit};pointer-events:none;visibility:hidden`;
      document.body.appendChild(probe);
      const h = probe.getBoundingClientRect().height;
      probe.remove();
      return h;
    };

    const largeH = measureUnitVh("lvh");
    const smallH = measureUnitVh("svh");
    const visualH = window.visualViewport?.height ?? window.innerHeight;
    const visualTop = window.visualViewport?.offsetTop ?? 0;
    const frameH = Math.max(
      largeH,
      stage.getBoundingClientRect().height,
      window.innerHeight,
    );

    if (onMobile) {
      stage.style.height = `${frameH}px`;
      if (hold) hold.style.height = `${frameH}px`;
    }

    const vw = stage.clientWidth;
    const visibleH = onMobile
      ? Math.min(...[visualH, smallH, window.innerHeight].filter((h) => h > 0))
      : stage.clientHeight;
    const visibleTop = onMobile ? visualTop : 0;
    const vh = visibleH;

    const applyMask = (widthPx, inkX, inkY) => {
      const maskH = widthPx * LOGO_ASPECT;
      video.style.setProperty("--mask-w", `${widthPx}px`);
      const pos = `${inkX - ANCHOR_X * widthPx}px ${inkY - ANCHOR_Y * maskH}px`;
      video.style.webkitMaskPosition = pos;
      video.style.maskPosition = pos;
    };

    // Tamaño de reposo compartido con la marca de agua
    const baseW = Math.min(vw * LOGO_REST_VW, LOGO_REST_MAX);
    const baseH = baseW * LOGO_ASPECT;
    // Tinta fija en pantalla: en reposo el bbox del logo queda centrado
    // en el área visible, no en el frame lvh del swipe.
    const inkX = vw / 2 - (VISUAL_X - ANCHOR_X) * baseW;
    const inkY = visibleTop + vh / 2 - (VISUAL_Y - ANCHOR_Y) * baseH;
    // Medido directamente sobre el arte: agrandar la máscara hasta ~45x la
    // mayor dimensión del viewport es el punto en que el recorte de pantalla
    // centrado en el ancla de arriba queda totalmente opaco — es decir, el
    // vídeo (que nunca cambia de escala) se lee a pantalla completa.
    const zoomH = onMobile ? Math.max(largeH, stage.clientHeight) : vh;
    const endW = Math.max(vw, zoomH) * 45;
    const easeIn = gsap.parseEase("power1.in");

    applyMask(baseW, inkX, inkY);

    const placeWatermark = () => {
      const mark = logoMarkRef.current;
      if (!mark) return;
      const restW = Math.min(stage.clientWidth * LOGO_REST_VW, LOGO_REST_MAX);
      mark.style.width = `${restW}px`;
      if (onMobile) {
        const vvH = window.visualViewport?.height ?? window.innerHeight;
        const vvTop = window.visualViewport?.offsetTop ?? 0;
        mark.style.top = `${vvTop + vvH / 2}px`;
      } else {
        mark.style.top = "50%";
      }
    };
    placeWatermark();
    window.visualViewport?.addEventListener("resize", placeWatermark);
    window.visualViewport?.addEventListener("scroll", placeWatermark);

    // Hold = lvh (swipe). El marco interior = viewport visible, para que
    // logo y listado se centren ahí sin absolute ni transforms sueltos.
    const artistsFrame = artistsFrameRef.current;
    if (onMobile && artistsFrame) {
      artistsFrame.style.height = `${vh}px`;
      artistsFrame.style.marginTop = `${visibleTop}px`;
    }

    const copy = copyRef.current;
    const copySpans = copySpansRef.current.filter(Boolean);
    if (copy) {
      gsap.set(copy, { opacity: 0 });
      gsap.set(copySpans, { opacity: 0 });
    }
    let copyRevealed = false;
    const fullStart = Math.max(vw, zoomH) * 10;
    const fullEnd = Math.max(vw, zoomH) * 22;

    const trigger = ScrollTrigger.create({
      trigger: spacer,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,
      onUpdate: (self) => {
        const w = gsap.utils.interpolate(baseW, endW, easeIn(self.progress));
        applyMask(w, inkX, inkY);
        if (scrollCueRef.current) {
          scrollCueRef.current.style.opacity = self.progress > 0.02 ? "0" : "1";
        }
        if (!copy) return;
        if (w >= fullEnd && !copyRevealed) {
          copyRevealed = true;
          revealSpans(copy, copySpans);
        } else if (w < fullStart && copyRevealed) {
          copyRevealed = false;
          hideSpans(copy, copySpans);
        }
      },
    });

    return () => {
      window.visualViewport?.removeEventListener("resize", placeWatermark);
      window.visualViewport?.removeEventListener("scroll", placeWatermark);
      gsap.killTweensOf([copy, copySpans]);
      trigger.kill();
    };
  }, []);

  useEffect(() => {
    const hold = holdRef.current;
    const container = artistsContainerRef.current;
    const hoverImg = hoverImageRef.current;
    if (!hold || !container || !hoverImg) return;

    ScrollTrigger.refresh();

    hasHoverRef.current = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    const spans = artistsSpansRef.current.filter(Boolean);
    const logoMark = logoMarkRef.current;
    gsap.set(container, { opacity: 0 });
    gsap.set(spans, { opacity: 0 });
    gsap.set(hoverImg, { xPercent: -50, yPercent: -50, scale: 1, force3D: true });
    if (logoMark) gsap.set(logoMark, { autoAlpha: 0 });

    const revealArtists = () => {
      revealSpans(container, spans);
      if (logoMark) {
        gsap.to(logoMark, { autoAlpha: 0.16, duration: 0.85, ease: "power3.out" });
      }
      if (hasHoverRef.current) container.style.pointerEvents = "auto";
      window.dispatchEvent(new Event("mm-hero-logo-settled"));

      if (!window.__mmHeroCoversPreloaded) {
        window.__mmHeroCoversPreloaded = true;
        const preloadCovers = () => {
          const uniqueBases = new Set(Object.values(ARTIST_COVER_BASES));
          uniqueBases.forEach((base) => {
            const img = new Image();
            img.onerror = () => {
              img.onerror = null;
              img.src = coverUrl(base, "webp");
            };
            img.src = coverUrl(base, "avif");
          });
        };
        if (typeof window.requestIdleCallback === "function") {
          window.requestIdleCallback(preloadCovers, { timeout: 1500 });
        } else {
          setTimeout(preloadCovers, 300);
        }
      }
    };

    const resetArtists = () => {
      container.style.pointerEvents = "none";
      handleHoverLeave();
      hideSpans(container, spans);
      if (logoMark) {
        gsap.to(logoMark, { autoAlpha: 0, duration: 0.85, ease: "power3.in" });
      }
      window.dispatchEvent(new Event("mm-hero-logo-reset"));
    };

    let idleTimer = 0;
    let snapTween = null;
    let snapping = false;
    let lastTouchY = 0;

    const progressOf = (st) => {
      const range = st.end - st.start;
      if (!range) return -1;
      return (st.scroll() - st.start) / range;
    };

    const snapTo = (gate, target) => {
      if (snapping) return;
      const st = gate.st;
      const range = st.end - st.start;
      if (!range) return;
      const progress = gsap.utils.clamp(0, 1, progressOf(st));
      if (Math.abs(progress - target) < 0.01) {
        gate.locked = target === 1;
        return;
      }

      window.clearTimeout(idleTimer);
      snapping = true;
      snapTween?.kill();

      const targetY = st.start + range * target;
      const proxy = { y: st.scroll() };
      snapTween = gsap.to(proxy, {
        y: targetY,
        duration: gsap.utils.interpolate(0.42, 0.72, Math.abs(target - progress)),
        ease: "power2.inOut",
        overwrite: true,
        onUpdate: () => st.scroll(proxy.y),
        onComplete: () => {
          snapping = false;
          snapTween = null;
          gate.locked = target === 1;
        },
      });
    };

    const makeGate = (trigger, canEnterFromStart) => {
      const gate = { locked: false, st: null, canEnterFromStart };
      gate.st = ScrollTrigger.create({
        trigger,
        start: "top bottom",
        end: "top top",
        onLeave: (self) => {
          if (self.direction === 1 && !gate.locked) snapTo(gate, 1);
        },
        onEnterBack: () => {
          gate.locked = true;
        },
        onLeaveBack: () => {
          gate.locked = false;
        },
        onUpdate: (self) => {
          if (snapping || gate.locked) return;
          if (self.direction === 1 && self.progress >= SWIPE_COMMIT) snapTo(gate, 1);
        },
      });
      return gate;
    };

    const gates = [makeGate(hold, () => true)];
    const highlightsEl = document.getElementById("mm-highlights");
    if (highlightsEl) {
      gates.push(makeGate(highlightsEl, () => gates[0].locked));
    }

    const findGate = (goingDown) => {
      for (const gate of gates) {
        const p = progressOf(gate.st);
        if (p > 0.001 && p < 0.999) return gate;
        if (
          goingDown &&
          p >= -0.02 &&
          p <= 0.001 &&
          !gate.locked &&
          gate.canEnterFromStart()
        ) {
          return gate;
        }
        if (!goingDown && p >= 0.999 && p <= 1.05) return gate;
      }
      return null;
    };

    const scheduleIdleSnap = (gate, goingDown) => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        if (snapping) return;
        const p = gsap.utils.clamp(0, 1, progressOf(gate.st));
        if (p <= 0.002 || p >= 0.998) {
          gate.locked = p >= 0.998;
          return;
        }
        if (goingDown) snapTo(gate, p >= SWIPE_COMMIT ? 1 : 0);
        else snapTo(gate, p <= 1 - SWIPE_COMMIT ? 0 : 1);
      }, SWIPE_IDLE_MS);
    };

    const applyDelta = (gate, deltaY) => {
      const st = gate.st;
      const range = st.end - st.start;
      if (!range) return;
      const goingDown = deltaY > 0;
      const nextY = gsap.utils.clamp(st.start, st.end, st.scroll() + deltaY);
      st.scroll(nextY);

      const p = (nextY - st.start) / range;
      if (goingDown && p >= SWIPE_COMMIT) {
        snapTo(gate, 1);
        return;
      }
      if (!goingDown && p <= 1 - SWIPE_COMMIT) {
        snapTo(gate, 0);
        return;
      }
      scheduleIdleSnap(gate, goingDown);
    };

    const onWheel = (event) => {
      const goingDown = event.deltaY > 0;
      if (snapping) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      const gate = findGate(goingDown);
      if (!gate) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      applyDelta(gate, event.deltaY);
    };

    const onTouchStart = (event) => {
      lastTouchY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event) => {
      const y = event.touches[0]?.clientY ?? lastTouchY;
      const deltaY = lastTouchY - y;
      lastTouchY = y;
      if (!deltaY) return;
      const goingDown = deltaY > 0;
      if (snapping) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      const gate = findGate(goingDown);
      if (!gate) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      applyDelta(gate, deltaY);
    };

    const wheelOpts = { passive: false, capture: true };
    const touchMoveOpts = { passive: false, capture: true };
    const touchStartOpts = { passive: true, capture: true };

    window.addEventListener("wheel", onWheel, wheelOpts);
    window.addEventListener("touchstart", onTouchStart, touchStartOpts);
    window.addEventListener("touchmove", onTouchMove, touchMoveOpts);

    const artistsSt = ScrollTrigger.create({
      trigger: hold,
      start: "top 5%",
      onEnter: revealArtists,
      onLeaveBack: resetArtists,
    });

    return () => {
      window.clearTimeout(idleTimer);
      snapTween?.kill();
      window.removeEventListener("wheel", onWheel, wheelOpts);
      window.removeEventListener("touchstart", onTouchStart, touchStartOpts);
      window.removeEventListener("touchmove", onTouchMove, touchMoveOpts);
      gates.forEach((gate) => gate.st.kill());
      artistsSt.kill();
      gsap.killTweensOf([container, spans, hoverImg, logoMark]);
    };
  }, []);

  return (
    <>
      <div ref={spacerRef} className="relative h-[450svh]">
        <div
          ref={stageRef}
          className="sticky top-0 h-[100lvh] w-full overflow-hidden bg-white"
        >
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            style={{
              WebkitMaskImage: `url("${LOGO_SRC}")`,
              maskImage: `url("${LOGO_SRC}")`,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "50% 50%",
              maskPosition: "50% 50%",
              WebkitMaskSize: "var(--mask-w) auto",
              maskSize: "var(--mask-w) auto",
            }}
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>

          <div
            ref={copyRef}
            className="pointer-events-none absolute top-1/2 left-1/2 z-10 flex w-[min(92vw,38rem)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0 text-center text-[14px] font-semibold leading-none tracking-normal text-white opacity-0 md:text-[15px]"
          >
            <h1
              ref={(el) => {
                copySpansRef.current[0] = el;
              }}
              className="m-0 text-[inherit] font-semibold"
            >
              {HEADLINES[0]}
            </h1>
            <p
              ref={(el) => {
                copySpansRef.current[1] = el;
              }}
              className="m-0"
            >
              {HEADLINES[1]}
            </p>
            <p
              ref={(el) => {
                copySpansRef.current[2] = el;
              }}
              className="m-0"
            >
              {HEADLINES[2]}
            </p>
          </div>
        </div>
      </div>

      <section
        ref={holdRef}
        className="relative h-[100lvh] w-full bg-white"
      >
        <div
          ref={artistsFrameRef}
          className="relative z-[2] flex h-full w-full items-center justify-center"
        >
          <img
            ref={hoverImageRef}
            alt=""
            aria-hidden
            decoding="async"
            className="pointer-events-none absolute top-1/2 left-1/2 z-[5] object-cover will-change-transform"
            style={{
              display: "none",
              width: "clamp(220px, 36vmin, 420px)",
              height: "clamp(220px, 36vmin, 420px)",
            }}
          />

          <div
            ref={artistsContainerRef}
            className="relative z-10 pointer-events-none w-full max-w-[600px]"
            style={{ opacity: 0 }}
          >
            <p
              className="px-4 text-center text-[12px] font-normal leading-[1.6] tracking-[0.12em] uppercase text-[#111]"
              style={{ fontFamily: "'MyFont', sans-serif" }}
            >
              {ARTISTS.map((name, i) => (
                <span
                  key={name}
                  ref={(el) => {
                    artistsSpansRef.current[i] = el;
                  }}
                  onMouseEnter={() => handleHoverEnter(name)}
                  onMouseLeave={handleHoverLeave}
                  className={
                    ARTIST_COVER_BASES[name.toLowerCase()]
                      ? "cursor-crosshair"
                      : "cursor-default"
                  }
                >
                  {name}
                  {i < ARTISTS.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          </div>
        </div>
      </section>

      <img
        ref={logoMarkRef}
        src={LOGO_SRC}
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed top-1/2 left-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 select-none"
        style={{ opacity: 0, visibility: "hidden" }}
        draggable={false}
      />
    </>
  );
}