"""Azure integration helpers for AgentTrace."""
from .monitor import azure_monitor_probe
from .resource import azure_resource_probe

__all__ = ["azure_monitor_probe", "azure_resource_probe"]
