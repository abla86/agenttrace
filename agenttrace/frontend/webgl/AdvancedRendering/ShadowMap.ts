export interface ShadowUniforms {
  lightView: Float32Array;
  lightProjection: Float32Array;
}

export interface ShadowDrawable {
  pos: [number, number, number];
}

export class ShadowMap {
  readonly size = 2048;
  readonly depthTexture: WebGLTexture;
  readonly framebuffer: WebGLFramebuffer;

  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly vao: WebGLVertexArrayObject;
  private readonly positionBuffer: WebGLBuffer;

  constructor(gl: WebGL2RenderingContext, program: WebGLProgram) {
    this.gl = gl;
    this.program = program;

    const framebuffer = gl.createFramebuffer();
    const depthTexture = gl.createTexture();
    const vao = gl.createVertexArray();
    const positionBuffer = gl.createBuffer();
    if (!framebuffer || !depthTexture || !vao || !positionBuffer) {
      throw new Error("Unable to create shadow resources");
    }

    this.framebuffer = framebuffer;
    this.depthTexture = depthTexture;
    this.vao = vao;
    this.positionBuffer = positionBuffer;

    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.DEPTH_COMPONENT24,
      this.size,
      this.size,
      0,
      gl.DEPTH_COMPONENT,
      gl.UNSIGNED_INT,
      null,
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
    gl.drawBuffers([gl.NONE]);
    gl.readBuffer(gl.NONE);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      throw new Error("Shadow framebuffer is incomplete");
    }

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const aPos = gl.getAttribLocation(program, "aPos");
    if (aPos < 0) throw new Error("Shadow shader is missing aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  render(entities: readonly ShadowDrawable[], uniforms: ShadowUniforms): void {
    const gl = this.gl;
    if (entities.length === 0) return;

    const positions = new Float32Array(entities.flatMap((entity) => entity.pos));
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, this.size, this.size);
    gl.enable(gl.DEPTH_TEST);
    gl.colorMask(false, false, false, false);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);

    gl.uniformMatrix4fv(
      gl.getUniformLocation(this.program, "uLightProjection"),
      false,
      uniforms.lightProjection,
    );
    gl.uniformMatrix4fv(
      gl.getUniformLocation(this.program, "uLightView"),
      false,
      uniforms.lightView,
    );

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.POINTS, 0, entities.length);
    gl.bindVertexArray(null);

    gl.colorMask(true, true, true, true);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  dispose(): void {
    const gl = this.gl;
    gl.deleteFramebuffer(this.framebuffer);
    gl.deleteTexture(this.depthTexture);
    gl.deleteBuffer(this.positionBuffer);
    gl.deleteVertexArray(this.vao);
  }
}
