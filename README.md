# AgentTrace

**A portable tracing, provenance, policy and audit layer for AI-agent systems.**

AgentTrace is designed to sit beside an existing agent application and make its security-relevant decisions observable, reproducible and auditable. The core API does not require the War-Room UI.

## What it provides

- **Traceable state** — typed nodes with deterministic content hashes and parent relationships.
- **Provenance / taint** — explicit source labels such as user intent, untrusted RAG, tool output and internal secrets.
- **Policy evaluation** — phase- and capability-aware ALLOW/BLOCK decisions.
- **Tool integrity** — manifest registration and fingerprint/Merkle evidence.
- **Bounded simulation** — attack scenarios are inert test data; payloads are not executed.
- **Runtime gateway** — optional local HTTP interception and audit surface.
- **War-Room** — optional visual control and simulation surface built on the same event/state model.
- **Google ADK + MCP integration example** — an applied interoperability boundary that puts AgentTrace policy and audit controls around MCP tools consumed by a Google ADK agent.

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

Google ADK + MCP example:

```bash
pip install "agenttrace[google-adk-mcp]"
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

## Google ADK + MCP applied integration

The repository now contains a concrete integration under:

`examples/google_adk_mcp/`

```text
Google ADK agent
      |
      | McpToolset / Streamable HTTP
      v
MCP policy gateway
      |
      v
AgentTrace
  |       |       |
Trace   Policy   Audit
```

The ADK agent discovers the MCP tools through `McpToolset`. The MCP gateway
does not execute a privileged operation until AgentTrace has evaluated the
tool manifest, capability and provenance. The example uses synthetic data and
does not contact external systems.

Run the gateway:

```bash
python examples/google_adk_mcp/policy_server.py
```

The ADK client is defined in:

```
examples/google_adk_mcp/adk_agent.py
```

This example is intentionally an adapter rather than a fork of the core. The
AgentTrace package remains usable without Google ADK or MCP.

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
       /       |        \
    MCP     HTTP    PromptGuard
     |
 Google ADK / other MCP hosts
```

The important boundary is deliberate: **the core does not depend on the War-Room UI or Google ADK**. ADK/MCP support is an optional interoperability layer.

## Safety and scope

AgentTrace is an evaluation and observability component, not a universal security guarantee. Detection, lexical similarity, taint labels and integrity fingerprints have explicit limits. Generated attack material is treated as inert simulation data.

The system does not silently rewrite its own source code or deploy production security changes.

The Google ADK/MCP example is a local synthetic demonstration. Production use would require authenticated identities, secret management, network controls, observability and deployment-specific security testing.

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
applications such as War-Room or ADK agents
```

This keeps the reusable engine independent from presentation and vendor-specific agent runtimes.

## Status

The project is under active development. The public package API is intentionally small; internal modules may evolve without being treated as stable integration points.

## License

MIT

## Safety and verification

AgentTrace is deterministic by design. Public demonstrations should use synthetic traces and must not imply that external tools, systems, or production agents were contacted.
