import { DataReleases } from "../data";

function parseRefParts(ref = "") {
  const normalized = String(ref || "").trim().toLowerCase();
  const m = normalized.match(/^([a-z]+)(\d+)(?:\.(\d+))?$/);
  if (!m) return null;
  return {
    prefix: m[1],
    major: Number(m[2]),
    minor: Number(m[3] || 0),
  };
}

function compareReleasesByRef(a, b) {
  const aRef = parseRefParts(a.ref);
  const bRef = parseRefParts(b.ref);
  const aYear = Number(a.year);
  const bYear = Number(b.year);
  const aIsMms = aRef?.prefix === "mms";
  const bIsMms = bRef?.prefix === "mms";

  // Exception: MMS catalog is independent from MMD.
  // Place MMS releases inside their year block (e.g. mms007 in 2024 area).
  if (aIsMms || bIsMms) {
    if (Number.isFinite(aYear) && Number.isFinite(bYear) && aYear !== bYear) {
      return aYear - bYear;
    }
  }

  if (aRef && bRef) {
    if (aRef.major !== bRef.major) return aRef.major - bRef.major;
    if (aRef.minor !== bRef.minor) return aRef.minor - bRef.minor;
    return aRef.prefix.localeCompare(bRef.prefix);
  }

  if (aRef && !bRef) return -1;
  if (!aRef && bRef) return 1;
  return String(a.ref || "").localeCompare(String(b.ref || ""));
}

// Source of truth for release order (slider + index).
export const SORTED_RELEASES = [...DataReleases].sort(compareReleasesByRef);

// Build slide sources from sorted releases and dedupe repeated image paths.
export const IMAGES = Array.from(
  new Set(
    SORTED_RELEASES.map((release) => release.image).filter(Boolean),
  ),
);

const IMAGE_VARIANT_WIDTHS = [720, 960, 1280];

const IMAGE_PROFILE_MAP = {
  "/statues.jpeg": "text",
  "/Daichi - cover.jpg": "text",
  "/img1.jpg": "text",
  "/img2.jpg": "text",
  "/img3.jpg": "text",
  "/img4.jpg": "text",
  "/img5.jpg": "text",
  "/MMD040_Cover-1.jpg": "text",
  "/MMD039.png": "text",
  "/img8.jpg": "text",
  "/img9.jpg": "text",
  "/img10.jpg": "text",
  "/MMD038.png": "text",
  "/MMD040-2.png": "text",
  "/morira - cover.png": "text",
  "/Celex - cover.jpg": "text",
  "/corben_peachland_cover.jpg": "text",
  "/Factory Edits - cover.jpg": "text",
  "/MMD041_Cover.jpg": "text",
  "/MMD042_Cover.jpg": "text",
};

function getVariantWidth(targetWidth, lowPerfMobile) {
  const clamped = Math.max(480, Math.round(targetWidth || 960));
  for (const width of IMAGE_VARIANT_WIDTHS) {
    if (clamped <= width) return lowPerfMobile ? Math.min(width, 960) : width;
  }
  return lowPerfMobile ? 960 : IMAGE_VARIANT_WIDTHS[IMAGE_VARIANT_WIDTHS.length - 1];
}

function getBaseName(src = "") {
  return src.replace(/^\/+/, "").replace(/\.[^/.]+$/, "");
}

export function getOptimizedImageCandidates(
  src,
  {
    viewportWidth = 390,
    dpr = 1,
    lowPerfMobile = false,
    prefersAvif = false,
  } = {},
) {
  const profile = IMAGE_PROFILE_MAP[src] || "balanced";
  const targetWidth = viewportWidth * Math.min(dpr, lowPerfMobile ? 1.35 : 2);
  let width = getVariantWidth(targetWidth, lowPerfMobile);
  // On very dense mobile displays, 720 can shimmer on fine typography.
  if (lowPerfMobile && dpr >= 2.2 && width < 960) width = 960;
  const base = getBaseName(src);
  const extOrder = prefersAvif ? ["avif", "webp"] : ["webp", "avif"];

  return extOrder.map(
    (ext) => `/img-opt/v2/${base}__${profile}-${width}.${ext}`,
  );
}

export const SLIDE_COUNT = IMAGES.length;
export const CENTER_IDX  = Math.floor(SLIDE_COUNT / 2);

export const TITLES = IMAGES.map(
  (_, i) => `MM — ${String(i + 1).padStart(3, "0")}`
);

export const RELEASE_MAP = {};
SORTED_RELEASES.forEach((r) => {
  if (r.image) RELEASE_MAP[r.image] = r;
});

export const DEFAULT_CREDITS_LINES = [
  "All Tracks Written, Produced by NairLess",
  "Mastering by Baldo Gallego",
  "Graphics & Design by J.Diaz | allthatjazz",
  "Curated By Da Silva & Dj Katah",
  "A & R by Moon & Mann",
  "Distributed By Word and Sound",
  "Powered By MM Discos",
];
