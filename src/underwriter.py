import os
from decimal import ROUND_UP, Decimal

from openai import AsyncOpenAI

from src.models import Decision, RiskAssessment, RiskLevel, ToolAction

PREMIUM_RATES = {
    RiskLevel.LOW: Decimal("0.000002"),
    RiskLevel.MEDIUM: Decimal("0.000005"),
    RiskLevel.HIGH: Decimal("0.00001"),
}
MINIMUM_PREMIUM_USDC = Decimal("0.000001")
USDC_QUANTUM = Decimal("0.000001")

INSTRUCTIONS = """
You underwrite one AI agent tool action.

Return:
- allow or deny
- low, medium, or high risk
- a concise rationale
- whether insurance coverage is required
- the estimated potential damage as the coverage limit in USDC when coverage is
  required

Harmless read-only actions should normally be allowed without coverage.
Consequential actions that spend money, modify data, or communicate externally
should be allowed with coverage when their impact is bounded and their intent is
clear. A bounded email to a small, explicit recipient list is insurable when it
contains no secrets or binding legal or financial commitment. Deny destructive,
malicious, unbounded, mass-communication, secret-disclosing, or binding actions.

Use null for premium_usdc and coverage_limit_usdc when coverage is not required.
Denied actions must not require coverage. For covered actions, set
premium_usdc to 0; the application calculates the per-tool premium separately.
"""


def price_assessment(assessment: RiskAssessment) -> RiskAssessment:
    if not assessment.requires_coverage:
        return assessment
    if assessment.coverage_limit_usdc is None:
        raise ValueError("covered action returned no coverage limit")

    premium = (
        assessment.coverage_limit_usdc * PREMIUM_RATES[assessment.risk_level]
    ).quantize(USDC_QUANTUM, rounding=ROUND_UP)
    return assessment.model_copy(
        update={"premium_usdc": max(premium, MINIMUM_PREMIUM_USDC)}
    )


async def evaluate_action(action: ToolAction) -> RiskAssessment:
    try:
        response = await AsyncOpenAI().responses.parse(
            model=os.getenv("OPENAI_MODEL", "gpt-5.4-mini"),
            instructions=INSTRUCTIONS,
            input=action.model_dump_json(),
            text_format=RiskAssessment,
        )
        assessment = response.output_parsed
        if assessment is None:
            raise ValueError("underwriter returned no assessment")
        if assessment.decision is Decision.DENY:
            return assessment.model_copy(
                update={
                    "requires_coverage": False,
                    "premium_usdc": None,
                    "coverage_limit_usdc": None,
                }
            )
        return price_assessment(assessment)
    except Exception:
        return RiskAssessment(
            decision=Decision.DENY,
            risk_level=RiskLevel.HIGH,
            rationale="The action could not be underwritten.",
            requires_coverage=False,
        )
