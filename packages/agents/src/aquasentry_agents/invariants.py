"""Unit conversion and statutory thresholds. No model calls."""

from __future__ import annotations

PPT_PER_PPB = 1000.0
PPT_PER_PPM = 1_000_000.0
PPB_PER_PPM = 1000.0

LEAD_ACTION_LEVEL_PPB = 15.0
PFAS_MCL_PPT = 4.0
PFAS_ANALYTES = frozenset({"pfoa", "pfos"})

_UNIT_ALIASES = {
    "ppt": "ppt",
    "ng/l": "ppt",
    "ppb": "ppb",
    "ug/l": "ppb",
    "µg/l": "ppb",
    "ppm": "ppm",
    "mg/l": "ppm",
}


def canonical_unit(unit: str) -> str:
    key = unit.strip().lower()
    if key not in _UNIT_ALIASES:
        raise ValueError(f"unsupported unit: {unit}")
    return _UNIT_ALIASES[key]


def to_ppb(value: float, unit: str) -> float:
    canonical = canonical_unit(unit)
    amount = float(value)
    if canonical == "ppb":
        return amount
    if canonical == "ppm":
        return amount * PPB_PER_PPM
    return amount / PPT_PER_PPB


def to_ppt(value: float, unit: str) -> float:
    canonical = canonical_unit(unit)
    amount = float(value)
    if canonical == "ppt":
        return amount
    if canonical == "ppb":
        return amount * PPT_PER_PPB
    return amount * PPT_PER_PPM


def lead_exceeds_action_level(value: float, unit: str) -> bool:
    """Lead and Copper Rule action level. 15 ppb is a violation, not a pass."""
    return to_ppb(value, unit) >= LEAD_ACTION_LEVEL_PPB


def pfas_exceeds_mcl(analyte: str, value: float, unit: str) -> bool:
    name = analyte.strip().lower()
    if name not in PFAS_ANALYTES:
        raise ValueError(f"not an MCL PFAS analyte: {analyte}")
    return to_ppt(value, unit) > PFAS_MCL_PPT


def exceeds_threshold(analyte: str, value: float, unit: str) -> bool:
    name = analyte.strip().lower()
    if name == "lead":
        return lead_exceeds_action_level(value, unit)
    if name in PFAS_ANALYTES:
        return pfas_exceeds_mcl(name, value, unit)
    raise ValueError(f"unsupported analyte: {analyte}")


def statutory_citation(analyte: str, exceeds: bool) -> str:
    name = analyte.strip().lower()
    if name == "lead" and exceeds:
        return "40 CFR 141.80 Lead and Copper Rule action level (15 ppb)"
    if name in PFAS_ANALYTES and exceeds:
        return "40 CFR 141.61 PFOA/PFOS MCL (4.0 ppt)"
    if name == "lead":
        return "40 CFR 141.80 below Lead and Copper Rule action level"
    if name in PFAS_ANALYTES:
        return "40 CFR 141.61 at or below PFOA/PFOS MCL"
    raise ValueError(f"unsupported analyte: {analyte}")


def corrosivity_index(*, ph: float, alkalinity_mg_l: float) -> dict[str, float | bool]:
    """Low pH plus low alkalinity flags leaching conditions. Not a plume model."""
    corrosive = ph < 7.2 and alkalinity_mg_l < 40
    index = round((7.2 - ph) * 10 + (40 - alkalinity_mg_l) / 10, 3)
    return {
        "ph": ph,
        "alkalinity_mg_l": alkalinity_mg_l,
        "corrosive": corrosive,
        "index": index,
    }
