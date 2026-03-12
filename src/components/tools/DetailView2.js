"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function DetailView2({ detail, release, closeDetail }) {
  const [mounted, setMounted]   = useState(false);
  const elementsRef             = useRef([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (detail) setMounted(true);
  }, [detail]);

  useEffect(() => {
    if (!mounted) return;

    const els = elementsRef.current.filter(Boolean);
    gsap.killTweensOf(els);

    if (detail) {
      gsap.set(els, { opacity: 0, filter: "blur(80px)", willChange: "filter, opacity" });

      els.forEach((el, i) => {
        const delay = i * 0.1;
        gsap.timeline({ delay })
          .to(el, { opacity: 1, filter: "blur(110px)", duration: 0.35, ease: "power2.in" })
          .to(el, {
            filter: "blur(0px)", duration: 1.4, ease: "power4.out",
            onComplete: () => {
              if (i === els.length - 1) gsap.set(els, { willChange: "auto" });
            },
          });
      });
    } else {
      gsap.set(els, { willChange: "filter, opacity" });
      
      // Salida uniforme — todos a la vez, sin stagger que delate el orden del DOM
      gsap.timeline()
        .to(els, {
          filter: "blur(60px)",
          duration: 0.2,
          ease: "power2.in",
        })
        .to(els, {
          opacity: 0,
          filter: "blur(100px)",
          duration: 0.4,
          ease: "power3.in",
          stagger: { each: 0.03, from: "end" },
          onComplete: () => {
            setMounted(false);
            elementsRef.current = [];
          },
        });
    }
  }, [detail, mounted]);

  if (!mounted) return null;

  const reg          = (i) => (el) => { elementsRef.current[i] = el; };
  const tracklist    = release?.tracklist ?? [];
  const TRACK_OFFSET = 7;

  // Posición de la imagen activa — usada en mobile para anclar el contenido
  const imgRect = detail?.imgRect;

  // ── MOBILE LAYOUT ──────────────────────────────────────────────────────────
  if (isMobile && imgRect) {
    const imgTop    = imgRect.top;
    const imgBottom = imgRect.bottom;
    const imgLeft   = imgRect.left;
    const imgRight  = imgRect.right;
    const GAP       = 14; // px entre imagen y contenido

    return (
      <div className="absolute inset-0 z-[200] pointer-events-none">

        {/* Links ENCIMA de la imagen — close, bandcamp, soundcloud */}
        <div
          className="absolute flex flex-row-reverse justify-between w-full px-4 pointer-events-none"
          style={{ 
            top: imgTop - GAP, 
            left: 0,
            transform: "translateY(-100%)" // ← se mueve su propia altura hacia arriba
          }}
        >
          <div className="flex flex-col text-releases-sm items-start">
            <button ref={reg(2)} onClick={closeDetail} className="pointer-events-auto uppercase">
              close
            </button>
          </div>
          <div className="flex flex-col text-releases-sm uppercase items-start">
            
            <a ref={reg(3)} href={release?.bandcamp} target="_blank" rel="noopener noreferrer" className="pointer-events-auto">
              bandcamp
            </a>
            <a ref={reg(4)} href={release?.soundcloud} target="_blank" rel="noopener noreferrer" className="pointer-events-auto">
              soundcloud
            </a>
          </div>
        </div>


        {/* Info + tracklist DEBAJO de la imagen */}
        <div
          className="absolute flex flex-col text-releases-sm px-4 pointer-events-none"
          style={{ top: imgBottom + GAP, left: 0, right: 0 }}
        >
          {/* Fila: artista (izq) — año (der) */}
          <div className="flex justify-between w-full">
            <span ref={reg(0)} className="block">{release?.artist}</span>
            <span ref={reg(5)} className="block">{release?.ref}</span>
          </div>

          {/* Fila: título (izq) — ref (der) */}
          <div className="flex justify-between w-full">
            <span ref={reg(1)} className="block">{release?.title}</span>
            <span ref={reg(6)} className="block">{release?.year}</span>
          </div>

          {/* Tracklist — mt-3 = mismo respiro que el gap entre imagen y links arriba */}
          <div className="flex flex-col mt-3">
            {tracklist.map((track, idx) => (
              <span
                key={idx}
                ref={reg(TRACK_OFFSET + idx)}
                className="block"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                <span className="inline-block mr-1">{idx + 1}</span>
                <span className="mr-1">—</span>
                {track}
              </span>
            ))}
          </div>
        </div>

      </div>
    );
  }

  // ── DESKTOP LAYOUT — igual que antes ──────────────────────────────────────
  return (
    <div className="absolute inset-0 z-[200] pointer-events-none">
      <div className="absolute inset-0 flex items-center justify-start pointer-events-none">
        <div className="flex justify-between w-full px-4">

          {/* LEFT */}
          <div className="flex flex-col text-releases-sm w-1/4">
            <div className="flex flex-col">
              <span ref={reg(0)} className="block">{release?.artist}</span>
              <span ref={reg(1)} className="block">{release?.title}</span>
            </div>
            <div className="flex flex-col mt-4">
            {tracklist.map((track, idx) => (
              <span key={idx} ref={reg(TRACK_OFFSET + idx)} className="block" style={{ fontVariantNumeric: "tabular-nums" }}>
                <span className="inline-block mr-1">{idx + 1}</span>
                <span className="mr-1">—</span>
                {track}
              </span>
            ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col text-releases-sm text-right uppercase items-end">
            <button ref={reg(2)} onClick={closeDetail} className="pointer-events-auto uppercase">
              close
            </button>
            <a ref={reg(3)} href={release?.bandcamp} target="_blank" rel="noopener noreferrer" className="pointer-events-auto">
              bandcamp
            </a>
            <a ref={reg(4)} href={release?.soundcloud} target="_blank" rel="noopener noreferrer" className="pointer-events-auto">
              soundcloud
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}