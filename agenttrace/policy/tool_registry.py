from __future__ import annotations

import hashlib
import json
from typing import Dict

from agenttrace.evaluation.models import ActionCapability, ToolManifest


class ToolManifestRegistry:
    """Deterministic registry for tool-manifest integrity."""

    def __init__(self) -> None:
        self._manifests: Dict[str, str] = {}

    @staticmethod
    def _canonical(manifest: ToolManifest) -> bytes:
        data = {
            "name": manifest.name,
            "schema": manifest.schema,
            "capabilities": sorted(c.value for c in manifest.capabilities),
            "version": manifest.version,
        }
        return json.dumps(
            data,
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
        ).encode("utf-8")

    @classmethod
    def fingerprint(cls, manifest: ToolManifest) -> str:
        return hashlib.sha256(cls._canonical(manifest)).hexdigest()

    def register(self, manifest: ToolManifest) -> str:
        digest = self.fingerprint(manifest)
        self._manifests[manifest.name] = digest
        return digest

    def verify(self, manifest: ToolManifest) -> bool:
        expected = self._manifests.get(manifest.name)
        return expected is not None and expected == self.fingerprint(manifest)

    def get_fingerprint(self, tool_name: str) -> str | None:
        return self._manifests.get(tool_name)

    # Compatibility helpers for the original evaluation-lab API.
    def register_tool(
        self,
        tool_name: str,
        schema: dict,
        capabilities: list[ActionCapability],
        version: str = "1",
    ) -> str:
        return self.register(
            ToolManifest(
                name=tool_name,
                schema=schema,
                capabilities=tuple(capabilities),
                version=version,
            )
        )

    def verify_tool_integrity(
        self,
        tool_name: str,
        current_schema: dict,
        current_caps: list[ActionCapability],
        version: str = "1",
    ) -> bool:
        return self.verify(
            ToolManifest(
                name=tool_name,
                schema=current_schema,
                capabilities=tuple(current_caps),
                version=version,
            )
        )
