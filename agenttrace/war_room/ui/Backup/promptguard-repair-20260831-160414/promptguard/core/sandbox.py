import ast
from typing import Dict, Any, List
from .models import SecurityViolation, ThreatCategory, ToolCallEvaluation
from .engine import PromptGuardEngine

class ToolCallSandbox:
    FORBIDDEN = {"eval", "exec", "system", "popen", "spawn", "open"}

    def __init__(self, engine: PromptGuardEngine):
        self.engine = engine

    def validate_tool_call(self, tool_name: str, arguments: Dict[str, Any]) -> ToolCallEvaluation:
        violations: List[SecurityViolation] = []
        for k, v in arguments.items():
            if isinstance(v, str):
                rep = self.engine.inspect_and_contain(v)
                violations.extend(rep.violations)
                if tool_name in ["run_python", "execute_code"]:
                    try:
                        tree = ast.parse(v)
                        for node in ast.walk(tree):
                            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in self.FORBIDDEN:
                                violations.append(SecurityViolation(ThreatCategory.UNSAFE_CODE_EXECUTION, "AST-01", 1.0, f"Forbudt funksjonskall '{node.func.id}'", node.func.id))
                    except SyntaxError:
                        pass
        return ToolCallEvaluation(is_valid=len(violations) == 0, tool_name=tool_name, sanitized_arguments=arguments, violations=violations)
