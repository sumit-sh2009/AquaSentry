"""Deterministic toxicological gate. This node never calls a model."""

from __future__ import annotations

from aquasentry_agents.invariants import exceeds_threshold, to_ppb, to_ppt
from aquasentry_agents.state import WaterState

MAX_ATTEMPTS = 3
DIRECTIVE = (
    "Recompute every analyte after unit conversion. Ignore utility CCR averages. "
    "Lead at or above 15 ppb violates the Lead and Copper Rule action level. "
    "PFOA and PFOS above 4.0 ppt violate the MCL. "
    "Spatial claims must be buffer intersections, not interpolated plumes."
)


def _finding_errors(finding: dict) -> list[str]:
    analyte = finding["analyte"]
    expected = exceeds_threshold(analyte, finding["reported_value"], finding["reported_unit"])
    errors: list[str] = []
    if analyte == "lead":
        canonical = to_ppb(finding["reported_value"], finding["reported_unit"])
        if abs(float(finding["canonical_ppb"]) - canonical) > 1e-6:
            errors.append(f"lead unit conversion drift at {finding['location']}")
    else:
        canonical = to_ppt(finding["reported_value"], finding["reported_unit"])
        if abs(float(finding["canonical_ppt"]) - canonical) > 1e-6:
            errors.append(f"{analyte} unit conversion drift at {finding['location']}")
    if bool(finding["exceeds"]) != expected:
        errors.append(
            f"{analyte} at {finding['location']}: worker marked exceeds={finding['exceeds']} "
            f"via {finding['classification_source']}; statutory comparison requires exceeds={expected}"
        )
    return errors


def evaluate_state(state: WaterState) -> list[str]:
    errors: list[str] = []
    for finding in state.get("active_violations") or []:
        errors.extend(_finding_errors(finding))
    exposure = state.get("exposure") or {}
    if exposure.get("method") not in {None, "postgis_st_dwithin_stub"}:
        errors.append("spatial method must be a PostGIS buffer, not a model interpolation")
    for school in exposure.get("impacted_schools") or []:
        if school.get("method") == "llm_interpolation":
            errors.append(f"llm interpolation forbidden for {school.get('school')}")
    return errors


def _petition(state: WaterState, findings: list[dict]) -> str:
    violations = [item for item in findings if item["exceeds"]]
    lines = [
        "Citizen notification under 40 CFR 141.85",
        f"Public water system: {state['pwsid']}",
        f"Service address: {state['address']}",
        f"Snapshot date: {state.get('snapshot_date', 'unknown')} ({state.get('data_source', 'snapshot')})",
        "",
        "The following results were recomputed from reported values. "
        "Regional CCR averages were not accepted as a safety finding.",
    ]
    if not violations:
        lines.append("No enforceable MCL or lead action-level exceedance was certified in this snapshot.")
    for item in violations:
        quantity = item.get("canonical_ppb", item.get("canonical_ppt"))
        unit = "ppb" if "canonical_ppb" in item else "ppt"
        lines.append(
            f"- {item['analyte']} at {item['location']}: {quantity} {unit}. {item['citation']}."
        )
    profile = state.get("geochemical_profiles") or {}
    if profile.get("corrosive"):
        lines.append(
            f"Finished-water corrosivity index {profile['index']} "
            f"(pH {profile['ph']}, alkalinity {profile['alkalinity_mg_l']} mg/L) "
            "is consistent with conditions that leach lead."
        )
    lines.append("")
    lines.append(
        "Request: sample the named tap, publish the service-line material, "
        "and schedule replacement where the line is lead or unknown."
    )
    return "\n".join(lines)


def evaluator_node(state: WaterState) -> dict:
    errors = evaluate_state(state)
    attempt = int(state.get("iteration", 0))
    if not errors:
        findings = list(state.get("active_violations") or [])
        return {
            "status": "certified",
            "re_evaluation_directive": "",
            "certified_docket": {
                "pwsid": state["pwsid"],
                "address": state["address"],
                "snapshot_date": state.get("snapshot_date"),
                "data_source": state.get("data_source"),
                "findings": findings,
                "geochemical_profiles": state.get("geochemical_profiles"),
                "exposure": state.get("exposure"),
                "petition": _petition(state, findings),
            },
            "audit_trail": [{"iteration": attempt, "result": "certified"}],
        }
    if attempt + 1 >= MAX_ATTEMPTS:
        return {
            "status": "human_review",
            "iteration": attempt + 1,
            "certified_docket": None,
            "re_evaluation_directive": DIRECTIVE,
            "rejection_vector": errors,
            "audit_trail": [{"iteration": attempt, "result": "human_review", "errors": errors}],
        }
    return {
        "status": "pending",
        "iteration": attempt + 1,
        "certified_docket": None,
        "re_evaluation_directive": DIRECTIVE,
        "rejection_vector": errors,
        "audit_trail": [{"iteration": attempt, "result": "rejected", "errors": errors}],
    }


def human_review_node(state: WaterState) -> dict:
    return {
        "status": "human_review",
        "certified_docket": None,
        "audit_trail": [
            {
                "iteration": state.get("iteration", 0),
                "result": "queued_for_human_review",
            }
        ],
    }
