"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

// ─── Config ─────────────────────────────────────────────────────────────────

const CARD_W         = 340;
const CARD_H         = 340;
const SPACING        = 330;
const SCROLL_LERP    = 0.07;
const SLIDE_COOLDOWN = 620;

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

// Debe coincidir siempre con IMAGES.length: layout/calcFinalPos usan esto para el carrusel infinito.
const SLIDE_COUNT = IMAGES.length;

const TITLES = IMAGES.map((_, i) => `MM — ${String(i + 1).padStart(3, "0")}`);

// ─── Shaders ─────────────────────────────────────────────────────────────────

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

// ─── Center slot ─────────────────────────────────────────────────────────────
// The slider treats card i=CENTER_IDX as the initial center.
// currentIndex starts at CENTER_IDX so scroll=CENTER_IDX*SPACING puts that card at x=0.
const CENTER_IDX = Math.floor(SLIDE_COUNT / 2);

// Lleva el offset del carrusel a [-trackWidth/2, trackWidth/2) de forma simétrica.
// El patrón antiguo (% trackWidth + si > mitad restar trackWidth) rompía cuando
// el offset era exactamente -trackWidth/2 (p. ej. slide 0 con n par): pasaba a +mitad
// y la primera carta “saltaba” a la derecha al alinear con calcFinalPos/layout.
function wrapCarouselOffset(offset, trackWidth) {
  const half = trackWidth / 2;
  return ((((offset + half) % trackWidth) + trackWidth) % trackWidth) - half;
}

// Calculates the exact layout position for card i at a given scroll value.
// Mirrors layout() logic with no lerp — used to set intro final positions.
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

// ─── Component ───────────────────────────────────────────────────────────────

