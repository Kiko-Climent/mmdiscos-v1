"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getResponsiveVideoSources } from "@/lib/videoSources";

gsap.registerPlugin(ScrollTrigger);

// ── Constants (must match globals.css .mm-global-logo-nav) ───────────────────
const LOGO_END_WIDTH_DESKTOP = 250;
const LOGO_END_WIDTH_MOBILE  = 200;
const LOGO_FIT_FACTOR        = 0.96;
const LOGO_PADDING           = "1rem 2.5rem 2.5rem";
const LOGO_LAYER_INSET       = "1rem 2.5rem 2.5rem 2.5rem";
const LOGO_INITIAL_SRC       = "/logo/Balearic Sound System Logo.svg";
const HERO_VIDEO = getResponsiveVideoSources("/video/MM Hero BG_1.mp4");

// ── Artist → release cover base (resuelve a /img-opt/v2/{base}__balanced-1280.{avif|webp})
// Render máximo del hover image: clamp(220px, 36vmin, 420px). DPR 3 ⇒ 1260px
// reales, por eso usamos la variante 1280. Originales en /public pesaban ~14 MB
// sumados; con AVIF-1280 bajamos a ~2 MB y con WebP-1280 a ~3 MB.
const ARTIST_COVER_BASES = {
  "mogwaa":          "img3",
  "daichi":          "Daichi - cover",
  "nic jalusi":      "MMD039",
  "pleasure voyage": "img5",
  "statues":         "statues",
  "mori ra":         "morira - cover",
  "guillaume":       "img2",
  "pontcho":         "MMD038",
  "corben":          "corben_peachland_cover",
  "celex":           "Celex - cover",
  "nairless":        "img4",
  "jaisiel":         "Factory Edits - cover",
  "trepanado":       "Factory Edits - cover",
  "ruf dug":         "MMD040-2",
  "saturn":          "MMD040-2",
  "atlantic brain":  "MMD040-2",
  "distance":        "MMD040_Cover-1",
};

const COVER_OPT_SIZE = 1280;
const coverUrl = (base, ext) =>
  `/img-opt/v2/${base}__balanced-${COVER_OPT_SIZE}.${ext}`;

const ARTISTS = [
  "Asa Tate", "Daichi", "Nic Jalusi", "James Falco", "Pleasure Voyage", "Mogwaa", "Statues",
  "Mori Ra", "Longhair", "Kross Section", "Komodo", "Marvin & Guy", "Distance",
  "Guillaume", "Pontcho", "Saturn", "Corben", "Bonnie & Klein", "Celex",
  "Florin Büchel", "NairLess", "Hal Incandenza", "Volta Cab", "Coyote",
  "Marcello Giordani", "Albion", "Serasso", "Atlantic Brain", "Jaisiel",
  "Trepanado", "Ruf Dug", "Chida", "Franz Scala", "Sankt Göran", "The.Deal",
  "A Beat Disciple", "Jakob Mäder", "Da Silva",
];

