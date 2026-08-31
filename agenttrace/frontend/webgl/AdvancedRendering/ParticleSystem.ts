export interface ParticleSource {
  x: number;
  y: number;
  z?: number;
  intensity?: number;
  seed?: number;
}

export class ParticleSystem {
  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly vao: WebGLVertexArrayObject;
  private readonly positionBuffer: WebGLBuffer;
  private readonly sizeBuffer: WebGLBuffer;
  private readonly baseSeed: number;

  private count = 0;

  constructor(gl: WebGL2RenderingContext, program: WebGLProgram, baseSeed = 17) {
    this.gl = gl;
    this.program = program;
    this.baseSeed = baseSeed;

    const vao = gl.createVertexArray();
    const positionBuffer = gl.createBuffer();
    const sizeBuffer = gl.createBuffer();
    if (!vao || !positionBuffer || !sizeBuffer) {
      throw new Error("Unable to create particle resources");
    }

    this.vao = vao;
    this.positionBuffer = positionBuffer;
    this.sizeBuffer = sizeBuffer;

    gl.bindVertexArray(vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const aPos = gl.getAttribLocation(program, "aPos");
    if (aPos < 0) throw new Error("Particle shader is missing aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    const aSize = gl.getAttribLocation(program, "aSize");
    if (aSize >= 0) {
      gl.enableVertexAttribArray(aSize);
      gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, 0, 0);
    }

    gl.bindVertexArray(null);
  }

  update(sources: readonly ParticleSource[], simulationTime: number): void {
    const positions: number[] = [];
    const sizes: number[] = [];

    for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex += 1) {
      const source = sources[sourceIndex];
      const intensity = Math.max(0, Math.min(1, source.intensity ?? 0.5));
      const count = Math.max(1, Math.min(32, Math.ceil(intensity * 16)));
      const seed = Number.isFinite(source.seed) ? Number(source.seed) : this.baseSeed + sourceIndex;

      for (let i = 0; i < count; i += 1) {
        const phase = simulationTime * 0.8 + seed * 0.37 + i * 0.61;
        const radius = 0.2 + intensity * 0.8;
        positions.push(
          source.x + Math.cos(phase) * radius,
          source.y + Math.sin(phase) * radius,
          (source.z ?? 0) + Math.sin(phase * 0.7) * radius * 0.35,
        );
        sizes.push(1 + intensity * 3);
      }
    }

    const gl = this.gl;
    const positionData = new Float32Array(positions);
    const sizeData = new Float32Array(sizes);
    this.count = sizes.length;

    gl.bindVertexArray(this.vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionData, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizeData, gl.DYNAMIC_DRAW);

    gl.bindVertexArray(null);
  }

  render(simulationTime: number): void {
    if (this.count === 0) return;

    const gl = this.gl;
    gl.useProgram(this.program);
    const timeLoc = gl.getUniformLocation(this.program, "uTime");
    if (timeLoc) gl.uniform1f(timeLoc, simulationTime);

    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.POINTS, 0, this.count);
    gl.bindVertexArray(null);
  }

  dispose(): void {
    const gl = this.gl;
    gl.deleteBuffer(this.positionBuffer);
    gl.deleteBuffer(this.sizeBuffer);
    gl.deleteVertexArray(this.vao);
  }
}
