"""HTTP health check and one investigation thread."""

import json

import httpx
import pytest
from fastapi.testclient import TestClient

from aquasentry_api.main import create_app
from aquasentry_mcp.catalog import fetch_sdwis


@pytest.fixture
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    monkeypatch.delenv("DATABASE_URL", raising=False)
    app = create_app()
    with TestClient(app) as test_client:
        yield test_client


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "aquasentry"}


def test_investigation_certifies_newark_snapshot(client: TestClient) -> None:
    response = client.post(
        "/investigations",
        json={"address": "81 Congress St, Newark, NJ", "pwsid": "NJ0714001"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "certified"
    assert body["data_source"] == "snapshot"
    assert body["snapshot_date"] == "2024-06-15"
    lead = next(item for item in body["docket"]["findings"] if item["analyte"] == "lead")
    assert lead["exceeds"] is True


def test_unknown_pwsid_is_422_or_404(client: TestClient) -> None:
    response = client.post(
        "/investigations",
        json={"address": "1 Main St", "pwsid": "XX0000000"},
    )
    assert response.status_code == 404


def test_short_address_is_rejected(client: TestClient) -> None:
    response = client.post("/investigations", json={"address": "NJ", "pwsid": "NJ0714001"})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_epa_timeout_falls_back_to_dated_snapshot() -> None:
    class TimeoutTransport(httpx.AsyncBaseTransport):
        async def handle_async_request(self, request: httpx.Request) -> httpx.Response:
            raise httpx.TimeoutException("exceeded 2500ms")

    async with httpx.AsyncClient(transport=TimeoutTransport()) as http:
        snapshot = await fetch_sdwis("NJ0714001", live=True, timeout_ms=2500, client=http)

    assert snapshot["data_source"] == "snapshot"
    assert snapshot["fallback_reason"] == "epa_timeout_or_error"
    assert snapshot["snapshot_date"] == "2024-06-15"
    assert json.loads(json.dumps(snapshot["samples"]))
