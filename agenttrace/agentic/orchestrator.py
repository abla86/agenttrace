"""Deterministic multi-agent review pipeline.

The orchestration layer is deliberately model-agnostic: CI can exercise the
security boundary without network calls or LLM credentials. A Google ADK
adapter can map the same agent roles onto real agents later.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any

from agenttrace.api import (
    ActionCapability,
    AgentPhase,
    Decision,
    EvaluationLab,
    TaintLabel,
    ToolManifest,
)


@dataclass(frozen=True)
class ReviewRequest:
    repository: str
    pull_request: int
    changed_files: tuple[str, ...]
    diff_summary: str
    dependency_changes: tuple[str, ...] = ()
    test_results: tuple[str, ...] = ()


@dataclass
class AgentFinding:
    agent: str
    severity: str
    title: str
    detail: str
    evidence: list[str] = field(default_factory=list)


@dataclass
class ReviewReport:
    repository: str
    pull_request: int
    findings: list[AgentFinding]
    blocked_actions: list[str]
    trace_root: str
    audit_root: str
    agents: list[str]

    def to_dict(self) -> dict[str, Any]:
        return {
            "repository": self.repository,
            "pull_request": self.pull_request,
            "findings": [asdict(finding) for finding in self.findings],
            "blocked_actions": self.blocked_actions,
            "trace_root": self.trace_root,
            "audit_root": self.audit_root,
            "agents": self.agents,
        }


class _Agent:
    name = "agent"
    capability = ActionCapability.READ

    def inspect(self, request: ReviewRequest) -> list[AgentFinding]:
        return []


class SecurityAgent(_Agent):
    name = "security"

    def inspect(self, request: ReviewRequest) -> list[AgentFinding]:
        findings: list[AgentFinding] = []
        lowered = request.diff_summary.lower()
        if any(token in lowered for token in ("secret=", "api_key", "password=")):
            findings.append(
                AgentFinding(
                    self.name,
                    "high",
                    "Potential secret material",
                    "The deterministic security pass found a credential-like token in the diff summary.",
                )
            )
        return findings


class DependencyAgent(_Agent):
    name = "dependency"

    def inspect(self, request: ReviewRequest) -> list[AgentFinding]:
        return [
            AgentFinding(
                self.name,
                "info",
                "Dependency review completed",
                "Changed dependency declarations were inspected by the deterministic review adapter.",
                list(request.dependency_changes),
            )
        ] if request.dependency_changes else []


class CodeQualityAgent(_Agent):
    name = "code-quality"

    def inspect(self, request: ReviewRequest) -> list[AgentFinding]:
        generated = [path for path in request.changed_files if path.endswith(".py")]
        if not generated:
            return []
        return [
            AgentFinding(
                self.name,
                "info",
                "Python changes identified",
                "Python files are routed through the quality stage before report synthesis.",
                generated,
            )
        ]


class TestAgent(_Agent):
    name = "test"

    def inspect(self, request: ReviewRequest) -> list[AgentFinding]:
        failed = [item for item in request.test_results if item.lower().startswith("fail")]
        if failed:
            return [
                AgentFinding(
                    self.name,
                    "high",
                    "Tests reported failures",
                    "The supplied test evidence contains failing checks.",
                    failed,
                )
            ]
        return []


class RiskFeedbackAgent(_Agent):
    name = "risk-feedback"

    def inspect(self, request: ReviewRequest) -> list[AgentFinding]:
        return [
            AgentFinding(
                self.name,
                "info",
                "Review synthesis completed",
                "The feedback stage consolidates deterministic findings and policy decisions.",
            )
        ]


class ReviewOrchestrator:
    """Run security-aware specialist agents behind an AgentTrace policy gate."""

    AGENT_NAMES = [
        "security",
        "dependency",
        "code-quality",
        "test",
        "risk-feedback",
    ]

    def __init__(self) -> None:
        self.lab = EvaluationLab()
        self.agents = [
            SecurityAgent(),
            DependencyAgent(),
            CodeQualityAgent(),
            TestAgent(),
            RiskFeedbackAgent(),
        ]
        self._read_tool = ToolManifest(
            name="review.read_context",
            schema={"type": "object", "properties": {"repository": {"type": "string"}}},
            capabilities=(ActionCapability.READ,),
        )
        self._write_tool = ToolManifest(
            name="review.write_pr_comment",
            schema={"type": "object", "properties": {"comment": {"type": "string"}}},
            capabilities=(ActionCapability.WRITE,),
        )
        self.lab.registry.register(self._read_tool)
        self.lab.registry.register(self._write_tool)

    def _authorize_read(self, request: ReviewRequest) -> None:
        self.lab.add_node(
            "review-context",
            TaintLabel.USER_INTENT,
            f"{request.repository}#{request.pull_request}",
        )
        result = self.lab.evaluate(
            "review:read-context",
            AgentPhase.RETRIEVING,
            ActionCapability.READ,
            ["review-context"],
            self._read_tool,
        )
        if result.decisions[0].decision != Decision.ALLOW:
            raise PermissionError(result.decisions[0].reason)

    def _authorize_write(self, findings: list[AgentFinding]) -> str:
        # Findings are tool-derived data and therefore cannot authorize a
        # privileged external write by themselves.
        self.lab.add_node(
            "review-findings",
            TaintLabel.TOOL_OUTPUT_UNTRUSTED,
            str([asdict(item) for item in findings]),
            parent_ids=("review-context",),
        )
        result = self.lab.evaluate(
            "review:write-pr-comment",
            AgentPhase.EXECUTION,
            ActionCapability.WRITE,
            ["review-findings"],
            self._write_tool,
        )
        return result.decisions[0].reason

    def review(self, request: ReviewRequest) -> ReviewReport:
        self._authorize_read(request)
        findings: list[AgentFinding] = []
        for agent in self.agents:
            findings.extend(agent.inspect(request))

        blocked_reason = self._authorize_write(findings)
        return ReviewReport(
            repository=request.repository,
            pull_request=request.pull_request,
            findings=findings,
            blocked_actions=[f"write_pr_comment: {blocked_reason}"],
            trace_root=self._trace_root(),
            audit_root=self.lab.audit_root(),
            agents=list(self.AGENT_NAMES),
        )

    def _trace_root(self) -> str:
        from agenttrace.audit.audit_log import merkle_root

        leaves = [
            f"{node.node_id}:{node.node_hash}"
            for node in sorted(self.lab.nodes.values(), key=lambda item: item.node_id)
        ]
        return merkle_root(leaves)
