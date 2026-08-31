#version 300 es
precision highp float;

layout(location = 0) in vec2 aPos;
layout(location = 1) in vec3 aWorldPos;
layout(location = 2) in float aIntensity;

uniform mat4 uProjection;
uniform mat4 uView;
uniform float uTime;

out float vIntensity;
out float vPulse;

void main() {
  vec4 clip = uProjection * uView * vec4(aWorldPos, 1.0);
  gl_Position = clip;
  gl_PointSize = max(2.0, 3.0 + aIntensity * 8.0);
  vIntensity = aIntensity;
  vPulse = 0.8 + 0.2 * sin(uTime + aIntensity * 6.28318);
}
