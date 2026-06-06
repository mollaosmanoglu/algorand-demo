from datetime import UTC, datetime
from typing import Any

from fastapi import WebSocket

from src.models import DashboardEvent, DashboardEventType, DashboardSnapshot

subscribers: set[WebSocket] = set()


async def connect(websocket: WebSocket, snapshot: DashboardSnapshot) -> None:
    await websocket.accept()
    subscribers.add(websocket)
    await websocket.send_text(
        DashboardEvent(
            type=DashboardEventType.SNAPSHOT,
            created_at=datetime.now(UTC),
            snapshot=snapshot,
        ).model_dump_json()
    )


def disconnect(websocket: WebSocket) -> None:
    subscribers.discard(websocket)


async def publish(event_type: DashboardEventType, **payload: Any) -> None:
    await broadcast(
        DashboardEvent(
            type=event_type,
            created_at=datetime.now(UTC),
            **payload,
        )
    )


async def broadcast(event: DashboardEvent) -> None:
    disconnected: list[WebSocket] = []
    message = event.model_dump_json()
    for subscriber in subscribers:
        try:
            await subscriber.send_text(message)
        except RuntimeError:
            disconnected.append(subscriber)

    for subscriber in disconnected:
        disconnect(subscriber)
