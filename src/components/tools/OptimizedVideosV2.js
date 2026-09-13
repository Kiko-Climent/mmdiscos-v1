import { mkdir, rm, access } from "fs/promises";
import path from "path";
import { spawn } from "child_process";

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const INPUT_DIR = path.join(PUBLIC_DIR, "video");
const OUTPUT_DIR = path.join(PUBLIC_DIR, "video-opt", "v2");

const DEFAULT_PROFILES = {
  mobile: {
    width: 854,
    height: 480,
    fps: 30,
    crf: 27,
    maxrate: "1200k",
    bufsize: "2400k",
  },
  tablet: {
    width: 1280,
    height: 720,
    fps: 30,
    crf: 24,
    maxrate: "2800k",
    bufsize: "5600k",
  },
  desktop: {
    width: 1920,
    height: 1080,
    fps: 30,
    crf: 22,
    maxrate: "5000k",
    bufsize: "10000k",
  },
};

const SOURCES = [
  { input: "MM Hero BG_1.mp4", outputBase: "mm-hero-bg-1" },
  {
    input: "Video MM Header.mp4",
    outputBase: "video-mm-header",
    profiles: {
      mobile: {
        width: 640,
        height: 360,
        fps: 24,
        crf: 29,
        maxrate: "800k",
        bufsize: "1600k",
      },
      tablet: {
        width: 960,
        height: 540,
        fps: 24,
        crf: 27,
        maxrate: "1500k",
        bufsize: "3000k",
      },
      desktop: {
        width: 1280,
        height: 720,
        fps: 24,
        crf: 25,
        maxrate: "2200k",
        bufsize: "4400k",
      },
    },
  },
  {
    // Footer video (AboutFooter). Fuente 2700×2160 (~5:4, casi cuadrado) a
    // 60fps y ~18.8 Mbps → 9.4 MB. Se muestra con object-cover en un contenedor
    // flexible, así que preservamos el aspect ratio original (scaleMode "width",
    // sin pad ni crop) y dejamos que el recorte lo haga el CSS. 30fps es más
    // que suficiente para un loop ambiental y reduce el peso a la mitad.
    input: "smokers.mp4",
    outputBase: "smokers",
    profiles: {
      mobile: {
        scaleMode: "width",
        width: 640,
        fps: 30,
        crf: 28,
        maxrate: "1000k",
        bufsize: "2000k",
      },
      tablet: {
        scaleMode: "width",
        width: 960,
        fps: 30,
        crf: 25,
        maxrate: "2000k",
        bufsize: "4000k",
      },
      desktop: {
        scaleMode: "width",
        width: 1600,
        fps: 30,
        crf: 22,
        maxrate: "4500k",
        bufsize: "9000k",
      },
    },
  },
];

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function ensureInputExists(fileName) {
  const inputPath = path.join(INPUT_DIR, fileName);
  await access(inputPath);
  return inputPath;
}

async function encodeVariant(inputPath, outputBase, profileName, profile) {
  const outputPath = path.join(OUTPUT_DIR, `${outputBase}__${profileName}.mp4`);
  // scaleMode "width": preserva el aspect ratio original del vídeo, cap por
  // ancho y sin barras negras (ideal para vídeos servidos con object-cover en
  // CSS, donde el recorte lo hace el navegador según el contenedor). Alto -2 =
  // divisible por 2 automáticamente (requisito de yuv420p).
  // Por defecto (sin scaleMode): encaja en la caja width×height y añade pad
  // negro para llegar a la dimensión exacta (comportamiento 16:9 previo).
  const scaleFilter = (
    profile.scaleMode === "width"
      ? [
          `scale='min(iw,${profile.width})':-2`,
          `fps=${profile.fps}`,
        ]
      : [
          `scale=${profile.width}:${profile.height}:force_original_aspect_ratio=decrease`,
          `pad=${profile.width}:${profile.height}:(ow-iw)/2:(oh-ih)/2:black`,
          `fps=${profile.fps}`,
        ]
  ).join(",");

  const args = [
    "-y",
    "-i",
    inputPath,
    "-an",
    "-vf",
    scaleFilter,
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    String(profile.crf),
    "-maxrate",
    profile.maxrate,
    "-bufsize",
    profile.bufsize,
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    outputPath,
  ];

  await runCommand("ffmpeg", args);
}

async function run() {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  let generated = 0;
  for (const source of SOURCES) {
    const inputPath = await ensureInputExists(source.input);
    const profiles = source.profiles || DEFAULT_PROFILES;
    for (const [profileName, profile] of Object.entries(profiles)) {
      await encodeVariant(inputPath, source.outputBase, profileName, profile);
      generated += 1;
    }
  }

  console.log(
    `[optimize:videos:v2] Generated ${generated} videos in ${OUTPUT_DIR}`,
  );
}

run().catch((error) => {
  console.error("[optimize:videos:v2] Failed:", error);
  process.exitCode = 1;
});
