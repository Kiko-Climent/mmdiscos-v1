"use client";

import { Fragment, useLayoutEffect, useRef } from "react";
import gsap from "gsap";

// ─────────────────────────────────────────────────────────────────────────
// Data — mismos 6 highlights que el layout desktop (v6).
// ─────────────────────────────────────────────────────────────────────────
const HIGHLIGHTS = [
  {
    title: "Pelagos",
    base: "MMD042_Cover",
    ref: "mmd042",
    copy: "James Falco's Pelagos EP lands somewhere between Amnesia Ibiza and The Haçienda — four sun-faded cuts of dub, dream house and Mediterranean afterhours heat.",
  },
  {
    title: "Brahmaputra",
    base: "MMD041_Cover",
    ref: "mmd041",
    copy: "Gritty basslines, sharp percussion and 80s-leaning house crossed with Balearic flashes, dub pressure and proto-trance heat. Four cuts caught between peak-time progressive and introspective drift.",
  },
  {
    title: "Socarrat vol.1",
    base: "MMD040_Cover-1",
    ref: "mmd040.1",
    copy: "A decade of MM Discos, condensed. Volume one drifts from mid-tempo grooves to house-driven heat, threaded with a Balearic pulse. No trends, no labels — just the freewheeling spirit that defined us from day one.",
  },
  {
    title: "Deamwalker",
    base: "img4",
    ref: "mmd036",
    copy: "Four tracks where downtempo electronics take the lead, drawing from house and balearic beat to sketch an island-Mediterranean landscape of color and fantasy.",
  },
  {
    title: "Socarrat vol.2",
    base: "MMD040-2",
    ref: "mmd040.2",
    copy: "The Socarrat continues. Volume II spans dark-Balearic moods, kraut-infused drifts, spatial post-Italo journeys, electronic funk and tropical psychedelia — a cosmic tutti-frutti charting ten years of MM Discos at full tilt.",
  },
  {
    title: "Eternal Sunset",
    base: "MMD039",
    ref: "mmd039",
    copy: "Nic Jalusi distills his '90s-leaning house on Eternal Sunset — Italian dream house, Kwaito and dub textures, African-synth heat and late-night breaks. A sun-soaked cocktail for living rooms and dancefloors alike.",
  },
];

const optBase = (base) => `/img-opt/v2/${base}__balanced`;

const ITEMS = HIGHLIGHTS.map((h) => ({
  ...h,
  catalog: h.ref.toUpperCase(),
}));

const HEADLINE_FONT = "'Favorit', sans-serif";
const INK = "#111111";

const EDGE = "0.75rem";
const SIDE = "6.75rem";
const GUTTER = `calc(${SIDE} - ${EDGE})`;
const NAV_PAD_TOP = 10;
const NAV_FONT_SIZE = 18;
const NAV_LINE_HEIGHT = 1.05;
const NAV_ROW = NAV_FONT_SIZE * NAV_LINE_HEIGHT;
const NAV_TRACKING = "-0.06em";
const NAV_WEIGHT = 600;
const STACK_HEIGHT = NAV_PAD_TOP + ITEMS.length * NAV_ROW;

const measureSvh = () => {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;top:0;left:0;width:0;height:100svh;pointer-events:none;visibility:hidden";
  document.body.appendChild(probe);
  const h = probe.getBoundingClientRect().height;
  probe.remove();
  return h;
};

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

// Tapa / título: mismo fundido que NewHighlightsMob2.
const FOCUS_MIN_OPACITY = 0.15;
const FOCUS_HOLD_VH = 0.32;
const FOCUS_FADE_VH = 0.25;

