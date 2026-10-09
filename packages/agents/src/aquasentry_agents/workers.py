"""Specialist workers. Numeric claims come from invariants, not a model."""

from __future__ import annotations

from aquasentry_agents.invariants import (
    corrosivity_index,
    exceeds_threshold,
    statutory_citation,
    to_ppb,
    to_ppt,
)
from aquasentry_agents.spatial import schools_near_lead_lines, vulnerability_score
from aquasentry_agents.state import WaterState
from aquasentry_mcp.catalog import load_system


def _classify(sample: dict, *, trust_utility: bool) -> dict:
    analyte = sample["analyte"]
    value = sample["value"]
    unit = sample["unit"]
    truth = exceeds_threshold(analyte, value, unit)
    if trust_utility:
        exceeds = not bool(sample["utility_says_safe"])
        source = "utility_ccr_average"
    else:
        exceeds = truth
        source = "deterministic_threshold"
    finding = {
        "analyte": analyte,
        "location": sample["location"],
        "reported_value": value,
        "reported_unit": unit,
        "exceeds": exceeds,
        "classification_source": source,
        "citation": statutory_citation(analyte, truth),
        "lat": sample["lat"],
        "lon": sample["lon"],
    }
    if analyte == "lead":
        finding["canonical_ppb"] = to_ppb(value, unit)
    else:
        finding["canonical_ppt"] = to_ppt(value, unit)
    return finding


def sdwis_worker(state: WaterState) -> dict:
    system = load_system(state["pwsid"])
    trust_utility = bool(state.get("stick_to_utility")) or (
        state.get("iteration", 0) == 0 and not state.get("re_evaluation_directive")
    )
    findings = [_classify(sample, trust_utility=trust_utility) for sample in system["samples"]]
    return {
        "active_violations": findings,
        "snapshot_date": system["snapshot_date"],
        "data_source": system["data_source"],
    }


def usgs_worker(state: WaterState) -> dict:
    system = load_system(state["pwsid"])
    hydro = system["hydrology"]
    profile = corrosivity_index(ph=hydro["ph"], alkalinity_mg_l=hydro["alkalinity_mg_l"])
    profile["huc12"] = hydro["huc12"]
    profile["station"] = hydro["station"]
    return {"geochemical_profiles": profile}


def spatial_worker(state: WaterState) -> dict:
    system = load_system(state["pwsid"])
    impacted = schools_near_lead_lines(system["schools"], system["service_lines"])
    return {
        "exposure": {
            "method": "postgis_st_dwithin_stub",
            "buffer_m": 80,
            "impacted_schools": impacted,
            "service_lines": system["service_lines"],
            "vulnerability_score": vulnerability_score(impacted, system["service_lines"]),
        }
    }
