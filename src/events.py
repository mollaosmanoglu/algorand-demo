from datetime import UTC, datetime

from fastapi import WebSocket

from src.models import (
    CoverageReceipt,
    DashboardAction,
    DashboardEvent,
    DashboardEventType,
    DashboardSnapshot,
    EvaluateResponse,
    Quote,
    ToolOutcome,
)


class EventBus:
    def __init__(self) -> None:
        self._subscribers: set[WebSocket] = set()

    async def connect(
        self,
        websocket: WebSocket,
        snapshot: DashboardSnapshot,
    ) -> None:
        await websocket.accept()
        self._subscribers.add(websocket)
        await websocket.send_text(
            DashboardEvent(
                type=DashboardEventType.SNAPSHOT,
                created_at=datetime.now(UTC),
                snapshot=snapshot,
            ).model_dump_json()
        )

    def disconnect(self, websocket: WebSocket) -> None:
        self._subscribers.discard(websocket)

    async def publish_evaluation(
        self,
        action: DashboardAction,
        evaluation: EvaluateResponse,
        quote: Quote | None,
    ) -> None:
        await self._broadcast(
            DashboardEvent(
                type=DashboardEventType.EVALUATION,
                created_at=datetime.now(UTC),
                action=action,
                evaluation=evaluation,
                quote=quote,
            )
        )

    async def publish_coverage(self, receipt: CoverageReceipt) -> None:
        await self._broadcast(
            DashboardEvent(
                type=DashboardEventType.COVERAGE,
                created_at=datetime.now(UTC),
                receipt=receipt,
            )
        )

    async def publish_outcome(self, outcome: ToolOutcome) -> None:
        await self._broadcast(
            DashboardEvent(
                type=DashboardEventType.OUTCOME,
                created_at=datetime.now(UTC),
                outcome=outcome,
            )
        )

    async def _broadcast(self, event: DashboardEvent) -> None:
        disconnected: list[WebSocket] = []
        message = event.model_dump_json()
        for subscriber in self._subscribers:
            try:
                await subscriber.send_text(message)
            except RuntimeError:
                disconnected.append(subscriber)

        for subscriber in disconnected:
            self.disconnect(subscriber)
