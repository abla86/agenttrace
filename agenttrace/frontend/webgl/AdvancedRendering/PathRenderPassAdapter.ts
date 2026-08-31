import type { WarRoomViewModel } from "../../../warroom/view_model";
import type { RenderContext, RenderPass } from "../UnifiedRendererPipeline";
import type { ShaderSystem } from "../ShaderSystem";
import { projectPathInput } from "./PathProjection";
import { GPUPathLayer } from "./GPUPathLayer";

/**
 * Bridges the low-level GPUPathLayer into the existing RenderPass contract.
 *
 * ProjectedWorld remains unchanged. Defenses and recent events come from the
 * authoritative WarRoomViewModel supplied through getViewModel().
 */
export class PathRenderPassAdapter implements RenderPass {
  private readonly gpuPath: GPUPathLayer;

  constructor(
    gl: WebGL2RenderingContext,
    shaderSystem: ShaderSystem,
    private readonly getViewModel: () => WarRoomViewModel | null,
  ) {
    const program = shaderSystem.get("path");
    this.gpuPath = new GPUPathLayer(gl, program);
  }

  render(context: RenderContext): void {
    const vm = this.getViewModel();
    if (!vm) return;

    this.gpuPath.render(
      projectPathInput(
        {
          world: context.world,
          defenses: vm.defenses,
          recentEvents: vm.recent_events,
        },
        context.simulationTime,
      ),
    );
  }

  dispose(): void {
    this.gpuPath.dispose();
  }
}
