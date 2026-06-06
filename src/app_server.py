import asyncio
import json
import os
from typing import Any

from src import events
from src.models import DashboardEventType

CODEX_APP_SERVER_ENABLED = "CODEX_APP_SERVER_ENABLED"


async def run() -> None:
    if os.getenv(CODEX_APP_SERVER_ENABLED) != "true":
        return

    try:
        proc = await asyncio.create_subprocess_exec(
            "codex",
            "app-server",
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
        )
    except FileNotFoundError:
        return
    if proc.stdin is None or proc.stdout is None:
        return

    await send(
        proc,
        {
            "method": "initialize",
            "id": 1,
            "params": {
                "clientInfo": {
                    "name": "luphra",
                    "title": "Luphra MicroCover",
                    "version": "0.1.0",
                }
            },
        },
    )
    await send(proc, {"method": "initialized", "params": {}})

    while line := await proc.stdout.readline():
        message = parse_message(line)
        if message is None or "method" not in message:
            continue
        await events.publish(
            DashboardEventType.CODEX_ACTIVITY,
            codex_method=str(message["method"]),
            codex_params=compact_params(message.get("params")),
        )


async def send(proc: asyncio.subprocess.Process, message: dict[str, object]) -> None:
    if proc.stdin is None:
        return
    proc.stdin.write(json.dumps(message).encode() + b"\n")
    await proc.stdin.drain()


def parse_message(line: bytes) -> dict[str, Any] | None:
    try:
        value = json.loads(line.decode())
    except json.JSONDecodeError:
        return None
    return value if isinstance(value, dict) else None


def compact_params(value: object) -> dict[str, object] | None:
    if not isinstance(value, dict):
        return None

    compact: dict[str, object] = {}
    for key in ("thread", "turn", "item", "status", "error"):
        item = value.get(key)
        if isinstance(item, dict):
            compact[key] = {
                name: field
                for name, field in item.items()
                if name in {"id", "type", "status", "name", "title"}
            }
    return compact or None
