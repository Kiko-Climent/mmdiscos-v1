"use client";

import { useLayoutEffect, useRef } from "react";
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

// EDGE = px-3 del NewNav. El wrapper se estrecha 2×EDGE; ahi dentro
// `right: 0` de las refs YA queda a EDGE del viewport (los absolute
// ignoran padding, por eso no usamos padding en el padre).
// SIDE = ancho de cada columna lateral (nav / refs) medido desde el
// borde de la pantalla, para que la imagen tenga el mismo aire a ambos
// lados.
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

// Mide 100svh igual que el hero (probe en vez de innerHeight): así el
// primer release queda centrado sobre el mismo eje que la marca de agua
// fija (top-[50svh] en HeroLogoReveal) y la tapa al aparecer tras el flip.
const measureSvh = () => {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;top:0;left:0;width:0;height:100svh;pointer-events:none;visibility:hidden";
  document.body.appendChild(probe);
  const h = probe.getBoundingClientRect().height;
  probe.remove();
  return h;
};

// El release centrado en el foco (mismo eje que el spacer de arriba, 50svh)
// queda a opacidad plena; los que salen por arriba o entran por abajo se
// apagan — igual que en la versión mobile de readymag.com/readymag/unlearned.
// FOCUS_MIN_OPACITY iguala MARQUEE_OPACITY del marquee desktop (NewHighlights2).
const FOCUS_MIN_OPACITY = 0.15;
// Zona muerta alrededor del foco (en fracción de vh): dentro de ella el
// release se mantiene a opacidad plena. El fundido solo arranca al
// cruzar ese radio, así que empieza más tarde — cerca del nav arriba /
// del borde inferior — en vez de degradarse ya desde el centro.
const FOCUS_HOLD_VH = 0.32;
const FOCUS_FADE_VH = 0.25;
// El texto descriptivo aguanta opacidad plena más tiempo que la imagen/titulo
// (igual que en la referencia de readymag): solo se apaga ya al borde mismo.
const TEXT_HOLD_VH = 0.55;
const TEXT_FADE_VH = 0.18;
// El texto nunca baja de esta opacidad — a diferencia de la imagen (que
// puede quedar casi invisible de fondo), el texto tiene que seguir siendo
// legible incluso ya desenfocado.
const TEXT_MIN_OPACITY = 0.75;

export default function NewHighlightsMob2() {
  const frameRef = useRef(null);
  const contentColRef = useRef(null);
  const refColRef = useRef(null);
  const topSpacerRef = useRef(null);
  const firstImageRef = useRef(null);
  const sectionRefs = useRef([]);
  const visualRefs = useRef([]);
  const textRefs = useRef([]);
  const refWrapRefs = useRef([]);
  const svhRef = useRef(0);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const contentCol = contentColRef.current;
    const refCol = refColRef.current;
    const topSpacer = topSpacerRef.current;
    const firstImage = firstImageRef.current;
    if (!frame || !contentCol || !refCol) return;

    const updateFocusOpacity = () => {
      const vh = svhRef.current || window.innerHeight;
      const focusY = vh / 2;
      const imgHoldPx = vh * FOCUS_HOLD_VH;
      const imgFadePx = vh * FOCUS_FADE_VH;
      const textHoldPx = vh * TEXT_HOLD_VH;
      const textFadePx = vh * TEXT_FADE_VH;
      sectionRefs.current.forEach((s, i) => {
        if (!s) return;
        const rect = s.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const dist = Math.abs(centerY - focusY);

        const visual = visualRefs.current[i];
        if (visual) {
          const tImg = Math.max(0, Math.min(1, (dist - imgHoldPx) / imgFadePx));
          visual.style.opacity = (1 - tImg * (1 - FOCUS_MIN_OPACITY)).toFixed(3);
          // Mismo tratamiento que el marquee desktop (opacity + grayscale(1)):
          // a t=1 el release queda tan desaturado como las imagenes de fondo.
          visual.style.filter = `grayscale(${(tImg * 100).toFixed(1)}%)`;
        }

        const text = textRefs.current[i];
        if (text) {
          const tText = Math.max(0, Math.min(1, (dist - textHoldPx) / textFadePx));
          text.style.opacity = (1 - tText * (1 - TEXT_MIN_OPACITY)).toFixed(3);
        }
      });
    };

    const layoutRefs = () => {
      svhRef.current = measureSvh();

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
        // El wrap no llega al fondo común: termina en el punto en el que
        // toda la pila cabe justo bajo el top. Así cada ref sigue pegándose
        // a su imagen, pero al salir del frame se desplazan juntas (mismo
        // delta) y no se comprimen una encima de otra.
        const wrapEnd =
          totalH - STACK_HEIGHT + NAV_PAD_TOP + (i + 1) * NAV_ROW;
        wrap.style.top = `${top}px`;
        wrap.style.height = `${Math.max(0, wrapEnd - top)}px`;
      });

      updateFocusOpacity();
    };

    layoutRefs();
    const ro = new ResizeObserver(layoutRefs);
    ro.observe(contentCol);
    window.addEventListener("resize", layoutRefs);

    // NO usar window "scroll": en móvil el scroll va por
    // ScrollTrigger.normalizeScroll (mueve el contenido con transform, no
    // con scrollTop nativo), así que el evento "scroll" nunca llega ahí.
    // El ticker de GSAP corre siempre, sea scroll nativo o normalizado.
    gsap.ticker.add(updateFocusOpacity);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", layoutRefs);
      gsap.ticker.remove(updateFocusOpacity);
    };
  }, []);

  return (
    <section
      style={{
        width: "100%",
        background: "#fff",
        color: INK,
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
                style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
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
                    <source srcSet={`${optBase(it.base)}-720.avif`} type="image/avif" />
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
                }}
              >
                {it.copy}
              </p>
            </section>
          ))}

          <div style={{ height: `calc(100svh - ${STACK_HEIGHT}px)` }} aria-hidden />
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