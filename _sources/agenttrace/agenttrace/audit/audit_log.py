import hashlib
import json
from dataclasses import dataclass
from typing import Iterable, List


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


@dataclass(frozen=True)
class AuditEvent:
    sequence: int
    event_type: str
    payload: dict

    def digest(self) -> str:
        canonical = json.dumps(
            {
                "sequence": self.sequence,
                "event_type": self.event_type,
                "payload": self.payload,
            },
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
        ).encode("utf-8")
        return sha256(canonical)


def merkle_root(leaves: Iterable[str]) -> str:
    level: List[str] = list(leaves)

    if not level:
        return sha256(b"")

    while len(level) > 1:
        if len(level) % 2:
            level.append(level[-1])

        next_level = []

        for i in range(0, len(level), 2):
            combined = (level[i] + level[i + 1]).encode("ascii")
            next_level.append(sha256(combined))

        level = next_level

    return level[0]


class AuditLog:
    def __init__(self) -> None:
        self.events: List[AuditEvent] = []

    def append(self, event_type: str, payload: dict) -> AuditEvent:
        event = AuditEvent(
            sequence=len(self.events),
            event_type=event_type,
            payload=payload,
        )
        self.events.append(event)
        return event

    def root(self) -> str:
        return merkle_root(event.digest() for event in self.events)

    def verify_event_count(self, expected: int) -> bool:
        return len(self.events) == expected
