import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from x402.http import FacilitatorConfig, HTTPFacilitatorClient, PaymentOption
from x402.http.middleware.fastapi import PaymentMiddlewareASGI
from x402.http.types import RouteConfig
from x402.mechanisms.avm import ALGORAND_TESTNET_CAIP2
from x402.mechanisms.avm.exact import ExactAvmServerScheme
from x402.server import x402ResourceServer

from src.models import Decision, EvaluateRequest, EvaluateResponse
from src.store import create_action, create_quote
from src.underwriter import evaluate_action

# AVM Python reference:
# https://github.com/GoPlausible/.github/blob/main/profile/algorand-x402-documentation/python/x402-avm-avm-examples-python.md

load_dotenv()

avm_address = os.environ["AVM_ADDRESS"]
facilitator_url = os.getenv(
    "FACILITATOR_URL",
    "https://facilitator.goplausible.xyz",
)

app = FastAPI(title="Luphra Agent Insurance")

facilitator = HTTPFacilitatorClient(FacilitatorConfig(url=facilitator_url))
server = x402ResourceServer(facilitator)
server.register(
    ALGORAND_TESTNET_CAIP2,
    ExactAvmServerScheme(),  # pyright: ignore[reportArgumentType]
)

routes = {
    "GET /coverage": RouteConfig(
        accepts=PaymentOption(
            scheme="exact",
            pay_to=avm_address,
            price="$0.01",
            network=ALGORAND_TESTNET_CAIP2,
        ),
        description="Per-action AI agent coverage",
        mime_type="application/json",
    )
}

app.add_middleware(PaymentMiddlewareASGI, routes=routes, server=server)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/evaluate")
async def evaluate(request: EvaluateRequest) -> EvaluateResponse:
    action = create_action(
        agent_id=request.agent_id,
        tool_name=request.tool_name,
        arguments=request.arguments,
    )
    assessment = await evaluate_action(action)

    if assessment.decision is Decision.DENY or not assessment.requires_coverage:
        return EvaluateResponse(
            action_id=action.id,
            decision=assessment.decision,
            risk_level=assessment.risk_level,
            rationale=assessment.rationale,
            requires_coverage=assessment.requires_coverage,
        )

    if (
        assessment.premium_usdc is None
        or assessment.coverage_limit_usdc is None
    ):
        raise HTTPException(
            status_code=502,
            detail="underwriter returned incomplete coverage terms",
        )

    quote = create_quote(
        action_id=action.id,
        premium_usdc=assessment.premium_usdc,
        coverage_limit_usdc=assessment.coverage_limit_usdc,
    )
    return EvaluateResponse(
        action_id=action.id,
        decision=assessment.decision,
        risk_level=assessment.risk_level,
        rationale=assessment.rationale,
        requires_coverage=True,
        quote_id=quote.id,
        premium_usdc=quote.premium_usdc,
        coverage_limit_usdc=quote.coverage_limit_usdc,
        expires_at=quote.expires_at,
    )


@app.get("/coverage")
async def coverage() -> dict[str, str]:
    return {
        "status": "covered",
        "coverage_limit": "$100",
        "message": "The agent action is insured.",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=4021)
