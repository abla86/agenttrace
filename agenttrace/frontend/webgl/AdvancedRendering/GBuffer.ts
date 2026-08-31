export interface GBufferTargets {
  fbo: WebGLFramebuffer;
  albedo: WebGLTexture;
  normals: WebGLTexture;
  emissive: WebGLTexture;
  depth: WebGLTexture;
}

export class GBuffer {
  readonly targets: GBufferTargets;
  private width: number;
  private height: number;
  private gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.width = gl.drawingBufferWidth;
    this.height = gl.drawingBufferHeight;

    const fbo = this.require(gl.createFramebuffer(), "framebuffer");
    const albedo = this.createColorTexture(gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
    const normals = this.createColorTexture(gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
    const emissive = this.createColorTexture(gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
    const depth = this.createDepthTexture();

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, albedo, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, normals, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, emissive, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depth, 0);
    gl.drawBuffers([
      gl.COLOR_ATTACHMENT0,
      gl.COLOR_ATTACHMENT1,
      gl.COLOR_ATTACHMENT2,
    ]);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      throw new Error("GBuffer framebuffer is incomplete");
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.targets = { fbo, albedo, normals, emissive, depth };
  }

  begin(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.targets.fbo);
    gl.viewport(0, 0, this.width, this.height);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  end(): void {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  resize(): void {
    const gl = this.gl;
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    if (width === this.width && height === this.height) return;

    this.width = width;
    this.height = height;
    this.destroyTexture(this.targets.albedo);
    this.destroyTexture(this.targets.normals);
    this.destroyTexture(this.targets.emissive);
    this.destroyTexture(this.targets.depth);

    const albedo = this.createColorTexture(gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
    const normals = this.createColorTexture(gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
    const emissive = this.createColorTexture(gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE);
    const depth = this.createDepthTexture();

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.targets.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, albedo, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, normals, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, emissive, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depth, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.targets.albedo = albedo;
    this.targets.normals = normals;
    this.targets.emissive = emissive;
    this.targets.depth = depth;
  }

  dispose(): void {
    const gl = this.gl;
    gl.deleteFramebuffer(this.targets.fbo);
    this.destroyTexture(this.targets.albedo);
    this.destroyTexture(this.targets.normals);
    this.destroyTexture(this.targets.emissive);
    this.destroyTexture(this.targets.depth);
  }

  private createColorTexture(internalFormat: number, format: number, type: number): WebGLTexture {
    const gl = this.gl;
    const texture = this.require(gl.createTexture(), "color texture");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, this.width, this.height, 0, format, type, null);
    return texture;
  }

  private createDepthTexture(): WebGLTexture {
    const gl = this.gl;
    const texture = this.require(gl.createTexture(), "depth texture");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.DEPTH_COMPONENT24,
      this.width,
      this.height,
      0,
      gl.DEPTH_COMPONENT,
      gl.UNSIGNED_INT,
      null,
    );
    return texture;
  }

  private destroyTexture(texture: WebGLTexture): void {
    this.gl.deleteTexture(texture);
  }

  private require<T>(value: T | null, label: string): T {
    if (!value) throw new Error(`Unable to create ${label}`);
    return value;
  }
}
