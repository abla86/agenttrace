from agenttrace.api import TraceNode, TaintLabel, sha256


def make_node(node_id: str, content: str, taint: TaintLabel = TaintLabel.TOOL_OUTPUT_UNTRUSTED) -> TraceNode:
    return TraceNode(node_id, taint, content, ())


def hash_content(content: str) -> str:
    return sha256(content.encode("utf-8"))
