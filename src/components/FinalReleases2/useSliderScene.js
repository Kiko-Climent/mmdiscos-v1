"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { vert, frag } from "./shaders";
import {
  CARD_W, CARD_H, SPACING, SCROLL_LERP, SLIDE_COOLDOWN,
  FOCUS_THUMB_Z, THUMB_SCALE, COLUMN_GAP_FRAC, COLUMN_GAP_MIN,
  PADDING_PX, THUMB_GAP_Y, HERO_SCALE,
  FOCUS_ENTER_STAGGER, FOCUS_ENTER_THUMB_DURATION, FOCUS_ENTER_THUMB_EASE,
  FOCUS_ENTER_HERO_DURATION, FOCUS_ENTER_HERO_EASE, FOCUS_ENTER_HERO_DELAY,
} from "./constants";
import { IMAGES, SLIDE_COUNT, CENTER_IDX, TITLES, RELEASE_MAP } from "./releaseMap";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FOV = 50;

function wrapCarouselOffset(offset, trackWidth) {
  const half = trackWidth / 2;
  return ((((offset + half) % trackWidth) + trackWidth) % trackWidth) - half;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSliderScene({
  canvasRef,
  sceneApiRef,
  titleRef,
  counterRef,
  infoPanelRef,
  trackPanelRef,
}) {
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

    // ── Mobile overrides ─────────────────────────────────────────────────────
    // Detect once at mount; layout stays consistent within a session.
    const isMobile = W < 768;
    const CW = isMobile ? 200 : CARD_W;   // card width  (world units ≈ px)
    const CH = isMobile ? 200 : CARD_H;   // card height
    const SP = isMobile ? 190 : SPACING;  // inter-card spacing

    // Focus layout constants for mobile
    const MOBILE_COLUMN_GAP = 20;  // gap between thumb column and hero

    // Cached nav bottom (screen Y) for mobile safe zone — updated on enterFocus / resize.
    // We measure the bottom of the last child (the menu links div), not the nav container,
    // because the container has a large bottom padding that would push things too far down.
    // We also add the menu's own marginTop so the gap below the links equals the gap
    // between logo and links.
    let mobileNavBottom = 0;
    function updateNavBottom() {
      const navEl = document.getElementById("mm-global-logo");
      if (!navEl) return;
      const linksEl = navEl.lastElementChild;
      if (linksEl) {
        const menuGap = parseFloat(getComputedStyle(linksEl).marginTop) || 0;
        mobileNavBottom = linksEl.getBoundingClientRect().bottom + menuGap;
      } else {
        mobileNavBottom = navEl.getBoundingClientRect().bottom;
      }
    }

    // Local calcFinalPos that uses the effective SP/CW values
    function calcFinalPos(i, scroll, screenW) {
      const tw = SLIDE_COUNT * SP;
      const offset = wrapCarouselOffset(i * SP - scroll, tw);
      const absDist = Math.abs(offset);
      const t = Math.min(absDist / (screenW * 1.1), 1.0);
      const tEased = Math.pow(t, 0.75);
      return {
        x: offset,
        y: -tEased * 140,
        z: -tEased * 900,
        scale: 1.06 - tEased * 0.45,
      };
    }

    // ── Renderer ────────────────────────────────────────────────────────────

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const getCamZ = () => H / (2 * Math.tan(((FOV * Math.PI) / 180) / 2));
    const camera = new THREE.PerspectiveCamera(FOV, W / H, 1, 8000);
    camera.position.z = getCamZ();

    // ── Panel layout computation ────────────────────────────────────────────

    // heroInfo: { x, y, z, scale } — optional, used on mobile to place panel below hero
    function computePanelLayout(heroInfo) {
      if (isMobile && heroInfo) {
        const heroW = CW * heroInfo.scale;
        const heroH = CH * heroInfo.scale;

        // Hero horizontal bounds in screen coords (world X: 0 = screen center)
        const heroLeftScreen  = heroInfo.x - heroW / 2 + W / 2;
        const heroRightScreen = heroInfo.x + heroW / 2 + W / 2;

        // Hero bottom edge in screen coords (world Y: 0 = screen center, Y-up)
        const heroBottomScreen = H / 2 - (heroInfo.y - heroH / 2);

        return {
          left:       heroLeftScreen,
          top:        heroBottomScreen + PADDING_PX,
          height:     H - heroBottomScreen - PADDING_PX * 2,
          availableW: heroRightScreen - heroLeftScreen,
          gap:        PADDING_PX,
        };
      }

      // Desktop layout — panel to the right of the hero
      const thumbW = CW * THUMB_SCALE;
      const heroW = CW * HERO_SCALE;
      const heroH = CH * HERO_SCALE;
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

    // ── Focus layout ────────────────────────────────────────────────────────

    function getLeftColumnAndHero(fIdx) {
      const vFov = (FOV * Math.PI) / 180;
      const camZ = camera.position.z;
      const halfW = Math.tan(vFov / 2) * camera.aspect * camZ;

      const marginWorld = (PADDING_PX / W) * (2 * halfW);
      const thumbW = CW * THUMB_SCALE;
      const thumbH = CH * THUMB_SCALE;
      const thumbLeftEdge = -halfW + marginWorld;
      const thumbHCenterX = thumbLeftEdge + thumbW / 2;

      const indices = [];
      for (let i = 0; i < SLIDE_COUNT; i++) {
        if (i !== fIdx) indices.push(i);
      }
      const m = indices.length;
      const step = thumbH + THUMB_GAP_Y;
      const thumbPositions = {};
      for (let k = 0; k < m; k++) {
        const idx = indices[k];
        const y = ((m - 1) / 2 - k) * step;
        thumbPositions[idx] = { x: thumbHCenterX, y, z: FOCUS_THUMB_Z };
      }

      if (isMobile) {
        // Hero width fills from right of thumb column to right edge (symmetric padding)
        const heroLeftEdge  = thumbHCenterX + thumbW / 2 + MOBILE_COLUMN_GAP;
        const heroRightEdge = halfW - marginWorld;          // = W/2 - PADDING_PX
        const heroW_m       = heroRightEdge - heroLeftEdge;
        const heroScale     = heroW_m / CW;                 // CW = CH → square card
        const heroH_m       = CH * heroScale;
        const xHero         = heroLeftEdge + heroW_m / 2;

        // Top of hero aligns with top of topmost thumbnail
        const topThumbCenterY = ((m - 1) / 2) * step;
        const topThumbTopY    = topThumbCenterY + thumbH / 2;

        // Safe zone: align hero top with the nav/menu bottom (+ same gap as logo→links).
        // Thumbnails are NOT shifted — they use all available vertical space freely.
        const navSafeWorld = H / 2 - mobileNavBottom;
        const heroTopNatural = topThumbTopY; // hero top aligns with top of thumb column
        const yShift = Math.max(0, heroTopNatural - navSafeWorld);

        const yHero = heroTopNatural - yShift - heroH_m / 2;

        return {
          thumbPositions,
          hero: { x: xHero, y: yHero, z: 0, scale: heroScale },
        };
      }

      const heroW = CW * HERO_SCALE;
      const columnGap = Math.max(COLUMN_GAP_MIN, heroW * COLUMN_GAP_FRAC);
      const xHero = thumbHCenterX + thumbW / 2 + columnGap + heroW / 2;

      return {
        thumbPositions,
        hero: { x: xHero, y: 0, z: 0, scale: HERO_SCALE },
      };
    }

    // ── Meshes ──────────────────────────────────────────────────────────────

    const loader = new THREE.TextureLoader();
    const meshes = [];

    IMAGES.forEach((src, i) => {
      const geo = new THREE.PlaneGeometry(CW, CH);
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

    // ── Mutable state ───────────────────────────────────────────────────────

    let introComplete = false;
    let currentIndex = CENTER_IDX;
    let scrollTarget = CENTER_IDX * SP;
    let scrollCurrent = CENTER_IDX * SP;
    let lastSlideTime = 0;
    let activeIndex = -1;
    let hoveredIndex = -1;
    let lastClosest = CENTER_IDX;
    const trackWidth = SLIDE_COUNT * SP;
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    let focusMode = false;
    let focusTransitioning = false;
    let focusedIndex = -1;
    let viewLocked = false;

    // ── Focus mode ──────────────────────────────────────────────────────────

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
      if (focusMode || focusTransitioning || viewLocked) return;
      focusTransitioning = true;
      focusedIndex = lastClosest;

      if (isMobile) updateNavBottom();
      const L = getLeftColumnAndHero(focusedIndex);
      const layout = computePanelLayout(L.hero);
      const imgKey = IMAGES[((focusedIndex % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT];
      const data = RELEASE_MAP[imgKey] || null;
      setFocusedData(data);
      setPanelLayout(layout);

      meshes.forEach((m) => {
        gsap.killTweensOf(m.position);
        gsap.killTweensOf(m.scale);
      });

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
            { x: L.hero.x, y: L.hero.y, z: L.hero.z, duration: FOCUS_ENTER_HERO_DURATION, ease: FOCUS_ENTER_HERO_EASE },
            tHero,
          );
          tl.to(
            mesh.scale,
            { x: L.hero.scale, y: L.hero.scale, duration: FOCUS_ENTER_HERO_DURATION, ease: FOCUS_ENTER_HERO_EASE },
            tHero,
          );
        } else {
          const p = L.thumbPositions[i];
          if (!p) return;
          const k = thumbOrder.indexOf(i);
          const tStart = k * FOCUS_ENTER_STAGGER;
          tl.to(
            mesh.position,
            { x: p.x, y: p.y, z: p.z, duration: FOCUS_ENTER_THUMB_DURATION, ease: FOCUS_ENTER_THUMB_EASE },
            tStart,
          );
          tl.to(
            mesh.scale,
            { x: THUMB_SCALE, y: THUMB_SCALE, duration: FOCUS_ENTER_THUMB_DURATION, ease: FOCUS_ENTER_THUMB_EASE },
            tStart,
          );
        }
      });

      if (data) {
        const panelDelay = (FOCUS_ENTER_HERO_DELAY + FOCUS_ENTER_HERO_DURATION * 0.6) * 1000;
        setTimeout(() => {
          if (infoPanelRef.current) {
            gsap.fromTo(
              infoPanelRef.current,
              isMobile ? { opacity: 0, y: 10 } : { opacity: 0, x: 14 },
              isMobile
                ? { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
                : { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
            );
          }
          if (!isMobile && trackPanelRef.current) {
            gsap.fromTo(
              trackPanelRef.current,
              { opacity: 0, x: 14 },
              { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", delay: 0.1 },
            );
          }
        }, panelDelay);
      }
    }

    function exitFocus() {
      if (!focusMode || focusTransitioning || viewLocked) return;
      focusTransitioning = true;

      if (infoPanelRef.current) {
        gsap.to(infoPanelRef.current, isMobile
          ? { opacity: 0, y: 10, duration: 0.22, ease: "power2.in" }
          : { opacity: 0, x: 14, duration: 0.22, ease: "power2.in" },
        );
      }
      if (!isMobile && trackPanelRef.current) {
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
          tl.to(mesh.position, { x: p.x, y: p.y, z: p.z, duration: FOCUS_ENTER_HERO_DURATION, ease: FOCUS_ENTER_HERO_EASE }, tHero);
          tl.to(mesh.scale, { x: p.scale, y: p.scale, duration: FOCUS_ENTER_HERO_DURATION, ease: FOCUS_ENTER_HERO_EASE }, tHero);
        } else {
          const k = thumbOrderExit.indexOf(i);
          if (k < 0) return;
          const tStart = k * FOCUS_ENTER_STAGGER;
          tl.to(mesh.position, { x: p.x, y: p.y, z: p.z, duration: FOCUS_ENTER_THUMB_DURATION, ease: FOCUS_ENTER_THUMB_EASE }, tStart);
          tl.to(mesh.scale, { x: p.scale, y: p.scale, duration: FOCUS_ENTER_THUMB_DURATION, ease: FOCUS_ENTER_THUMB_EASE }, tStart);
        }
      });
    }

    // ── Navigation ──────────────────────────────────────────────────────────

    function goTo(delta) {
      const now = Date.now();
      if (now - lastSlideTime < SLIDE_COOLDOWN) return;
      lastSlideTime = now;
      currentIndex += delta;
      scrollTarget = currentIndex * SP;
    }

    // ── Carousel layout ─────────────────────────────────────────────────────

    function layout(scroll) {
      let closestDist = Infinity;
      let closestIndex = 0;

      meshes.forEach((mesh, i) => {
        const offset = wrapCarouselOffset(i * SP - scroll, trackWidth);
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

    // ── UI update ───────────────────────────────────────────────────────────

    function updateUI(index) {
      if (index === activeIndex) return;
      activeIndex = index;

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

    // ── View-transition API (exposed via sceneApiRef) ───────────────────────

    sceneApiRef.current = {
      animateToCenter(onComplete) {
        if (!introComplete) {
          onComplete?.();
          return;
        }

        if (focusMode || focusTransitioning) {
          focusMode = false;
          focusTransitioning = false;
          focusedIndex = -1;
          setFocusedData(null);
          if (infoPanelRef.current) infoPanelRef.current.style.opacity = "0";
          if (trackPanelRef.current) trackPanelRef.current.style.opacity = "0";
        }

        viewLocked = true;

        meshes.forEach((m) => {
          gsap.killTweensOf(m.position);
          gsap.killTweensOf(m.scale);
        });

        gsap.to(
          [titleRef.current, counterRef.current].filter(Boolean),
          { opacity: 0, duration: 0.3, ease: "power2.in" },
        );

        meshes.forEach((m, i) => {
          m.renderOrder = i === lastClosest ? 10 : 0;
        });

        const tl = gsap.timeline({ onComplete });

        const FILA_SCALE_IDX = 0.12;
        const FILA_GAP_IDX   = CW * FILA_SCALE_IDX + 6;
        const FILA_START_X_IDX = -(SLIDE_COUNT / 2 - 0.5) * FILA_GAP_IDX;

        const order = [...Array(SLIDE_COUNT).keys()].sort(
          (a, b) => Math.abs(a - lastClosest) - Math.abs(b - lastClosest),
        );

        order.forEach((i, step) => {
          const delay = step * 0.025;
          const targetX = FILA_START_X_IDX + i * FILA_GAP_IDX;
          tl.to(meshes[i].position, { x: targetX, y: 0, z: 0, duration: 0.8, ease: "power3.inOut" }, delay);
          tl.to(meshes[i].scale, { x: FILA_SCALE_IDX, y: FILA_SCALE_IDX, duration: 0.8, ease: "power3.inOut" }, delay);
        });
      },

      animateToPyramid(onComplete) {
        meshes.forEach((m) => {
          gsap.killTweensOf(m.position);
          gsap.killTweensOf(m.scale);
        });

        const scroll = currentIndex * SP;
        scrollCurrent = scroll;
        scrollTarget = scroll;

        const tl = gsap.timeline({
          onComplete: () => {
            viewLocked = false;
            meshes.forEach((m) => { m.renderOrder = 0; });

            activeIndex = -1;
            if (titleRef.current) {
              titleRef.current.textContent = TITLES[lastClosest];
            }
            if (counterRef.current) {
              counterRef.current.textContent = `${String(lastClosest + 1).padStart(2, "0")} / ${String(SLIDE_COUNT).padStart(2, "0")}`;
            }
            gsap.to(
              [titleRef.current, counterRef.current].filter(Boolean),
              { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
            );

            onComplete?.();
          },
        });

        const order = [...Array(SLIDE_COUNT).keys()].sort(
          (a, b) => Math.abs(b - lastClosest) - Math.abs(a - lastClosest),
        );

        order.forEach((i, step) => {
          const pos = calcFinalPos(i, scroll, W);
          const delay = step * 0.028;
          tl.to(meshes[i].position, { x: pos.x, y: pos.y, z: pos.z, duration: 1.0, ease: "power3.inOut" }, delay);
          tl.to(meshes[i].scale, { x: pos.scale, y: pos.scale, duration: 1.0, ease: "power3.inOut" }, delay);
        });
      },
    };

    // ── Events ──────────────────────────────────────────────────────────────

    const onWheel = (e) => {
      e.preventDefault();
      if (!introComplete || viewLocked) return;
      if (focusTransitioning) return;
      if (focusMode) { exitFocus(); return; }
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
    const onTouchEnd = (e) => {
      touchBlockClickUntil = Date.now() + 450;
      if (!introComplete || viewLocked) return;
      if (focusTransitioning) { touchAccum = 0; return; }

      if (focusMode) {
        if (Math.abs(touchAccum) > 30) {
          // Swipe → salir del detalle
          exitFocus();
        } else {
          // Tap en focus mode → salir si se toca la imagen hero
          const touch = e.changedTouches[0];
          const rect = canvas.getBoundingClientRect();
          const tapX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
          const tapY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(new THREE.Vector2(tapX, tapY), camera);
          const hits = raycaster.intersectObjects(meshes);
          if (hits.length > 0 && hits[0].object.userData.index === focusedIndex) {
            exitFocus();
          }
        }
        touchAccum = 0;
        return;
      }

      if (Math.abs(touchAccum) > 30) {
        // Swipe → navegar
        goTo(touchAccum > 0 ? 1 : -1);
      } else {
        // Tap → entrar al detalle si se toca la imagen central
        const touch = e.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const tapX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const tapY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(new THREE.Vector2(tapX, tapY), camera);
        const hits = raycaster.intersectObjects(meshes);
        if (hits.length > 0 && hits[0].object.userData.index === lastClosest) {
          enterFocus();
        }
      }
      touchAccum = 0;
    };

    const onMouseMove = (e) => {
      mouse.x = (e.clientX / W) * 2 - 1;
      mouse.y = -(e.clientY / H) * 2 + 1;
    };

    const onClick = (e) => {
      if (Date.now() < touchBlockClickUntil) return;
      if (!introComplete || focusTransitioning || viewLocked) return;
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

    // ── Render loop ─────────────────────────────────────────────────────────

    let time = 0;
    let rafId;

    function animate() {
      rafId = requestAnimationFrame(animate);
      time += 0.016;

      if (introComplete && !viewLocked) {
        if (!focusTransitioning) {
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
      }

      // Hover raycasting — desktop only (no ripple on mobile)
      if (!isMobile && !viewLocked) {
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
            if (isCenter)
              gsap.to(meshes[idx].material.uniforms.uHover, { value: 1, duration: 0.3 });
            canvas.style.cursor = "pointer";
          }
          if (hit.uv && isCenter) hit.object.material.uniforms.uMouse.value.copy(hit.uv);
        } else if (hoveredIndex >= 0) {
          gsap.to(meshes[hoveredIndex].material.uniforms.uHover, { value: 0, duration: 0.4 });
          hoveredIndex = -1;
          canvas.style.cursor = "default";
        }
      }

      meshes.forEach((m) => (m.material.uniforms.uTime.value = time));
      renderer.render(scene, camera);
    }

    // ── Intro animation ─────────────────────────────────────────────────────

    if (titleRef.current) titleRef.current.style.opacity = "0";
    if (counterRef.current) counterRef.current.style.opacity = "0";

    const INTRO_SCROLL = CENTER_IDX * SP;
    const getFinalPos = (i) => calcFinalPos(i, INTRO_SCROLL, W);

    const CARD_SMALL = 0.12;
    const ENTRY_START = -W * 0.65;

    meshes.forEach((mesh) => {
      mesh.position.set(ENTRY_START, 0, 0);
      mesh.scale.set(CARD_SMALL, CARD_SMALL, 1);
    });

    animate();

    const introTl = gsap.timeline();

    const FILA_SCALE = 0.12;
    const FILA_GAP = CW * FILA_SCALE + 6;
    const FILA_START_X = -(SLIDE_COUNT / 2 - 0.5) * FILA_GAP;

    meshes.forEach((mesh, i) => {
      introTl.to(
        mesh.position,
        { x: FILA_START_X + i * FILA_GAP, y: 0, z: 0, duration: 0.5, ease: "power2.out" },
        i * 0.055,
      );
    });

    const PHASE2_START = SLIDE_COUNT * 0.055 + 0.5 + 0.35;

    meshes.forEach((mesh, i) => {
      const pos = getFinalPos(i);
      introTl.to(
        mesh.position,
        { x: pos.x, y: pos.y, z: pos.z, duration: 1.1, ease: "power3.inOut" },
        PHASE2_START + i * 0.03,
      );
      introTl.to(
        mesh.scale,
        { x: pos.scale, y: pos.scale, duration: 1.1, ease: "power3.inOut" },
        PHASE2_START + i * 0.03,
      );
    });

    const PHASE3_START = PHASE2_START + 0.75;

    introTl.to(
      [titleRef.current, counterRef.current].filter(Boolean),
      { opacity: 1, duration: 0.6, ease: "power2.out" },
      PHASE3_START + 0.1,
    );

    const INTRO_END = PHASE2_START + 1.1 + SLIDE_COUNT * 0.03 + 0.05;
    introTl.call(() => { introComplete = true; }, [], INTRO_END);

    // ── Resize ──────────────────────────────────────────────────────────────

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      if (isMobile) updateNavBottom();
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.position.z = getCamZ();
      camera.updateProjectionMatrix();

      if (focusMode && !focusTransitioning) {
        const L = getLeftColumnAndHero(focusedIndex);
        setPanelLayout(computePanelLayout(L.hero));
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

    // ── Cleanup ─────────────────────────────────────────────────────────────

    return () => {
      cancelAnimationFrame(rafId);
      introTl.kill();
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

  return { focusedData, panelLayout, viewportSize };
}
