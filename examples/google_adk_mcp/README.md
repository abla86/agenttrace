# Google ADK + MCP + AgentTrace

This example turns the existing **AgentTrace** security core into a concrete
Google ADK / MCP integration.

## Architecture

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

Google ADK supports multi-agent systems and MCP toolsets, while MCP provides a
standardized tool boundary between an agent host and external capabilities.
AgentTrace supplies the application-specific policy, provenance and audit
layer around that boundary.

## Run locally

Terminal 1:

```bash
pip install -e ".[dev]"
pip install "mcp>=2,<3"
python examples/google_adk_mcp/policy_server.py
```

Terminal 2:

```bash
pip install "google-adk>=1.29.0"
python examples/google_adk_mcp/adk_agent.py
```

The ADK file defines the agent/toolset. The MCP gateway is the component that
must make the authorization decision before a tool side effect is allowed.

## Security demonstration

A normal read uses `USER_INTENT` and can be allowed.

A write attributed to `RAG_UNTRUSTED` or `TOOL_OUTPUT_UNTRUSTED` is blocked by
the existing AgentTrace policy because untrusted data cannot authorize a
privileged action.

The example is deliberately synthetic. It does not connect to GitHub, Google
Cloud resources, clinical systems, or production databases.

## Why this belongs in the portfolio

This is the applied bridge between the Google Cloud learning badges and an
existing engineering artifact:

- **Introduction to Security Principles in Cloud Computing** -> explicit
  policy boundary and least-privilege-style capability checks.
- **Strategies for Cloud Security Risk Management** -> provenance and auditable
  risk decisions.
- **Secure Enterprise AI Agents** -> controlled tool access and audit evidence.
- **AI Boost Bites: Your Personal Feedback Agent** -> structured agent/tool
  feedback.
- **Build Collaborative Multi-Agent Systems with ADK & MCP** -> ADK agent,
  MCP toolset and interoperable tool boundary.

The badges are training evidence. The repository code is the applied evidence.

## Verification

The repository's normal test suite remains the source of truth for AgentTrace.
This example should be added to CI once the optional ADK/MCP dependencies are
available in the runner.

Do not describe this example as production-ready merely because the demo runs.
Production deployment would additionally require authenticated identities,
secret management, network controls, observability and deployment-specific
security testing.
