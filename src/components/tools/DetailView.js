"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * DetailView
 *
 * @param {boolean}  detail      — estado externo (abierto/cerrado)
 * @param {object}   release     — DataReleases[activeIndexRef.current]
 * @param {function} closeDetail — callback para cerrar
 */
export default function DetailView({ detail, release, closeDetail }) {
  // "mounted" controla si el DOM existe
  // se separa de "detail" para poder animar la salida antes de desmontar
  const [mounted, setMounted]  = useState(false);
  const elementsRef            = useRef([]);

  // ── Entrada: detail true → monta el DOM ──────────────────────────────────
  useEffect(() => {
    if (detail) setMounted(true);
  }, [detail]);

  // ── Animación cada vez que cambia detail o se completa el montaje ─────────
  useEffect(() => {
    if (!mounted) return;

    const els = elementsRef.current.filter(Boolean);

    gsap.killTweensOf(els);
    gsap.set(els, { willChange: "filter, opacity" });

    if (detail) {
      // Entrada: blur → nítido, izq → dcha
      gsap.fromTo(
        els,
        { opacity: 0, filter: "blur(60px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.6,
          ease: "power3.out",
          stagger: { each: 0.08 },
          onComplete: () => gsap.set(els, { willChange: "auto" }),
        }
      );
    } else {
      // Salida: nítido → blur, dcha → izq, luego desmonta
      gsap.to(els, {
        opacity: 0,
        filter: "blur(60px)",
        duration: 1.0,
        ease: "power2.in",
        stagger: { each: 0.06, from: "end" },
        onComplete: () => {
          setMounted(false);
          elementsRef.current = [];
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail, mounted]);

  if (!mounted) return null;

  // Registra cada elemento animable en el array por índice
  const reg = (i) => (el) => { elementsRef.current[i] = el; };

  const tracklist  = release?.tracklist ?? [];
  const TRACK_OFFSET = 5; // artist + title + close + bandcamp + soundcloud

  return (
    <div
      id="detail-mode"
      className="absolute inset-0 z-[200] pointer-events-none"
    >
      <div className="absolute inset-0 flex items-center justify-start pointer-events-none">
        <div className="flex justify-between w-full px-8">

          {/* ── LEFT ──────────────────────────────────────────────────── */}
          <div className="flex flex-col text-releases w-1/2">
            <div className="flex flex-col">
              <span ref={reg(0)} className="block">{release?.artist}</span>
              <span ref={reg(1)} className="block">{release?.title}</span>
            </div>

            <div className="flex flex-col mt-4">
              {tracklist.map((track, idx) => (
                <span key={idx} ref={reg(TRACK_OFFSET + idx)} className="block">
                  <span className="inline-block w-18">
                    {String.fromCharCode(65 + Math.floor(idx / 4))}
                    {(idx % 4) + 1})
                  </span>
                  {track}
                </span>
              ))}
            </div>
          </div>

          {/* ── RIGHT ─────────────────────────────────────────────────── */}
          <div className="flex flex-col text-releases text-right uppercase items-end">
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