#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;
uniform sampler2D uScene;

void main() {
  vec3 c = texture(uScene, vUv).rgb;
  float brightness = max(max(c.r, c.g), c.b);
  float threshold = smoothstep(0.8, 1.2, brightness);
  outColor = vec4(c * (1.0 + threshold * 0.65), 1.0);
}
