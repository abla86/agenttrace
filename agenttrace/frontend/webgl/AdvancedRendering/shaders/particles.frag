#version 300 es
precision highp float;

in float vPulse;
out vec4 outColor;

void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = dot(p, p);
  if (d > 1.0) discard;

  float alpha = (1.0 - smoothstep(0.2, 1.0, d)) * vPulse;
  outColor = vec4(0.95, 0.35, 0.15, alpha);
}
