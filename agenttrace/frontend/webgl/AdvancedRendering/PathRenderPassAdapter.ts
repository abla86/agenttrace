import type { WarRoomViewModel } from "../../../warroom/view_model";
import type { RenderContext, RenderPass } from "../UnifiedRendererPipeline";
import { projectPathInput } from "./PathProjection";
import type { ShaderSystem } from "../ShaderSystem";
import { GPUPathLayer } from "./GPUPathLayer";

/**
 * Adapts the low-level GPUPathLayer API to the existing RenderPass contract.
 *
 * The adapter deliberately does not add texture/framebuffer fields to
 * RenderContext and does not modify ProjectedWorld. It receives the
 * authoritative WarRoomViewModel separately and renders the path/activity
 * overlay as a side-effecting visual pass.
 */
export class PathRenderPassAdapter implements RenderPass {
  private readonly gpuPath: GPUPathLayer;
  private latestViewModel: WarRoomViewModel | null = null;

  constructor(
    private readonly shaderSystem: ShaderSystem,
    private readonly getViewModel: () => WarRoomViewModel | null,
  ) {
    const program = shaderSystem.get("path");
    this.gpuPath = new GPUPathLayerPlaceholder(program);
  }

  render(context: RenderContext): void {
    const vm = this.getViewModel();
    if (!vm) return;

    this.latestViewModel = vm;
    const input = projectPathInput(
      {
        world: context.world,
        defenses: vm.defenses,
        recentEvents: vm.recent_events,
      },
      context.simulationTime,
    );

    this.gpuPath.render(input);
  }

  dispose(): void {
    this.gpuPath.dispose();
    this.latestViewModel = null;
  }
}

// Kept local so the adapter has one place to construct the low-level renderer.
// The program is still resolved exclusively through ShaderSystem.get("path").
class GPUPathLayerPlaceholder extends GPUPathLayer {
  constructor(program: WebGLProgram) {
    super((globalThis as unknown as { __AGENTTRACE_GL__?: WebGL2RenderingContext }).__AGENTTRACE_GL__!, program);
  }
}
