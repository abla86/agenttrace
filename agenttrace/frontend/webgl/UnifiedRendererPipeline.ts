import type { ProjectedWorld } from "./Projector3D";
import { Scene3D } from "./Scene3D";

export interface RenderPass {
  render: (context: RenderContext) => void;
  dispose?: () => void;
}

export interface RenderContext {
  gl: WebGL2RenderingContext;
  scene: Scene3D;
  world: ProjectedWorld;
  simulationTime: number;
}

export interface UnifiedRendererDependencies {
  shadow?: RenderPass;
  gbuffer?: RenderPass;
  ssao?: RenderPass;
  lighting?: RenderPass;
  ssr?: RenderPass;
  fog?: RenderPass;
  path?: RenderPass;
  particles?: RenderPass;
  postProcessing?: RenderPass;
}

export class UnifiedRendererPipeline {
  private disposed = false;

  constructor(
    private readonly gl: WebGL2RenderingContext,
    readonly scene: Scene3D,
    private readonly passes: UnifiedRendererDependencies = {},
  ) {}

  update(world: ProjectedWorld): void {
    if (this.disposed) throw new Error("UnifiedRendererPipeline has been disposed");
    this.scene.update(world);
  }

  render(simulationTime: number): void {
    if (this.disposed) return;

    const context: RenderContext = {
      gl: this.gl,
      scene: this.scene,
      world: this.scene.world,
      simulationTime,
    };

    this.passes.shadow?.render(context);
    this.passes.gbuffer?.render(context);
    this.passes.ssao?.render(context);
    this.passes.lighting?.render(context);
    this.passes.ssr?.render(context);
    this.passes.fog?.render(context);
    this.passes.path?.render(context);
    this.passes.particles?.render(context);
    this.passes.postProcessing?.render(context);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const pass of Object.values(this.passes)) pass?.dispose?.();
  }
}
