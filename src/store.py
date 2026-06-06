from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import uuid4

from src.models import Quote, ToolAction

actions: dict[str, ToolAction] = {}
quotes: dict[str, Quote] = {}


def create_action(
    agent_id: str,
    tool_name: str,
    arguments: dict[str, object],
) -> ToolAction:
    action = ToolAction(
        id=_new_id("action"),
        agent_id=agent_id,
        tool_name=tool_name,
        arguments=arguments,
        created_at=datetime.now(UTC),
    )
    actions[action.id] = action
    return action


def get_action(action_id: str) -> ToolAction:
    return actions[action_id]


def create_quote(
    action_id: str,
    premium_usdc: Decimal,
    coverage_limit_usdc: Decimal,
    ttl: timedelta = timedelta(minutes=5),
) -> Quote:
    get_action(action_id)
    quote = Quote(
        id=_new_id("quote"),
        action_id=action_id,
        premium_usdc=premium_usdc,
        coverage_limit_usdc=coverage_limit_usdc,
        expires_at=datetime.now(UTC) + ttl,
    )
    quotes[quote.id] = quote
    return quote


def get_quote(quote_id: str) -> Quote:
    return quotes[quote_id]


def get_payable_quote(
    quote_id: str,
    now: datetime | None = None,
) -> Quote:
    quote = get_quote(quote_id)
    checked_at = now or datetime.now(UTC)

    if quote.consumed_at is not None:
        raise ValueError("quote has already been consumed")
    if checked_at >= quote.expires_at:
        raise ValueError("quote has expired")

    return quote


def consume_quote(
    quote_id: str,
    now: datetime | None = None,
) -> Quote:
    consumed_at = now or datetime.now(UTC)
    quote = get_payable_quote(quote_id, consumed_at)

    consumed_quote = quote.model_copy(update={"consumed_at": consumed_at})
    quotes[quote_id] = consumed_quote
    return consumed_quote


def _new_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex}"
