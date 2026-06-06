#!/usr/bin/env python3
import json
import os
import sys
from urllib import request

BACKEND_URL = os.getenv("LUPHRA_BACKEND_URL", "http://127.0.0.1:4021")


def payload() -> dict:
    raw = sys.stdin.read()
    return json.loads(raw) if raw.strip() else {}


def field(data: dict, *names: str) -> object:
    for name in names:
        if name in data:
            return data[name]
    return None


def tool_name(data: dict) -> str:
    tool = data.get("tool")
    if isinstance(tool, dict) and isinstance(tool.get("name"), str):
        return tool["name"]
    value = field(data, "tool_name", "toolName", "name")
    return value if isinstance(value, str) else "unknown"


def tool_args(data: dict) -> dict:
    tool = data.get("tool")
    if isinstance(tool, dict):
        for key in ("input", "arguments", "args"):
            value = tool.get(key)
            if isinstance(value, dict):
                return value
    value = field(data, "tool_input", "toolInput", "input", "arguments", "args")
    return value if isinstance(value, dict) else {}


def post(path: str, body: dict) -> dict:
    req = request.Request(
        f"{BACKEND_URL}{path}",
        data=json.dumps(body).encode(),
        headers={"content-type": "application/json"},
        method="POST",
    )
    with request.urlopen(req, timeout=30) as res:
        return json.loads(res.read().decode())


def approve(reason: str) -> None:
    print(json.dumps({"decision": "approve", "reason": reason}))
    raise SystemExit(0)


def block(reason: str) -> None:
    print(json.dumps({"decision": "block", "reason": reason}))
    raise SystemExit(2)


def pre(data: dict) -> None:
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
        block("coverage required; run the quoted payment flow before this tool")

    approve("allowed by Luphra")


def post_tool(data: dict) -> None:
    action_id = field(data, "action_id", "actionId")
    if not isinstance(action_id, str):
        approve("no action_id supplied")

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