export default function MMNewestHero2_1() {
  const spacerRef           = useRef(null);
  const videoContainerRef   = useRef(null);
  const videoRef            = useRef(null);
  const boxRef              = useRef(null);
  const logoRef             = useRef(null);
  const artistsContainerRef = useRef(null);
  const artistsSpansRef     = useRef([]);
  const hoverImageRef       = useRef(null);
  // Tracks hover capability — set once in useEffect, read in handlers
  const hasHoverRef         = useRef(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  // ── Hover handlers ───────────────────────────────────────────────────────────
  // Single <img>, src swapped. AVIF primario; si el navegador no decodifica
  // AVIF, el onerror cae a WebP de la misma variante. No-op en touch/mobile.
  const handleHoverEnter = (name) => {
    if (!hasHoverRef.current) return;
    const base = ARTIST_COVER_BASES[name.toLowerCase()];
    const img = hoverImageRef.current;
    if (!base || !img) return;
    img.onerror = () => { img.onerror = null; img.src = coverUrl(base, "webp"); };
    img.src = coverUrl(base, "avif");
    img.style.display = "block";
    gsap.killTweensOf(img);
    gsap.fromTo(
      img,
      { scale: 1.05 },
      { scale: 1, duration: 0.28, ease: "power2.out" }
    );
  };

  const handleHoverLeave = () => {
    if (!hoverImageRef.current) return;
    gsap.killTweensOf(hoverImageRef.current);
    hoverImageRef.current.style.display = "none";
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShouldLoadVideo(window.innerWidth >= 720);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 720) return;

    const box    = boxRef.current;
    const logo   = logoRef.current;
    const spacer = spacerRef.current;
    if (!box || !logo || !spacer) return;

    // Freeze viewport dims on mount — prevents address-bar resize jank on Android
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // True hover support = pointer fine + hover capable (mouse/trackpad, not touch)
    hasHoverRef.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (videoContainerRef.current) {
      videoContainerRef.current.style.height = `${vh}px`;
    }

    // ── Box initial visual size ───────────────────────────────────────────────
    const isMobile    = vw < 720;
    const boxInitW    = isMobile ? vw * 0.88 : vw * 0.30;
    const boxInitH    = boxInitW * (9 / 16);
    const startScaleX = boxInitW / vw;
    const startScaleY = boxInitH / vh;

    // End position of logo — matches CSS .mm-global-logo-nav
    const endLogoW    = isMobile ? LOGO_END_WIDTH_MOBILE : LOGO_END_WIDTH_DESKTOP;
    const endLogoLeft = (vw - endLogoW) / 2;

    // ── Promote to GPU composited layers before any animation ─────────────────
    box.style.willChange  = "transform, background-color";
    logo.style.willChange = "transform";

    // ── Box: full-size DOM element, visually scaled to initial rectangle ───────
    gsap.set(box, {
      width:           vw,
      height:          vh,
      xPercent:        -50,
      yPercent:        -50,
      scaleX:          startScaleX,
      scaleY:          startScaleY,
      backgroundColor: "rgba(255,255,255,0.35)",
      force3D:         true,
    });

    // ── Logo: measure rendered size to compute startScale/startY ──────────────
    let startScale = 1;
    let startY     = 0;

    const syncLogo = () => {
      logo.style.width           = `${endLogoW}px`;
      logo.style.padding         = LOGO_PADDING;
      logo.style.transformOrigin = "top center";
      gsap.set(logo, { x: endLogoLeft, y: 0, scale: 1, opacity: 1, force3D: true });

      const B = box.getBoundingClientRect();
      const L = logo.getBoundingClientRect();
      if (B.width <= 0 || B.height <= 0 || L.width <= 0 || L.height <= 0) return;

      startScale    = Math.min(B.width / L.width, B.height / L.height) * LOGO_FIT_FACTOR;
      const scaledH = L.height * startScale;
      startY        = B.top + (B.height - scaledH) / 2;
      gsap.set(logo, { y: startY, scale: startScale });
    };

    syncLogo();
    requestAnimationFrame(() => {
      syncLogo();
      ScrollTrigger.refresh();
    });

    // ── Artists: invisible until reveal ──────────────────────────────────────
    const spans = artistsSpansRef.current.filter(Boolean);
    gsap.set(artistsContainerRef.current, { xPercent: -50, yPercent: -50, opacity: 0 });
    gsap.set(spans, { opacity: 0 });

    // ── Hover image: center via GSAP transform ───────────────────────────────
    // Preload de covers se difiere a revealArtists (post hero-scrub) dentro de
    // requestIdleCallback — así no compite con el video/logo del LCP del hero.
    gsap.set(hoverImageRef.current, { xPercent: -50, yPercent: -50, scale: 1, force3D: true });

    // ── Reveal: fires when logo settles at top ────────────────────────────────
    const revealArtists = () => {
      window.dispatchEvent(new Event("mm-hero-logo-settled"));

      box.style.backdropFilter       = "none";
      box.style.webkitBackdropFilter = "none";

      box.style.willChange  = "auto";
      logo.style.willChange = "auto";

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.style.display = "none";
      }

      gsap.set(artistsContainerRef.current, { opacity: 1 });
      // Only enable pointer events where real hover is supported
      if (hasHoverRef.current) {
        artistsContainerRef.current.style.pointerEvents = "auto";
      }

      gsap.fromTo(
        spans,
        { opacity: 0 },
        { opacity: 1, duration: 0.85, ease: "power3.out", stagger: { each: 0.04, from: "random" } }
      );

      // Preload diferido de covers únicos. AVIF primario; el onerror cae a
      // WebP en navegadores sin soporte AVIF. Se ejecuta una sola vez por
      // sesión gracias al flag en window.
      if (!window.__mmHeroCoversPreloaded) {
        window.__mmHeroCoversPreloaded = true;
        const preloadCovers = () => {
          const uniqueBases = new Set(Object.values(ARTIST_COVER_BASES));
          uniqueBases.forEach((base) => {
            const img = new Image();
            img.onerror = () => { img.onerror = null; img.src = coverUrl(base, "webp"); };
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

    // ── Reset: fires when user scrolls back above the logo trigger ────────────
    const resetHero = () => {
      window.dispatchEvent(new Event("mm-hero-logo-reset"));

      artistsContainerRef.current.style.pointerEvents = "none";
      handleHoverLeave();

      gsap.set([box, logo], { clearProps: "display,opacity" });

      box.style.willChange           = "transform, background-color";
      logo.style.willChange          = "transform";
      box.style.backdropFilter       = "blur(3px)";
      box.style.webkitBackdropFilter = "blur(3px)";

      gsap.to(artistsContainerRef.current, { opacity: 0, duration: 0.25, ease: "power2.in" });
      gsap.set(spans, { opacity: 0 });

      if (videoRef.current) {
        videoRef.current.style.display = "block";
        videoRef.current.play().catch(() => {});
      }
    };

    // ── Main scrub: box expands → logo travels to top ─────────────────────────
    const logoTrigger = ScrollTrigger.create({
      trigger:             spacer,
      start:               "top top",
      end:                 `+=${vh}px`,
      scrub:               1,
      invalidateOnRefresh: true,
      onLeave:             revealArtists,
      onEnterBack:         resetHero,
      onUpdate: (self) => {
        const p = self.progress;

        gsap.set(box, {
          scaleX:          gsap.utils.interpolate(startScaleX, 1, p),
          scaleY:          gsap.utils.interpolate(startScaleY, 1, p),
          backgroundColor: `rgba(255,255,255,${gsap.utils.interpolate(0.35, 1, p)})`,
        });

        gsap.set(logo, {
          y:     gsap.utils.interpolate(startY, 0, p),
          scale: gsap.utils.interpolate(startScale, 1, p),
        });

        if (videoRef.current) {
          gsap.set(videoRef.current, { opacity: 1 - p });
        }
      },
    });

    // ── Exit: white box + artists text scroll off, logo stays fixed ───────────
    const setTextY = gsap.quickSetter(artistsContainerRef.current, "y", "px");
    const setBoxY  = gsap.quickSetter(box, "y", "px");

    const artistsExitTrigger = ScrollTrigger.create({
      trigger:             spacer,
      start:               `top+=${vh * 1.2}px top`,
      end:                 `top+=${vh * 1.85}px top`,
      scrub:               1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        setTextY(-p * vh);
        setBoxY(-p * vh);
      },
      onLeave: () => {
        gsap.set([box, artistsContainerRef.current], { display: "none" });
        hoverImageRef.current.style.display = "none";
      },
      onEnterBack: () => {
        // No tocar y aquí. onEnterBack se dispara al cruzar el FIN del
        // rango desde arriba (progress ≈ 1), no el inicio — así que el
        // estado correcto es y ≈ -vh (fuera de pantalla, arriba), que
        // es justo el último valor que quedó antes del display:none al
        // hacer onLeave. Si forzáramos y=0 aquí, el clearProps haría
        // visibles los elementos al centro durante un frame antes de
        // que el onUpdate los reposicionara → flash.
        gsap.set([box, artistsContainerRef.current], { clearProps: "display" });
        if (hasHoverRef.current) {
          artistsContainerRef.current.style.pointerEvents = "auto";
        }
      },
    });

    return () => {
      logoTrigger.kill();
      artistsExitTrigger.kill();
      box.style.willChange  = "auto";
      logo.style.willChange = "auto";
    };
  }, []);

  return (
    <>
      {/* ── Scroll spacer ─────────────────────────────────────────────────────
           185svh (no 200svh) para que el final del spacer coincida con el
           fin del artistsExitTrigger (top+=vh*1.85). Así el siguiente
           componente (Highlights3_3Desktop_2) se pinea inmediatamente
           después de que el listado de artistas haya salido — sin pausa en
           blanco y, sobre todo, sin que los artistas tapen el intro de los
           paneles que llega justo después.
      ──────────────────────────────────────────────────────────────────────── */}
      <div ref={spacerRef} className="h-[185svh] pointer-events-none" />

      {/* ── Video background ─────────────────────────────────────────────────
           Height overridden to frozenVH px in useEffect (Android resize jank).
      ──────────────────────────────────────────────────────────────────────── */}
      <div
        ref={videoContainerRef}
        className="fixed top-0 left-0 w-full h-svh z-0 pointer-events-none overflow-hidden"
      >
        <video
          ref={videoRef}
          autoPlay muted loop playsInline
          preload={shouldLoadVideo ? "auto" : "none"}
          className="w-full h-full object-cover"
        >
          {shouldLoadVideo ? (
            <>
              <source media="(max-width: 719px)" src={HERO_VIDEO.mobile} type="video/mp4" />
              <source media="(max-width: 1279px)" src={HERO_VIDEO.tablet} type="video/mp4" />
              <source src={HERO_VIDEO.desktop} type="video/mp4" />
              <source src={HERO_VIDEO.fallback} type="video/mp4" />
            </>
          ) : null}
        </video>
      </div>

      {/* ── Blur box ──────────────────────────────────────────────────────────
           width/height/scaleX/scaleY/backgroundColor: fully GSAP-managed.
           backdropFilter kept inline — removed in JS post-reveal.
      ──────────────────────────────────────────────────────────────────────── */}
      <div
        ref={boxRef}
        className="fixed top-1/2 left-1/2 z-[100] pointer-events-none"
        style={{
          backgroundColor: "rgba(255,255,255,0.35)",
          backdropFilter:  "blur(3px)",
        }}
      />

      {/* ── Logo ──────────────────────────────────────────────────────────────
           opacity:0 initial — GSAP reveals it once layout is measured.
           width/padding/transformOrigin set in JS so they never cause reflow
           during scroll; only y + scale are animated.
      ──────────────────────────────────────────────────────────────────────── */}
      <div
        id="mm-hero-animated-logo"
        ref={logoRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{
          opacity: 0,
          // Logo "contrast-aware". Ambas capas se renderizan en blanco
          // (filter invert), y este contenedor hace mix-blend difference
          // contra el backdrop de la página → negro sobre fondos claros,
          // blanco sobre cortinas oscuras, transición per-pixel automática
          // (sin JS de sync para Highlights / About / hero / lo que venga).
          //
          // No usar `isolate` — crearía un isolation group que impediría
          // al blend leer el backdrop de la página. El z-[9999] ya crea
          // stacking context propio sin bloquear el blending.
          mixBlendMode: "difference",
        }}
      >
        {/* Ghost: holds container dimensions without visible content */}
        <img
          src={LOGO_INITIAL_SRC}
          alt="" aria-hidden
          className="w-full h-auto block opacity-0 pointer-events-none"
        />

        {/* Single inverted layer — el blend difference del contenedor
            decide el color final per-pixel contra el backdrop. */}
        <div
          className="absolute pointer-events-none"
          style={{ inset: LOGO_LAYER_INSET }}
        >
          <img
            src={LOGO_INITIAL_SRC}
            alt="MM Discos"
            className="w-full h-full object-contain block invert"
          />
        </div>
      </div>

      {/* ── Hover image ───────────────────────────────────────────────────────
           display toggled via JS; clamp() values have no Tailwind equivalent.
           z-500: above white box (100), below artists text (9000).
      ──────────────────────────────────────────────────────────────────────── */}
      <img
        ref={hoverImageRef}
        alt="" aria-hidden
        decoding="async"
        className="fixed top-1/2 left-1/2 z-[500] object-cover pointer-events-none will-change-transform"
        style={{
          display: "none",
          width:   "clamp(220px, 36vmin, 420px)",
          height:  "clamp(220px, 36vmin, 420px)",
        }}
      />

      {/* ── Artists names ─────────────────────────────────────────────────────
           xPercent/yPercent/opacity/y: GSAP-managed. Width kept inline —
           min() has no direct Tailwind equivalent. Padding adds lateral
           breathing room so text never bleeds to the viewport edge.
      ──────────────────────────────────────────────────────────────────────── */}
      <div
        ref={artistsContainerRef}
        className="fixed top-1/2 left-1/2 z-[9000] pointer-events-none"
        style={{ width: "min(100%, 600px)", opacity: 0 }}
      >
        <p
          className="text-[12px] font-normal leading-[1.6] tracking-[0.12em] uppercase text-justify text-[#111] px-4"
          style={{ fontFamily: "'MyFont', sans-serif" }}
        >
          {ARTISTS.map((name, i) => (
            <span
              key={i}
              ref={(el) => { artistsSpansRef.current[i] = el; }}
              onMouseEnter={() => handleHoverEnter(name)}
              onMouseLeave={handleHoverLeave}
              className={ARTIST_COVER_BASES[name.toLowerCase()] ? "cursor-crosshair" : "cursor-default"}
            >
              {name}{i < ARTISTS.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>
    </>
  );
}