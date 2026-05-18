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
  const scaleFilter = [
    `scale=${profile.width}:${profile.height}:force_original_aspect_ratio=decrease`,
    `pad=${profile.width}:${profile.height}:(ow-iw)/2:(oh-ih)/2:black`,
    `fps=${profile.fps}`,
  ].join(",");

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
