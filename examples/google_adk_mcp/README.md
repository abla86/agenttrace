# Google ADK + MCP + AgentTrace

This example is the applied flagship for the Google Cloud agent-security
learning evidence. It combines a deterministic specialist-agent pipeline with
an optional Google ADK/MCP runtime boundary.

## Architecture

Review request / PR diff
        |
        v
ADK Orchestrator / Host
        |
        +--> Security Agent
        +--> Dependency Agent
        +--> Code Quality Agent
        +--> Test Agent
        +--> Risk / Feedback Agent
        |
        v
MCP tool boundary
        |
        v
AgentTrace policy gate
        |
        +--> Trace
        +--> Audit
        |
        v
Structured PR review

The deterministic implementation lives in agenttrace/agentic/. It is the
CI-safe reference implementation: no LLM calls, credentials, GitHub writes or
network access are required.

The Google ADK adapter remains in adk_agent.py. The MCP gateway in
policy_server.py is the tool boundary. Specialist-agent output is treated as
untrusted tool output and cannot, by itself, authorize a privileged write.

## Run the deterministic flagship

From the repository root:

    pip install -e ".[dev,google-adk-mcp]"
    python examples/google_adk_mcp/multi_agent_demo.py
    pytest -q tests/test_agentic_review.py

The report contains the participating agents, findings, blocked write action,
trace root and audit root.

## Google ADK / MCP runtime

The optional ADK client uses McpToolset with Streamable HTTP. Start the local
gateway:

    python examples/google_adk_mcp/policy_server.py

Then load the ADK agent in an ADK-compatible runner after configuring the
credentials required by that environment.

No production systems are contacted by the example.

## Badge-to-engineering evidence

| Learning evidence | Repository evidence |
|---|---|
| Introduction to Security Principles in Cloud Computing | capability-aware policy boundary and provenance controls |
| Strategies for Cloud Security Risk Management | auditable decisions, trace root and audit root |
| Secure Enterprise AI Agents | specialist agents behind a policy gate; untrusted tool output cannot authorize writes |
| AI Boost Bites: Your Personal Feedback Agent | structured feedback/report synthesis stage |
| Build Collaborative Multi-Agent Systems with ADK & MCP | specialist-agent architecture plus ADK/MCP interoperability |

These are completion badges/training evidence, not professional Google Cloud
certifications. The repository implementation is the applied engineering
evidence.

## Verification boundary

The deterministic tests are the source of truth for the flagship security
logic. The optional ADK/MCP runtime is intentionally separate because it
requires external SDK/runtime configuration. A passing deterministic test does
not prove production deployment security.

Production deployment would additionally require authenticated identities,
secret management, network controls, observability, rate limits, deployment
isolation and deployment-specific security testing.
