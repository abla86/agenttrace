from __future__ import annotations

import importlib

from .base import AgentTracePlugin


def load_plugin(path: str) -> AgentTracePlugin:
    module_name, class_name = path.rsplit(".", 1)
    plugin_class = getattr(importlib.import_module(module_name), class_name)
    plugin = plugin_class()
    if not isinstance(plugin, AgentTracePlugin):
        raise TypeError(f"{path} is not an AgentTracePlugin")
    return plugin
