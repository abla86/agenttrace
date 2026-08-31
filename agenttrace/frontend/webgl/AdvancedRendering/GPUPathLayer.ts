export interface PathWorldOrganism {
  id: string;
  pos: [number, number, number];
}

export interface PathWorldDefense {
  type?: string;
  pos?: [number, number, number];
  x?: number;
  y?: number;
  z?: number;
}

export interface PathWorld {
  organisms: readonly PathWorldOrganism[];
  defenses: readonly PathWorldDefense[];
  environment?: {
    pressure?: number;
    entropy?: number;
  };
}

export interface PathEvent {
  id: string;
  kind?: string;
  tick?: number;
  payload?: Record<string, unknown>;
}

export interface PathLayerInput {
  world: PathWorld;
  events: readonly PathEvent[];
  simulationTime: number;
}

export interface PathLayerResources {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
}

/**
 * Visual-only path/activity layer.
 *
 * It never computes or mutates simulation paths. It projects existing organism
 * and defense positions into a screen-space texture that can be consumed by
 * the downstream post-processing stack.
 */
export class GPUPathLayer {
  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly vao: WebGLVertexArrayObject;
  private readonly quadBuffer: WebGLBuffer;
  private readonly positionBuffer: WebGLBuffer;
  private readonly intensityBuffer: WebGLBuffer;
  private readonly resources: PathLayerResources;

  constructor(gl: WebGL2RenderingContext, program: WebGLProgram) {
    this.gl = gl;
    this.program = program;

    const vao = gl.createVertexArray();
    const quadBuffer = gl.createBuffer();
    const positionBuffer = gl.createBuffer();
    const intensityBuffer = gl.createBuffer();
    const framebuffer = gl.createFramebuffer();
    const texture = gl.createTexture();

    if (!vao || !quadBuffer || !positionBuffer || !intensityBuffer || !framebuffer || !texture) {
      throw new Error("Unable to create GPU path resources");
    }

    this.vao = vao;
    this.quadBuffer = quadBuffer;
    this.positionBuffer = positionBuffer;
    this.intensityBuffer = intensityBuffer;
    this.resources = { texture, framebuffer };

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const aPos = gl.getAttribLocation(program, "aPos");
    if (aPos < 0) throw new Error("GPU path shader is missing aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  updateResources(width: number, height: number): void {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.resources.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA8,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.resources.framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.resources.texture,
      0,
    );

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      throw new Error("GPU path framebuffer is incomplete");
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  render(input: PathLayerInput): WebGLTexture {
    const gl = this.gl;
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    this.updateResources(width, height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.resources.framebuffer);
    gl.viewport(0, 0, width, height);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);

    const intensity = this.computeIntensity(input);
    const positionData = this.collectPositions(input.world);
    const intensities = new Float32Array(positionData.length / 3);
    intensities.fill(intensity);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionData), gl.DYNAMIC_DRAW);

    const aWorldPos = gl.getAttribLocation(this.program, "aWorldPos");
    if (aWorldPos >= 0) {
      gl.enableVertexAttribArray(aWorldPos);
      gl.vertexAttribPointer(aWorldPos, 3, gl.FLOAT, false, 0, 0);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.intensityBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, intensities, gl.DYNAMIC_DRAW);
    const aIntensity = gl.getAttribLocation(this.program, "aIntensity");
    if (aIntensity >= 0) {
      gl.enableVertexAttribArray(aIntensity);
      gl.vertexAttribPointer(aIntensity, 1, gl.FLOAT, false, 0, 0);
    }

    const timeLoc = gl.getUniformLocation(this.program, "uTime");
    if (timeLoc) gl.uniform1f(timeLoc, input.simulationTime);

    const pressureLoc = gl.getUniformLocation(this.program, "uPressure");
    if (pressureLoc) gl.uniform1f(pressureLoc, input.world.environment?.pressure ?? 0);

    const entropyLoc = gl.getUniformLocation(this.program, "uEntropy");
    if (entropyLoc) gl.uniform1f(entropyLoc, input.world.environment?.entropy ?? 0);

    if (positionData.length > 0) {
      gl.bindVertexArray(this.vao);
      gl.drawArrays(gl.POINTS, 0, positionData.length / 3);
      gl.bindVertexArray(null);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.enable(gl.DEPTH_TEST);
    return this.resources.texture;
  }

  dispose(): void {
    const gl = this.gl;
    gl.deleteBuffer(this.positionBuffer);
    gl.deleteBuffer(this.intensityBuffer);
    gl.deleteBuffer(this.quadBuffer);
    gl.deleteVertexArray(this.vao);
    gl.deleteTexture(this.resources.texture);
    gl.deleteFramebuffer(this.resources.framebuffer);
  }

  private collectPositions(world: PathWorld): number[] {
    const positions: number[] = [];

    for (const organism of world.organisms) {
      positions.push(...organism.pos);
    }

    for (const defense of world.defenses) {
      const pos = defense.pos ?? [defense.x ?? 0, defense.y ?? 0, defense.z ?? 0];
      positions.push(...pos);
    }

    return positions;
  }

  private computeIntensity(input: PathLayerInput): number {
    const eventPressure = Math.min(1, input.events.length / 100);
    const environmentPressure = input.world.environment?.pressure ?? 0;
    const entropy = input.world.environment?.entropy ?? 0;
    return Math.max(0.05, Math.min(1, 0.45 + eventPressure * 0.25 + environmentPressure * 0.2 + entropy * 0.1));
  }
}
