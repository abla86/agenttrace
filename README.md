# AgentTrace — Adaptive Agent Security Lab

AgentTrace is a local security laboratory and visual operator environment for evaluating AI-agent security workflows.

It unifies:

- PromptGuard detection and containment
- AgentTrace provenance/taint and policy evaluation
- tool capability and integrity verification
- bounded multi-step attack simulation
- controlled mutation/evolution experiments
- audit and trace evidence
- the War-Room visual interface for observing and controlling simulations

## One application

The project has one security model and one event model.

The UI provides multiple modes over the same state:

- **Agent Defense Lab** — evaluation, propagation, taint, drift and defense analysis
- **War-Room** — visual attack/defense arena, worm controls, honeypot views and replay
- **System** — health, diagnostics, audit and controlled autonomy

The War-Room is a presentation/control surface. It does not replace the security engine.

## Architecture

```text
War-Room UI
    |
    v
Security event/state model
    |
    +--> PromptGuard
    +--> provenance / taint
    +--> capability policy
    +--> tool integrity
    +--> intent / behaviour drift
    +--> attack evaluation
    +--> audit / trace
    |
    +--> bounded sandboxed simulation
```

## Safety model

Generated attack material is inert simulation data. The platform does not execute generated attack payloads.

Autonomy is deliberately bounded:

1. generate
2. simulate
3. evaluate
4. propose
5. validate
6. explicitly promote

The system does not silently rewrite its own source code or deploy production security changes.

## Integrity

Tool manifest hashes and Merkle roots provide tamper/drift evidence for registered tool definitions. They do not prove that a tool is semantically safe.

Trace hashing provides reproducible evidence of recorded state. It is not a cryptographic guarantee about the external agent or environment.

## Determinism

Security decisions and bounded scenario generation are designed to be reproducible. Cryptographic hashing uses stable algorithms rather than process-randomized language hashes.

No latency claim is made until it has been measured with a published benchmark methodology.

## Research position

This is an evaluation platform, not a claim that prompt injection or agentic compromise can be universally prevented.

The testable unit is the complete security decision chain:

```text
attack
 -> mutation
 -> source/provenance
 -> taint
 -> intent
 -> phase
 -> requested capability
 -> tool integrity
 -> policy
 -> defense
 -> outcome
 -> trace
 -> visual event
 -> metric
```

Potential evaluation measures include attack-success rate, detection rate, false positives, privileged-action blocks, tool-drift detection, intent/behaviour drift, latency, reproducibility and explanation completeness.

## Development

```powershell
python -m pip install -e ".[dev]"
pytest -q
ruff check .
python -m agenttrace.cli self-test
```

For the runtime gateway:

```powershell
uvicorn agenttrace.runtime.gateway:app --reload
```

The War-Room frontend is located under `agenttrace/web/war-room` after integration.

## Limitations

- lexical and bounded similarity are not general semantic understanding
- no detector guarantees prevention of unknown attacks
- Merkle/fingerprint checks detect integrity changes but not semantic safety
- the visual War-Room is not a production security boundary
- autonomous evolution is controlled experimentation, not self-modifying production software
- the runtime layer is a local policy/audit gateway, not a universal LLM-provider proxy

## License

MIT
