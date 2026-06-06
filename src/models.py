from datetime import datetime
from decimal import Decimal
from enum import StrEnum

from pydantic import BaseModel


class Decision(StrEnum):
    ALLOW = "allow"
    DENY = "deny"


class RiskLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


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
