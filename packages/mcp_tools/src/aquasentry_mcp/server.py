"""FastMCP surface over the local SDWIS / USGS / LCRI catalog."""

from __future__ import annotations

from fastmcp import FastMCP

from aquasentry_mcp.catalog import fetch_sdwis, load_system

mcp = FastMCP("AquaSentry")


@mcp.tool
def get_sdwis_snapshot(pwsid: str) -> dict:
    """Return the local SDWIS mirror for one public water system."""
    return load_system(pwsid)


@mcp.tool
def get_service_line_inventory(pwsid: str) -> list[dict]:
    """Lead, copper, and unknown service lines for the MVP watershed."""
    return load_system(pwsid)["service_lines"]


def main() -> None:
    mcp.run(transport="stdio")
