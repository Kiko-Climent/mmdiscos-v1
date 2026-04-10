# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint validation
npm run optimize:images  # Run image optimization tool
```

## Tech Stack

- **Next.js 15** with Pages Router (`src/pages/`)
- **React 19** with `"use client"` directives throughout
- **Three.js** — 3D carousel/release visualization in `FinalReleases/`
- **GSAP + ScrollTrigger** — all scroll-synchronized animations
- **Lenis** — smooth scrolling
- **GLSL shaders** — processed via glslify-loader (configured in `next.config.mjs`)
- **Tailwind CSS v4** — configured via `@tailwindcss/postcss` in `postcss.config.mjs`, no `tailwind.config.js`
- Path alias: `@/*` → `./src/*`

## Architecture

This is a record label (MM Discos) portfolio site. The home page (`pages/index.js`) composes three main sections:
1. **MMDiscosHero3** — hero with carousel, GSAP scroll animations, blur/glow effects
2. **ParallaxGallery2** — 5-column parallax gallery with clip-path scroll reveals
3. **AboutSection5** — animated about/footer with social links

The releases page (`pages/releases/index.js`) uses **FinalReleasesSlider** — the most complex component, combining a Three.js canvas scene (managed by `useReleasesSliderScene` hook) with `ReleaseInfoPanel`, `ReleaseTrackPanel`, and `GrainOverlay`.

### Key files for the releases 3D scene
- `src/components/FinalReleases/FinalReleasesSlider.js` — main component
- `src/components/FinalReleases/useReleasesSliderScene.js` — Three.js scene hook
- `src/components/FinalReleases/shaders.js` — GLSL shader strings
- `src/components/FinalReleases/releaseMap.js` — release metadata mapping
- `src/components/FinalReleases/carouselMath.js` — 3D carousel positioning math

### Static data
- `src/lib/data.js` — project/release data (title, image, year, href)
- `src/components/FinalReleases/constants.js` — release constants

### Component versioning
Many components have multiple numbered iterations (`index.js`, `index2.js`, ... `index5.js` or `Hero.js` through `Hero5.js`). Only the latest version is used in production pages — earlier versions are kept for reference. When modifying a component, always check which version is actually imported in the pages.

### Animation patterns
- GSAP animations use `useRef` + `useEffect` with cleanup (`ctx.revert()`)
- ScrollTrigger scrub animations tied to `lenis` smooth scroll
- Three.js scene lifecycle managed via custom hook with `useEffect` cleanup
- Mobile vs desktop handled via `window.innerWidth` checks inside effects
