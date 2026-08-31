#version 300 es
precision highp float;

in vec3 vColor;
in float vOpacity;

layout(location = 0) out vec4 outAlbedo;
layout(location = 1) out vec4 outNormals;
layout(location = 2) out vec4 outEmissive;

void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float radius2 = dot(p, p);
  if (radius2 > 1.0) discard;

  float z = sqrt(max(0.0, 1.0 - radius2));
  vec3 normal = normalize(vec3(p, z));
  float edge = smoothstep(1.0, 0.65, radius2);

  outAlbedo = vec4(vColor, vOpacity * edge);
  outNormals = vec4(normal * 0.5 + 0.5, 1.0);
  outEmissive = vec4(vColor * 0.15, vOpacity * edge);
}
