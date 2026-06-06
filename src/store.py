from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import uuid4

from src.models import CoverageReceipt, Quote, ToolAction

actions: dict[str, ToolAction] = {}
quotes: dict[str, Quote] = {}
receipts: dict[str, CoverageReceipt] = {}


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


def get_receipt(receipt_id: str) -> CoverageReceipt:
    return receipts[receipt_id]


def get_receipt_by_quote_id(quote_id: str) -> CoverageReceipt:
    for receipt in receipts.values():
        if receipt.quote_id == quote_id:
            return receipt
    raise KeyError(quote_id)


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


def create_receipt(
    quote_id: str,
    network: str,
    asset: str,
    payer: str | None = None,
    settlement_transaction: str | None = None,
    now: datetime | None = None,
) -> CoverageReceipt:
    try:
        get_receipt_by_quote_id(quote_id)
    except KeyError:
        pass
    else:
        raise ValueError("coverage has already been activated")

    consumed_quote = consume_quote(quote_id, now)
    receipt = CoverageReceipt(
        id=_new_id("receipt"),
        action_id=consumed_quote.action_id,
        quote_id=consumed_quote.id,
        premium_usdc=consumed_quote.premium_usdc,
        coverage_limit_usdc=consumed_quote.coverage_limit_usdc,
        network=network,
        asset=asset,
        activated_at=consumed_quote.consumed_at or datetime.now(UTC),
        payer=payer,
        settlement_transaction=settlement_transaction,
    )
    receipts[receipt.id] = receipt
    return receipt


def _new_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex}"
