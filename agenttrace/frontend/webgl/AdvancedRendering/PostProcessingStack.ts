import { ShaderSystem } from "../ShaderSystem";
import { PostProcessTarget } from "./PostProcessTarget";

type Size = { width: number; height: number };

abstract class FullscreenPass {
  protected readonly gl: WebGL2RenderingContext;
  protected readonly program: WebGLProgram;
  protected readonly vao: WebGLVertexArrayObject;
  private readonly quadBuffer: WebGLBuffer;

  constructor(gl: WebGL2RenderingContext, programId: string) {
    this.gl = gl;
    this.program = ShaderSystem.get(programId);

    const vao = gl.createVertexArray();
    const quadBuffer = gl.createBuffer();
    if (!vao || !quadBuffer) throw new Error(`Unable to create ${programId} resources`);
    this.vao = vao;
    this.quadBuffer = quadBuffer;

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(this.program, "aPos");
    if (aPos < 0) throw new Error(`${programId} shader is missing aPos`);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  protected draw(target: PostProcessTarget, source: WebGLTexture, time: number): void {
    const gl = this.gl;
    target.bind();
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, source);
    const sceneLoc = gl.getUniformLocation(this.program, "uScene");
    if (sceneLoc) gl.uniform1i(sceneLoc, 0);
    const timeLoc = gl.getUniformLocation(this.program, "uTime");
    if (timeLoc) gl.uniform1f(timeLoc, time);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
    gl.enable(gl.DEPTH_TEST);
    target.unbind();
  }

  dispose(): void {
    this.gl.deleteBuffer(this.quadBuffer);
    this.gl.deleteVertexArray(this.vao);
  }
}

export class BloomPass extends FullscreenPass {
  constructor(gl: WebGL2RenderingContext) { super(gl, "bloom"); }
  render(source: WebGLTexture, target: PostProcessTarget, time: number): void {
    this.draw(target, source, time);
  }
}

export class ToneMappingPass extends FullscreenPass {
  constructor(gl: WebGL2RenderingContext) { super(gl, "tonemap"); }
  render(source: WebGLTexture, target: PostProcessTarget, time: number): void {
    this.draw(target, source, time);
  }
}

export class VignettePass extends FullscreenPass {
  constructor(gl: WebGL2RenderingContext) { super(gl, "vignette"); }
  render(source: WebGLTexture, target: PostProcessTarget, time: number): void {
    this.draw(target, source, time);
  }
}

export class ChromaticAberrationPass extends FullscreenPass {
  constructor(gl: WebGL2RenderingContext) { super(gl, "chromatic"); }
  render(source: WebGLTexture, target: PostProcessTarget, time: number): void {
    this.draw(target, source, time);
  }
}

export class PostProcessingStack {
  private readonly bloom: BloomPass;
  private readonly tonemap: ToneMappingPass;
  private readonly vignette: VignettePass;
  private readonly chromatic: ChromaticAberrationPass;
  private readonly ping: PostProcessTarget;
  private readonly pong: PostProcessTarget;

  constructor(private readonly gl: WebGL2RenderingContext, size: Size) {
    this.bloom = new BloomPass(gl);
    this.tonemap = new ToneMappingPass(gl);
    this.vignette = new VignettePass(gl);
    this.chromatic = new ChromaticAberrationPass(gl);
    this.ping = new PostProcessTarget(gl, size);
    this.pong = new PostProcessTarget(gl, size);
  }

  resize(size: Size): void {
    this.ping.resize(size);
    this.pong.resize(size);
  }

  render(source: WebGLTexture, simulationTime: number): WebGLTexture {
    this.bloom.render(source, this.ping, simulationTime);
    this.tonemap.render(this.ping.texture, this.pong, simulationTime);
    this.vignette.render(this.pong.texture, this.ping, simulationTime);
    this.chromatic.render(this.ping.texture, this.pong, simulationTime);
    return this.pong.texture;
  }

  dispose(): void {
    this.bloom.dispose();
    this.tonemap.dispose();
    this.vignette.dispose();
    this.chromatic.dispose();
    this.ping.dispose();
    this.pong.dispose();
  }
}
