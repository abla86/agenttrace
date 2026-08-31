#version 300 es
precision highp float;

in float vIntensity;
in float vPulse;

uniform float uPressure;
uniform float uEntropy;

out vec4 outColor;

void main() {
  vec2 p = gl_PointCoord - vec2(0.5);
  float d = length(p);
  if (d > 0.5) discard;

  float edge = smoothstep(0.5, 0.05, d);
  float activity = clamp(vIntensity * vPulse, 0.0, 1.0);
  float red = clamp(0.25 + uPressure * 0.75 + activity * 0.25, 0.0, 1.0);
  float green = clamp(0.55 + (1.0 - uPressure) * 0.25, 0.0, 1.0);
  float blue = clamp(0.95 - uEntropy * 0.35, 0.0, 1.0);

  outColor = vec4(red, green, blue, edge * (0.25 + activity * 0.65));
}
