"""
Static code inspection only.

IMPORTANT:
This module does NOT provide a secure execution sandbox.
It only identifies selected dangerous Python constructs.

Actual code execution must occur inside an OS/container/VM isolation
boundary if untrusted code is ever executed.
"""

import ast
from typing import List

FORBIDDEN_CALLS = {
    "eval",
    "exec",
    "compile",
    "__import__",
}

FORBIDDEN_MODULES = {
    "os",
    "subprocess",
    "socket",
    "pty",
}


def inspect_python(code: str) -> List[str]:
    findings: List[str] = []

    try:
        tree = ast.parse(code)
    except SyntaxError as exc:
        return [f"SYNTAX_ERROR:{exc.msg}"]

    for node in ast.walk(tree):

        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                if node.func.id in FORBIDDEN_CALLS:
                    findings.append(f"FORBIDDEN_CALL:{node.func.id}")

            elif isinstance(node.func, ast.Attribute):
                if node.func.attr in {"system", "popen", "spawn"}:
                    findings.append(
                        f"FORBIDDEN_ATTRIBUTE_CALL:{node.func.attr}"
                    )

        elif isinstance(node, ast.Import):
            for alias in node.names:
                root = alias.name.split(".")[0]
                if root in FORBIDDEN_MODULES:
                    findings.append(f"FORBIDDEN_IMPORT:{root}")

        elif isinstance(node, ast.ImportFrom):
            root = (node.module or "").split(".")[0]
            if root in FORBIDDEN_MODULES:
                findings.append(f"FORBIDDEN_IMPORT:{root}")

    return findings


class ToolCallSandbox:
    """Static validator for tool-call arguments; never executes supplied code."""

    def __init__(self, engine=None) -> None:
        self.engine = engine

    def validate_tool_call(self, tool_name: str, arguments: dict) -> "ToolCallEvaluation":
        from .models import ToolCallEvaluation, SecurityViolation, ThreatCategory

        violations = []
        if not isinstance(arguments, dict):
            violations.append(
                SecurityViolation(
                    ThreatCategory.UNSAFE_CODE_EXECUTION,
                    "TOOL-ARGS-01",
                    1.0,
                    "Tool arguments must be a JSON object.",
                    str(arguments)[:200],
                )
            )
            return ToolCallEvaluation(False, tool_name, {}, violations)

        sanitized = dict(arguments)
        code = arguments.get("code")
        if isinstance(code, str):
            findings = inspect_python(code)
            for finding in findings:
                violations.append(
                    SecurityViolation(
                        ThreatCategory.UNSAFE_CODE_EXECUTION,
                        "AST-01",
                        1.0,
                        f"Static code inspection finding: {finding}",
                        finding,
                    )
                )

        return ToolCallEvaluation(
            is_valid=not violations,
            tool_name=tool_name,
            sanitized_arguments=sanitized,
            violations=violations,
        )
