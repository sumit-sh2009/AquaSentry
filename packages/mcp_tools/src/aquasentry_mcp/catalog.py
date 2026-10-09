"""Fixture catalog and the EPA timeout fallback."""

from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

import httpx

FIXTURE_PATH = Path(__file__).with_name("fixtures") / "newark.json"
EPA_SDWIS_URL = "https://data.epa.gov/efservice/SDW_VIOLATION/PWSID/{pwsid}/JSON"
DEFAULT_TIMEOUT_MS = 2500


def load_system(pwsid: str) -> dict:
    catalog = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
    if catalog["pwsid"] != pwsid:
        raise KeyError(pwsid)
    system = deepcopy(catalog)
    system["data_source"] = "snapshot"
    return system


async def fetch_sdwis(
    pwsid: str,
    *,
    live: bool = False,
    timeout_ms: int = DEFAULT_TIMEOUT_MS,
    client: httpx.AsyncClient | None = None,
) -> dict:
    """Live EPA calls that exceed timeout_ms fall back to the local snapshot."""
    if not live:
        return load_system(pwsid)

    owns_client = client is None
    http = client or httpx.AsyncClient(timeout=timeout_ms / 1000)
    try:
        response = await http.get(EPA_SDWIS_URL.format(pwsid=pwsid))
        response.raise_for_status()
        snapshot = load_system(pwsid)
        snapshot["data_source"] = "live"
        snapshot["live_payload"] = response.json()
        return snapshot
    except (httpx.TimeoutException, httpx.HTTPError, json.JSONDecodeError):
        snapshot = load_system(pwsid)
        snapshot["data_source"] = "snapshot"
        snapshot["fallback_reason"] = "epa_timeout_or_error"
        return snapshot
    finally:
        if owns_client:
            await http.aclose()
