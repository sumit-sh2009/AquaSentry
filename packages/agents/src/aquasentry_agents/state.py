"""Graph channels. Audit lists append. Current worker outputs overwrite."""

from __future__ import annotations

import operator
from typing import Annotated, Any, TypedDict


def replace(_left: Any, right: Any) -> Any:
    return right


class WaterState(TypedDict, total=False):
    address: str
    pwsid: str
    iteration: int
    stick_to_utility: bool
    active_violations: Annotated[list[dict[str, Any]], replace]
    geochemical_profiles: Annotated[dict[str, Any], replace]
    exposure: Annotated[dict[str, Any], replace]
    snapshot_date: str
    data_source: str
    rejection_vector: Annotated[list[str], operator.add]
    audit_trail: Annotated[list[dict[str, Any]], operator.add]
    re_evaluation_directive: str
    certified_docket: dict[str, Any] | None
    status: str
