"""Cyclic StateGraph: workers, then a bounded evaluator."""

from __future__ import annotations

from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Send

from aquasentry_agents.evaluator import evaluator_node, human_review_node
from aquasentry_agents.state import WaterState
from aquasentry_agents.workers import sdwis_worker, spatial_worker, usgs_worker


def dispatch(_state: WaterState) -> dict:
    return {}


def fan_out(state: WaterState) -> list[Send]:
    return [
        Send("sdwis_worker", state),
        Send("usgs_worker", state),
        Send("spatial_worker", state),
    ]


def route_after_eval(state: WaterState) -> str:
    status = state.get("status")
    if status == "certified":
        return "certified"
    if status == "human_review":
        return "human_review"
    return "dispatch"


def build_graph(checkpointer: BaseCheckpointSaver | None = None):
    graph = StateGraph(WaterState)
    graph.add_node("dispatch", dispatch)
    graph.add_node("sdwis_worker", sdwis_worker)
    graph.add_node("usgs_worker", usgs_worker)
    graph.add_node("spatial_worker", spatial_worker)
    graph.add_node("evaluator", evaluator_node)
    graph.add_node("human_review", human_review_node)

    graph.add_edge(START, "dispatch")
    graph.add_conditional_edges("dispatch", fan_out)
    graph.add_edge("sdwis_worker", "evaluator")
    graph.add_edge("usgs_worker", "evaluator")
    graph.add_edge("spatial_worker", "evaluator")
    graph.add_conditional_edges(
        "evaluator",
        route_after_eval,
        {
            "certified": END,
            "human_review": "human_review",
            "dispatch": "dispatch",
        },
    )
    graph.add_edge("human_review", END)
    return graph.compile(checkpointer=checkpointer)
