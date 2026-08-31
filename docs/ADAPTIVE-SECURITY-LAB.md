# Adaptive Agent Security Lab

## Purpose
This module extends the existing AgentTrace policy/evaluation implementation with a bounded attack-generation layer and a visualisation surface.

## Safety boundary
Generated scenarios are inert test data. The laboratory does not execute generated code, invoke network destinations from payloads, mutate its own source code, or autonomously deploy changes.

## Evaluation model
The lab records attack type, mutation family, agent phase, capability, taint and policy decision. This enables repeatable comparisons of control configurations.

## Research hypothesis
A combined trace of provenance/taint, capability policy and bounded adaptive scenario mutation may improve reproducibility and explanation of agent-security evaluations. This is a hypothesis requiring empirical comparison against baselines.

## Metrics
Attack success rate, benign false-positive rate, blocked privileged actions, mutation coverage, detection latency, reproducibility and explanation completeness.
