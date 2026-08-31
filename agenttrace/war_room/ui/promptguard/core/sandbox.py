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
