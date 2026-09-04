# AgentTrace

**A portable tracing, provenance, policy and audit layer for AI-agent systems.**

AgentTrace is a standalone Python library for making security-relevant agent decisions observable, reproducible and auditable.

## What it provides

- **Traceable state** — typed nodes with deterministic content hashes and parent relationships.
- **Provenance / taint** — explicit source labels such as user intent, untrusted RAG, tool output and internal secrets.
- **Policy evaluation** — phase- and capability-aware ALLOW/BLOCK decisions.
- **Tool integrity** — manifest registration and fingerprint/Merkle evidence.
- **Audit evidence** — canonical event digests and reproducible Merkle roots.
- **Bounded simulation** — attack scenarios are inert test data; payloads are not executed.
- **Runtime gateway** — optional local HTTP interception and audit surface.

AgentTrace does not require a dashboard, cloud provider, cluster, or application-specific UI.

## Install

Core:

```bash
pip install agenttrace
```

Optional HTTP tooling:

```bash
pip install "agenttrace[web]"
```

Development:

```bash
pip install "agenttrace[dev]"
pytest -q
ruff check .
```

## Minimal integration

```python
from agenttrace import EvaluationLab, ActionCapability, AgentPhase, TaintLabel

lab = EvaluationLab()

lab.add_node(
    "user-1",
    TaintLabel.USER_INTENT,
    "read the requested record",
)

result = lab.evaluate(
    "example",
    AgentPhase.EXECUTION,
    ActionCapability.READ,
    ["user-1"],
)

print(result.decisions[0].decision)
print(lab.audit_root())
```

For applications that want the explicitly named integration surface:

```python
from agenttrace.api import TraceNode, PolicyEngine, AuditLog
```

## Architecture

```text
Agent / application
        |
        v
 AgentTrace core
 +------+------+------+
 |      |      |      |
Trace  Policy Audit Integrity
 |      |      |      |
 +------+------+------+
        |
  optional extensions
        |
   +----+----+
   |         |
 cloud     other
 adapters  consumers
```

The dependency direction is deliberate:

```text
agenttrace core
      ^
      |
extensions / adapters
      ^
      |
applications
```

The core remains independent from consumer applications and infrastructure providers.

## Azure and other extensions

Cloud- and platform-specific functionality should live in separate extension packages. An Azure extension can depend on AgentTrace and add Azure Resource Manager, Azure Monitor, Application Insights, AKS, identity and related integrations without adding those dependencies to the core package.

## Safety and scope

AgentTrace is an evaluation and observability component, not a universal security guarantee. Detection, lexical similarity, taint labels and integrity fingerprints have explicit limits. Generated attack material is treated as inert simulation data.

The system does not silently rewrite its own source code or deploy production security changes.

## Reproducibility

Security decisions and bounded scenario generation are designed to be reproducible. Hashes use stable canonical representations. Performance claims are not made without benchmark evidence.

## Status

The project is under active development. The public package API is intentionally small; internal modules may evolve without being treated as stable integration points.

## License

MIT
