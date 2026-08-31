#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uAlbedo;
uniform sampler2D uNormals;
uniform sampler2D uEmissive;
uniform sampler2D uDepth;
uniform vec3 uAmbient;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform float uIntensity;
uniform float uTime;

void main() {
  vec4 albedo = texture(uAlbedo, vUv);
  vec3 encodedNormal = texture(uNormals, vUv).xyz;
  vec3 normal = normalize(encodedNormal * 2.0 - 1.0);
  vec3 emissive = texture(uEmissive, vUv).rgb;
  float depth = texture(uDepth, vUv).r;

  if (albedo.a <= 0.001 || depth >= 0.999999) discard;

  vec3 lightDir = normalize(-uLightDirection);
  float diffuse = max(dot(normal, lightDir), 0.0);
  vec3 lighting = uAmbient + uLightColor * diffuse * uIntensity;
  float depthFade = 1.0 - smoothstep(0.85, 1.0, depth);
  float pulse = 0.97 + 0.03 * sin(uTime * 0.5);

  outColor = vec4((albedo.rgb * lighting + emissive) * depthFade * pulse, albedo.a);
}
