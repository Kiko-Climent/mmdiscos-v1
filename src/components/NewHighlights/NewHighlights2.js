"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { DataReleases } from "@/components/data";

// ─────────────────────────────────────────────────────────────────────────
// Data — mismos 6 highlights que la v5.
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

const catalogLabel = (ref) => ref.toUpperCase();

const ITEMS = HIGHLIGHTS.map((h) => ({
  ...h,
  catalog: catalogLabel(h.ref),
  tracklist: DataReleases.find((r) => r.ref === h.ref)?.tracklist ?? [],
}));

// El track del marquee es la lista duplicada — con translateX(-50%) en un
// bucle infinito, el punto donde "empalma" es invisible porque la segunda
// mitad es una copia exacta de la primera.
const MARQUEE_ITEMS = [...ITEMS, ...ITEMS];

// Cuantas mas pistas, mas columnas — asi el bloque crece en ANCHO, no en
// ALTO, y nunca se acerca verticalmente a la franja de los titulos.
const trackColumnCount = (n) => (n > 8 ? 3 : n > 4 ? 2 : 1);

const HEADLINE_FONT = "'Favorit', sans-serif";

const GREY_TEXT_SOFT = "#9a9a9a";
const INK = "#111111";

// ─────────────────────────────────────────────────────────────────────────
// Geometría — v6 = v5 + grid imaginario de 3 columnas para alinear imagen y
// tracklist. En v5 la imagen y el tracklist compartian el mismo borde
// DERECHO (right:EDGE) pero anchos independientes: la imagen tenia un
// ancho fijo (LATERAL_WIDTH) y el tracklist se ajustaba "a medida" segun
// el numero de columnas de pistas (190px para 1 columna, 408px para 2,
// 626px para 3) — asi que su borde IZQUIERDO caia en un sitio distinto
// segun el release, sin relacion con la imagen.
//
// Ahora ambos comparten el mismo ancho de referencia, RIGHT_COL_WIDTH — la
// "columna derecha" de un grid imaginario de 3 columnas que cubre toda la
// seccion. La imagen mide exactamente eso (y por tanto crece respecto a
// v5). Para 1-2 columnas de pistas, el tracklist usa ese mismo
// RIGHT_COL_WIDTH directamente — bordes izquierdos identicos. Para 3
// columnas, el ancho del bloque se DERIVA algebraicamente de
// RIGHT_COL_WIDTH (ver TRACK_WIDTH_3COL mas abajo) para que sea el LIMITE
// ENTRE LA 1ª Y LA 2ª COLUMNA — no el borde del bloque entero — el que
// coincide con el borde de la imagen. Con un ancho por columna fijo (como
// en la primera version) esa coincidencia solo salia aproximada segun el
// viewport; derivandolo del mismo ancho de la imagen sale exacta siempre.
// ─────────────────────────────────────────────────────────────────────────
const EDGE = "0.75rem"; // mismo px-3 del NewNav
const TOP_CLEARANCE = "clamp(1.25rem, 3vh, 2rem)";
const BAND_BOTTOM = "clamp(7rem, 13vh, 9rem)"; // suelo de la franja de titulos
const LINE_BOTTOM = EDGE; // mismo margen inferior que los laterales — descripcion y tracklist se anclan aqui

const DESC_WIDTH = "clamp(190px, 15vw, 260px)"; // estrecho a proposito -> lineas cortas

// Ancho de la columna derecha del grid imaginario de 3 columnas — lo
// comparten la imagen Y el contenedor del tracklist (ver comentario de
// arriba). Antes la imagen usaba LATERAL_WIDTH (clamp 320–500px); ahora es
// mas ancha porque tiene que dar cabida tambien a un tracklist de 2
// columnas con margen de sobra.
const RIGHT_COL_WIDTH = "clamp(380px, 30vw, 520px)";

const TRACK_COL_GAP = 28;

// v6_1 — variante para tracklists largos (>8 pistas, las que en v6 se
// partian en 3 columnas). En vez de columnas, aqui se escriben TODAS las
// pistas seguidas, una detras de otra, como un unico parrafo que envuelve
// de forma natural — mas brutalista, mas "muro de texto" editorial.
//
// Ese parrafo vive en un bloque ANCHO que arranca en el borde izquierdo de
// la columna CENTRAL del grid imaginario de 3 columnas (no en el borde
// izquierdo de la imagen, que es donde arranca la columna derecha) y
// termina en el mismo borde derecho que la imagen — es decir, ocupa las
// columnas central + derecha juntas, con su gutter intermedio:
//
//   WIDE_TRACK_WIDTH = RIGHT_COL_WIDTH (columna central)
//                    + GRID_GUTTER
//                    + RIGHT_COL_WIDTH (columna derecha, la de la imagen)
//
// Al estar ambos bloques anclados al mismo borde derecho (right: EDGE),
// esto deja su borde IZQUIERDO exactamente donde arrancaria esa columna
// central — sin necesidad de medir nada, solo geometria.
const GRID_GUTTER = "2rem";
const WIDE_TRACK_WIDTH = `calc(${RIGHT_COL_WIDTH} * 2 + ${GRID_GUTTER})`;

