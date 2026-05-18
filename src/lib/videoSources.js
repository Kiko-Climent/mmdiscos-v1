const RESPONSIVE_VIDEO_MAP = {
  "/video/MM Hero BG_1.mp4": {
    mobile: "/video-opt/v2/mm-hero-bg-1__mobile.mp4",
    tablet: "/video-opt/v2/mm-hero-bg-1__tablet.mp4",
    desktop: "/video-opt/v2/mm-hero-bg-1__desktop.mp4",
  },
  "/video/Video MM Header.mp4": {
    mobile: "/video-opt/v2/video-mm-header__mobile.mp4",
    tablet: "/video-opt/v2/video-mm-header__tablet.mp4",
    desktop: "/video-opt/v2/video-mm-header__desktop.mp4",
  },
};

export function getResponsiveVideoSources(originalSrc) {
  const mapped = RESPONSIVE_VIDEO_MAP[originalSrc];
  if (!mapped) {
    return {
      mobile: originalSrc,
      tablet: originalSrc,
      desktop: originalSrc,
      fallback: originalSrc,
    };
  }

  return {
    ...mapped,
    fallback: originalSrc,
  };
}
