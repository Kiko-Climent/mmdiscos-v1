
import sharp from "sharp";
import { readdir } from "fs/promises";
import path from "path";

const INPUT_DIR  = "./public/raw";
const OUTPUT_DIR = "./public/img-opt";

const files = await readdir(INPUT_DIR);

for (const file of files) {
  const input = path.join(INPUT_DIR, file);
  const name  = path.parse(file).name;

  // AVIF — mejor compresión, soportado en Safari 16+, Chrome, Firefox
  await sharp(input)
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .avif({ quality: 60 })
    .toFile(path.join(OUTPUT_DIR, `${name}.avif`));

  // WebP — fallback para browsers más viejos
  await sharp(input)
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 70 })
    .toFile(path.join(OUTPUT_DIR, `${name}.webp`));
}