const HOVER_SCALE = 2.3;

// Marquee v6_2 — collage modular, no fila uniforme.
//
// Una sola unidad `--mm-u` genera tres tamanos en proporcion Fibonacci
// 3:5:8 (S:M:L). Tres registros verticales (start / center / end) anclan
// cada placa al techo, al eje o al suelo de la banda. La frase de 6
// tiempos —una por release— es una OLA alto→bajo, no un random: se lee
// como tres pares (alta, cuelga), y al duplicar la lista el empalme del
// bucle cae exactamente en el mismo compas (i % 6).
//
// Cada placa tiene su celda: gutter fijo, sin solape. El ritmo lo marcan
// tamano y registro, no el encaje.
const MARQUEE_UNIT = "clamp(3rem, 4.8vw, 4.75rem)";
const MARQUEE_SIZES = {
  s: "calc(var(--mm-u) * 3)",
  m: "calc(var(--mm-u) * 5)",
  l: "calc(var(--mm-u) * 8)",
};
const MARQUEE_PIN = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
};
const MARQUEE_PHRASE = [
  { size: "m", pin: "start",  y: 0 },  // plate alta — ancla
  { size: "l", pin: "end",    y: 0 },  // plancha que cuelga
  { size: "m", pin: "start",  y: 9 },  // misma escala, un registro abajo
  { size: "s", pin: "center", y: -6 }, // sello en el eje
  { size: "m", pin: "end",    y: 0 },  // eco de la plancha, a escala M
  { size: "s", pin: "start",  y: 6 },  // sello alto → vuelve al ancla
];
const MARQUEE_GAP = "4px";
const MARQUEE_DURATION = "48s";
const MARQUEE_OPACITY = 0.15;
const MARQUEE_KEYFRAMES_NAME = "mm-highlights-marquee-62";

const DEFAULT_DESC = "The six latest from the catalog. MMD036 → MMD042.";
const DEFAULT_BLURB =
  "Dub pressure, dream house, gritty basslines, kraut drifts, post-Italo journeys and tropical psychedelia — six records that drift from afterhours heat to 90s breaks without ever settling into one genre.";

