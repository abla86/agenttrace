import asyncio

from agenttrace.warroom.api import WarRoomRuntime
from agenttrace.warroom.runner import WarRoomRunner


def test_runner_starts_and_stops_without_replacing_runtime() -> None:
    async def scenario() -> None:
        runtime = WarRoomRuntime(seed=7)
        runner = WarRoomRunner(runtime=runtime, interval_seconds=0.01)

        assert not runner.running
        runner.start()
        assert runner.running

        await asyncio.sleep(0.03)
        assert runtime.state()["tick"] >= 2

        await runner.stop()
        assert not runner.running

    asyncio.run(scenario())


def test_runner_rejects_non_positive_interval() -> None:
    runtime = WarRoomRuntime(seed=7)
    try:
        WarRoomRunner(runtime=runtime, interval_seconds=0)
    except ValueError:
        return
    raise AssertionError("runner must reject non-positive intervals")
