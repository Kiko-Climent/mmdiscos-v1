"use client";

import { useEffect } from "react";
import * as THREE from "three";
import gsap from "gsap";
import {
  CARD_W,
  CARD_H,
  SPACING,
  SCROLL_LERP,
  SLIDE_COOLDOWN,
  SCROLL_SETTLED_EPS,
  WHEEL_ACCUM_THRESHOLD,
  FOCUS_THUMB_Z,
  THUMB_SCALE,
  COLUMN_GAP_FRAC,
  COLUMN_GAP_MIN,
  PADDING_PX,
  THUMB_GAP_Y,
  HERO_SCALE,
  FOCUS_ENTER_STAGGER,
  FOCUS_ENTER_THUMB_DURATION,
  FOCUS_ENTER_THUMB_EASE,
  FOCUS_ENTER_HERO_DURATION,
  FOCUS_ENTER_HERO_EASE,
  FOCUS_ENTER_HERO_DELAY,
  IMAGES,
  SLIDE_COUNT,
  TITLES,
  CENTER_IDX,
} from "./constants";
import { RELEASE_MAP } from "./releaseMap";
import { vert, frag } from "./shaders";
import { calcFinalPos, wrapCarouselOffset } from "./carouselMath";

export function useReleasesSliderScene({
  canvasRef,
  titleRef,
  counterRef,
  bgARef,
  bgBRef,
  bgActiveRef,
  infoPanelRef,
  trackPanelRef,
  exitToIndexRef, 
  setFocusedData,
  setPanelLayout,
}) {
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
    let indexMode = false;

    let indexTransitioning = false;

    let wheelAccum = 0;

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

  // 👇 pegar todo esto aquí
  function exitToIndex(onComplete) {
    if (indexTransitioning) return;
    indexTransitioning = true;
  
    if (focusMode) {
      if (infoPanelRef.current)
        gsap.to(infoPanelRef.current, { opacity: 0, x: 14, duration: 0.18, ease: "power2.in" });
      if (trackPanelRef.current)
        gsap.to(trackPanelRef.current, { opacity: 0, x: 14, duration: 0.18, ease: "power2.in" });
      setFocusedData(null);
      focusMode = false;
      focusedIndex = -1;
    }
  
    gsap.to([titleRef.current, counterRef.current].filter(Boolean), {
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
    });
  
    const FILA_SCALE = 0.12;
    const FILA_GAP = CARD_W * FILA_SCALE + 6;
    const FILA_START_X = -(SLIDE_COUNT / 2 - 0.5) * FILA_GAP;
  
    meshes.forEach((m) => {
      gsap.killTweensOf(m.position);
      gsap.killTweensOf(m.scale);
    });
  
    const tl = gsap.timeline({
      onComplete: () => {
        console.log("=== exitToIndex complete ===");
        meshes.forEach((mesh, i) => {
          console.log(`mesh[${i}] pos:`, mesh.position.x.toFixed(1), mesh.position.y.toFixed(1), mesh.position.z.toFixed(1), "scale:", mesh.scale.x.toFixed(3));
        });
        console.log("FILA_START_X esperado:", -(SLIDE_COUNT / 2 - 0.5) * (CARD_W * 0.12 + 6));
        console.log("FILA_SCALE esperado: 0.12");
    
        indexTransitioning = false;
        introComplete = false;
        indexMode = true;
        onComplete?.();
      },
    });
  
    meshes.forEach((mesh, i) => {
      const targetX = FILA_START_X + i * FILA_GAP;
      tl.to(
        mesh.position,
        { x: targetX, y: 0, z: 0, duration: 0.9, ease: "power3.inOut" },
        i * 0.025
      );
      tl.to(
        mesh.scale,
        { x: FILA_SCALE, y: FILA_SCALE, duration: 0.9, ease: "power3.inOut" },
        i * 0.025
      );
    });
  
    // Dim suave del bg en lugar de fade out completo
    if (bgARef.current) gsap.to(bgARef.current, { opacity: 0, duration: 0.5 });
    if (bgBRef.current) gsap.to(bgBRef.current, { opacity: 0, duration: 0.5 });
  }
  
  
  exitToIndexRef.current = exitToIndex;
  
  let lastBgIndex = -1;

    function updateBackground(index) {
      if (index === lastBgIndex) return;
      lastBgIndex = index;

      const src = IMAGES[((index % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT];
      const topEl = bgActiveRef.current === "a" ? bgARef.current : bgBRef.current;
      const bottomEl = bgActiveRef.current === "a" ? bgBRef.current : bgARef.current;
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
      bgActiveRef.current = bgActiveRef.current === "a" ? "b" : "a";
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
      // Un slide por vez: no encolar otro hasta que el scroll haya casi alcanzado el objetivo.
      if (Math.abs(scrollTarget - scrollCurrent) > SCROLL_SETTLED_EPS) {
        return;
      }
      const dy = e.deltaY;
      if (dy === 0) return;
      if (wheelAccum !== 0 && Math.sign(wheelAccum) !== Math.sign(dy)) {
        wheelAccum = dy;
      } else {
        wheelAccum += dy;
      }
      if (Math.abs(wheelAccum) < WHEEL_ACCUM_THRESHOLD) return;
      const dir = wheelAccum > 0 ? 1 : -1;
      wheelAccum = 0;
      goTo(dir);
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

      // DEBUG puntual (solo unos frames)
  if (indexMode && Math.random() < 0.01) {
    console.log("animate() indexMode=true, mesh[0] pos:", meshes[0]?.position.x.toFixed(1), meshes[0]?.scale.x.toFixed(3));
  }

      if (introComplete && !focusTransitioning && !indexMode) { // ← añade !indexMode
        if (focusMode) {
          layoutFocusedHero();
          lastClosest = focusedIndex;
        } else {
          scrollCurrent += (scrollTarget - scrollCurrent) * SCROLL_LERP;
          if (Math.abs(scrollTarget - scrollCurrent) < 0.15) {
            scrollCurrent = scrollTarget;
          }
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- montaje único; refs y setters estables
}