export default function ReleasesSlider() {
  const canvasRef  = useRef(null);
  const titleRef   = useRef(null);
  const counterRef = useRef(null);
  const bgARef     = useRef(null);
  const bgBRef     = useRef(null);
  const bgActive   = useRef("a");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let W = window.innerWidth;
    let H = window.innerHeight;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene   = new THREE.Scene();
    const FOV     = 50;
    const getCamZ = () => H / (2 * Math.tan((FOV * Math.PI / 180) / 2));
    const camera  = new THREE.PerspectiveCamera(FOV, W / H, 1, 8000);
    camera.position.z = getCamZ();

    // ── Meshes ────────────────────────────────────────────────────────────────
    const loader = new THREE.TextureLoader();
    const meshes = [];

    IMAGES.forEach((src, i) => {
      const geo = new THREE.PlaneGeometry(CARD_W, CARD_H);
      const mat = new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          uTexture: { value: new THREE.Texture() },
          uMouse:   { value: new THREE.Vector2(0.5, 0.5) },
          uHover:   { value: 0 },
          uTime:    { value: 0 },
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

    // ── Slider state ──────────────────────────────────────────────────────────
    let introComplete = false;

    // Start centered on CENTER_IDX so the initial layout() call matches
    // exactly the positions the intro animation lands on — zero jump.
    let currentIndex  = CENTER_IDX;
    let scrollTarget  = CENTER_IDX * SPACING;
    let scrollCurrent = CENTER_IDX * SPACING;

    let lastSlideTime = 0;
    let activeIndex   = -1;
    let hoveredIndex  = -1;
    let lastClosest   = CENTER_IDX;
    const trackWidth  = SLIDE_COUNT * SPACING;
    const mouse       = new THREE.Vector2();
    const raycaster   = new THREE.Raycaster();

    // ── Background crossfade ──────────────────────────────────────────────────
    let lastBgIndex = -1;

    function updateBackground(index) {
      if (index === lastBgIndex) return;
      lastBgIndex = index;

      const src      = IMAGES[((index % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT];
      const topEl    = bgActive.current === "a" ? bgARef.current : bgBRef.current;
      const bottomEl = bgActive.current === "a" ? bgBRef.current : bgARef.current;
      if (!topEl || !bottomEl) return;

      bottomEl.style.backgroundImage = `url(${src})`;
      topEl.style.zIndex             = "1";
      bottomEl.style.zIndex          = "2";
      gsap.killTweensOf(bottomEl);
      gsap.killTweensOf(topEl);
      gsap.fromTo(bottomEl, { opacity: 0 }, {
        opacity: 1, duration: 0.65, ease: "power2.inOut",
        onComplete: () => { topEl.style.opacity = "0"; },
      });
      bgActive.current = bgActive.current === "a" ? "b" : "a";
    }

    // ── Navigation ────────────────────────────────────────────────────────────
    function goTo(delta) {
      const now = Date.now();
      if (now - lastSlideTime < SLIDE_COOLDOWN) return;
      lastSlideTime = now;
      currentIndex += delta;
      scrollTarget  = currentIndex * SPACING;
    }

    // ── Layout ────────────────────────────────────────────────────────────────
    function layout(scroll) {
      let closestDist  = Infinity;
      let closestIndex = 0;

      meshes.forEach((mesh, i) => {
        const offset = wrapCarouselOffset(i * SPACING - scroll, trackWidth);

        const absDist = Math.abs(offset);
        const t       = Math.min(absDist / (W * 1.1), 1.0);
        const tEased  = Math.pow(t, 0.75);

        mesh.position.x = offset;

        const targetZ = -tEased * 900;
        mesh.position.z += (targetZ - mesh.position.z) * 0.1;

        const targetY = -tEased * 140;
        mesh.position.y += (targetY - mesh.position.y) * 0.1;

        mesh.rotation.z = 0;

        const targetScale = 1.06 - tEased * 0.45;
        mesh.scale.x += (targetScale - mesh.scale.x) * 0.1;
        mesh.scale.y  = mesh.scale.x;

        if (absDist < closestDist) {
          closestDist  = absDist;
          closestIndex = i;
        }
      });

      return closestIndex;
    }

    // ── UI ────────────────────────────────────────────────────────────────────
    function updateUI(index) {
      if (index === activeIndex) return;
      activeIndex = index;
      updateBackground(index);

      if (titleRef.current) {
        gsap.to(titleRef.current, {
          opacity: 0, y: -6, duration: 0.15,
          onComplete: () => {
            if (titleRef.current) {
              titleRef.current.textContent = TITLES[index];
              gsap.to(titleRef.current, { opacity: 1, y: 0, duration: 0.3 });
            }
          },
        });
      }
      if (counterRef.current) {
        counterRef.current.textContent =
          `${String(index + 1).padStart(2, "0")} / ${String(SLIDE_COUNT).padStart(2, "0")}`;
      }
    }

    // ── Events ────────────────────────────────────────────────────────────────
    const onWheel = (e) => {
      e.preventDefault();
      if (!introComplete) return;
      goTo(e.deltaY > 0 ? 1 : -1);
    };

    let touchStartX = 0;
    let touchAccum  = 0;
    const onTouchStart = (e) => { touchStartX = e.touches[0].clientX; touchAccum = 0; };
    const onTouchMove  = (e) => {
      e.preventDefault();
      touchAccum  += touchStartX - e.touches[0].clientX;
      touchStartX  = e.touches[0].clientX;
    };
    const onTouchEnd = () => {
      if (!introComplete) return;
      if (Math.abs(touchAccum) > 30) goTo(touchAccum > 0 ? 1 : -1);
      touchAccum = 0;
    };
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / W) * 2 - 1;
      mouse.y = -(e.clientY / H) * 2 + 1;
    };

    canvas.addEventListener("wheel",      onWheel,      { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true  });
    canvas.addEventListener("touchmove",  onTouchMove,  { passive: false });
    canvas.addEventListener("touchend",   onTouchEnd);
    window.addEventListener("mousemove",  onMouseMove);

    // ── Render loop ───────────────────────────────────────────────────────────
    let time  = 0;
    let rafId;

    function animate() {
      rafId = requestAnimationFrame(animate);
      time += 0.016;

      if (introComplete) {
        scrollCurrent += (scrollTarget - scrollCurrent) * SCROLL_LERP;
        const closest = layout(scrollCurrent);
        lastClosest   = ((closest % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT;
        updateUI(lastClosest);
      }

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(meshes);

      if (hits.length > 0) {
        const hit      = hits[0];
        const idx      = hit.object.userData.index;
        const isCenter = (idx === lastClosest);

        if (idx !== hoveredIndex) {
          if (hoveredIndex >= 0)
            gsap.to(meshes[hoveredIndex].material.uniforms.uHover, { value: 0, duration: 0.4 });
          hoveredIndex = idx;
          if (isCenter)
            gsap.to(meshes[idx].material.uniforms.uHover, { value: 1, duration: 0.3 });
          canvas.style.cursor = "pointer";
        }
        if (hit.uv && isCenter)
          hit.object.material.uniforms.uMouse.value.copy(hit.uv);

      } else if (hoveredIndex >= 0) {
        gsap.to(meshes[hoveredIndex].material.uniforms.uHover, { value: 0, duration: 0.4 });
        hoveredIndex = -1;
        canvas.style.cursor = "default";
      }

      meshes.forEach((m) => (m.material.uniforms.uTime.value = time));
      renderer.render(scene, camera);
    }

    // ── Intro setup ───────────────────────────────────────────────────────────
    // Ocultar fondo y UI hasta que la intro los revele
    if (bgARef.current)     bgARef.current.style.opacity     = "0";
    if (bgBRef.current)     bgBRef.current.style.opacity     = "0";
    if (titleRef.current)   titleRef.current.style.opacity   = "0";
    if (counterRef.current) counterRef.current.style.opacity = "0";

    // Posición piramidal final — calculada con INTRO_SCROLL para que coincida
    // exactamente con donde el slider arranca. Sin este match habría un salto.
    const INTRO_SCROLL = CENTER_IDX * SPACING;
    const getFinalPos  = (i) => calcFinalPos(i, INTRO_SCROLL, W);

    // Fase 0: todas las cartas fuera a la izquierda, muy pequeñas
    const CARD_SMALL  = 0.12;
    const ENTRY_START = -W * 0.65;

    meshes.forEach((mesh) => {
      mesh.position.set(ENTRY_START, 0, 0);
      mesh.scale.set(CARD_SMALL, CARD_SMALL, 1);
    });

    // Arranca el loop antes de la animación para que el canvas renderice
    animate();

    const tl = gsap.timeline();

    // ── Fase 1: entran en fila desde la izquierda (stagger) ───────────────────
    const FILA_SCALE   = 0.12;
    const FILA_GAP     = CARD_W * FILA_SCALE + 6;
    const FILA_START_X = -(SLIDE_COUNT / 2 - 0.5) * FILA_GAP;

    meshes.forEach((mesh, i) => {
      tl.to(mesh.position, {
        x: FILA_START_X + i * FILA_GAP,
        y: 0,
        z: 0,
        duration: 0.5,
        ease: "power2.out",
      }, i * 0.055);
    });

    // ── Fase 2: explotan a su posición piramidal ──────────────────────────────
    // empieza tras el último stagger + 0.35s de pausa visual
    const PHASE2_START = SLIDE_COUNT * 0.055 + 0.5 + 0.35;

    meshes.forEach((mesh, i) => {
      const pos = getFinalPos(i);

      tl.to(mesh.position, {
        x: pos.x, y: pos.y, z: pos.z,
        duration: 1.1,
        ease: "power3.inOut",
      }, PHASE2_START + i * 0.03);

      tl.to(mesh.scale, {
        x: pos.scale, y: pos.scale,
        duration: 1.1,
        ease: "power3.inOut",
      }, PHASE2_START + i * 0.03);
    });

    // ── Fase 3: fade in fondo y UI mientras las cartas se colocan ────────────
    const PHASE3_START = PHASE2_START + 0.75;

    tl.call(() => { updateBackground(CENTER_IDX); }, [], PHASE3_START);

    tl.to([titleRef.current, counterRef.current].filter(Boolean), {
      opacity: 1, duration: 0.6, ease: "power2.out",
    }, PHASE3_START + 0.1);

    // ── Fin intro: activa el slider sin ningún salto ──────────────────────────
    const INTRO_END = PHASE2_START + 1.1 + SLIDE_COUNT * 0.03 + 0.05;

    tl.call(() => {
      // Las posiciones de los meshes ya son exactamente calcFinalPos(i, INTRO_SCROLL)
      // y scrollCurrent/scrollTarget = INTRO_SCROLL = CENTER_IDX * SPACING
      // → layout() en el primer frame producirá las mismas posiciones → sin salto
      introComplete = true;
    }, [], INTRO_END);

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.position.z = getCamZ();
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      tl.kill();
      canvas.removeEventListener("wheel",      onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove",  onTouchMove);
      canvas.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("resize",     onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: "#fff" }}>
  
      {/* WebGL canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />
  
      {/* Grain opcional (puedes eliminarlo si quieres totalmente plano) */}
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