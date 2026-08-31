# AgentTrace — Adaptive Agent Security Lab

AgentTrace is a local security laboratory for evaluating controls around AI-agent workflows. It combines bounded attack simulation, provenance/taint tracking, capability policy decisions, tool-manifest integrity checks, auditable traces and an interactive browser visualization.

## What it actually provides

- deterministic, bounded attack-scenario generation; generated payloads are inert and never executed
- taint-aware policy evaluation for user, RAG, tool-output, trusted and secret data
- phase/capability authorization
- tool-manifest fingerprinting and Merkle-root integrity verification
- multi-step evaluation with tamper-evident trace roots
- JSONL-style in-memory audit events with Merkle aggregation
- local CLI and self-test
- dependency-free browser visualization with worm controls, defense state, graph movement and event telemetry
- reproducible regression tests

## Architecture

```
agenttrace/
  evaluation/     trace models and evaluation lab
  policy/         capability policy + tool integrity
  scenarios.py    bounded attack generation/mutation
  audit/          event digests and Merkle aggregation
  runtime/        Starlette gateway for policy interception
  web/            standalone interactive visualization
  cli.py          command-line interface
promptguard/
  core/           lexical normalization, containment and bounded detection
tests/
docs/
```

The `promptguard` package is a detection/containment component. AgentTrace is the broader evaluation and policy laboratory.

## Security model

The policy layer makes explicit decisions using trust/taint labels, agent phases, requested capabilities, source provenance and registered tool manifests.

Examples:

- RAG- or tool-output-tainted data cannot authorize WRITE or NETWORK actions.
- INTERNAL_SECRET cannot flow to NETWORK.
- WRITE and NETWORK are denied before EXECUTION.
- A tool with an unknown or changed manifest is denied when integrity verification is requested.
- Trace and tool Merkle roots make changes detectable; they do **not** prove that content or a tool is semantically safe.

## Adaptive laboratory

Attack generation is intentionally bounded. Mutations are test cases, not executable malware. The lab can compare:

```
attack variant
    -> provenance / taint
    -> requested capability
    -> policy decision
    -> defense outcome
    -> trace evidence
```

The browser UI visualizes this chain as a controlled simulation. It does not provide a production browser security boundary and does not execute generated attack payloads.

## Determinism

The lexical detector uses stable cryptographic hashing rather than Python's process-randomized `hash()`. Scenario generation uses an explicit seed. The project therefore supports reproducible evaluation across processes.

No performance target such as "<2 ms per request" is claimed without a benchmark on a defined hardware/software environment.

## Run

```powershell
python -m agenttrace.cli self-test
python -m agenttrace.cli demo --json
python -m unittest discover -s tests -p "test_*.py" -v
```

Open `agenttrace/web/index.html` directly for the standalone visual lab.

For the optional runtime gateway:

```powershell
pip install -e .
uvicorn agenttrace.runtime.gateway:app --reload
```

## Limitations

- lexical and bounded semantic similarity are not equivalent to general semantic understanding
- no detector can guarantee elimination of prompt injection or unknown attacks
- Merkle/fingerprint checks detect integrity drift but do not establish semantic safety
- the visual lab is a controlled simulation, not a production security boundary
- "learning" means bounded mutation, evaluation and evidence collection; it does not rewrite its own source code
- autonomous policy changes are not applied silently; proposed changes should be validated before promotion
- the runtime gateway currently provides policy interception and audit persistence, not a full reverse proxy for every LLM provider

## Research/evaluation position

The project is positioned as an evaluation platform rather than a claim of a new universal detector. Its testable unit is the security decision chain across provenance, capability, phase, tool integrity and outcome. That makes experiments reproducible without requiring a stochastic model inside the security decision itself.

## License

See LICENSE.
