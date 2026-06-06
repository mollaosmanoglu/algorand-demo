import asyncio
import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager, suppress

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from x402.http import FacilitatorConfig, HTTPFacilitatorClient, PaymentOption
from x402.http.middleware.fastapi import PaymentMiddlewareASGI
from x402.http.types import HTTPRequestContext, RouteConfig
from x402.mechanisms.avm import ALGORAND_TESTNET_CAIP2
from x402.mechanisms.avm.exact import ExactAvmServerScheme
from x402.server import x402ResourceServer

from src import app_server
from src import events as event_stream
from src.models import (
    CoverageReceipt,
    DashboardEventType,
    Decision,
    EvaluateRequest,
    EvaluateResponse,
    OutcomeRequest,
    ToolOutcome,
)
from src.store import (
    create_action,
    create_dashboard_snapshot,
    create_outcome,
    create_quote,
    create_receipt,
    get_payable_quote,
    to_dashboard_action,
)
from src.underwriter import evaluate_action

# AVM Python reference:
# https://github.com/GoPlausible/.github/blob/main/profile/algorand-x402-documentation/python/x402-avm-avm-examples-python.md

load_dotenv()

avm_address = os.environ["AVM_ADDRESS"]
facilitator_url = os.getenv(
    "FACILITATOR_URL",
    "https://facilitator.goplausible.xyz",
)

@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None]:
    task = asyncio.create_task(app_server.run())
    try:
        yield
    finally:
        task.cancel()
        with suppress(asyncio.CancelledError):
            await task


app = FastAPI(title="Luphra Agent Insurance", lifespan=lifespan)

facilitator = HTTPFacilitatorClient(FacilitatorConfig(url=facilitator_url))
server = x402ResourceServer(facilitator)
server.register(
    ALGORAND_TESTNET_CAIP2,
    ExactAvmServerScheme(),  # pyright: ignore[reportArgumentType]
)

def quote_price(context: HTTPRequestContext) -> str:
    quote_id = context.path.rstrip("/").rsplit("/", maxsplit=1)[-1]
    quote = get_payable_quote(quote_id)
    return f"${quote.premium_usdc}"


routes = {
    "POST /coverage/*": RouteConfig(
        accepts=PaymentOption(
            scheme="exact",
            pay_to=avm_address,
            price=quote_price,
            network=ALGORAND_TESTNET_CAIP2,
        ),
        description="Per-action AI agent coverage",
        mime_type="application/json",
    )
}

app.add_middleware(PaymentMiddlewareASGI, routes=routes, server=server)

COVERAGE_ASSET = "USDC"


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.websocket("/events")
async def events(websocket: WebSocket) -> None:
    await event_stream.connect(websocket, create_dashboard_snapshot())
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        event_stream.disconnect(websocket)


@app.post("/evaluate")
async def evaluate(request: EvaluateRequest) -> EvaluateResponse:
    action = create_action(
        agent_id=request.agent_id,
        tool_name=request.tool_name,
        arguments=request.arguments,
    )
    assessment = await evaluate_action(action)

    if assessment.decision is Decision.DENY or not assessment.requires_coverage:
        response = EvaluateResponse(
            action_id=action.id,
            decision=assessment.decision,
            risk_level=assessment.risk_level,
            rationale=assessment.rationale,
            requires_coverage=assessment.requires_coverage,
        )
        await event_stream.publish(
            DashboardEventType.EVALUATION,
            action=to_dashboard_action(action),
            evaluation=response,
            quote=None,
        )
        return response

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
    response = EvaluateResponse(
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
    await event_stream.publish(
        DashboardEventType.EVALUATION,
        action=to_dashboard_action(action),
        evaluation=response,
        quote=quote,
    )
    return response


@app.post("/coverage/{quote_id}")
async def coverage(quote_id: str) -> CoverageReceipt:
    try:
        receipt = create_receipt(
            quote_id=quote_id,
            network=ALGORAND_TESTNET_CAIP2,
            asset=COVERAGE_ASSET,
        )
        await event_stream.publish(DashboardEventType.COVERAGE, receipt=receipt)
        return receipt
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="quote not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@app.post("/outcome/{action_id}")
async def outcome(action_id: str, request: OutcomeRequest) -> ToolOutcome:
    try:
        recorded_outcome = create_outcome(
            action_id=action_id,
            state=request.state,
            result_summary=request.result_summary,
        )
        await event_stream.publish(
            DashboardEventType.OUTCOME,
            outcome=recorded_outcome,
        )
        return recorded_outcome
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="action not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=4021)
