#version 300 es
precision highp float;

in vec3 aPos;

uniform mat4 uLightProjection;
uniform mat4 uLightView;

void main() {
  gl_Position = uLightProjection * uLightView * vec4(aPos, 1.0);
}
