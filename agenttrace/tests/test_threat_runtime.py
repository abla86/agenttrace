from agenttrace.simulation.scenes import default_scene_manager
from agenttrace.simulation.species import default_species_registry
from agenttrace.simulation.threat_runtime import MultiSpeciesEngine, ThreatRuntime


def test_default_species_and_scenes_are_registered() -> None:
    species = default_species_registry()
    scenes = default_scene_manager()

    assert species.get("worm_basic") is not None
    assert species.get("virus_fast") is not None
    assert species.get("botnet_node") is not None
    assert species.get("dos_agent") is not None
    assert scenes.get("memory_scene") is not None
    assert scenes.get("network_scene") is not None
    assert scenes.get("cloud_scene") is not None
    assert scenes.get("dos_scene") is not None


def test_species_engine_can_spawn_multiple_species_without_network_side_effects() -> None:
    engine = MultiSpeciesEngine()
    worm = engine.spawn("worm_basic", "memory_scene", "w-1")
    virus = engine.spawn("virus_fast", "memory_scene", "v-1")
    bot = engine.spawn("botnet_node", "network_scene", "b-1")
    dos = engine.spawn("dos_agent", "dos_scene", "d-1")

    assert {worm.kind, virus.kind, bot.kind, dos.kind} == {"worm", "virus", "bot", "dos"}
    assert len(engine.by_scene("memory_scene")) == 2
    assert len(engine.by_scene("dos_scene")) == 1


def test_threat_runtime_applies_only_simulated_pressure() -> None:
    runtime = ThreatRuntime()
    runtime.species_engine.spawn("dos_agent", "dos_scene", "d-1")

    metrics = {
        "infection_rate": 0.0,
        "memory_pressure": 0.0,
        "scan_activity": 0.0,
        "dos_pressure": 0.0,
    }

    events = runtime.tick(metrics)

    assert metrics["dos_pressure"] > 0.0
    assert events[0].kind == "THREAT_BEHAVIOR"
    assert events[0].action == "attack"
