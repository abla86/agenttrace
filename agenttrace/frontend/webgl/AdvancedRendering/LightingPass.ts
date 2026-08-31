export interface LightingUniforms {
  time: number;
  ambient: [number, number, number];
  lightDirection: [number, number, number];
  lightColor: [number, number, number];
  intensity: number;
}

export class LightingPass {
  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly vao: WebGLVertexArrayObject;
  private readonly quadBuffer: WebGLBuffer;

  constructor(gl: WebGL2RenderingContext, program: WebGLProgram) {
    this.gl = gl;
    this.program = program;

    const vao = gl.createVertexArray();
    const quadBuffer = gl.createBuffer();
    if (!vao || !quadBuffer) throw new Error("Unable to create lighting resources");

    this.vao = vao;
    this.quadBuffer = quadBuffer;

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const location = gl.getAttribLocation(program, "aPos");
    if (location < 0) throw new Error("Lighting shader is missing aPos");
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  render(gbuffer: {
    albedo: WebGLTexture;
    normals: WebGLTexture;
    emissive: WebGLTexture;
    depth: WebGLTexture;
  }, uniforms: LightingUniforms): void {
    const gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(this.program);

    this.bindTexture(0, gbuffer.albedo, "uAlbedo");
    this.bindTexture(1, gbuffer.normals, "uNormals");
    this.bindTexture(2, gbuffer.emissive, "uEmissive");
    this.bindTexture(3, gbuffer.depth, "uDepth");

    this.setVec3("uAmbient", uniforms.ambient);
    this.setVec3("uLightDirection", uniforms.lightDirection);
    this.setVec3("uLightColor", uniforms.lightColor);
    this.setFloat("uIntensity", uniforms.intensity);
    this.setFloat("uTime", uniforms.time);

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

  private setVec3(name: string, value: [number, number, number]): void {
    this.gl.uniform3fv(this.gl.getUniformLocation(this.program, name), value);
  }
}
