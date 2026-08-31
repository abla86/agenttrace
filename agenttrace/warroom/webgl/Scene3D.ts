export type Vec3 = [number, number, number];

export interface SceneEntity3D {
  id: string;
  kind: "worm" | "virus" | "bot" | "dos";
  pos: Vec3;
  size: number;
  color: Vec3;
  opacity: number;
}

export interface Scene3DState {
  organisms: SceneEntity3D[];
  territories: ReadonlyArray<Record<string, unknown>>;
  colonies: ReadonlyArray<Record<string, unknown>>;
  civilizations: ReadonlyArray<Record<string, unknown>>;
  heatmap: ReadonlyArray<number>;
}

type ViewEntity = Record<string, unknown>;

type ViewModelLike = {
  worms?: ReadonlyArray<ViewEntity>;
  viruses?: ReadonlyArray<ViewEntity>;
  bots?: ReadonlyArray<ViewEntity>;
  dosAgents?: ReadonlyArray<ViewEntity>;
  territories?: ReadonlyArray<Record<string, unknown>>;
  colonies?: ReadonlyArray<Record<string, unknown>>;
  civilizations?: ReadonlyArray<Record<string, unknown>>;
  heatmap?: ReadonlyArray<number>;
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function numberOf(value: unknown, fallback = 0): number {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function toOrganism(
  entity: ViewEntity,
  kind: SceneEntity3D["kind"],
): SceneEntity3D {
  const aggression = clamp01(numberOf(entity.aggression));
  const stealth = clamp01(numberOf(entity.stealth));
  const adaptability = clamp01(numberOf(entity.adaptability));
  const radius = Math.max(2, numberOf(entity.radius, numberOf(entity.size, 4)));

  const palette: Record<SceneEntity3D["kind"], Vec3> = {
    worm: [aggression, 1 - stealth, stealth],
    virus: [0.9, adaptability, stealth],
    bot: [0.2, stealth, adaptability],
    dos: [Math.max(0.4, aggression), 0.05, 0.05],
  };

  return {
    id: String(entity.id ?? `${kind}-unknown`),
    kind,
    pos: [
      numberOf(entity.x),
      numberOf(entity.y),
      numberOf(entity.z, aggression * 2 - 1),
    ],
    size: radius,
    color: palette[kind],
    opacity: clamp01(numberOf(entity.opacity, 1)),
  };
}

export class Scene3D {
  state: Scene3DState = {
    organisms: [],
    territories: [],
    colonies: [],
    civilizations: [],
    heatmap: [],
  };

  updateFromViewModel(vm: ViewModelLike): void {
    const organisms: SceneEntity3D[] = [];

    for (const worm of vm.worms ?? []) organisms.push(toOrganism(worm, "worm"));
    for (const virus of vm.viruses ?? []) organisms.push(toOrganism(virus, "virus"));
    for (const bot of vm.bots ?? []) organisms.push(toOrganism(bot, "bot"));
    for (const agent of vm.dosAgents ?? []) organisms.push(toOrganism(agent, "dos"));

    this.state = {
      organisms,
      territories: vm.territories ?? [],
      colonies: vm.colonies ?? [],
      civilizations: vm.civilizations ?? [],
      heatmap: vm.heatmap ?? [],
    };
  }

  getOrganisms(): ReadonlyArray<SceneEntity3D> {
    return this.state.organisms;
  }

  getWorldState(): Scene3DState {
    return this.state;
  }
}
