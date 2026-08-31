"""
Security note:

This module is NOT a secure arbitrary-code execution sandbox.

It is a static validation layer for generated test payloads.

Real isolation must be provided by an OS/container/VM boundary.
"""

import ast


FORBIDDEN_IMPORTS = {
    "os",
    "subprocess",
    "socket",
    "pty",
}

FORBIDDEN_CALLS = {
    "eval",
    "exec",
    "compile",
    "__import__",
}


def inspect_python(code: str) -> list[str]:
    findings: list[str] = []

    try:
        tree = ast.parse(code)
    except SyntaxError as exc:
        return [f"SYNTAX_ERROR:{exc.msg}"]

    for node in ast.walk(tree):

        if isinstance(node, ast.Import):
            for alias in node.names:
                root = alias.name.split(".")[0]
                if root in FORBIDDEN_IMPORTS:
                    findings.append(f"FORBIDDEN_IMPORT:{root}")

        elif isinstance(node, ast.ImportFrom):
            root = (node.module or "").split(".")[0]
            if root in FORBIDDEN_IMPORTS:
                findings.append(f"FORBIDDEN_IMPORT:{root}")

        elif isinstance(node, ast.Call):

            if isinstance(node.func, ast.Name):
                if node.func.id in FORBIDDEN_CALLS:
                    findings.append(f"FORBIDDEN_CALL:{node.func.id}")

            if isinstance(node.func, ast.Attribute):
                if node.func.attr in {"system", "popen", "spawn"}:
                    findings.append(
                        f"FORBIDDEN_ATTRIBUTE_CALL:{node.func.attr}"
                    )

    return findings
