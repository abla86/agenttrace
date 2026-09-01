# AgentTrace

Standalone Python primitives for deterministic AI-agent provenance, execution tracing, policy evaluation and security diagnostics.

## Provides
- execution and provenance tracing
- explicit agent states and phases
- policy and capability evaluation
- tool-integrity and drift checks
- bounded reproducible scenarios
- audit logging
- optional PromptGuard components
- CLI and browser demonstrations

AgentTrace is system-agnostic. It contains no application-specific integration and no dependency on War-Room or other private products.

## Quick start
    python -m pip install agenttrace
    agenttrace self-test

## Development
    python -m pip install -e ".[dev]"
    pytest
    ruff check .

## Security boundary
Scenarios and demonstrations are bounded and non-executing. They are intended for defensive testing, validation and observability.
