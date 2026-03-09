"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

/**
 * BlurReveal — Reusable text blur-in animation component
 *
 * Props:
 * @param {React.ReactNode}  children    — Text content to animate
 * @param {"words"|"chars"}  splitBy     — Split unit (default: "words")
 * @param {"mount"|"scroll"} trigger     — When to fire (default: "scroll")
 * @param {number}           threshold   — IntersectionObserver threshold 0–1 (default: 0.3)
 * @param {number}           duration    — Animation duration in seconds (default: 1.8)
 * @param {number}           stagger     — Stagger between each unit (default: 0.06)
 * @param {number}           delay       — Initial delay in seconds (default: 0)
 * @param {number}           blurAmount  — Starting blur in px (default: 60)
 * @param {string}           ease        — GSAP ease string (default: "power3.out")
 * @param {string}           className   — Tailwind / custom classes on the wrapper
 * @param {boolean}          once        — Only animate once on scroll (default: true)
 */
export default function BlurReveal({
  children,
  splitBy = "words",
  trigger = "scroll",
  threshold = 0.3,
  duration = 1.8,
  stagger = 0.06,
  delay = 0,
  blurAmount = 60,
  ease = "power3.out",
  className = "",
  once = true,
}) {
  const wrapperRef = useRef(null);
  const splitRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    // Wait for fonts before splitting
    document.fonts.ready.then(() => {
      // Split text into units
      splitRef.current = new SplitText(el, {
        type: splitBy,
        // Wrap each unit so overflow: hidden clips during animation
        wordsClass: "blur-word",
        charsClass: "blur-char",
      });

      const units = el.querySelectorAll(
        splitBy === "chars" ? ".blur-char" : ".blur-word"
      );

      // GPU-friendly initial state: use transform + filter (compositor layers)
      gsap.set(units, {
        filter: `blur(${blurAmount}px)`,
        opacity: 0,
        willChange: "filter, opacity",
      });

      const animate = () => {
        gsap.to(units, {
          filter: "blur(0px)",
          opacity: 1,
          duration,
          ease,
          delay,
          stagger,
          onComplete: () => {
            // Remove willChange after animation to free GPU memory
            gsap.set(units, { willChange: "auto", clearProps: "filter" });
          },
        });
      };

      if (trigger === "mount") {
        animate();
        return;
      }

      // Scroll trigger via IntersectionObserver (no extra GSAP plugin needed)
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (once && hasAnimated.current) return;
              hasAnimated.current = true;
              animate();
              if (once) observer.disconnect();
            }
          });
        },
        { threshold }
      );

      observer.observe(el);

      return () => observer.disconnect();
    });

    return () => {
      splitRef.current?.revert();
    };
  }, [splitBy, trigger, threshold, duration, stagger, delay, blurAmount, ease, once]);

  return (
    <span
      ref={wrapperRef}
      // SVG filter trick from the original for extra blur softness (optional)
      style={{ filter: "url(#blur-matrix) blur(0.25px)" }}
      className={`inline-block ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * BlurRevealSVGFilter — Drop this once anywhere in your layout/page.
 * Required for the soft matrix blur effect on the text edges.
 * It's invisible but powers the `url(#blur-matrix)` filter reference.
 */
export function BlurRevealSVGFilter() {
  return (
    <svg
      aria-hidden="true"
      className="absolute w-0 h-0 overflow-hidden pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="blur-matrix">
          <feGaussianBlur stdDeviation="8 0" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
            result="matrix"
          />
          <feBlend in="SourceGraphic" in2="matrix" mode="normal" />
        </filter>
      </defs>
    </svg>
  );
}