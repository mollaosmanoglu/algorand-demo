# Luphra Agent Insurance

Minimal FastAPI and x402 skeleton for accepting Algorand TestNet payments.

## Setup

```bash
uv sync
uv run python src/main.py
```

Create `.env` and set `AVM_ADDRESS` to the Algorand TestNet address that should
receive payments. Set `FACILITATOR_URL` to
`https://facilitator.goplausible.xyz`.

The default facilitator is `https://facilitator.goplausible.xyz`, matching the
Algorand x402 tutorial.

## Endpoints

- `GET /health` is free.
- `GET /coverage` costs `$0.01` in TestNet USDC.

An unpaid request to `/coverage` receives HTTP `402 Payment Required`. The x402
client can then sign the requested payment and retry automatically.

The server runs at `http://localhost:4021`.
