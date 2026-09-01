import unittest

from agenttrace.evaluation.models import ActionCapability, ToolManifest
from agenttrace.policy.merkle_registry import MerkleToolRegistry


class MerkleToolRegistryTests(unittest.TestCase):
    def test_manifest_capability_change_changes_root(self):
        registry = MerkleToolRegistry()
        original = ToolManifest(
            "docs",
            {"query": "string"},
            (ActionCapability.READ,),
        )
        changed = ToolManifest(
            "docs",
            {"query": "string"},
            (ActionCapability.READ, ActionCapability.WRITE),
        )
        registry.register(original)
        self.assertFalse(registry.verify([changed]))

    def test_same_snapshot_verifies(self):
        registry = MerkleToolRegistry()
        tool = ToolManifest(
            "docs",
            {"query": "string"},
            (ActionCapability.READ,),
        )
        registry.register(tool)
        self.assertTrue(registry.verify([tool]))
