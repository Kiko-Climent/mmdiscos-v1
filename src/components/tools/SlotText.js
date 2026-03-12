"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function SlotText({ value = "", className = "" }) {
  const [current, setCurrent]   = useState(value);
  const [incoming, setIncoming] = useState(null);
  const currentCharsRef  = useRef([]);
  const incomingCharsRef = useRef([]);
  const isAnimating = useRef(false);
  const queued      = useRef(null);

  useEffect(() => {
    if (value === current) return;
    if (isAnimating.current) {
      queued.current = value;
      return;
    }
    setIncoming(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (incoming === null) return;

    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isAnimating.current = true;

        const from = current;
        const to   = incoming;
        const maxLen = Math.max(from.length, to.length);
        const tl = gsap.timeline({
          onComplete: () => {
            isAnimating.current = false;
            setCurrent(to);
            setIncoming(null);
            if (queued.current !== null) {
              const next = queued.current;
              queued.current = null;
              setIncoming(next);
            }
          },
        });

        for (let i = 0; i < maxLen; i++) {
          const oldEl   = currentCharsRef.current[i];
          const newEl   = incomingCharsRef.current[i];
          const changed = from[i] !== to[i];
          const delay   = i * 0.045;

          if (changed) {
            if (oldEl) {
              tl.to(oldEl, { y: "-120%", opacity: 0, duration: 0.18, ease: "power2.in" }, delay);
            }
            if (newEl) {
              // Incoming arranca invisible abajo
              gsap.set(newEl, { y: "120%", opacity: 0 });
              tl.to(newEl, { y: "0%", opacity: 1, duration: 0.2, ease: "power2.out" }, delay + 0.1);
            }
          } else {
            // Mismo caracter — el incoming aparece en su sitio, el old se oculta
            if (newEl) gsap.set(newEl, { y: "0%", opacity: 1 });
            if (oldEl) gsap.set(oldEl, { opacity: 0 });
          }
        }
      });
    });

    return () => cancelAnimationFrame(raf1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incoming]);

  const renderSpans = (str, refArr, forceVisible = false) =>
    str.split("").map((ch, i) => (
      <span
        key={i}
        ref={el => { refArr[i] = el; }}
        style={{
          display:  "inline-block",
          overflow: "hidden",
          // Los chars del texto actual siempre visibles —
          // GSAP solo los mueve durante la transición
          opacity: forceVisible ? 1 : undefined,
        }}
      >
        {ch === " " ? "\u00A0" : ch}
      </span>
    ));

  return (
    <span className={className} style={{ position: "relative", display: "inline-block" }}>
      {/* Texto actual — siempre visible mientras no anima */}
      <span style={{ display: "inline-block" }}>
        {renderSpans(current, currentCharsRef.current, true)}
      </span>

      {/* Texto entrante — invisible hasta que GSAP lo anima */}
      {incoming !== null && (
        <span style={{ position: "absolute", top: 0, left: 0, display: "inline-block", whiteSpace: "nowrap" }}>
          {renderSpans(incoming, incomingCharsRef.current, false)}
        </span>
      )}
    </span>
  );
}