export default function NewHighlights2() {
  const [activeIndex, setActiveIndex] = useState(null);

  const descRef = useRef(null);
  const catalogRef = useRef(null);
  const trackWrapRef = useRef(null);
  const trackItemsRef = useRef([]);
  const imgWrapRef = useRef(null);
  const imgRef = useRef(null);
  const marqueeRef = useRef(null);

  // Marquee — arranca visible (opacity ya en el estilo inicial). Aqui solo
  // lo apagamos/encendemos segun haya o no un titulo activo: fade + pausa
  // de la animacion CSS (asi no sigue de fondo consumiendo GPU sin verse).
  useLayoutEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;
    gsap.killTweensOf(el);
    if (activeIndex === null) {
      el.style.animationPlayState = "running";
      gsap.to(el, { opacity: MARQUEE_OPACITY, duration: 0.35, ease: "power2.out" });
    } else {
      gsap.to(el, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          el.style.animationPlayState = "paused";
        },
      });
    }
  }, [activeIndex]);

  useLayoutEffect(() => {
    const item = activeIndex !== null ? ITEMS[activeIndex] : null;

    gsap.killTweensOf([
      descRef.current,
      catalogRef.current,
      trackWrapRef.current,
      imgWrapRef.current,
    ]);

    if (!item) {
      gsap.to(imgWrapRef.current, {
        opacity: 0,
        duration: 0.16,
        ease: "power2.in",
      });
      gsap.fromTo(
        [catalogRef.current, descRef.current, trackWrapRef.current],
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }
      );
      return;
    }

    gsap.fromTo(
      descRef.current,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }
    );

    gsap.fromTo(
      catalogRef.current,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }
    );

    gsap.to(trackWrapRef.current, { opacity: 1, duration: 0.16, ease: "power1.out" });
    const trackLines = trackItemsRef.current.filter(Boolean);
    gsap.fromTo(
      trackLines,
      { opacity: 0, y: 3 },
      { opacity: 1, y: 0, duration: 0.18, ease: "power2.out", stagger: 0.015, delay: 0.03 }
    );

    if (imgRef.current) {
      const base = item.base;
      imgRef.current.onerror = () => {
        imgRef.current.onerror = null;
        imgRef.current.src = `${optBase(base)}-960.webp`;
      };
      imgRef.current.src = `${optBase(base)}-960.avif`;
    }
    gsap.fromTo(
      imgWrapRef.current,
      { opacity: 0, scale: 1.03 },
      { opacity: 1, scale: 1, duration: 0.28, ease: "power2.out" }
    );
  }, [activeIndex]);

  const active = activeIndex !== null ? ITEMS[activeIndex] : null;
  const trackCols = active ? trackColumnCount(active.tracklist.length) : 1;
  // 1-2 columnas: bloque estrecho, mismo ancho que la imagen — como en v6.
  // Listas largas (>8 pistas, trackCols===3 en v6): en vez de columnas,
  // parrafo continuo en un bloque ancho (ver WIDE_TRACK_WIDTH arriba).
  const isLongList = trackCols === 3;
  const trackWidth = !active || isLongList ? WIDE_TRACK_WIDTH : RIGHT_COL_WIDTH;

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100svh",
        background: "#fff",
        color: INK,
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Keyframes del marquee — desplaza el track exactamente la mitad de
          su ancho (la lista duplicada), asi el bucle no se nota. */}
      <style>{`
        @keyframes ${MARQUEE_KEYFRAMES_NAME} {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      {/* Marquee de fondo — collage modular 3:5:8 en bucle continuo.
          Vive DETRAS de los titulos. La banda llega a EDGE (no se corta
          en BAND_BOTTOM) para que las planchas grandes cuelguen hacia
          el copy inferior; el texto pinta encima por orden DOM.
          pointer-events:none para que nunca robe el hover a los titulos. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: EDGE,
          bottom: EDGE,
          overflow: "hidden",
          display: "flex",
          alignItems: "stretch",
          pointerEvents: "none",
        }}
      >
        <div
          ref={marqueeRef}
          style={{
            "--mm-u": MARQUEE_UNIT,
            display: "flex",
            alignItems: "stretch",
            gap: MARQUEE_GAP,
            height: "100%",
            width: "max-content",
            opacity: MARQUEE_OPACITY,
            animation: `${MARQUEE_KEYFRAMES_NAME} ${MARQUEE_DURATION} linear infinite`,
          }}
        >
          {MARQUEE_ITEMS.map((it, i) => {
            const slot = MARQUEE_PHRASE[i % MARQUEE_PHRASE.length];
            const size = MARQUEE_SIZES[slot.size];
            return (
              <div
                key={`${it.ref}-${i}`}
                style={{
                  flexShrink: 0,
                  width: size,
                  aspectRatio: "1 / 1",
                  alignSelf: MARQUEE_PIN[slot.pin],
                  transform: slot.y ? `translateY(${slot.y}vh)` : undefined,
                  overflow: "hidden",
                }}
              >
                <img
                  src={`${optBase(it.base)}-720.webp`}
                  alt=""
                  draggable={false}
                  decoding="async"
                  loading={i < ITEMS.length ? "eager" : "lazy"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    filter: "grayscale(1)",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Titulos — centrados en TODA la seccion con el mismo margen a ambos
          lados (EDGE). z-index por encima del marquee y de la imagen para
          que el titulo en hover los tape (y a sus vecinos). */}
      <div
        style={{
          position: "absolute",
          left: EDGE,
          right: EDGE,
          top: TOP_CLEARANCE,
          bottom: BAND_BOTTOM,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0px",
          zIndex: 10,
        }}
      >
        {ITEMS.map((it, i) => {
          const isActive = activeIndex === i;
          return (
            // La zona de deteccion de hover (este <button>) NUNCA cambia de
            // tamaño — solo el <span> de dentro se escala visualmente. Si el
            // propio button se escalase (como antes), su area de hover
            // crecia con el, y el raton tenia que salir de toda esa zona
            // ampliada antes de que el titulo vecino reaccionase (lag
            // perceptible al pasar de uno a otro). Separando "deteccion" de
            // "render" el cambio es instantaneo: el span, con pointer-events
            // none, deja pasar el hover al button vecino aunque lo tape
            // visualmente.
            <button
              key={it.ref}
              type="button"
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex((cur) => (cur === i ? null : cur))}
              onFocus={() => setActiveIndex(i)}
              onBlur={() => setActiveIndex((cur) => (cur === i ? null : cur))}
              style={{
                position: "relative",
                appearance: "none",
                background: "transparent",
                border: 0,
                padding: 0,
                margin: 0,
                cursor: "pointer",
                lineHeight: 0.92,
                zIndex: isActive ? 2 : 1,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  textTransform: "uppercase",
                  fontFamily: HEADLINE_FONT,
                  fontWeight: 700,
                  lineHeight: 0.92,
                  letterSpacing: "-0.03em",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  fontSize: "clamp(2rem, 3.6vw, 3.4rem)",
                  color: INK,
                  transform: isActive ? `scale(${HOVER_SCALE})` : "scale(1)",
                  transformOrigin: "center center",
                  transition: "transform 220ms cubic-bezier(0.16, 1, 0.3, 1)",
                  zIndex: isActive ? 10 : 1,
                  pointerEvents: "none",
                }}
              >
                {it.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Etiqueta izquierda — "HIGHLIGHTS" en reposo; al hover se
          sustituye por el catalogo del release activo. */}
      <div
        style={{
          position: "absolute",
          left: EDGE,
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          pointerEvents: "none",
          zIndex: 12,
        }}
      >
        <p
          ref={catalogRef}
          style={{
            margin: 0,
            fontFamily: HEADLINE_FONT,
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "-0.06em",
            lineHeight: 1.05,
            textTransform: "uppercase",
            color: INK,
            whiteSpace: "nowrap",
          }}
        >
          {active ? active.catalog : "Highlights"}
        </p>
      </div>

      {/* Imagen — esquina superior derecha. Ancho = RIGHT_COL_WIDTH, igual
          que el contenedor del tracklist (ver arriba) — es lo que garantiza
          que sus bordes izquierdos coincidan para releases de 1-2 columnas
          de pistas. z-index por debajo de los titulos. */}
      <div
        style={{
          position: "absolute",
          top: EDGE,
          right: EDGE,
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        <div
          ref={imgWrapRef}
          style={{
            width: RIGHT_COL_WIDTH,
            aspectRatio: "1 / 1",
            overflow: "hidden",
            opacity: 0,
          }}
        >
          <img
            ref={imgRef}
            alt=""
            draggable={false}
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      </div>

      {/* Descripcion — anclada al margen izquierdo (EDGE) y al suelo de la
          seccion (LINE_BOTTOM = EDGE). Bloque estrecho: lineas cortas. */}
      <div
        style={{
          position: "absolute",
          left: EDGE,
          bottom: LINE_BOTTOM,
          width: DESC_WIDTH,
        }}
      >
        <p
          ref={descRef}
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            lineHeight: 1.32,
            color: INK,
          }}
        >
          {active ? active.copy : DEFAULT_DESC}
        </p>
      </div>

      {/* Tracklist — abajo a la derecha, mismo borde que la imagen
          (right: EDGE). 1-2 columnas: `width: RIGHT_COL_WIDTH`, identico
          al de la imagen — bordes izquierdos coinciden directamente, igual
          que en v6. Listas largas (>8 pistas): `width: WIDE_TRACK_WIDTH`,
          y en vez de columnas, todas las pistas seguidas en un unico
          parrafo que envuelve de forma natural — ver comentario junto a
          WIDE_TRACK_WIDTH mas arriba. */}
      <div
        ref={trackWrapRef}
        style={{
          position: "absolute",
          right: EDGE,
          bottom: LINE_BOTTOM,
          width: trackWidth,
        }}
      >
          {active && (
          <p
            style={{
              textTransform: "uppercase",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.14em",
              color: GREY_TEXT_SOFT,
              margin: "0 0 6px",
              // Siempre a la izquierda: en modo columnas el contenido se
              // alinea a la izquierda por defecto (column-count), y en
              // modo parrafo continuo tambien — el listado "empieza"
              // siempre en el borde izquierdo del bloque, en ambos modos.
              textAlign: "left",
            }}
          >
            Tracklist
          </p>
          )}

          {!active ? (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.32,
                color: INK,
                textAlign: "left",
              }}
            >
              {DEFAULT_BLURB}
            </p>
          ) : isLongList ? (
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.5, textAlign: "left" }}>
              {(active?.tracklist ?? []).map((track, i, arr) => (
                <span
                  key={`${active?.ref ?? "x"}-${i}`}
                  ref={(el) => {
                    trackItemsRef.current[i] = el;
                  }}
                  style={{ opacity: 0 }}
                >
                  <span style={{ color: GREY_TEXT_SOFT }}>{String(i + 1).padStart(2, "0")}</span>{" "}
                  <span style={{ color: INK }}>{track}</span>
                  {i < arr.length - 1 && <span style={{ color: GREY_TEXT_SOFT }}> · </span>}
                </span>
              ))}
            </p>
          ) : (
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                columnCount: trackCols,
                columnGap: TRACK_COL_GAP,
              }}
            >
              {(active?.tracklist ?? []).map((track, i) => (
                <li
                  key={`${active?.ref ?? "x"}-${i}`}
                  ref={(el) => {
                    trackItemsRef.current[i] = el;
                  }}
                  style={{
                    opacity: 0,
                    breakInside: "avoid",
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.32,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                >
                  <span style={{ color: GREY_TEXT_SOFT }}>{String(i + 1).padStart(2, "0")}</span>{" "}
                  <span style={{ color: INK }}>{track}</span>
                </li>
              ))}
            </ul>
          )}
      </div>
    </section>
  );
}
