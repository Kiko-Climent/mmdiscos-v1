"use client";

import { useEffect, useRef, useCallback } from "react";
import { DataReleases } from "../data/index";

const ROW_H = 32;

export default function IndexReleases() {
  const previewRef = useRef(null);
  const wrapperRefs = useRef([]);
  const rowRefs = useRef([]);
  const gsapRef = useRef(null);

  useEffect(() => {
    const load = () => { gsapRef.current = window.gsap; };
    if (typeof window !== "undefined" && window.gsap) { load(); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
    s.onload = load;
    document.head.appendChild(s);
  }, []);

  const showImage = useCallback((index) => {
    const gsap = gsapRef.current;
    const preview = previewRef.current;
    if (!gsap || !preview) return;

    Array.from(preview.querySelectorAll("img")).forEach((img) => img.remove());

    const img = new window.Image();
    img.src = DataReleases[index].image;
    img.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;will-change:opacity;";
    preview.appendChild(img);

    requestAnimationFrame(() => {
      gsap.to(img, { opacity: 1, duration: 0.25, ease: "power2.out" });
    });
  }, []);

  const hideImages = useCallback(() => {
    const gsap = gsapRef.current;
    const preview = previewRef.current;
    if (!gsap || !preview) return;
    Array.from(preview.querySelectorAll("img")).forEach((img) => {
      gsap.to(img, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => img.remove(),
      });
    });
  }, []);

  const dimAll = useCallback((exceptIndex) => {
    const gsap = gsapRef.current;
    if (!gsap) return;
    rowRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        opacity: i === exceptIndex ? 1 : 0.2,
        duration: 0.25,
        ease: "power2.out",
        overwrite: true,
      });
    });
  }, []);

  const undimAll = useCallback(() => {
    const gsap = gsapRef.current;
    if (!gsap) return;
    rowRefs.current.forEach((el) => {
      if (!el) return;
      gsap.to(el, { opacity: 1, duration: 0.25, ease: "power2.out", overwrite: true });
    });
  }, []);

  const handleEnter = useCallback((index) => {
    const gsap = gsapRef.current;
    const w = wrapperRefs.current[index];
    if (!gsap || !w) return;
    gsap.to(w, { y: -ROW_H, duration: 0.3, ease: "expo.out", overwrite: true });
    showImage(index);
    dimAll(index);
  }, [showImage, dimAll]);

  const handleLeave = useCallback((index) => {
    const gsap = gsapRef.current;
    const w = wrapperRefs.current[index];
    if (!gsap || !w) return;
    gsap.to(w, { y: 0, duration: 0.3, ease: "expo.out", overwrite: true });
    hideImages();
    undimAll();
  }, [hideImages, undimAll]);

  return (
    // Full viewport, flex center
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* ── Preview image — on top of list (higher z-index), pointer-events none ── */}
      <div
        ref={previewRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "clamp(180px, 28vmin, 400px)",
          height: "clamp(180px, 28vmin, 400px)",
          transform: "translate(-50%, -50%)",
          zIndex: 10,           // above the list (z-index 1)
          pointerEvents: "none",
        }}
      />

      {/* ── List — centered, lower z-index ── */}
      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
        {DataReleases.map((r, i) => (
          <div
            key={r.ref}
            ref={(el) => (rowRefs.current[i] = el)}
            style={{ height: ROW_H, overflow: "hidden", cursor: "default" }}
            onMouseEnter={() => handleEnter(i)}
            onMouseLeave={() => handleLeave(i)}
          >
            <div
              ref={(el) => (wrapperRefs.current[i] = el)}
              style={{ willChange: "transform" }}
            >
              {/* Row 0 — default: REF / YEAR */}
              <div style={row}>
                <span style={cell}>{r.ref.toUpperCase()}</span>
                <span style={cell}>{r.year}</span>
              </div>
              {/* Row 1 — hover: ARTIST / TITLE */}
              <div style={row}>
                <span style={cell}>{(r.artist_name || r.artist).toUpperCase()}</span>
                <span style={{ ...cell, ...truncate }}>{r.title.toUpperCase()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const row = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "clamp(24px, 5vw, 80px)",
  height: ROW_H,
  background: "transparent",
};

const cell = {
  fontSize: 9.5,
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  lineHeight: 1,
  color: "#000",
  fontFamily: "inherit",
  whiteSpace: "nowrap",
};

const truncate = {
  maxWidth: "40vw",
  overflow: "hidden",
  textOverflow: "ellipsis",
};