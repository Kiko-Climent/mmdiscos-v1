/** Layout y animación del carrusel WebGL */
export const CARD_W = 340;
export const CARD_H = 340;
export const SPACING = 330;
/** Mayor = el scroll alcanza el slide objetivo más rápido (más fluido). */
export const SCROLL_LERP = 0.22;
/** Antidebounce mínimo (ms); el ritmo real entre slides lo marca “scroll alineado” + rueda. */
export const SLIDE_COOLDOWN = 50;
/** Suma de deltaY (rueda/trackpad) antes de contar 1 paso; evita varios slides en un solo gesto. */
export const WHEEL_ACCUM_THRESHOLD = 42;
/** Si |scrollTarget - scrollCurrent| > esto, no se acepta otro paso (1 slide a la vez). */
export const SCROLL_SETTLED_EPS = 2.5;
export const FOCUS_THUMB_Z = 0;
export const THUMB_SCALE = 0.12;
export const COLUMN_GAP_FRAC = 0.14;
export const COLUMN_GAP_MIN = 72;
export const PADDING_PX = 12;
export const THUMB_GAP_Y = 14;
export const HERO_SCALE = 1.06;

export const FOCUS_ENTER_STAGGER = 0.048;
export const FOCUS_ENTER_THUMB_DURATION = 0.95;
export const FOCUS_ENTER_THUMB_EASE = "power2.out";
export const FOCUS_ENTER_HERO_DURATION = 1.0;
export const FOCUS_ENTER_HERO_EASE = "power3.inOut";
export const FOCUS_ENTER_HERO_DELAY = 0.06;

export const IMAGES = [
  "/img1.jpg",
  "/img2.jpg",
  "/img3.jpg",
  "/img4.jpg",
  "/img5.jpg",
  "/MMD040_Cover-1.jpg",
  "/MMD039.png",
  "/img8.jpg",
  "/img9.jpg",
  "/img10.jpg",
  "/MMD038.png",
  "/MMD040-2.png",
  "/morira - cover.png",
  "/Celex - cover.jpg",
  "/corben_peachland_cover.jpg",
  "/Factory Edits - cover.jpg",
];

export const SLIDE_COUNT = IMAGES.length;
export const TITLES = IMAGES.map((_, i) => `MM — ${String(i + 1).padStart(3, "0")}`);
export const CENTER_IDX = Math.floor(SLIDE_COUNT / 2);

/** Paneles HTML (info · tracklist · credits) */
export const PANEL_FONT_SIZE = 9;
export const PANEL_LINE_HEIGHT = 1.15;
export const PANEL_TEXT = "#000";
export const PANEL_GAP_TIGHT = 1;

/** Ancho relativo del bloque info respecto al área disponible a la derecha del hero */
export const INFO_W_FRAC = 0.38;

export const DEFAULT_CREDITS_LINES = [
  "All Tracks Written, Produced by NairLess",
  "Mastering by Baldo Gallego",
  "Graphics & Design by J.Diaz | allthatjazz",
  "Curated By Da Silva & Dj Katah",
  "A & R by Moon & Mann",
  "Distributed By Word and Sound",
  "Powered By MM Discos",
];
