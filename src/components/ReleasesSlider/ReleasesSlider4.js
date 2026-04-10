"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { DataReleases } from "../data";

// ─── Config ─────────────────────────────────────────────────────────────────

const CARD_W         = 340;
const CARD_H         = 340;
const SPACING        = 330;
const SCROLL_LERP    = 0.07;
const SLIDE_COOLDOWN = 620;
const FOCUS_THUMB_Z = 0;
const THUMB_SCALE   = 0.12;
const COLUMN_GAP_FRAC = 0.14;
const COLUMN_GAP_MIN  = 72;
const PADDING_PX      = 12;
const THUMB_GAP_Y   = 14;
const HERO_SCALE    = 1.06;

const FOCUS_ENTER_STAGGER         = 0.048;
const FOCUS_ENTER_THUMB_DURATION  = 0.95;
const FOCUS_ENTER_THUMB_EASE      = "power2.out";
const FOCUS_ENTER_HERO_DURATION   = 1.0;
const FOCUS_ENTER_HERO_EASE       = "power3.inOut";
const FOCUS_ENTER_HERO_DELAY      = 0.06;

const IMAGES = [
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

const SLIDE_COUNT = IMAGES.length;

const TITLES = IMAGES.map((_, i) => `MM — ${String(i + 1).padStart(3, "0")}`);

const RELEASE_MAP = {};
DataReleases.forEach((r) => { if (r.image) RELEASE_MAP[r.image] = r; });

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const frag = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2      uMouse;
  uniform float     uHover;
  uniform float     uTime;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    if (uHover > 0.0) {
      vec2  dir    = uv - uMouse;
      float dist   = length(dir);
      float ripple = sin(dist * 22.0 - uTime * 5.0) * 0.018;
      ripple *= smoothstep(0.75, 0.0, dist) * uHover;
      uv += normalize(dir + vec2(0.0001)) * ripple;
      uv  = clamp(uv, 0.001, 0.999);
    }
    gl_FragColor = texture2D(uTexture, uv);
  }
