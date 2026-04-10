export const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const frag = /* glsl */ `
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
