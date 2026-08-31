export class ShaderSystem {
  private readonly programs = new Map<string, WebGLProgram>();

  load(gl: WebGL2RenderingContext, id: string, vertexSource: string, fragmentSource: string): WebGLProgram {
    const existing = this.programs.get(id);
    if (existing) {
      gl.deleteProgram(existing);
      this.programs.delete(id);
    }

    const vertex = this.compile(gl, gl.VERTEX_SHADER, vertexSource, `${id}:vertex`);
    const fragment = this.compile(gl, gl.FRAGMENT_SHADER, fragmentSource, `${id}:fragment`);
    const program = gl.createProgram();
    if (!program) throw new Error(`Unable to create shader program: ${id}`);

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      const log = gl.getProgramInfoLog(program) ?? "unknown link error";
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      throw new Error(`Failed to link ${id}: ${log}`);
    }

    gl.detachShader(program, vertex);
    gl.detachShader(program, fragment);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    this.programs.set(id, program);
    return program;
  }

  get(id: string): WebGLProgram {
    const program = this.programs.get(id);
    if (!program) throw new Error(`Shader program not loaded: ${id}`);
    return program;
  }

  dispose(gl: WebGL2RenderingContext): void {
    for (const program of this.programs.values()) gl.deleteProgram(program);
    this.programs.clear();
  }

  private compile(
    gl: WebGL2RenderingContext,
    type: number,
    source: string,
    label: string,
  ): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) throw new Error(`Unable to create shader: ${label}`);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader) ?? "unknown compile error";
      gl.deleteShader(shader);
      throw new Error(`Failed to compile ${label}: ${log}`);
    }
    return shader;
  }
}