// Copy — mismo split L/R + spread + cascade que ManifestoNew.js.
// La formación NO arranca abajo del todo: el párrafo sigue fuera hasta
// ~90vh y acaba de coserse al llegar a la banda de lectura (~66vh),
// que es donde el copy se lee bajo el título (foto 2). El montaje es
// continuo (smootherstep): no hay corte a “ya legible”.
const TEXT_ASSEMBLE_END_VH = 0.66;
const TEXT_ASSEMBLE_START_VH = 0.9;
// Aproximación suave de la tapa al foco (sin corte binario).
const TEXT_IMAGE_ENTER_VH = 0.22;
const TEXT_OFF_VW = 0.6;
const TEXT_SPREAD = 0.1;
const SEG_DURATION = 0.7;
const LINE_CASCADE = 0.03;
const TEXT_ENTER_BLUR_PX = 4;
const NAV_LINK_COUNT = 4;
const TEXT_TOP_FADE_Y = NAV_PAD_TOP + NAV_LINK_COUNT * NAV_ROW;
const TEXT_TOP_MIN_OPACITY = 0.32;

const power2Out = gsap.parseEase("power2.out");

// Derivada 0 en t=0 y t=1: el aterrizaje no corta, se apaga solo.
function smootherstep(t) {
  t = clamp01(t);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

// Agrupa palabras en trozos línea×lado usando el layout ya pintado.
// Clustering por proximidad de `top` (mitad de la altura de palabra)
// — copiado de ManifestoNew.js.
function buildQuoteSegments(quoteEl) {
  const wordEls = Array.from(quoteEl.querySelectorAll(".hl-q-word"));
  const containerRect = quoteEl.getBoundingClientRect();
  const containerCenterX = containerRect.left + containerRect.width / 2;

  const wordMeta = wordEls.map((el) => {
    const r = el.getBoundingClientRect();
    return {
      el,
      top: r.top,
      centerX: r.left + r.width / 2,
    };
  });

  const sorted = [...wordMeta].sort((a, b) => a.top - b.top);
  const sampleH = sorted[0]?.el.getBoundingClientRect().height || 20;
  const threshold = Math.max(sampleH * 0.45, 6);

  const lines = [];
  sorted.forEach((w) => {
    const line = lines[lines.length - 1];
    if (line && Math.abs(w.top - line.top) <= threshold) {
      line.words.push(w);
    } else {
      lines.push({ top: w.top, words: [w] });
    }
  });

  const segments = [];
  lines.forEach((line, lineIdx) => {
    const left = [];
    const right = [];
    line.words.forEach((w) => {
      (w.centerX < containerCenterX ? left : right).push(w);
    });
    left.sort((a, b) => a.centerX - b.centerX);
    right.sort((a, b) => a.centerX - b.centerX);
    if (left.length) {
      segments.push({
        side: "L",
        lineIdx,
        words: left,
        anchorX: left[left.length - 1].centerX,
      });
    }
    if (right.length) {
      segments.push({
        side: "R",
        lineIdx,
        words: right,
        anchorX: right[0].centerX,
      });
    }
  });

  return segments;
}

function applyAssemble(segments, offX, assembleP) {
  const maxLine = segments.reduce((m, s) => Math.max(m, s.lineIdx), 0);
  const totalWave = SEG_DURATION + maxLine * LINE_CASCADE;
  segments.forEach((seg) => {
    const startTime = seg.lineIdx * LINE_CASCADE;
    const local = clamp01((assembleP * totalWave - startTime) / SEG_DURATION);
    const eased = power2Out(local);
    const baseOff = seg.side === "L" ? -offX : offX;
    seg.words.forEach((w) => {
      const extra = (w.centerX - seg.anchorX) * TEXT_SPREAD;
      w.el.style.transform = `translate3d(${((1 - eased) * (baseOff + extra)).toFixed(2)}px,0,0)`;
      w.el.style.opacity = eased.toFixed(3);
    });
  });
}

export default function NewHighlightsMob3() {
  const frameRef = useRef(null);
  const contentColRef = useRef(null);
  const refColRef = useRef(null);
  const topSpacerRef = useRef(null);
  const firstImageRef = useRef(null);
  const sectionRefs = useRef([]);
  const visualRefs = useRef([]);
  const textRefs = useRef([]);
  const refWrapRefs = useRef([]);
  const packsRef = useRef([]);
  const svhRef = useRef(0);
  const topFadeYRef = useRef(TEXT_TOP_FADE_Y);
  const offXRef = useRef(0);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const contentCol = contentColRef.current;
    const refCol = refColRef.current;
    const topSpacer = topSpacerRef.current;
    const firstImage = firstImageRef.current;
    if (!frame || !contentCol || !refCol) return;

    const updateFocus = () => {
      const vh = svhRef.current || window.innerHeight;
      const focusY = vh / 2;
      const imgHoldPx = vh * FOCUS_HOLD_VH;
      const imgFadePx = vh * FOCUS_FADE_VH;
      const assembleEndY = vh * TEXT_ASSEMBLE_END_VH;
      const assembleStartY = vh * TEXT_ASSEMBLE_START_VH;
      const assembleRangePx = Math.max(1, assembleStartY - assembleEndY);
      const imageEnterPx = vh * TEXT_IMAGE_ENTER_VH;
      const topFadeY = topFadeYRef.current;
      const offX = offXRef.current;

      sectionRefs.current.forEach((s, i) => {
        if (!s) return;
        const rect = s.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const dist = Math.abs(centerY - focusY);

        const visual = visualRefs.current[i];
        if (visual) {
          const tImg = Math.max(0, Math.min(1, (dist - imgHoldPx) / imgFadePx));
          visual.style.opacity = (1 - tImg * (1 - FOCUS_MIN_OPACITY)).toFixed(3);
          visual.style.filter = `grayscale(${(tImg * 100).toFixed(1)}%)`;
        }

        const text = textRefs.current[i];
        const pack = packsRef.current[i];
        if (!text || !pack?.segments?.length || !visual) return;

        const visRect = visual.getBoundingClientRect();
        const imgBox = visual.firstElementChild;
        const focusRect = imgBox ? imgBox.getBoundingClientRect() : visRect;
        const visCenterY = focusRect.top + focusRect.height / 2;
        const delta = visCenterY - focusY;
        const y = text.getBoundingClientRect().top;
        const textP = 1 - clamp01((y - assembleEndY) / assembleRangePx);
        const imageP = 1 - clamp01(delta / imageEnterPx);
        const assembleP = smootherstep(Math.max(textP, imageP));

        applyAssemble(pack.segments, offX, assembleP);
        const blurPx = (1 - assembleP) * TEXT_ENTER_BLUR_PX;
        text.style.filter = `blur(${blurPx.toFixed(2)}px)`;

        if (y < topFadeY) {
          const tText = clamp01((topFadeY - y) / Math.max(1, topFadeY));
          text.style.opacity = (
            1 -
            tText * (1 - TEXT_TOP_MIN_OPACITY)
          ).toFixed(3);
        } else {
          text.style.opacity = "1";
        }
      });
    };

    const layoutRefs = () => {
      svhRef.current = measureSvh();
      offXRef.current = window.innerWidth * TEXT_OFF_VW;

      const navEl = document.getElementById("mm-new-nav");
      topFadeYRef.current = navEl
        ? navEl.getBoundingClientRect().bottom
        : TEXT_TOP_FADE_Y;

      if (topSpacer && firstImage) {
        const imgH = firstImage.offsetHeight;
        const space = Math.max(0, svhRef.current / 2 - imgH / 2 - NAV_PAD_TOP);
        topSpacer.style.height = `${space}px`;
      }

      const list = sectionRefs.current.filter(Boolean);
      const frameTop = frame.getBoundingClientRect().top;
      const totalH = contentCol.offsetHeight;
      refCol.style.height = `${totalH}px`;
      list.forEach((s, i) => {
        const wrap = refWrapRefs.current[i];
        if (!wrap) return;
        const top = s.getBoundingClientRect().top - frameTop;
        const wrapEnd =
          totalH - STACK_HEIGHT + NAV_PAD_TOP + (i + 1) * NAV_ROW;
        wrap.style.top = `${top}px`;
        wrap.style.height = `${Math.max(0, wrapEnd - top)}px`;
      });

      // Medir el wrap real ANTES de aplicar x off-screen (igual que
      // ManifestoNew). Si medimos con translate, el seam L/R se rompe.
      textRefs.current.forEach((el) => {
        if (!el) return;
        el.style.opacity = "1";
        el.style.filter = "none";
        el.querySelectorAll(".hl-q-word").forEach((w) => {
          w.style.transform = "";
          w.style.opacity = "";
        });
      });
      void contentCol.offsetWidth;
      packsRef.current = textRefs.current.map((el) =>
        el ? { segments: buildQuoteSegments(el) } : null
      );

      updateFocus();
    };

    layoutRefs();
    const ro = new ResizeObserver(layoutRefs);
    ro.observe(contentCol);
    window.addEventListener("resize", layoutRefs);
    gsap.ticker.add(updateFocus);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", layoutRefs);
      gsap.ticker.remove(updateFocus);
    };
  }, []);

  return (
    <section
      style={{
        width: "100%",
        background: "#fff",
        color: INK,
        overflow: "hidden",
      }}
    >
      <div
        ref={frameRef}
        style={{
          position: "relative",
          width: `calc(100% - 2 * ${EDGE})`,
          margin: "0 auto",
        }}
      >
        <div
          ref={contentColRef}
          style={{ paddingTop: NAV_PAD_TOP, position: "relative", zIndex: 2 }}
        >
          <div ref={topSpacerRef} aria-hidden="true" />
          {ITEMS.map((it, i) => (
            <section
              key={it.ref}
              ref={(el) => {
                sectionRefs.current[i] = el;
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: i === 0 ? "0 0 28px" : "28px 0",
              }}
            >
              <div
                ref={(el) => {
                  visualRefs.current[i] = el;
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  ref={i === 0 ? firstImageRef : undefined}
                  style={{
                    width: `calc(100% - 2 * ${GUTTER})`,
                    aspectRatio: "1 / 1",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <picture>
                    <source
                      srcSet={`${optBase(it.base)}-720.avif`}
                      type="image/avif"
                    />
                    <img
                      src={`${optBase(it.base)}-720.webp`}
                      alt={it.title}
                      draggable={false}
                      decoding="async"
                      loading={i < 2 ? "eager" : "lazy"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </picture>
                </div>

                <h3
                  style={{
                    fontFamily: HEADLINE_FONT,
                    fontSize: "clamp(2.2rem, 9.5vw, 3.2rem)",
                    fontWeight: 700,
                    lineHeight: 0.92,
                    letterSpacing: "-0.04em",
                    textTransform: "uppercase",
                    textAlign: "center",
                    textWrap: "balance",
                    margin: "16px 0 0",
                    color: INK,
                    width: "100%",
                  }}
                >
                  {it.title}
                </h3>
              </div>

              <p
                ref={(el) => {
                  textRefs.current[i] = el;
                }}
                style={{
                  fontFamily: HEADLINE_FONT,
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  textAlign: "center",
                  color: INK,
                  margin: "8px 0 0",
                  width: "100%",
                  willChange: "opacity, filter",
                }}
              >
                {it.copy.split(" ").map((w, wi, arr) => (
                  <Fragment key={wi}>
                    <span
                      className="hl-q-word"
                      style={{
                        display: "inline-block",
                        willChange: "transform, opacity",
                      }}
                    >
                      {w}
                    </span>
                    {wi < arr.length - 1 ? " " : ""}
                  </Fragment>
                ))}
              </p>
            </section>
          ))}

          <div
            style={{ height: `calc(100svh - ${STACK_HEIGHT}px)` }}
            aria-hidden
          />
        </div>

        <div
          ref={refColRef}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: GUTTER,
            pointerEvents: "none",
            zIndex: 6,
          }}
        >
          {ITEMS.map((it, i) => (
            <div
              key={it.ref}
              ref={(el) => {
                refWrapRefs.current[i] = el;
              }}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
              }}
            >
              <div
                style={{
                  position: "sticky",
                  top: NAV_PAD_TOP + i * NAV_ROW,
                  fontFamily: HEADLINE_FONT,
                  fontSize: NAV_FONT_SIZE,
                  fontWeight: NAV_WEIGHT,
                  letterSpacing: NAV_TRACKING,
                  lineHeight: NAV_LINE_HEIGHT,
                  color: INK,
                  textAlign: "right",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {it.catalog}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
