# AgentTrace — Adaptive Agent Security Lab

AgentTrace is a local, deterministic security laboratory for evaluating AI-agent security controls.

## What it actually provides

- deterministic attack-scenario generation and bounded mutation
- taint-aware policy evaluation for user, RAG, secret and trusted data
- tool-manifest integrity checking with Merkle roots
- phase/capability authorization
- multi-step attack traces and attack-success metrics
- drift detection over observed agent behaviour
- JSONL audit traces
- local CLI
- dependency-free browser dashboard for attack graphs, heatmaps and defense events
- reproducible regression tests

The laboratory is deliberately separated from production agent execution. It simulates agent decisions and policy enforcement; it does not execute arbitrary generated attack payloads.

## Architecture

```
agenttrace/
  core.py          deterministic security engine
  scenarios.py     bounded attack mutation and scenario generation
  cli.py           command-line interface
  web/             dependency-free visual dashboard
tests/
docs/
```

## Security model

The engine uses explicit trust labels, capabilities, agent phases and tool manifests. Untrusted RAG content cannot authorize privileged writes or network operations, secrets cannot flow to the network, and tool-manifest drift invalidates authorization.

Merkle roots provide tamper-evident integrity over a registered tool set. They are an integrity mechanism, not proof that a tool is safe.

## Research/evaluation position

This project is an evaluation and experimentation platform, not a claim that prompt injection can be eliminated. OWASP identifies prompt injection, data/model poisoning, excessive agency, vector/embedding weaknesses and related risks as active GenAI security problems. NIST has specifically highlighted the need to measure agent-hijacking risk. The project's contribution is the combination of deterministic traceability, bounded adaptive mutation, taint/capability policy decisions, tool-integrity evidence and visual explanation in one local reproducible lab.

## Run

```powershell
python -m agenttrace.cli self-test
python -m agenttrace.cli demo --json
python -m unittest discover -s tests -p "test_*.py" -v
```

For the dashboard, open `agenttrace/web/index.html` in a browser and load the JSON produced by the CLI.

## Limitations

- The detector is rule/policy based and does not understand arbitrary natural-language attacks.
- Hashing and Merkle roots detect integrity drift; they do not establish semantic safety.
- The dashboard is a visualisation layer, not a browser security boundary.
- "Learning" is bounded scenario mutation and evidence collection, not autonomous modification of its own source code.
- No security control is represented as a guarantee against prompt injection.

## License

See LICENSE.
