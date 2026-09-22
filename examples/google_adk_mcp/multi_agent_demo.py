"""Runnable deterministic flagship demonstration.

This keeps the CI path free of LLM/network calls while exposing the same
specialist-agent architecture used by the Google ADK adapter.
"""

from agenttrace.agentic import ReviewOrchestrator, ReviewRequest


def main() -> None:
    report = ReviewOrchestrator().review(
        ReviewRequest(
            repository="abla86/agenttrace",
            pull_request=0,
            changed_files=(
                "agenttrace/agentic/orchestrator.py",
                "examples/google_adk_mcp/multi_agent_demo.py",
            ),
            diff_summary="deterministic multi-agent review demonstration",
            dependency_changes=("google-adk>=1.29.0", "mcp>=2,<3"),
            test_results=("PASS: agentic policy tests",),
        )
    )
    print(report.to_dict())


if __name__ == "__main__":
    main()
