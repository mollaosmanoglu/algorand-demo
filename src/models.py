from datetime import datetime
from decimal import Decimal
from enum import StrEnum

from pydantic import BaseModel, Field


class Decision(StrEnum):
    ALLOW = "allow"
    DENY = "deny"


class RiskLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class OutcomeState(StrEnum):
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ToolAction(BaseModel):
    id: str
    agent_id: str
    tool_name: str
    arguments: dict[str, object]
    created_at: datetime


class RiskAssessment(BaseModel):
    decision: Decision
    risk_level: RiskLevel
    rationale: str
    requires_coverage: bool
    premium_usdc: Decimal | None = None
    coverage_limit_usdc: Decimal | None = None


class Quote(BaseModel):
    id: str
    action_id: str
    premium_usdc: Decimal
    coverage_limit_usdc: Decimal
    expires_at: datetime
    consumed_at: datetime | None = None


class CoverageReceipt(BaseModel):
    id: str
    action_id: str
    quote_id: str
    premium_usdc: Decimal
    coverage_limit_usdc: Decimal
    network: str
    asset: str
    activated_at: datetime
    payer: str | None = None
    settlement_transaction: str | None = None


class ToolOutcome(BaseModel):
    id: str
    action_id: str
    coverage_receipt_id: str | None = None
    state: OutcomeState
    result_summary: str | None = None
    recorded_at: datetime


class EvaluateRequest(BaseModel):
    agent_id: str
    tool_name: str
    arguments: dict[str, object] = Field(default_factory=dict)


class EvaluateResponse(BaseModel):
    action_id: str
    decision: Decision
    risk_level: RiskLevel
    rationale: str
    requires_coverage: bool
    quote_id: str | None = None
    premium_usdc: Decimal | None = None
    coverage_limit_usdc: Decimal | None = None
    expires_at: datetime | None = None


class OutcomeRequest(BaseModel):
    state: OutcomeState
    result_summary: str | None = Field(default=None, max_length=500)


class DashboardEventType(StrEnum):
    SNAPSHOT = "snapshot"
    EVALUATION = "evaluation"
    COVERAGE = "coverage"
    OUTCOME = "outcome"
    CODEX_ACTIVITY = "codex_activity"


class DashboardSnapshot(BaseModel):
    actions: list[ToolAction]
    evaluations: list[EvaluateResponse]
    quotes: list[Quote]
    receipts: list[CoverageReceipt]
    outcomes: list[ToolOutcome]


class DashboardEvent(BaseModel):
    type: DashboardEventType
    created_at: datetime
    snapshot: DashboardSnapshot | None = None
    action: ToolAction | None = None
    evaluation: EvaluateResponse | None = None
    quote: Quote | None = None
    receipt: CoverageReceipt | None = None
    outcome: ToolOutcome | None = None
    codex_method: str | None = None
    codex_params: dict[str, object] | None = None
