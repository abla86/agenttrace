from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from agenttrace.evaluation.models import TraceNode


@dataclass(frozen=True)
class RequestContext:
    request_id: str
    source_ids: tuple[str, ...]

    @classmethod
    def create(cls, request_id: str, source_ids: Iterable[str]) -> "RequestContext":
        normalized = tuple(str(value) for value in source_ids)
        if not request_id.strip():
            raise ValueError("REQUEST_ID_REQUIRED")
        if not normalized:
            raise ValueError("SOURCE_ID_REQUIRED")
        return cls(request_id=request_id, source_ids=normalized)


def ensure_parents_exist(nodes: dict[str, TraceNode], parent_ids: Iterable[str]) -> None:
    missing = [parent_id for parent_id in parent_ids if parent_id not in nodes]
    if missing:
        raise ValueError(f"UNKNOWN_PARENT_NODES:{','.join(missing[:10])}")
