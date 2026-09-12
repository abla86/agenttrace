from agenttrace import AgentTrace
from agenttrace.adapters import connect
from agenttrace.analysis import TraceAnalysis
from agenttrace.render import TraceRenderer
from agenttrace.plugins import AgentTracePlugin


class Collector:
    def __init__(self):
        self.states = []
        self.events = []

    def push_state(self, state):
        self.states.append(state)

    def push_event(self, event):
        self.events.append(event)


class ExamplePlugin(AgentTracePlugin):
    pass


def test_trace_records_events_and_supports_unsubscribe():
    trace = AgentTrace()
    received = []
    unsubscribe = trace.subscribe(received.append)

    trace.add_state("start", {"status": "ready"})
    trace.add_event("scan", {"severity": "high"})

    assert trace.states[0].name == "start"
    assert received[0].event_type == "scan"

    unsubscribe()
    trace.add_event("done")
    assert len(received) == 1


def test_analysis_and_render():
    trace = AgentTrace()
    trace.add_event("scan", {"severity": "high"})
    trace.add_event("scan", {"severity": "low"})

    analysis = TraceAnalysis(trace)
    assert analysis.count_events() == 2
    assert analysis.event_types() == {"scan": 2}
    assert analysis.severity_distribution() == {"high": 1, "low": 1}

    rendered = TraceRenderer(trace)
    assert '"events"' in rendered.to_json()
    assert "[EVENT] scan:" in rendered.to_text()


def test_generic_adapter_keeps_consumer_out_of_core():
    trace = AgentTrace()
    collector = Collector()
    disconnect = connect(trace, collector)

    trace.add_state("start")
    trace.add_event("scan")

    assert [state.name for state in collector.states] == ["start"]
    assert [event.event_type for event in collector.events] == ["scan"]
    disconnect()


def test_plugin_contract_is_instantiable():
    assert isinstance(ExamplePlugin(), AgentTracePlugin)
