import sharp from "sharp";
import { mkdir, readdir, rm } from "fs/promises";
import path from "path";

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const RAW_DIR = path.join(PUBLIC_DIR, "raw");
const OUTPUT_DIR = path.join(PUBLIC_DIR, "img-opt", "v2");

const SOURCE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const TARGET_WIDTHS = [720, 960, 1280];

const PROFILES = {
  balanced: {
    avif: { quality: 58 },
    webp: { quality: 78 },
    sharpen: false,
  },
  text: {
    avif: { quality: 74 },
    webp: { quality: 90 },
    sharpen: true,
  },
};

function isImageFile(fileName) {
  return SOURCE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

function stripExt(fileName) {
  return fileName.replace(/\.[^/.]+$/, "");
}

async function listImageFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && isImageFile(entry.name))
    .map((entry) => path.join(dir, entry.name));
}

function sortPreferred(a, b) {
  const aIsRaw = a.includes(`${path.sep}raw${path.sep}`);
  const bIsRaw = b.includes(`${path.sep}raw${path.sep}`);
  if (aIsRaw && !bIsRaw) return -1;
  if (!aIsRaw && bIsRaw) return 1;
  return a.localeCompare(b);
}

async function collectSourceImages() {
  const [publicFiles, rawFiles] = await Promise.all([
    listImageFiles(PUBLIC_DIR),
    listImageFiles(RAW_DIR),
  ]);

  const all = [...rawFiles, ...publicFiles].sort(sortPreferred);
  const uniqueByBaseName = new Map();

  for (const filePath of all) {
    const baseName = stripExt(path.basename(filePath));
    if (!uniqueByBaseName.has(baseName)) {
      uniqueByBaseName.set(baseName, filePath);
    }
  }

  return uniqueByBaseName;
}

async function encodeVariant(inputPath, outputBaseName, profileName, width) {
  const profile = PROFILES[profileName];
  const outputPrefix = `${outputBaseName}__${profileName}-${width}`;
  const image = sharp(inputPath)
    .rotate()
    .resize(width, width, { fit: "inside", withoutEnlargement: true });

  if (profile.sharpen) image.sharpen(1.1);

  await Promise.all([
    image
      .clone()
      .avif(profile.avif)
      .toFile(path.join(OUTPUT_DIR, `${outputPrefix}.avif`)),
    image
      .clone()
      .webp(profile.webp)
      .toFile(path.join(OUTPUT_DIR, `${outputPrefix}.webp`)),
  ]);
}

async function run() {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  const sources = await collectSourceImages();
  const jobs = [];

  for (const [baseName, inputPath] of sources.entries()) {
    for (const width of TARGET_WIDTHS) {
      for (const profileName of Object.keys(PROFILES)) {
        jobs.push(encodeVariant(inputPath, baseName, profileName, width));
      }
    }
  }

  await Promise.all(jobs);

  const totalOutputs = jobs.length * 2;
  console.log(
    `[optimize:images:v2] Generated ${totalOutputs} files from ${sources.size} images in ${OUTPUT_DIR}`,
  );
}

run().catch((error) => {
  console.error("[optimize:images:v2] Failed:", error);
  process.exitCode = 1;
});
