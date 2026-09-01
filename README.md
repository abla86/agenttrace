# AgentTrace

**A portable tracing, provenance, policy and audit layer for AI-agent systems.**

AgentTrace is designed to sit beside an existing agent application and make its security-relevant decisions observable, reproducible and auditable. The core API does not require the War-Room UI.

## What it provides

- **Traceable state** — typed nodes with deterministic content hashes and parent relationships.
- **Provenance / taint** — explicit source labels such as user intent, untrusted RAG, tool output and internal secrets.
- **Policy evaluation** — phase- and capability-aware ALLOW/BLOCK decisions.
- **Tool integrity** — manifest registration and fingerprint/Merkle evidence.
- **Audit evidence** — canonical event digests and reproducible Merkle roots.
- **Bounded simulation** — attack scenarios are inert test data; payloads are not executed.
- **Runtime gateway** — optional local HTTP interception and audit surface.
- **War-Room** — optional visual control and simulation surface built on the same event/state model.

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

For applications that want a lower-level or explicitly named integration surface:

```python
from agenttrace.api import TraceNode, PolicyEngine, AuditLog
```

## Architecture

```text
Existing agent / application
            |
            v
       AgentTrace core
     +------+-------+------+
     |      |       |      |
   Trace  Policy  Audit  Integrity
     |      |       |      |
     +------+-------+------+
            |
       optional adapters
       /       |       \
    HTTP   PromptGuard  War-Room
```

The important boundary is deliberate: **the core does not depend on the War-Room UI**. A consumer can use AgentTrace as a library without running a dashboard or simulator.

## Safety and scope

AgentTrace is an evaluation and observability component, not a universal security guarantee. Detection, lexical similarity, taint labels and integrity fingerprints have explicit limits. Generated attack material is treated as inert simulation data.

The system does not silently rewrite its own source code or deploy production security changes.

## Reproducibility

Security decisions and bounded scenario generation are designed to be reproducible. Hashes use stable canonical representations. Performance claims are not made without benchmark evidence.

## Package design

The intended dependency direction is:

```text
agenttrace core
   ^
   |
adapters / integrations
   ^
   |
applications such as War-Room
```

This keeps the reusable engine independent from presentation.

## Status

The project is under active development. The public package API is intentionally small; internal modules may evolve without being treated as stable integration points.

## License

MIT
