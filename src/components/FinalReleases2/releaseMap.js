import { DataReleases } from "../data";

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

export const OPTIMIZED_IMAGE_MAP = {
  "/img1.jpg": "/img-opt/img1.webp",
  "/img2.jpg": "/img-opt/img2.webp",
  "/img3.jpg": "/img-opt/img3.webp",
  "/img4.jpg": "/img-opt/img4.webp",
  "/img5.jpg": "/img-opt/img5.webp",
  "/MMD040_Cover-1.jpg": "/img-opt/MMD040_Cover-1.webp",
  "/MMD039.png": "/img-opt/MMD039.webp",
  "/img8.jpg": "/img-opt/img8.webp",
  "/img9.jpg": "/img-opt/img9.webp",
  "/img10.jpg": "/img-opt/img10.webp",
  "/MMD038.png": "/img-opt/MMD038.webp",
  "/MMD040-2.png": "/img-opt/MMD040-2.webp",
  "/morira - cover.png": "/img-opt/morira - cover.webp",
  "/Celex - cover.jpg": "/img-opt/Celex - cover.webp",
  "/corben_peachland_cover.jpg": "/img-opt/corben_peachland_cover.webp",
  "/Factory Edits - cover.jpg": "/img-opt/Factory Edits - cover.webp",
};

export const SLIDE_COUNT = IMAGES.length;
export const CENTER_IDX  = Math.floor(SLIDE_COUNT / 2);

export const TITLES = IMAGES.map(
  (_, i) => `MM — ${String(i + 1).padStart(3, "0")}`
);

export const RELEASE_MAP = {};
DataReleases.forEach((r) => {
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
