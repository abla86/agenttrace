from agenttrace.api import TraceNode, TaintLabel


def make_node(node_id: str, content: str, taint: TaintLabel = TaintLabel.TOOL_OUTPUT_UNTRUSTED) -> TraceNode:
    return TraceNode(node_id, taint, content, ())
