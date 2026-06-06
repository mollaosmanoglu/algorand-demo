from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import uuid4

from src.models import Quote, ToolAction


class InsuranceStore:
    def __init__(self) -> None:
        self.actions: dict[str, ToolAction] = {}
        self.quotes: dict[str, Quote] = {}

    def create_action(
        self,
        agent_id: str,
        tool_name: str,
        arguments: dict[str, object],
    ) -> ToolAction:
        action = ToolAction(
            id=self._new_id("action"),
            agent_id=agent_id,
            tool_name=tool_name,
            arguments=arguments,
            created_at=datetime.now(UTC),
        )
        self.actions[action.id] = action
        return action

    def get_action(self, action_id: str) -> ToolAction:
        return self.actions[action_id]

    def create_quote(
        self,
        action_id: str,
        premium_usdc: Decimal,
        coverage_limit_usdc: Decimal,
        ttl: timedelta = timedelta(minutes=5),
    ) -> Quote:
        self.get_action(action_id)
        quote = Quote(
            id=self._new_id("quote"),
            action_id=action_id,
            premium_usdc=premium_usdc,
            coverage_limit_usdc=coverage_limit_usdc,
            expires_at=datetime.now(UTC) + ttl,
        )
        self.quotes[quote.id] = quote
        return quote

    def get_quote(self, quote_id: str) -> Quote:
        return self.quotes[quote_id]

    def consume_quote(
        self,
        quote_id: str,
        now: datetime | None = None,
    ) -> Quote:
        quote = self.get_quote(quote_id)
        consumed_at = now or datetime.now(UTC)

        if quote.consumed_at is not None:
            raise ValueError("quote has already been consumed")
        if consumed_at >= quote.expires_at:
            raise ValueError("quote has expired")

        consumed_quote = quote.model_copy(update={"consumed_at": consumed_at})
        self.quotes[quote_id] = consumed_quote
        return consumed_quote

    @staticmethod
    def _new_id(prefix: str) -> str:
        return f"{prefix}_{uuid4().hex}"
