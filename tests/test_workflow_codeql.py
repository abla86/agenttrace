from pathlib import Path


def test_codeql_checkout_has_single_with_block():
    workflow = Path(__file__).resolve().parents[1] / ".github" / "workflows" / "codeql.yml"
    lines = workflow.read_text(encoding="utf-8").splitlines()

    step_start = next(i for i, line in enumerate(lines) if line.strip() == "- name: Checkout")
    step_lines: list[str] = []
    for line in lines[step_start + 1 :]:
        if line.startswith("      - ") and line.strip() != "- name: Checkout":
            break
        step_lines.append(line.strip())

    assert step_lines.count("with:") == 1
    assert "persist-credentials: false" in step_lines
