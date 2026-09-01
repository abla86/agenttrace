from __future__ import annotations

from typing import Any

from .proposals import EnrichedProposal, ProposalEngine


def to_proposal_view(item: EnrichedProposal) -> dict[str, Any]:
    """Expose proposal metadata for rendering without promotion capability."""
    data = ProposalEngine.as_dict(item)
    data["state"] = (
        "PROMOTED" if item.proposal.approved else "VALIDATED" if item.proposal.validated else "PROPOSED"
    )
    data["can_promote"] = bool(item.proposal.validated and item.proposal.approved)
    return data
