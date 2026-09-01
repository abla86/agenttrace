# AgentTrace extensions

Azure and Kubernetes probes implemented against the standalone core contract on cleanup/standalone-core.

The probes register their ToolManifest before calling PolicyEngine.evaluate; this is required by the core ToolManifestRegistry.

Validation targets:
- pytest
- ruff check .
- mypy agenttrace_azure agenttrace_kube
- python -m compileall agenttrace agenttrace_azure agenttrace_kube tests