`;

const CENTER_IDX = Math.floor(SLIDE_COUNT / 2);

const DEFAULT_CREDITS_LINES = [
  "All Tracks Written, Produced by NairLess",
  "Mastering by Baldo Gallego",
  "Graphics & Design by J.Diaz | allthatjazz",
  "Curated By Da Silva & Dj Katah",
  "A & R by Moon & Mann",
  "Distributed By Word and Sound",
  "Powered By MM Discos",
];

const PANEL_FONT_SIZE = 9;
const PANEL_LINE_HEIGHT = 1.15;
const PANEL_TEXT = "#000";
const PANEL_GAP_TIGHT = 1;

function wrapCarouselOffset(offset, trackWidth) {
  const half = trackWidth / 2;
  return ((((offset + half) % trackWidth) + trackWidth) % trackWidth) - half;
}

function calcFinalPos(i, scroll, W) {
  const trackWidth = SLIDE_COUNT * SPACING;
  const offset = wrapCarouselOffset(i * SPACING - scroll, trackWidth);
  const absDist = Math.abs(offset);
  const t       = Math.min(absDist / (W * 1.1), 1.0);
  const tEased  = Math.pow(t, 0.75);
  return {
    x:     offset,
    y:     -tEased * 140,
    z:     -tEased * 900,
    scale: 1.06 - tEased * 0.45,
  };
}


export default function ReleasesSlider4() {
  const canvasRef  = useRef(null);
  const titleRef   = useRef(null);
  const counterRef = useRef(null);
  const bgARef     = useRef(null);
  const bgBRef     = useRef(null);
  const bgActive   = useRef("a");

  const infoPanelRef  = useRef(null);
  const trackPanelRef = useRef(null);

  const [focusedData, setFocusedData] = useState(null);
  const [panelLayout, setPanelLayout] = useState({
    left: 0, top: 0, height: 0, availableW: 0, gap: 0,
  });

  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const sync = () =>
      setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let W = window.innerWidth;
    let H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const FOV = 50;
    const getCamZ = () => H / (2 * Math.tan((FOV * Math.PI / 180) / 2));
    const camera = new THREE.PerspectiveCamera(FOV, W / H, 1, 8000);
    camera.position.z = getCamZ();

    function computePanelLayout() {
      const thumbW = CARD_W * THUMB_SCALE;
      const heroW = CARD_W * HERO_SCALE;
      const heroH = CARD_H * HERO_SCALE;
      const colGap = Math.max(COLUMN_GAP_MIN, heroW * COLUMN_GAP_FRAC);
      const tCenterX = -W / 2 + PADDING_PX + thumbW / 2;
      const xHero = tCenterX + thumbW / 2 + colGap + heroW / 2;
      const panelLeft = W / 2 + xHero + heroW / 2 + colGap;
      const panelTop = H / 2 - heroH / 2;
      return {
        left: panelLeft,
        top: panelTop,
        height: heroH,
        availableW: W - panelLeft,
        gap: colGap,
      };
    }

    function getLeftColumnAndHero(focusedIndex) {
      const vFov = (FOV * Math.PI) / 180;
      const camZ = camera.position.z;
      const halfW = Math.tan(vFov / 2) * camera.aspect * camZ;

      const marginWorld = (PADDING_PX / W) * (2 * halfW);
      const thumbW = CARD_W * THUMB_SCALE;
      const thumbH = CARD_H * THUMB_SCALE;
      const thumbLeftEdge = -halfW + marginWorld;
      const thumbHCenterX = thumbLeftEdge + thumbW / 2;

      const indices = [];
      for (let i = 0; i < SLIDE_COUNT; i++) {
        if (i !== focusedIndex) indices.push(i);
      }
      const m = indices.length;
      const step = thumbH + THUMB_GAP_Y;
      const thumbPositions = {};
      for (let k = 0; k < m; k++) {
        const idx = indices[k];
        const y = ((m - 1) / 2 - k) * step;
        thumbPositions[idx] = { x: thumbHCenterX, y, z: FOCUS_THUMB_Z };
      }

      const heroW = CARD_W * HERO_SCALE;
      const columnGap = Math.max(COLUMN_GAP_MIN, heroW * COLUMN_GAP_FRAC);
      const xHero = thumbHCenterX + thumbW / 2 + columnGap + heroW / 2;

      return {
        thumbPositions,
        hero: { x: xHero, y: 0, z: 0, scale: HERO_SCALE },
      };
    }

    const loader = new THREE.TextureLoader();
    const meshes = [];

    IMAGES.forEach((src, i) => {
      const geo = new THREE.PlaneGeometry(CARD_W, CARD_H);
      const mat = new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          uTexture: { value: new THREE.Texture() },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uHover: { value: 0 },
          uTime: { value: 0 },
        },
      });
      loader.load(src, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        mat.uniforms.uTexture.value = tex;
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { index: i };
      scene.add(mesh);
      meshes.push(mesh);
    });

    let introComplete = false;
    let currentIndex = CENTER_IDX;
    let scrollTarget = CENTER_IDX * SPACING;
    let scrollCurrent = CENTER_IDX * SPACING;
    let lastSlideTime = 0;
    let activeIndex = -1;
    let hoveredIndex = -1;
    let lastClosest = CENTER_IDX;
    const trackWidth = SLIDE_COUNT * SPACING;
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let focusMode = false;
    let focusTransitioning = false;
    let focusedIndex = -1;

    function layoutFocusedHero() {
      const L = getLeftColumnAndHero(focusedIndex);
      meshes.forEach((mesh, i) => {
        if (i === focusedIndex) {
          if (L.hero) {
            mesh.position.x += (L.hero.x - mesh.position.x) * 0.1;
            mesh.position.y += (L.hero.y - mesh.position.y) * 0.1;
            mesh.position.z += (L.hero.z - mesh.position.z) * 0.1;
            const ts = L.hero.scale;
            mesh.scale.x += (ts - mesh.scale.x) * 0.1;
            mesh.scale.y = mesh.scale.x;
          }
        } else {
          const p = L.thumbPositions[i];
          if (p) {
            mesh.position.x += (p.x - mesh.position.x) * 0.1;
            mesh.position.y += (p.y - mesh.position.y) * 0.1;
            mesh.position.z += (p.z - mesh.position.z) * 0.1;
            mesh.scale.x += (THUMB_SCALE - mesh.scale.x) * 0.1;
            mesh.scale.y = mesh.scale.x;
          }
        }
      });
    }

    function enterFocus() {
      if (focusMode || focusTransitioning) return;
      focusTransitioning = true;
      focusedIndex = lastClosest;

      const L = getLeftColumnAndHero(focusedIndex);

      const layout = computePanelLayout();
      const imgKey = IMAGES[((focusedIndex % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT];
      const data = RELEASE_MAP[imgKey] || null;
      setFocusedData(data);
      setPanelLayout(layout);

      meshes.forEach((m) => {
        gsap.killTweensOf(m.position);
        gsap.killTweensOf(m.scale);
      });

      const hasOthers = meshes.some((_, i) => i !== focusedIndex);
      if (!hasOthers) {
        meshes[focusedIndex].renderOrder = 10;
        focusMode = true;
        focusTransitioning = false;
        return;
      }

      meshes.forEach((m, i) => {
        m.renderOrder = i === focusedIndex ? 10 : 0;
      });

      const tl = gsap.timeline({
        onComplete: () => {
          focusMode = true;
          focusTransitioning = false;
        },
      });

      const thumbOrder = [];
      for (let i = 0; i < SLIDE_COUNT; i++) {
        if (i !== focusedIndex) thumbOrder.push(i);
      }

      meshes.forEach((mesh, i) => {
        if (i === focusedIndex) {
          const tHero = FOCUS_ENTER_HERO_DELAY;
          tl.to(
            mesh.position,
            {
              x: L.hero.x,
              y: L.hero.y,
              z: L.hero.z,
              duration: FOCUS_ENTER_HERO_DURATION,
              ease: FOCUS_ENTER_HERO_EASE,
            },
            tHero
          );
          tl.to(
            mesh.scale,
            {
              x: L.hero.scale,
              y: L.hero.scale,
              duration: FOCUS_ENTER_HERO_DURATION,
              ease: FOCUS_ENTER_HERO_EASE,
            },
            tHero
          );
        } else {
          const p = L.thumbPositions[i];
          if (!p) return;
          const k = thumbOrder.indexOf(i);
          const tStart = k * FOCUS_ENTER_STAGGER;
          tl.to(
            mesh.position,
            {
              x: p.x,
              y: p.y,
              z: p.z,
              duration: FOCUS_ENTER_THUMB_DURATION,
              ease: FOCUS_ENTER_THUMB_EASE,
            },
            tStart
          );
          tl.to(
            mesh.scale,
            {
              x: THUMB_SCALE,
              y: THUMB_SCALE,
              duration: FOCUS_ENTER_THUMB_DURATION,
              ease: FOCUS_ENTER_THUMB_EASE,
            },
            tStart
          );
        }
      });

      if (data) {
        const panelDelay = (FOCUS_ENTER_HERO_DELAY + FOCUS_ENTER_HERO_DURATION * 0.6) * 1000;
        setTimeout(() => {
          if (infoPanelRef.current) {
            gsap.fromTo(
              infoPanelRef.current,
              { opacity: 0, x: 14 },
              { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
            );
          }
          if (trackPanelRef.current) {
            gsap.fromTo(
              trackPanelRef.current,
              { opacity: 0, x: 14 },
              { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", delay: 0.1 }
            );
          }
        }, panelDelay);
      }
    }

    function exitFocus() {
      if (!focusMode || focusTransitioning) return;
      focusTransitioning = true;

      if (infoPanelRef.current) {
        gsap.to(infoPanelRef.current, { opacity: 0, x: 14, duration: 0.22, ease: "power2.in" });
      }
      if (trackPanelRef.current) {
        gsap.to(trackPanelRef.current, { opacity: 0, x: 14, duration: 0.22, ease: "power2.in" });
      }

      const scroll = scrollCurrent;

      meshes.forEach((m) => {
        gsap.killTweensOf(m.position);
        gsap.killTweensOf(m.scale);
      });

      const tl = gsap.timeline({
        onComplete: () => {
          meshes.forEach((mesh, i) => {
            const p = calcFinalPos(i, scrollCurrent, W);
            mesh.position.set(p.x, p.y, p.z);
            mesh.scale.set(p.scale, p.scale, 1);
            mesh.renderOrder = 0;
          });
          focusMode = false;
          focusedIndex = -1;
          focusTransitioning = false;
          setFocusedData(null);
        },
      });

      const thumbOrderExit = [];
      for (let i = 0; i < SLIDE_COUNT; i++) {
        if (i !== focusedIndex) thumbOrderExit.push(i);
      }

      meshes.forEach((mesh, i) => {
        const p = calcFinalPos(i, scroll, W);
        if (i === focusedIndex) {
          const tHero = FOCUS_ENTER_HERO_DELAY;
          tl.to(
            mesh.position,
            {
              x: p.x,
              y: p.y,
              z: p.z,
              duration: FOCUS_ENTER_HERO_DURATION,
              ease: FOCUS_ENTER_HERO_EASE,
            },
            tHero
          );
          tl.to(
            mesh.scale,
            {
              x: p.scale,
              y: p.scale,
              duration: FOCUS_ENTER_HERO_DURATION,
              ease: FOCUS_ENTER_HERO_EASE,
            },
            tHero
          );
        } else {
          const k = thumbOrderExit.indexOf(i);
          if (k < 0) return;
          const tStart = k * FOCUS_ENTER_STAGGER;
          tl.to(
            mesh.position,
            {
              x: p.x,
              y: p.y,
              z: p.z,
              duration: FOCUS_ENTER_THUMB_DURATION,
              ease: FOCUS_ENTER_THUMB_EASE,
            },
            tStart
          );
          tl.to(
            mesh.scale,
            {
              x: p.scale,
              y: p.scale,
              duration: FOCUS_ENTER_THUMB_DURATION,
              ease: FOCUS_ENTER_THUMB_EASE,
            },
            tStart
          );
        }
      });
    }

    let lastBgIndex = -1;

    function updateBackground(index) {
      if (index === lastBgIndex) return;
      lastBgIndex = index;

      const src = IMAGES[((index % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT];
      const topEl = bgActive.current === "a" ? bgARef.current : bgBRef.current;
      const bottomEl = bgActive.current === "a" ? bgBRef.current : bgARef.current;
      if (!topEl || !bottomEl) return;

      bottomEl.style.backgroundImage = `url(${src})`;
      topEl.style.zIndex = "1";
      bottomEl.style.zIndex = "2";
      gsap.killTweensOf(bottomEl);
      gsap.killTweensOf(topEl);
      gsap.fromTo(bottomEl, { opacity: 0 }, {
        opacity: 1,
        duration: 0.65,
        ease: "power2.inOut",
        onComplete: () => {
          topEl.style.opacity = "0";
        },
      });
      bgActive.current = bgActive.current === "a" ? "b" : "a";
    }

    function goTo(delta) {
      const now = Date.now();
      if (now - lastSlideTime < SLIDE_COOLDOWN) return;
      lastSlideTime = now;
      currentIndex += delta;
      scrollTarget = currentIndex * SPACING;
    }

    function layout(scroll) {
      let closestDist = Infinity;
      let closestIndex = 0;

      meshes.forEach((mesh, i) => {
        const offset = wrapCarouselOffset(i * SPACING - scroll, trackWidth);
        const absDist = Math.abs(offset);
        const t = Math.min(absDist / (W * 1.1), 1.0);
        const tEased = Math.pow(t, 0.75);

        mesh.position.x = offset;
        mesh.position.z += (-tEased * 900 - mesh.position.z) * 0.1;
        mesh.position.y += (-tEased * 140 - mesh.position.y) * 0.1;
        mesh.rotation.z = 0;
        mesh.scale.x += (1.06 - tEased * 0.45 - mesh.scale.x) * 0.1;
        mesh.scale.y = mesh.scale.x;

        if (absDist < closestDist) {
          closestDist = absDist;
          closestIndex = i;
        }
      });

      return closestIndex;
    }

    function updateUI(index) {
      if (index === activeIndex) return;
      activeIndex = index;
      updateBackground(index);

      if (titleRef.current) {
        gsap.to(titleRef.current, {
          opacity: 0,
          y: -6,
          duration: 0.15,
          onComplete: () => {
            if (titleRef.current) {
              titleRef.current.textContent = TITLES[index];
              gsap.to(titleRef.current, { opacity: 1, y: 0, duration: 0.3 });
            }
          },
        });
      }
      if (counterRef.current) {
        counterRef.current.textContent = `${String(index + 1).padStart(2, "0")} / ${String(SLIDE_COUNT).padStart(2, "0")}`;
      }
    }

    const onWheel = (e) => {
      e.preventDefault();
      if (!introComplete) return;
      if (focusTransitioning) return;
      if (focusMode) {
        exitFocus();
        return;
      }
      goTo(e.deltaY > 0 ? 1 : -1);
    };

    let touchStartX = 0;
    let touchAccum = 0;
    let touchBlockClickUntil = 0;
    const onTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchAccum = 0;
    };
    const onTouchMove = (e) => {
      e.preventDefault();
      touchAccum += touchStartX - e.touches[0].clientX;
      touchStartX = e.touches[0].clientX;
    };
    const onTouchEnd = () => {
      touchBlockClickUntil = Date.now() + 450;
      if (!introComplete) return;
      if (focusTransitioning) {
        touchAccum = 0;
        return;
      }
      if (focusMode) {
        if (Math.abs(touchAccum) > 30) exitFocus();
        touchAccum = 0;
        return;
      }
      if (Math.abs(touchAccum) > 30) goTo(touchAccum > 0 ? 1 : -1);
      touchAccum = 0;
    };
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / W) * 2 - 1;
      mouse.y = -(e.clientY / H) * 2 + 1;
    };

    const onClick = (e) => {
      if (Date.now() < touchBlockClickUntil) return;
      if (!introComplete || focusTransitioning) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(meshes);
      if (hits.length === 0) return;

      const idx = hits[0].object.userData.index;

      if (focusMode) {
        if (idx === focusedIndex) exitFocus();
        return;
      }

      if (idx === lastClosest) enterFocus();
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("click", onClick);
    window.addEventListener("mousemove", onMouseMove);

    let time = 0;
    let rafId;

    function animate() {
      rafId = requestAnimationFrame(animate);
      time += 0.016;

      if (introComplete && !focusTransitioning) {
        if (focusMode) {
          layoutFocusedHero();
          lastClosest = focusedIndex;
        } else {
          scrollCurrent += (scrollTarget - scrollCurrent) * SCROLL_LERP;
          const closest = layout(scrollCurrent);
          lastClosest = ((closest % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT;
          updateUI(lastClosest);
        }
      }

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(meshes);

      if (hits.length > 0) {
        const hit = hits[0];
        const idx = hit.object.userData.index;
        const isCenter = focusMode ? idx === focusedIndex : idx === lastClosest;

        if (idx !== hoveredIndex) {
          if (hoveredIndex >= 0)
            gsap.to(meshes[hoveredIndex].material.uniforms.uHover, { value: 0, duration: 0.4 });
          hoveredIndex = idx;
          if (isCenter) gsap.to(meshes[idx].material.uniforms.uHover, { value: 1, duration: 0.3 });
          canvas.style.cursor = "pointer";
        }
        if (hit.uv && isCenter) hit.object.material.uniforms.uMouse.value.copy(hit.uv);
      } else if (hoveredIndex >= 0) {
        gsap.to(meshes[hoveredIndex].material.uniforms.uHover, { value: 0, duration: 0.4 });
        hoveredIndex = -1;
        canvas.style.cursor = "default";
      }

      meshes.forEach((m) => (m.material.uniforms.uTime.value = time));
      renderer.render(scene, camera);
    }

    if (bgARef.current) bgARef.current.style.opacity = "0";
    if (bgBRef.current) bgBRef.current.style.opacity = "0";
    if (titleRef.current) titleRef.current.style.opacity = "0";
    if (counterRef.current) counterRef.current.style.opacity = "0";

    const INTRO_SCROLL = CENTER_IDX * SPACING;
    const getFinalPos = (i) => calcFinalPos(i, INTRO_SCROLL, W);

    const CARD_SMALL = 0.12;
    const ENTRY_START = -W * 0.65;

    meshes.forEach((mesh) => {
      mesh.position.set(ENTRY_START, 0, 0);
      mesh.scale.set(CARD_SMALL, CARD_SMALL, 1);
    });

    animate();

    const tl = gsap.timeline();

    const FILA_SCALE = 0.12;
    const FILA_GAP = CARD_W * FILA_SCALE + 6;
    const FILA_START_X = -(SLIDE_COUNT / 2 - 0.5) * FILA_GAP;

    meshes.forEach((mesh, i) => {
      tl.to(
        mesh.position,
        {
          x: FILA_START_X + i * FILA_GAP,
          y: 0,
          z: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        i * 0.055
      );
    });

    const PHASE2_START = SLIDE_COUNT * 0.055 + 0.5 + 0.35;

    meshes.forEach((mesh, i) => {
      const pos = getFinalPos(i);

      tl.to(
        mesh.position,
        {
          x: pos.x,
          y: pos.y,
          z: pos.z,
          duration: 1.1,
          ease: "power3.inOut",
        },
        PHASE2_START + i * 0.03
      );

      tl.to(
        mesh.scale,
        {
          x: pos.scale,
          y: pos.scale,
          duration: 1.1,
          ease: "power3.inOut",
        },
        PHASE2_START + i * 0.03
      );
    });

    const PHASE3_START = PHASE2_START + 0.75;

    tl.call(() => {
      updateBackground(CENTER_IDX);
    }, [], PHASE3_START);

    tl.to([titleRef.current, counterRef.current].filter(Boolean), {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out",
    }, PHASE3_START + 0.1);

    const INTRO_END = PHASE2_START + 1.1 + SLIDE_COUNT * 0.03 + 0.05;

    tl.call(() => {
      introComplete = true;
    }, [], INTRO_END);

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.position.z = getCamZ();
      camera.updateProjectionMatrix();

      if (focusMode && !focusTransitioning) {
        const L = getLeftColumnAndHero(focusedIndex);
        setPanelLayout(computePanelLayout());
        meshes.forEach((mesh, i) => {
          if (i === focusedIndex) {
            mesh.position.set(L.hero.x, L.hero.y, L.hero.z);
            mesh.scale.set(L.hero.scale, L.hero.scale, 1);
          } else {
            const p = L.thumbPositions[i];
            if (p) {
              mesh.position.set(p.x, p.y, p.z);
              mesh.scale.set(THUMB_SCALE, THUMB_SCALE, 1);
            }
          }
        });
      }
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      tl.kill();
      meshes.forEach((m) => {
        gsap.killTweensOf(m.position);
        gsap.killTweensOf(m.scale);
      });
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  const INFO_W_FRAC = 0.38;
  const infoW     = Math.max(120, panelLayout.availableW * INFO_W_FRAC - panelLayout.gap * 0.5);
  const trackLeft = panelLayout.left + infoW + panelLayout.gap;
  const trackW    = Math.max(0, panelLayout.availableW - infoW - panelLayout.gap - PADDING_PX * 2);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        background: "#fff",
        height: viewportSize.h > 0 ? viewportSize.h : "100vh",
      }}
    >

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />

      {/* ── Panel info (sección 2): artist/title · year/ref · format/vinyl ── */}
      <div
        ref={infoPanelRef}
        style={{
          position:       "absolute",
          left:           panelLayout.left,
          top:            panelLayout.top,
          width:          infoW,
          height:         panelLayout.height,
          opacity:        0,
          pointerEvents:  "none",
          zIndex:         3,
          display:        "flex",
          flexDirection:  "column",
          justifyContent: "space-between",
        }}
      >
        {focusedData && (
          <>
            {/* 1 · Artist + Title */}
            <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
              <p style={{
                margin: 0,
                fontSize: PANEL_FONT_SIZE,
                lineHeight: PANEL_LINE_HEIGHT,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: PANEL_TEXT,
              }}>
                {focusedData.artist}
              </p>
              <p style={{
                margin: 0,
                fontSize: PANEL_FONT_SIZE,
                lineHeight: PANEL_LINE_HEIGHT,
                letterSpacing: "0.04em",
                color: PANEL_TEXT,
              }}>
                {focusedData.title}
              </p>
            </div>

            {/* 2 · Year + Ref */}
            <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
              <p style={{
                margin: 0,
                fontSize: PANEL_FONT_SIZE,
                lineHeight: PANEL_LINE_HEIGHT,
                letterSpacing: "0.04em",
                color: PANEL_TEXT,
              }}>
                {focusedData.year}
              </p>
              <p style={{
                margin: 0,
                fontSize: PANEL_FONT_SIZE,
                lineHeight: PANEL_LINE_HEIGHT,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: PANEL_TEXT,
              }}>
                {focusedData.ref}
              </p>
            </div>

            {/* 3 · Format + Vinyl */}
            <div style={{ display: "flex", flexDirection: "column", gap: PANEL_GAP_TIGHT }}>
              <p style={{
                margin: 0,
                fontSize: PANEL_FONT_SIZE,
                lineHeight: PANEL_LINE_HEIGHT,
                letterSpacing: "0.04em",
                color: PANEL_TEXT,
              }}>
                {focusedData.format}
              </p>
              {focusedData.vinyl && (
                <p style={{
                  margin: 0,
                  fontSize: PANEL_FONT_SIZE,
                  lineHeight: PANEL_LINE_HEIGHT,
                  letterSpacing: "0.04em",
                  color: PANEL_TEXT,
                }}>
                  {focusedData.vinyl}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Panel tracklist (sección 3) ──────────────────────────────────── */}
      <div
        ref={trackPanelRef}
        style={{
          position:       "absolute",
          left:           trackLeft,
          top:            panelLayout.top,
          width:          trackW,
          height:         panelLayout.height,
          opacity:        0,
          pointerEvents:  "none",
          zIndex:         3,
          overflow:       "hidden",
          display:        "flex",
          flexDirection:  "column",
        }}
      >
        <div
          style={{
            flex:       1,
            minHeight:  0,
            overflow:   "auto",
          }}
        >
          {focusedData?.tracklist?.map((track, i) => (
            <div
              key={i}
              style={{
                display:    "flex",
                alignItems: "baseline",
                lineHeight: PANEL_LINE_HEIGHT,
                fontSize:   PANEL_FONT_SIZE,
                color:      PANEL_TEXT,
              }}
            >
              <span style={{
                margin:             0,
                fontSize:           PANEL_FONT_SIZE,
                lineHeight:         PANEL_LINE_HEIGHT,
                color:              PANEL_TEXT,
                minWidth:           18,
                letterSpacing:      "0.06em",
                fontVariantNumeric: "tabular-nums",
                flexShrink:         0,
              }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{
                margin:        0,
                fontSize:      PANEL_FONT_SIZE,
                lineHeight:    PANEL_LINE_HEIGHT,
                letterSpacing: "0.04em",
                color:         PANEL_TEXT,
              }}>
                {track}
              </span>
            </div>
          ))}
        </div>

        {focusedData && (
          <div
            style={{
              flexShrink:  0,
              marginTop:   "auto",
              paddingTop:  PANEL_GAP_TIGHT * 4,
            }}
          >
            <p style={{
              margin:        0,
              marginBottom:  PANEL_GAP_TIGHT * 2,
              fontSize:      PANEL_FONT_SIZE,
              lineHeight:    PANEL_LINE_HEIGHT,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color:         PANEL_TEXT,
            }}>
              Credits
            </p>
            <div
              style={{
                fontSize: PANEL_FONT_SIZE,
                lineHeight: PANEL_LINE_HEIGHT,
                letterSpacing: "0.04em",
                color: PANEL_TEXT,
              }}
            >
              {DEFAULT_CREDITS_LINES.map((line, i) => (
                <p
                  key={i}
                  style={{
                    margin: 0,
                    fontSize: PANEL_FONT_SIZE,
                    lineHeight: PANEL_LINE_HEIGHT,
                    letterSpacing: "0.04em",
                    color: PANEL_TEXT,
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Grain overlay (igual que el original) ─────────────────────────── */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23g)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "256px",
        mixBlendMode: "multiply",
        opacity: 0.03,
        zIndex: 2,
      }} />
    </div>
  );
}

