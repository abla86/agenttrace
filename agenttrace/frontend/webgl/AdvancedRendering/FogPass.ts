import { ShaderSystem } from "../ShaderSystem";

export class FogPass {
  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly vao: WebGLVertexArrayObject;
  private readonly quadBuffer: WebGLBuffer;

  constructor(gl: WebGL2RenderingContext, program = ShaderSystem.get("fog")) {
    this.gl = gl;
    this.program = program;

    const vao = gl.createVertexArray();
    const quadBuffer = gl.createBuffer();
    if (!vao || !quadBuffer) throw new Error("Unable to create fog resources");
    this.vao = vao;
    this.quadBuffer = quadBuffer;

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    if (aPos < 0) throw new Error("Fog shader is missing aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  render(gbuffer: { depth: WebGLTexture }, simulationTime: number, density = 0.18): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(this.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gbuffer.depth);
    gl.uniform1i(gl.getUniformLocation(this.program, "uDepth"), 0);
    gl.uniform1f(gl.getUniformLocation(this.program, "uTime"), simulationTime);
    gl.uniform1f(gl.getUniformLocation(this.program, "uDensity"), Math.max(0, Math.min(1, density)));

    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
    gl.enable(gl.DEPTH_TEST);
  }

  dispose(): void {
    this.gl.deleteBuffer(this.quadBuffer);
    this.gl.deleteVertexArray(this.vao);
  }
}
