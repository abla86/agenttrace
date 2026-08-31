# AgentTrace — Adaptive Agent Security Lab

A local deterministic security laboratory for evaluating AI-agent security controls. It combines bounded adaptive attack scenarios, taint-aware authorization, tool-manifest integrity, reproducible traces and a dependency-free visual dashboard. Generated payloads are never executed.

## Run

`python -m agenttrace.cli self-test`

`python -m agenttrace.cli demo --json`

`python -m unittest discover -s tests -p "test_*.py" -v`

## Research position
OWASP identifies prompt injection, data/model poisoning, excessive agency and vector/embedding weaknesses as active GenAI security risks. NIST highlights agent hijacking and measurable evaluation. AgentTrace does not claim to eliminate prompt injection; it provides a reproducible laboratory for testing combined controls.

See `docs/RESEARCH-AND-SCOPE.md` for scope and limitations.
