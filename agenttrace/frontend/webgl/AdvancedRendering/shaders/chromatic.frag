#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;
uniform sampler2D uScene;
uniform float uTime;

void main() {
  vec2 centered = vUv - vec2(0.5);
  float radius = dot(centered, centered);
  float strength = 0.0025 + 0.0015 * (0.5 + 0.5 * sin(uTime * 0.35));
  vec2 offset = centered * radius * strength;

  float r = texture(uScene, clamp(vUv + offset, 0.0, 1.0)).r;
  float g = texture(uScene, vUv).g;
  float b = texture(uScene, clamp(vUv - offset, 0.0, 1.0)).b;
  float a = texture(uScene, vUv).a;

  outColor = vec4(r, g, b, a);
}
