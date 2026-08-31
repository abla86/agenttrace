#version 300 es
precision highp float;

in vec3 aPos;
in vec3 aColor;
in float aSize;
in float aOpacity;

uniform mat4 uProjection;
uniform mat4 uView;

out vec3 vColor;
out float vOpacity;

void main() {
  gl_Position = uProjection * uView * vec4(aPos, 1.0);
  gl_PointSize = max(1.0, aSize);
  vColor = aColor;
  vOpacity = aOpacity;
}
