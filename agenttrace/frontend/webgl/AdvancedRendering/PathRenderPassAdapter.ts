import type { WarRoomViewModel } from "../../../warroom/view_model";
import type { RenderContext, RenderPass } from "../UnifiedRendererPipeline";
import type { ShaderSystem } from "../ShaderSystem";
import { projectPathInput } from "./PathProjection";
import { GPUPathLayer } from "./GPUPathLayer";

/**
 * Adapts GPUPathLayer to the existing RenderPass contract without modifying
 * RenderContext or ProjectedWorld.
 *
 * The authoritative defenses/recent events remain in WarRoomViewModel.
 * The low-level GPUPathLayer owns its own render target and returns its texture;
 * this adapter intentionally treats that texture as an internal side effect
 * because the current RenderPass contract has no output-texture channel.
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
