#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;
uniform sampler2D uScene;

void main() {
  vec4 source = texture(uScene, vUv);
  vec2 p = vUv - vec2(0.5);
  float distanceFromCenter = length(p) * 1.4142;
  float vignette = 1.0 - smoothstep(0.45, 0.9, distanceFromCenter) * 0.28;
  outColor = vec4(source.rgb * vignette, source.a);
}
