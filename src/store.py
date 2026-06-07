from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import uuid4

from src.models import (
    CoverageReceipt,
    DashboardSnapshot,
    EvaluateResponse,
    OutcomeState,
    Quote,
    ToolAction,
    ToolOutcome,
)

actions: dict[str, ToolAction] = {}
evaluations: dict[str, EvaluateResponse] = {}
quotes: dict[str, Quote] = {}
receipts: dict[str, CoverageReceipt] = {}
outcomes: dict[str, ToolOutcome] = {}


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


def save_evaluation(evaluation: EvaluateResponse) -> EvaluateResponse:
    get_action(evaluation.action_id)
    evaluations[evaluation.action_id] = evaluation
    return evaluation


def list_quotes() -> list[Quote]:
    return list(quotes.values())


def list_receipts() -> list[CoverageReceipt]:
    return list(receipts.values())


def list_outcomes() -> list[ToolOutcome]:
    return list(outcomes.values())


def create_dashboard_snapshot() -> DashboardSnapshot:
    return DashboardSnapshot(
        actions=list(actions.values()),
        evaluations=list(evaluations.values()),
        quotes=list_quotes(),
        receipts=list_receipts(),
        outcomes=list_outcomes(),
    )


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


def get_receipt_by_action_id(action_id: str) -> CoverageReceipt:
    for receipt in receipts.values():
        if receipt.action_id == action_id:
            return receipt
    raise KeyError(action_id)


def get_outcome(outcome_id: str) -> ToolOutcome:
    return outcomes[outcome_id]


def get_outcome_by_action_id(action_id: str) -> ToolOutcome:
    for outcome in outcomes.values():
        if outcome.action_id == action_id:
            return outcome
    raise KeyError(action_id)


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


def create_outcome(
    action_id: str,
    state: OutcomeState,
    result_summary: str | None = None,
    now: datetime | None = None,
) -> ToolOutcome:
    action = get_action(action_id)
    try:
        get_outcome_by_action_id(action.id)
    except KeyError:
        pass
    else:
        raise ValueError("outcome has already been recorded")

    try:
        receipt = get_receipt_by_action_id(action.id)
        coverage_receipt_id = receipt.id
    except KeyError:
        coverage_receipt_id = None

    outcome = ToolOutcome(
        id=_new_id("outcome"),
        action_id=action.id,
        coverage_receipt_id=coverage_receipt_id,
        state=state,
        result_summary=result_summary,
        recorded_at=now or datetime.now(UTC),
    )
    outcomes[outcome.id] = outcome
    return outcome


def _new_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex}"
