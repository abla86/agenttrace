#version 300 es
precision highp float;

in vec3 aPos;
in float aSize;

uniform mat4 uProjection;
uniform mat4 uView;
uniform float uTime;

out float vPulse;

void main() {
  gl_Position = uProjection * uView * vec4(aPos, 1.0);
  vPulse = 0.75 + 0.25 * sin(uTime + float(gl_VertexID) * 0.17);
  gl_PointSize = max(1.0, aSize * vPulse);
}
