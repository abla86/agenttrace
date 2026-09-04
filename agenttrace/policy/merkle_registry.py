from __future__ import annotations

import hashlib
import json
from typing import Iterable

from agenttrace.evaluation.models import ToolManifest


class MerkleToolRegistry:
    """Tamper-evident snapshot of registered tool manifests."""

    def __init__(self):
        self._manifests: dict[str, ToolManifest] = {}
        self._root = self._compute_root(())

    @staticmethod
    def _leaf(manifest: ToolManifest) -> str:
        data = {
            "name": manifest.name,
            "schema": manifest.schema,
            "capabilities": sorted(c.value for c in manifest.capabilities),
            "version": manifest.version,
        }
        return hashlib.sha256(
            json.dumps(data, sort_keys=True, separators=(",", ":")).encode()
        ).hexdigest()

    @classmethod
    def _compute_root(cls, manifests: Iterable[ToolManifest]) -> str:
        level = [
            hashlib.sha256(f"{m.name}:{cls._leaf(m)}".encode()).hexdigest()
            for m in sorted(manifests, key=lambda x: x.name)
        ]
        if not level:
            return hashlib.sha256(b"").hexdigest()
        while len(level) > 1:
            if len(level) % 2:
                level.append(level[-1])
            level = [
                hashlib.sha256((level[i] + level[i + 1]).encode()).hexdigest()
                for i in range(0, len(level), 2)
            ]
        return level[0]

    def register(self, manifest: ToolManifest) -> str:
        self._manifests[manifest.name] = manifest
        self._root = self._compute_root(self._manifests.values())
        return self._root

    @property
    def root(self) -> str:
        return self._root

    def verify(self, observed: Iterable[ToolManifest]) -> bool:
        return self._compute_root(observed) == self._root
