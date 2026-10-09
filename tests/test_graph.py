"""Evaluator loop: utility CCR averages are rejected, then recomputed."""

import pytest

from aquasentry_agents.graph import build_graph


def _request(**overrides: object) -> dict:
    payload = {
        "address": "81 Congress St, Newark, NJ",
        "pwsid": "NJ0714001",
        "iteration": 0,
        "stick_to_utility": False,
        "status": "pending",
        "re_evaluation_directive": "",
        "rejection_vector": [],
        "audit_trail": [],
    }
    payload.update(overrides)
    return payload


@pytest.mark.asyncio
async def test_evaluator_rejects_ccr_average_then_certifies_lead() -> None:
    graph = build_graph()
    result = await graph.ainvoke(_request())

    assert result["status"] == "certified"
    assert result["iteration"] == 1
    assert result["audit_trail"][0]["result"] == "rejected"
    assert any("lead" in item and "exceeds=False" in item for item in result["rejection_vector"])

    lead = next(item for item in result["certified_docket"]["findings"] if item["analyte"] == "lead")
    assert lead["exceeds"] is True
    assert lead["canonical_ppb"] == 15
    assert lead["classification_source"] == "deterministic_threshold"
    assert "40 CFR 141.85" in result["certified_docket"]["petition"]
    assert result["exposure"]["method"] == "postgis_st_dwithin_stub"
    assert result["geochemical_profiles"]["corrosive"] is True
    school_names = [item["school"] for item in result["exposure"]["impacted_schools"]]
    assert school_names == ["Louise A. Spencer School"]


@pytest.mark.asyncio
async def test_three_failed_passes_exit_to_human_review() -> None:
    graph = build_graph()
    result = await graph.ainvoke(_request(stick_to_utility=True))

    assert result["status"] == "human_review"
    assert result["iteration"] == 3
    assert result["certified_docket"] is None
    assert sum(1 for step in result["audit_trail"] if step["result"] == "rejected") == 2
    assert any(step["result"] == "human_review" for step in result["audit_trail"])
