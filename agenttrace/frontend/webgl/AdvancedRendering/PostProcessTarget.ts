export interface RenderTargetSize {
  width: number;
  height: number;
}

export class PostProcessTarget {
  readonly fbo: WebGLFramebuffer;
  readonly texture: WebGLTexture;
  private readonly gl: WebGL2RenderingContext;
  private width: number;
  private height: number;

  constructor(gl: WebGL2RenderingContext, size: RenderTargetSize) {
    this.gl = gl;
    const fbo = gl.createFramebuffer();
    const texture = gl.createTexture();
    if (!fbo || !texture) throw new Error("Unable to create post-process target");

    this.fbo = fbo;
    this.texture = texture;
    this.width = Math.max(1, Math.floor(size.width));
    this.height = Math.max(1, Math.floor(size.height));
    this.allocate();
  }

  resize(size: RenderTargetSize): void {
    this.width = Math.max(1, Math.floor(size.width));
    this.height = Math.max(1, Math.floor(size.height));
    this.allocate();
  }

  bind(): void {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
    this.gl.viewport(0, 0, this.width, this.height);
  }

  unbind(): void {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  dispose(): void {
    this.gl.deleteFramebuffer(this.fbo);
    this.gl.deleteTexture(this.texture);
  }

  private allocate(): void {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA8,
      this.width,
      this.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.texture,
      0,
    );
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      throw new Error("Post-process framebuffer is incomplete");
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}
