#!/usr/bin/env python3
import json
import os
import sys
import tempfile
from typing import Any
from urllib import request

BACKEND_URL = "http://127.0.0.1:4021"
CACHE_PATH = os.path.join(tempfile.gettempdir(), "luphra-hook-actions.json")


Payload = dict[str, Any]


def payload() -> Payload:
    raw = sys.stdin.read()
    data = json.loads(raw) if raw.strip() else {}
    return data if isinstance(data, dict) else {}


def field(data: Payload, *names: str) -> object:
    for name in names:
        if name in data:
            return data[name]
    return None


def call_key(data: Payload) -> str:
    value = field(data, "tool_call_id", "toolCallId", "call_id", "callId", "id")
    if isinstance(value, str):
        return value
    return f"{field(data, 'session_id', 'sessionId') or 'codex'}:{tool_name(data)}"


def load_cache() -> dict[str, str]:
    try:
        with open(CACHE_PATH, encoding="utf-8") as file:
            data = json.load(file)
    except FileNotFoundError:
        return {}
    return {str(key): str(value) for key, value in data.items()} if isinstance(data, dict) else {}


def save_cache(data: dict[str, str]) -> None:
    with open(CACHE_PATH, "w", encoding="utf-8") as file:
        json.dump(data, file)


def remember_action(data: Payload, action_id: object) -> None:
    if not isinstance(action_id, str):
        return
    cache = load_cache()
    cache[call_key(data)] = action_id
    save_cache(cache)


def pop_action(data: Payload) -> str | None:
    cache = load_cache()
    action_id = cache.pop(call_key(data), None)
    save_cache(cache)
    return action_id


def tool_name(data: Payload) -> str:
    tool = data.get("tool")
    if isinstance(tool, dict) and isinstance(tool.get("name"), str):
        return tool["name"]
    value = field(data, "tool_name", "toolName", "name")
    return value if isinstance(value, str) else "unknown"


def tool_args(data: Payload) -> Payload:
    tool = data.get("tool")
    if isinstance(tool, dict):
        for key in ("input", "arguments", "args"):
            value = tool.get(key)
            if isinstance(value, dict):
                return value
    value = field(data, "tool_input", "toolInput", "input", "arguments", "args")
    return value if isinstance(value, dict) else {}


def post(path: str, body: Payload) -> Payload:
    req = request.Request(
        f"{BACKEND_URL}{path}",
        data=json.dumps(body).encode(),
        headers={"content-type": "application/json"},
        method="POST",
    )
    with request.urlopen(req, timeout=30) as res:
        data = json.loads(res.read().decode())
        return data if isinstance(data, dict) else {}


def approve(reason: str) -> None:
    print(json.dumps({"decision": "approve", "reason": reason}))
    raise SystemExit(0)


def block(reason: str) -> None:
    print(json.dumps({"decision": "block", "reason": reason}))
    raise SystemExit(2)


def pre(data: Payload) -> None:
    result = post(
        "/evaluate",
        {
            "agent_id": str(field(data, "agent_id", "agentId", "session_id") or "codex"),
            "tool_name": tool_name(data),
            "arguments": tool_args(data),
        },
    )

    if result["decision"] == "deny":
        block(result.get("rationale", "denied by Luphra"))

    if result.get("requires_coverage"):
        block(
            "coverage required before this tool "
            f"(action_id={result.get('action_id')}, quote_id={result.get('quote_id')})"
        )

    remember_action(data, result.get("action_id"))
    approve("allowed by Luphra")


def post_tool(data: Payload) -> None:
    action_id = field(data, "action_id", "actionId")
    if not isinstance(action_id, str):
        action_id = pop_action(data)
    if not isinstance(action_id, str):
        approve("no evaluated action found")

    state = "failed" if field(data, "error", "is_error") else "succeeded"
    post(f"/outcome/{action_id}", {"state": state, "result_summary": None})
    approve("outcome recorded")


def main() -> None:
    data = payload()
    event = os.getenv("LUPHRA_HOOK_EVENT") or data.get("hook_event_name")
    if event == "PostToolUse":
        post_tool(data)
    else:
        pre(data)


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception as exc:
        block(f"Luphra hook failed: {exc}")
