import type { ProjectedWorld } from "../Projector3D";
import type { PathEvent, PathWorld } from "./GPUPathLayer";

export interface PathProjectionInput {
  world: ProjectedWorld;
  defenses: readonly Record<string, unknown>[];
  recentEvents: readonly Record<string, unknown>[];
}

function toPosition(value: Record<string, unknown>): [number, number, number] | null {
  const pos = value.pos;
  if (Array.isArray(pos) && pos.length >= 2) {
    return [Number(pos[0]) || 0, Number(pos[1]) || 0, Number(pos[2]) || 0];
  }

  if (typeof value.x === "number" || typeof value.y === "number" || typeof value.z === "number") {
    return [Number(value.x) || 0, Number(value.y) || 0, Number(value.z) || 0];
  }

  return null;
}

export function projectPathInput(input: PathProjectionInput, simulationTime: number): {
  world: PathWorld;
  events: readonly PathEvent[];
  simulationTime: number;
} {
  const defenses = input.defenses.flatMap((defense) => {
    const pos = toPosition(defense);
    return pos ? [{ type: typeof defense.type === "string" ? defense.type : undefined, pos }] : [];
  });

  const events = input.recentEvents.map((event, index) => ({
    id: typeof event.id === "string" ? event.id : `event-${index}`,
    kind: typeof event.kind === "string" ? event.kind : undefined,
    tick: typeof event.tick === "number" ? event.tick : undefined,
    payload: event.payload && typeof event.payload === "object"
      ? event.payload as Record<string, unknown>
      : undefined,
  }));

  return {
    world: {
      organisms: input.world.organisms.map((organism) => ({
        id: organism.id,
        pos: organism.pos,
      })),
      defenses,
      environment: {
        pressure: input.world.environment.pressure,
        entropy: input.world.environment.entropy,
      },
    },
    events,
    simulationTime,
  };
}
