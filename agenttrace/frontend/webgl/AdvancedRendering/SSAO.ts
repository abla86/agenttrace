import { ShaderSystem } from "../ShaderSystem";

export class SSAO {
  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly vao: WebGLVertexArrayObject;
  private readonly quadBuffer: WebGLBuffer;

  constructor(gl: WebGL2RenderingContext, program = ShaderSystem.get("ssao")) {
    this.gl = gl;
    this.program = program;

    const vao = gl.createVertexArray();
    const quadBuffer = gl.createBuffer();
    if (!vao || !quadBuffer) throw new Error("Unable to create SSAO resources");

    this.vao = vao;
    this.quadBuffer = quadBuffer;

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, "aPos");
    if (aPos < 0) throw new Error("SSAO shader is missing aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  render(gbuffer: { normals: WebGLTexture; depth: WebGLTexture }, uniforms: { radius?: number; bias?: number; time?: number }): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(this.program);

    this.bindTexture(0, gbuffer.normals, "uNormals");
    this.bindTexture(1, gbuffer.depth, "uDepth");

    this.setFloat("uRadius", uniforms.radius ?? 0.5);
    this.setFloat("uBias", uniforms.bias ?? 0.025);
    this.setFloat("uTime", uniforms.time ?? 0);

    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
    gl.enable(gl.DEPTH_TEST);
  }

  dispose(): void {
    this.gl.deleteBuffer(this.quadBuffer);
    this.gl.deleteVertexArray(this.vao);
  }

  private bindTexture(unit: number, texture: WebGLTexture, uniform: string): void {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(this.program, uniform), unit);
  }

  private setFloat(name: string, value: number): void {
    this.gl.uniform1f(this.gl.getUniformLocation(this.program, name), value);
  }
}
