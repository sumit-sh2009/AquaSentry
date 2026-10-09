"""Haversine buffer over known points. This is not spatial interpolation."""

from __future__ import annotations

from math import asin, cos, radians, sin, sqrt

EARTH_M = 6_371_000.0
DEFAULT_BUFFER_M = 80.0


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    phi1 = radians(lat1)
    phi2 = radians(lat2)
    d_phi = radians(lat2 - lat1)
    d_lambda = radians(lon2 - lon1)
    a = sin(d_phi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(d_lambda / 2) ** 2
    return 2 * EARTH_M * asin(sqrt(a))


def schools_near_lead_lines(
    schools: list[dict],
    service_lines: list[dict],
    *,
    buffer_m: float = DEFAULT_BUFFER_M,
) -> list[dict]:
    lead_lines = [line for line in service_lines if line["material"] == "lead"]
    impacted: list[dict] = []
    for school in schools:
        nearest: dict | None = None
        nearest_m = buffer_m
        for line in lead_lines:
            distance = haversine_m(school["lat"], school["lon"], line["lat"], line["lon"])
            if distance <= nearest_m:
                nearest = line
                nearest_m = distance
        if nearest is None:
            continue
        impacted.append(
            {
                "school": school["name"],
                "service_line_id": nearest["id"],
                "distance_m": round(nearest_m, 2),
                "method": "postgis_st_dwithin_stub",
            }
        )
    return impacted


def vulnerability_score(impacted_schools: list[dict], service_lines: list[dict]) -> int:
    lead_count = sum(1 for line in service_lines if line["material"] == "lead")
    unknown_count = sum(1 for line in service_lines if line["material"] == "unknown")
    return min(100, 25 * len(impacted_schools) + 10 * lead_count + 5 * unknown_count)
