"""Statutory unit and threshold invariants."""

import pytest

from aquasentry_agents.invariants import (
    corrosivity_index,
    exceeds_threshold,
    lead_exceeds_action_level,
    pfas_exceeds_mcl,
    to_ppb,
    to_ppt,
)
from aquasentry_agents.spatial import schools_near_lead_lines


def test_lead_at_15_ppb_is_a_violation() -> None:
    assert lead_exceeds_action_level(15, "ppb") is True


def test_lead_just_under_action_level_is_not_a_violation() -> None:
    assert lead_exceeds_action_level(14.9, "ppb") is False


def test_lead_micrograms_per_litre_match_ppb() -> None:
    assert to_ppb(15, "ug/L") == 15
    assert lead_exceeds_action_level(0.015, "ppm") is True


def test_fifteen_ppb_lead_is_fifteen_thousand_ppt() -> None:
    assert to_ppt(15, "ppb") == 15_000


def test_pfoa_above_four_ppt_exceeds_mcl() -> None:
    assert pfas_exceeds_mcl("PFOA", 4.01, "ppt") is True


def test_pfos_exactly_at_mcl_does_not_exceed() -> None:
    assert pfas_exceeds_mcl("PFOS", 4.0, "ppt") is False


def test_unknown_unit_is_rejected() -> None:
    with pytest.raises(ValueError, match="unsupported unit"):
        exceeds_threshold("lead", 1, "cups")


def test_corrosive_water_requires_low_ph_and_alkalinity() -> None:
    assert corrosivity_index(ph=6.6, alkalinity_mg_l=28)["corrosive"] is True
    assert corrosivity_index(ph=7.8, alkalinity_mg_l=28)["corrosive"] is False


def test_school_within_buffer_of_a_lead_line_is_listed() -> None:
    schools = [{"name": "Louise A. Spencer School", "lat": 40.7246, "lon": -74.1728}]
    lines = [
        {"id": "LSL-1842", "material": "lead", "lat": 40.72455, "lon": -74.17285},
        {"id": "CSL-2201", "material": "copper", "lat": 40.7482, "lon": -74.171},
    ]
    hits = schools_near_lead_lines(schools, lines, buffer_m=80)
    assert [hit["service_line_id"] for hit in hits] == ["LSL-1842"]
    assert hits[0]["method"] == "postgis_st_dwithin_stub"
