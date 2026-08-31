import { Camera3D } from "./Camera3D";
import type { ProjectedWorld } from "./Projector3D";

export class Scene3D {
  readonly camera: Camera3D;
  world: ProjectedWorld = {
    organisms: [],
    territories: [],
    colonies: [],
    civilizations: [],
    heatmap: null,
    environment: { entropy: 0, pressure: 0, autonomy: 0, fog: 0 },
  };

  constructor(canvas: HTMLCanvasElement) {
    this.camera = new Camera3D(canvas);
  }

  update(world: ProjectedWorld): void {
    this.world = world;
  }
}
