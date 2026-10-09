"""FastAPI lifespan, health, and investigation routes."""

from __future__ import annotations

import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from aquasentry_agents.checkpointer import close_checkpointer, open_checkpointer
from aquasentry_agents.graph import build_graph
from aquasentry_mcp.catalog import load_system


class InvestigationRequest(BaseModel):
    address: str = Field(min_length=3, max_length=240)
    pwsid: str = "NJ0714001"
    stick_to_utility: bool = False


class InvestigationResponse(BaseModel):
    thread_id: str
    status: str
    iteration: int
    data_source: str | None = None
    snapshot_date: str | None = None
    rejection_vector: list[str]
    audit_trail: list[dict]
    docket: dict | None = None


def create_app() -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        database_url = os.environ.get("DATABASE_URL") or None
        saver, pool = await open_checkpointer(database_url)
        app.state.checkpointer = saver
        app.state.pool = pool
        app.state.graph = build_graph(saver)
        yield
        await close_checkpointer(pool)

    app = FastAPI(title="AquaSentry", version="0.1.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://127.0.0.1:5202",
            "http://localhost:5202",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok", "service": "aquasentry"}

    @app.get("/watersheds/{pwsid}")
    async def watershed(pwsid: str) -> dict:
        try:
            return load_system(pwsid)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail=f"unknown pwsid: {pwsid}") from exc

    @app.post("/investigations", response_model=InvestigationResponse)
    async def investigate(body: InvestigationRequest) -> InvestigationResponse:
        try:
            load_system(body.pwsid)
        except KeyError as exc:
            raise HTTPException(status_code=404, detail=f"unknown pwsid: {body.pwsid}") from exc
        thread_id = str(uuid4())
        result = await app.state.graph.ainvoke(
            {
                "address": body.address,
                "pwsid": body.pwsid,
                "iteration": 0,
                "stick_to_utility": body.stick_to_utility,
                "status": "pending",
                "re_evaluation_directive": "",
                "rejection_vector": [],
                "audit_trail": [],
            },
            config={"configurable": {"thread_id": thread_id}, "recursion_limit": 30},
        )
        return InvestigationResponse(
            thread_id=thread_id,
            status=result["status"],
            iteration=int(result.get("iteration", 0)),
            data_source=result.get("data_source"),
            snapshot_date=result.get("snapshot_date"),
            rejection_vector=list(result.get("rejection_vector") or []),
            audit_trail=list(result.get("audit_trail") or []),
            docket=result.get("certified_docket"),
        )

    return app


app = create_app()
