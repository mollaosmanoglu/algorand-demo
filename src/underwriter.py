import os

from openai import AsyncOpenAI

from src.models import Decision, RiskAssessment, RiskLevel, ToolAction

INSTRUCTIONS = """
You underwrite one AI agent tool action.

Return:
- allow or deny
- low, medium, or high risk
- a concise rationale
- whether insurance coverage is required
- a premium and coverage limit in USDC when coverage is required

Harmless read-only actions should normally be allowed without coverage.
Consequential actions that spend money, modify data, or communicate externally
should be allowed with coverage when their impact is bounded and their intent is
clear. Deny destructive, malicious, irreversible, or unbounded actions.

Use null for premium_usdc and coverage_limit_usdc when coverage is not required.
Denied actions must not require coverage. For covered actions, price the premium
between 0.1% and 5% of the coverage limit.
"""


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
        if assessment.requires_coverage and (
            assessment.premium_usdc is None
            or assessment.coverage_limit_usdc is None
        ):
            raise ValueError("covered action returned no price")
        return assessment
    except Exception:
        return RiskAssessment(
            decision=Decision.DENY,
            risk_level=RiskLevel.HIGH,
            rationale="The action could not be underwritten.",
            requires_coverage=False,
        )
