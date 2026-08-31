import hashlib
import json
from typing import Dict, Tuple

from agenttrace.evaluation.models import (
    ActionCapability,
    ToolManifest,
)


class ToolManifestRegistry:
    """
    Deterministic tool-integrity registry.

    This is intentionally called a manifest integrity registry,
    not a Merkle tree. A Merkle tree is implemented separately
    by the audit subsystem.
    """

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
