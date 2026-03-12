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
      [...els].reverse().forEach((el, i) => {
        gsap.timeline({ delay: i * 0.06 })
          .to(el, { filter: "blur(90px)", duration: 0.25, ease: "power2.in" })
          .to(el, {
            opacity: 0, filter: "blur(120px)", duration: 0.5, ease: "power3.in",
            onComplete: () => {
              if (i === els.length - 1) {
                setMounted(false);
                elementsRef.current = [];
              }
            },
          });
      });
    }
  }, [detail, mounted]);

  if (!mounted) return null;

  const reg          = (i) => (el) => { elementsRef.current[i] = el; };
  const tracklist    = release?.tracklist ?? [];
  const TRACK_OFFSET = 5;

  // Posición de la imagen activa — usada en mobile para anclar el contenido
  const imgRect = detail?.imgRect;

  // ── MOBILE LAYOUT ──────────────────────────────────────────────────────────
  if (isMobile && imgRect) {
    const imgTop    = imgRect.top;
    const imgBottom = imgRect.bottom;
    const imgLeft   = imgRect.left;
    const imgRight  = imgRect.right;
    const GAP       = 12; // px entre imagen y contenido

    return (
      <div className="absolute inset-0 z-[200] pointer-events-none">

        {/* Links ENCIMA de la imagen — close, bandcamp, soundcloud */}
        <div
          className="absolute flex flex-row justify-between w-full px-4 pointer-events-none"
          style={{ top: imgTop - GAP - 72, left: 0 }} // 72px ≈ altura aprox de los 3 links
        >
          <div className="flex flex-col text-releases-sm uppercase items-start gap-1">
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

        {/* Info + tracklist DEBAJO de la imagen */}
        <div
          className="absolute flex flex-col text-releases-sm px-4 pointer-events-none gap-2"
          style={{ top: imgBottom + GAP, left: 0, right: 0 }}
        >
          <span ref={reg(0)} className="block">{release?.artist}</span>
          <span ref={reg(1)} className="block">{release?.title}</span>

          <div className="flex flex-col mt-2">
            {tracklist.map((track, idx) => (
              <span key={idx} ref={reg(TRACK_OFFSET + idx)} className="block">
                <span className="inline-block w-10">
                  {String.fromCharCode(65 + Math.floor(idx / 4))}
                  {(idx % 4) + 1})
                </span>
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
                <span key={idx} ref={reg(TRACK_OFFSET + idx)} className="block">
                  <span className="inline-block w-10">
                    {String.fromCharCode(65 + Math.floor(idx / 4))}
                    {(idx % 4) + 1})
                  </span>
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