from agenttrace.api import TaintLabel, TraceNode


def make_node(
    node_id: str,
    content: str,
    taint: TaintLabel = TaintLabel.TOOL_OUTPUT_UNTRUSTED,
) -> TraceNode:
    return TraceNode(node_id, taint, content, ())
