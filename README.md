# Luphra Agent Insurance

FastAPI backend for per-action AI agent insurance. The backend evaluates a
pending tool call, returns a risk decision and optional quote, activates quoted
coverage through x402 on Algorand TestNet, records the tool outcome, and streams
dashboard events over WebSocket.

## Setup

```bash
uv sync
```

Create `.env`:

```bash
AVM_ADDRESS=<receiver Algorand TestNet address>
FACILITATOR_URL=https://facilitator.goplausible.xyz
OPENAI_API_KEY=<OpenAI API key>
OPENAI_MODEL=gpt-5.4-mini
```

Optional Codex App Server observation:

```bash
CODEX_APP_SERVER_ENABLED=true
```

When enabled, the backend starts `codex app-server`, initializes a JSONL
connection, and forwards compact Codex notifications into `WS /events`.

Run the backend:

```bash
uv run python src/main.py
```

The server runs at `http://localhost:4021`.

## Endpoints

- `GET /health` returns backend health.
- `POST /evaluate` evaluates a proposed tool call and may return a quote.
- `POST /coverage/{quote_id}` is x402-protected and activates quoted coverage.
- `POST /outcome/{action_id}` records succeeded, failed, or cancelled tool outcomes.
- `WS /events` sends an initial snapshot, then evaluation, coverage, and outcome events.

## Smoke Flow

Harmless evaluation:

```bash
curl -s http://localhost:4021/evaluate \
  -H 'content-type: application/json' \
  -d '{
    "agent_id": "demo-agent",
    "tool_name": "read_file",
    "arguments": {"path": "README.md"}
  }' | jq
```

Consequential evaluation:

```bash
curl -s http://localhost:4021/evaluate \
  -H 'content-type: application/json' \
  -d '{
    "agent_id": "demo-agent",
    "tool_name": "purchase_api_credits",
    "arguments": {"vendor": "new-vendor", "amount_usdc": 50}
  }' | jq
```

Denied evaluation:

```bash
curl -s http://localhost:4021/evaluate \
  -H 'content-type: application/json' \
  -d '{
    "agent_id": "demo-agent",
    "tool_name": "delete_production_database",
    "arguments": {"confirm": true}
  }' | jq
```

Coverage activation is payment protected. Use the `quote_id` from a
consequential evaluation:

```bash
curl -i -X POST http://localhost:4021/coverage/<quote_id>
```

An unpaid request returns `402 Payment Required`. A payment-capable x402 client
can then retry the same `POST /coverage/{quote_id}` with payment headers. After
settlement, the response is a `CoverageReceipt`.

Record an outcome:

```bash
curl -s http://localhost:4021/outcome/<action_id> \
  -H 'content-type: application/json' \
  -d '{"state": "succeeded", "result_summary": "Tool completed."}' | jq
```

Observe dashboard events:

```bash
uv run python -m websockets ws://localhost:4021/events
```

## Codex Hooks

Project-local Codex hooks are configured in `.codex/hooks.json` and call
`src/hooks.py`.

The current hook is intentionally minimal:

- `PreToolUse` submits the pending tool call to `POST /evaluate`.
- Denied actions are blocked.
- Harmless allowed actions continue.
- Covered actions fail closed with a message to run the quoted payment flow.
- `PostToolUse` records an outcome when Codex supplies an `action_id`.

This does not auto-pay x402 yet.

## LORA

For a real TestNet payment, inspect the settlement transaction in LORA:

```text
https://lora.algokit.io/testnet/transaction/<transaction-id>
```

`settlement_transaction` is currently nullable because the stock x402 FastAPI
middleware settles after the route body is generated.

## Frontend

The standalone visual dashboard is in `frontend/`.

```bash
bun install --cwd frontend
bun --cwd frontend run dev
```
