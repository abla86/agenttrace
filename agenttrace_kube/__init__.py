"""Kubernetes extension for AgentTrace."""

from .node import kube_node_probe
from .pod import kube_pod_probe

__all__ = ["kube_node_probe", "kube_pod_probe"]
