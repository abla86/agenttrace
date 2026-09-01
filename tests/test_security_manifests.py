from pathlib import Path

import yaml


SECURITY_DIR = Path(__file__).parents[1] / "security"


def _documents():
    for path in sorted(SECURITY_DIR.glob("*.yaml")):
        with path.open(encoding="utf-8") as handle:
            for document in yaml.safe_load_all(handle):
                if document:
                    yield path.name, document


def _by_kind(kind):
    return [(name, doc) for name, doc in _documents() if doc.get("kind") == kind]


def test_security_manifests_have_no_deprecated_pod_security_policy():
    assert not _by_kind("PodSecurityPolicy")


def test_namespace_enforces_restricted_pod_security():
    namespaces = _by_kind("Namespace")
    agenttrace = next(doc for _, doc in namespaces if doc["metadata"]["name"] == "agenttrace")
    labels = agenttrace["metadata"]["labels"]
    assert labels["pod-security.kubernetes.io/enforce"] == "restricted"


def test_policy_server_uses_restricted_runtime_security_context():
    deployments = _by_kind("Deployment")
    policy = next(
        doc
        for _, doc in deployments
        if doc["metadata"]["name"] == "agenttrace-policy-server"
    )
    pod = policy["spec"]["template"]
    assert pod["spec"]["securityContext"]["runAsNonRoot"] is True
    assert pod["spec"]["securityContext"]["seccompProfile"]["type"] == "RuntimeDefault"

    container = pod["spec"]["containers"][0]
    security = container["securityContext"]
    assert security["allowPrivilegeEscalation"] is False
    assert security["readOnlyRootFilesystem"] is True
    assert security["capabilities"]["drop"] == ["ALL"]


def test_policy_server_has_default_deny_and_explicit_ingress():
    policies = _by_kind("NetworkPolicy")
    names = {doc["metadata"]["name"] for _, doc in policies}
    assert "agenttrace-default-deny" in names
    policy = next(doc for _, doc in policies if doc["metadata"]["name"] == "agenttrace-policy-server")
    assert policy["spec"]["podSelector"]["matchLabels"]["app"] == "agenttrace-policy-server"
    assert policy["spec"]["policyTypes"] == ["Ingress", "Egress"]

    ingress = policy["spec"]["ingress"]
    assert any(
        rule.get("from")
        and any(
            item.get("podSelector", {}).get("matchLabels", {}).get("app")
            == "agenttrace-dashboard"
            for item in rule["from"]
        )
        and any(port.get("port") == 8000 for port in rule.get("ports", []))
        for rule in ingress
    )


def test_policy_server_has_no_kubernetes_api_rbac_permissions():
    roles = _by_kind("Role")
    policy_roles = [
        doc for _, doc in roles if doc["metadata"]["name"] == "policy-server-role"
    ]
    assert policy_roles == []
