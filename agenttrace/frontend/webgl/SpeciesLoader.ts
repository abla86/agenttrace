import type { SpeciesProfile, SpeciesRenderer3D } from "./SpeciesRegistry";
import { SpeciesRegistry } from "./SpeciesRegistry";

export interface SpeciesConfig {
  profiles?: SpeciesProfile[];
  renderers3D?: Array<{
    id: string;
    rendererId: string;
  }>;
}

export type RendererFactory = (id: string) => SpeciesRenderer3D | undefined;

/**
 * Loads declarative configuration. JSON may reference renderer ids, but
 * executable renderer functions are resolved through the supplied factory.
 */
export class SpeciesLoader {
  static loadFromConfig(config: SpeciesConfig, resolveRenderer: RendererFactory): void {
    for (const profile of config.profiles ?? []) {
      SpeciesRegistry.registerProfile(profile);
    }

    for (const binding of config.renderers3D ?? []) {
      const renderer = resolveRenderer(binding.rendererId);
      if (!renderer) {
        throw new Error(`Renderer not registered: ${binding.rendererId}`);
      }
      SpeciesRegistry.registerRenderer3D({
        ...renderer,
        id: binding.id,
      });
    }
  }
}
