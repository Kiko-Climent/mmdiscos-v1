"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function DetailView2({ detail, release, closeDetail }) {
  const [mounted, setMounted] = useState(false);
  const elementsRef           = useRef([]);

  useEffect(() => {
    if (detail) setMounted(true);
  }, [detail]);

  useEffect(() => {
    if (!mounted) return;

    const els = elementsRef.current.filter(Boolean);
    gsap.killTweensOf(els);

    if (detail) {
      // ── ENTRADA: bloom blur ────────────────────────────────────────────────
      // Cada elemento hace: invisible+blur60 → blur pico 90 → nítido
      // El stagger escala el delay de entrada, no la duración — así cada
      // letra/palabra tiene su propio arco completo sin pisarse.
      gsap.set(els, { opacity: 0, filter: "blur(80px)", willChange: "filter, opacity" });

      els.forEach((el, i) => {
        const delay = i * 0.1;

        gsap.timeline({ delay })
          // Fase 1 — aparece y el blur sube al pico (rápido, 30% del tiempo)
          .to(el, {
            opacity: 1,
            filter: "blur(110px)",
            duration: 0.35,
            ease: "power2.in",
          })
          // Fase 2 — el blur se disuelve suavemente hasta 0 (lento, 70%)
          .to(el, {
            filter: "blur(0px)",
            duration: 1.4,
            ease: "power4.out",
            onComplete: () => {
              if (i === els.length - 1) gsap.set(els, { willChange: "auto" });
            },
          });
      });

    } else {
      // ── SALIDA: inverso — de dcha a izqda, nítido → blur bloom → desaparece ─
      gsap.set(els, { willChange: "filter, opacity" });

      [...els].reverse().forEach((el, i) => {
        const delay = i * 0.06;

        gsap.timeline({ delay })
          .to(el, {
            filter: "blur(90px)",
            duration: 0.25,
            ease: "power2.in",
          })
          .to(el, {
            opacity: 0,
            filter: "blur(120px)",
            duration: 0.5,
            ease: "power3.in",
            onComplete: () => {
              if (i === els.length - 1) {
                setMounted(false);
                elementsRef.current = [];
              }
            },
          });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail, mounted]);

  if (!mounted) return null;

  const reg = (i) => (el) => { elementsRef.current[i] = el; };
  const tracklist    = release?.tracklist ?? [];
  const TRACK_OFFSET = 5;

  return (
    <div id="detail-mode" className="absolute inset-0 z-[200] pointer-events-none">
      <div className="absolute inset-0 flex items-center justify-start pointer-events-none">
        <div className="flex justify-between w-full px-8">

          {/* ── LEFT ────────────────────────────────────────────────── */}
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

          {/* ── RIGHT ───────────────────────────────────────────────── */}
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