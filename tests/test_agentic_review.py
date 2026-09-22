from agenttrace.agentic import ReviewOrchestrator, ReviewRequest


def test_multi_agent_review_produces_auditable_report():
    report = ReviewOrchestrator().review(
        ReviewRequest(
            repository="abla86/agenttrace",
            pull_request=99,
            changed_files=("agenttrace/agentic/orchestrator.py",),
            diff_summary="adds deterministic review orchestration",
            dependency_changes=("google-adk>=1.29.0",),
            test_results=("PASS: deterministic suite",),
        )
    )

    assert report.agents == [
        "security",
        "dependency",
        "code-quality",
        "test",
        "risk-feedback",
    ]
    assert report.trace_root
    assert report.audit_root
    assert any(item.agent == "dependency" for item in report.findings)
    assert any("write_pr_comment" in item for item in report.blocked_actions)


def test_untrusted_findings_cannot_authorize_write():
    report = ReviewOrchestrator().review(
        ReviewRequest(
            repository="example/repo",
            pull_request=1,
            changed_files=(),
            diff_summary="normal change",
        )
    )

    assert "UNTRUSTED" in report.blocked_actions[0].upper()
