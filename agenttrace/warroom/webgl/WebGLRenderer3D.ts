import { Camera3D, Vec3 as CameraVec3 } from "./Camera3D";

export type Vec3 = [number, number, number];

export interface RenderEntity3D {
  id: string;
  kind: "worm" | "virus" | "bot" | "dos";
  pos: Vec3;
  size: number;
  color: Vec3;
  opacity?: number;
}

const VERTEX_SHADER = `#version 300 es
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
  gl_PointSize = max(2.0, aSize);
  vColor = aColor;
  vOpacity = aOpacity;
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec3 vColor;
in float vOpacity;
out vec4 outColor;

void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  if (d > 0.5) discard;
  float edge = 1.0 - smoothstep(0.25, 0.5, d);
  outColor = vec4(vColor, edge * vOpacity);
}
`;

function compileShader(
  gl: WebGL2RenderingContext,
  type: GLenum,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create WebGL shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "Unknown shader error";
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create WebGL program");

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? "Unknown link error";
    gl.deleteProgram(program);
    throw new Error(log);
  }
  return program;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function projectRenderEntity(
  entity: Record<string, unknown>,
  width = 400,
  height = 240,
): RenderEntity3D {
  const x = Number(entity.x ?? 0);
  const y = Number(entity.y ?? 0);
  const radius = Number(entity.radius ?? 4);
  const stealth = clamp(Number(entity.stealth ?? 0), 0, 1);
  const speed = Math.max(0, Number(entity.speed ?? 0));
  const aggression = clamp(Number(entity.aggression ?? speed / 2), 0, 1);

  return {
    id: String(entity.id ?? "unknown"),
    kind: "worm",
    pos: [x - width / 2, height / 2 - y, aggression * 2 - 1],
    size: Math.max(2, radius * 2),
    color: [aggression, 1 - stealth, stealth],
    opacity: clamp(Number(entity.opacity ?? 1), 0.05, 1),
  };
}

export class WebGLRenderer3D {
  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly vao: WebGLVertexArrayObject;
  private readonly positionBuffer: WebGLBuffer;
  private readonly colorBuffer: WebGLBuffer;
  private readonly sizeBuffer: WebGLBuffer;
  private readonly opacityBuffer: WebGLBuffer;
  private readonly projectionLocation: WebGLUniformLocation;
  private readonly viewLocation: WebGLUniformLocation;

  private readonly camera: Camera3D;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    camera = new Camera3D(),
  ) {
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: true });
    if (!gl) throw new Error("WebGL2 is not supported");

    this.gl = gl;
    this.camera = camera;
    this.program = createProgram(gl);

    const vao = gl.createVertexArray();
    const positionBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();
    const sizeBuffer = gl.createBuffer();
    const opacityBuffer = gl.createBuffer();
    if (!vao || !positionBuffer || !colorBuffer || !sizeBuffer || !opacityBuffer) {
      throw new Error("Unable to allocate WebGL resources");
    }

    this.vao = vao;
    this.positionBuffer = positionBuffer;
    this.colorBuffer = colorBuffer;
    this.sizeBuffer = sizeBuffer;
    this.opacityBuffer = opacityBuffer;

    const projectionLocation = gl.getUniformLocation(this.program, "uProjection");
    const viewLocation = gl.getUniformLocation(this.program, "uView");
    if (!projectionLocation || !viewLocation) throw new Error("Missing matrix uniforms");
    this.projectionLocation = projectionLocation;
    this.viewLocation = viewLocation;

    gl.bindVertexArray(vao);
    this.bindAttribute("aPos", positionBuffer, 3);
    this.bindAttribute("aColor", colorBuffer, 3);
    this.bindAttribute("aSize", sizeBuffer, 1);
    this.bindAttribute("aOpacity", opacityBuffer, 1);
    gl.bindVertexArray(null);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  private bindAttribute(name: string, buffer: WebGLBuffer, size: number): void {
    const gl = this.gl;
    const location = gl.getAttribLocation(this.program, name);
    if (location < 0) throw new Error(`Missing attribute: ${name}`);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  }

  render(entities: RenderEntity3D[]): void {
    const gl = this.gl;
    const width = Math.max(1, this.canvas.clientWidth || this.canvas.width);
    const height = Math.max(1, this.canvas.clientHeight || this.canvas.height);

    if (this.canvas.width !== width) this.canvas.width = width;
    if (this.canvas.height !== height) this.canvas.height = height;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.02, 0.02, 0.06, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    const positions = new Float32Array(entities.flatMap((e) => e.pos));
    const colors = new Float32Array(entities.flatMap((e) => e.color));
    const sizes = new Float32Array(entities.map((e) => e.size));
    const opacities = new Float32Array(entities.map((e) => e.opacity ?? 1));

    this.upload(this.positionBuffer, positions);
    this.upload(this.colorBuffer, colors);
    this.upload(this.sizeBuffer, sizes);
    this.upload(this.opacityBuffer, opacities);

    const aspect = this.canvas.width / this.canvas.height;
    const projection = this.camera.getProjectionMatrix(aspect);
    const view = this.camera.getViewMatrix();

    gl.uniformMatrix4fv(this.projectionLocation, false, projection);
    gl.uniformMatrix4fv(this.viewLocation, false, view);

    gl.drawArrays(gl.POINTS, 0, entities.length);
    gl.bindVertexArray(null);
  }

  getCamera(): Camera3D {
    return this.camera;
  }

  dispose(): void {
    const gl = this.gl;
    gl.deleteBuffer(this.positionBuffer);
    gl.deleteBuffer(this.colorBuffer);
    gl.deleteBuffer(this.sizeBuffer);
    gl.deleteBuffer(this.opacityBuffer);
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.program);
  }

  private upload(buffer: WebGLBuffer, data: Float32Array): void {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.DYNAMIC_DRAW);
  }
}
