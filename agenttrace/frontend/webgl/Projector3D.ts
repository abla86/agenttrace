export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];

export interface ProjectedOrganism {
  id: string;
  kind: string;
  pos: Vec3;
  color: Vec3;
  size: number;
  opacity: number;
}

export interface ProjectedTerritory {
  id: string;
  pos: Vec3;
  radius: number;
  color: Vec3;
  pressure: number;
  stability: number;
}

export interface ProjectedColonyNode {
  pos: Vec3;
  color: Vec3;
  size: number;
}

export interface ProjectedColonyLink {
  a: Vec3;
  b: Vec3;
  color: Vec3;
}

export interface ProjectedColony {
  id: string;
  nodes: ProjectedColonyNode[];
  links: ProjectedColonyLink[];
}

export interface ProjectedCivilization {
  id: string;
  pos: Vec3;
  height: number;
  width: number;
  color: Vec3;
}

export interface ProjectedHeatmap {
  width: number;
  height: number;
  data: Float32Array;
}

export interface ProjectedEnvironment {
  entropy: number;
  pressure: number;
  autonomy: number;
  fog: number;
}

export interface ProjectedWorld {
  organisms: ProjectedOrganism[];
  territories: ProjectedTerritory[];
  colonies: ProjectedColony[];
  civilizations: ProjectedCivilization[];
  heatmap: ProjectedHeatmap | null;
  environment: ProjectedEnvironment;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function normalizeColor(value: unknown): Vec3 {
  if (Array.isArray(value)) {
    return [clamp01(Number(value[0])), clamp01(Number(value[1])), clamp01(Number(value[2]))];
  }
  if (value && typeof value === "object") {
    const color = value as Record<string, unknown>;
    return [clamp01(Number(color.r)), clamp01(Number(color.g)), clamp01(Number(color.b))];
  }
  return [0.6, 0.7, 1.0];
}

function mapOrganism(entity: any, fallbackKind: string): ProjectedOrganism {
  const genome = entity?.genome ?? {};
  const color = entity?.color ?? {
    r: genome.aggression ?? 0.2,
    g: genome.adaptability ?? 0.5,
    b: genome.stealth ?? 0.2,
  };

  return {
    id: String(entity?.id ?? `${fallbackKind}-unknown`),
    kind: String(entity?.kind ?? fallbackKind),
    pos: [Number(entity?.x ?? 0), Number(entity?.y ?? 0), Number(entity?.z ?? 0)],
    color: normalizeColor(color),
    size: Math.max(1, Number(entity?.size3D ?? entity?.size ?? 4)),
    opacity: clamp01(Number(entity?.opacity3D ?? entity?.opacity ?? 1)),
  };
}

export function projectWorld3D(vm: any): ProjectedWorld {
  const worms = Array.isArray(vm?.worms) ? vm.worms.map((w: any) => mapOrganism(w, "worm")) : [];
  const viruses = Array.isArray(vm?.viruses) ? vm.viruses.map((v: any) => mapOrganism(v, "virus")) : [];
  const bots = Array.isArray(vm?.bots) ? vm.bots.map((b: any) => mapOrganism(b, "bot")) : [];
  const dosAgents = Array.isArray(vm?.dosAgents) ? vm.dosAgents.map((d: any) => mapOrganism(d, "dos")) : [];

  const organisms = [...worms, ...viruses, ...bots, ...dosAgents];
  const wormMap = new Map(worms.map((worm) => [worm.id, worm]));

  const territories: ProjectedTerritory[] = (vm?.territories ?? []).map((territory: any) => ({
    id: String(territory.id),
    pos: [Number(territory.centerX ?? territory.x ?? 0), Number(territory.centerY ?? territory.y ?? 0), Number(territory.z ?? 0)],
    radius: Math.max(0, Number(territory.radius ?? 1)),
    color: normalizeColor(territory.color ?? { r: 0.3, g: 0.3, b: 0.4 }),
    pressure: clamp01(Number(territory.pressure ?? 0)),
    stability: clamp01(Number(territory.stability ?? 1)),
  }));

  const colonies: ProjectedColony[] = (vm?.colonies ?? []).map((colony: any) => {
    const nodes: ProjectedColonyNode[] = (colony.members ?? []).flatMap((id: string) => {
      const worm = wormMap.get(id);
      if (!worm) return [];
      return [{
        pos: [...worm.pos] as Vec3,
        color: [clamp01(Number(colony.cohesion ?? 0)), clamp01(Number(colony.stealth ?? 0)), clamp01(Number(colony.aggression ?? 0))],
        size: 0.3 + clamp01(Number(colony.cohesion ?? 0)) * 0.4,
      }];
    });

    const links: ProjectedColonyLink[] = [];
    for (let i = 1; i < nodes.length; i += 1) {
      const color: Vec3 = [
        clamp01(Number(colony.aggression ?? 0)),
        0.1,
        clamp01(Number(colony.stealth ?? 0)),
      ];
      links.push({ a: nodes[i - 1].pos, b: nodes[i].pos, color });
    }

    return { id: String(colony.id), nodes, links };
  });

  const territoryMap = new Map(territories.map((territory) => [territory.id, territory]));
  const civilizations: ProjectedCivilization[] = (vm?.civilizations ?? []).flatMap((civ: any) => {
    const territory = territoryMap.get(String(civ.territoryId ?? civ.ownerTerritoryId ?? ""));
    if (!territory) return [];
    return [{
      id: String(civ.id),
      pos: [...territory.pos] as Vec3,
      height: Math.max(0, Number(civ.techLevel ?? 0)) * 0.02,
      width: 0.5 + Math.max(0, Number(civ.militaryLevel ?? 0)) * 0.005,
      color: [
        clamp01(Number(civ.techLevel ?? 0) / 100),
        clamp01(Number(civ.expansionDoctrine ?? 0) / 100),
        clamp01(Number(civ.stealthDoctrine ?? 0) / 100),
      ],
    }];
  });

  const heatmap = vm?.heatmap?.width && vm?.heatmap?.height && vm?.heatmap?.values
    ? {
        width: Number(vm.heatmap.width),
        height: Number(vm.heatmap.height),
        data: vm.heatmap.values instanceof Float32Array
          ? vm.heatmap.values
          : new Float32Array(vm.heatmap.values),
      }
    : null;

  const metrics = vm?.metrics ?? {};
  const entropy = clamp01(Number(metrics.entropy ?? metrics.driftScore ?? 0));
  const pressure = clamp01(Number(metrics.pressure ?? metrics.dosPressure ?? 0));
  const autonomy = clamp01(Number(metrics.autonomyLevel ?? metrics.autonomy ?? 0) / (Number(metrics.autonomyLevel) > 1 ? 100 : 1));

  return {
    organisms,
    territories,
    colonies,
    civilizations,
    heatmap,
    environment: {
      entropy,
      pressure,
      autonomy,
      fog: clamp01(pressure * 0.6 + entropy * 0.2),
    },
  };
}
