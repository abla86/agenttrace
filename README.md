# Complete Agent Security Lab

Unified security platform combining:

- War-Room visual security environment
- PromptGuard detection
- AgentTrace execution tracing
- taint/provenance tracking
- tool integrity verification
- attack simulation
- sandboxed attack scenarios
- evaluation and diagnostics

## Architecture

frontend/
    War-Room visual control environment

security/
    Prompt injection and agent security controls

agenttrace/
    Runtime tracing, evaluation and diagnostics

attacklab/
    Controlled attack simulation

api/
    Integration boundary between UI and security engine

tests/
    Cross-module verification

## Security model

Untrusted data must never automatically acquire authorization
to perform privileged actions.

Security decisions should consider:

1. source
2. taint
3. provenance
4. agent phase
5. requested capability
6. tool integrity
7. policy
8. execution history

Tool manifest hashing provides integrity/drift detection.
It is not treated as a complete tool-poisoning detector.

The War-Room is the visual control surface.
The security engine remains authoritative.
