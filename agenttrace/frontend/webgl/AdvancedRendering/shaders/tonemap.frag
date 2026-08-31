#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;
uniform sampler2D uScene;

vec3 acesApprox(vec3 x) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main() {
  vec4 source = texture(uScene, vUv);
  outColor = vec4(acesApprox(source.rgb), source.a);
}
