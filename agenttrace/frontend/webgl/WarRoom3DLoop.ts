export interface Renderer3D {
  update(viewModel: unknown): void;
  draw(): void;
  dispose?(): void;
}

export class WarRoom3DLoop {
  private frameId: number | null = null;
  private running = false;

  constructor(
    private readonly renderer3D: Renderer3D,
    private readonly viewModelProvider: () => unknown,
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;

    const frame = () => {
      if (!this.running) return;
      this.renderer3D.update(this.viewModelProvider());
      this.renderer3D.draw();
      this.frameId = requestAnimationFrame(frame);
    };

    this.frameId = requestAnimationFrame(frame);
  }

  stop(): void {
    this.running = false;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  dispose(): void {
    this.stop();
    this.renderer3D.dispose?.();
  }
}
