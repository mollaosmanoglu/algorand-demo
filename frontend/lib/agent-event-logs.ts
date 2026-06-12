import type { DashboardEvent } from "@/lib/agent-events"

export type AgentLogLevel = "info" | "event" | "success" | "warning" | "error"

export type AgentLogLine = {
  id: string
  timestamp: string
  level: AgentLogLevel
  label: string
  message: string
}

function timestamp(): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date())
}

export function createAgentLogLine(
  label: string,
  message: string,
  level: AgentLogLevel = "info",
): AgentLogLine {
  return {
    id: crypto.randomUUID(),
    timestamp: timestamp(),
    level,
    label,
    message,
  }
}

export function formatDashboardEvent(event: DashboardEvent): AgentLogLine[] {
  if (event.type === "snapshot" && event.snapshot) {
    return [
      createAgentLogLine(
        "SYNC",
        `restored ${event.snapshot.actions.length} actions, ${event.snapshot.receipts.length} settlements`,
      ),
    ]
  }

  const actionName = event.action?.tool_name ?? event.evaluation?.action_id ?? "unknown"

  if (event.type === "evaluation") {
    if (!event.evaluation) {
      return [createAgentLogLine("EVAL", `${actionName} queued`, "event")]
    }
    const evaluation = event.evaluation
    const level = evaluation.decision === "deny" ? "error" : "event"
    const coverage = evaluation.requires_coverage ? " coverage=required" : ""
    return [
      createAgentLogLine(
        "EVAL",
        `${actionName} decision=${evaluation.decision} risk=${evaluation.risk_level}${coverage}`,
        level,
      ),
    ]
  }

  if (event.type === "coverage") {
    const lines: AgentLogLine[] = []
    if (event.quote) {
      lines.push(
        createAgentLogLine(
          "QUOTE",
          `${actionName} premium=$${event.quote.premium_usdc} limit=$${event.quote.coverage_limit_usdc}`,
          "warning",
        ),
      )
    }
    if (event.receipt) {
      const transaction = event.receipt.settlement_transaction
        ? ` tx=${event.receipt.settlement_transaction}`
        : ""
      lines.push(
        createAgentLogLine(
          "PAID",
          `${actionName} receipt=${event.receipt.id}${transaction}`,
          "success",
        ),
      )
    }
    return lines
  }

  if (event.type === "outcome" && event.outcome) {
    const level =
      event.outcome.state === "succeeded"
        ? "success"
        : event.outcome.state === "failed"
          ? "error"
          : "warning"
    return [
      createAgentLogLine(
        "RESULT",
        `${actionName} state=${event.outcome.state}${event.outcome.result_summary ? ` ${event.outcome.result_summary}` : ""}`,
        level,
      ),
    ]
  }

  if (event.type === "codex_activity") {
    return [createAgentLogLine("CODEX", `${actionName} activity received`, "event")]
  }

  return []
}
