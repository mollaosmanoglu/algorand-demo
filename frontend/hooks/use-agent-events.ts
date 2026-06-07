"use client"

import * as React from "react"

import {
  AgentEventState,
  applyDashboardEvent,
  DashboardEvent,
  deriveActionRows,
  emptyAgentEventState,
} from "@/lib/agent-events"
import {
  AgentLogLine,
  createAgentLogLine,
  formatDashboardEvent,
} from "@/lib/agent-event-logs"

const EVENTS_URL = "ws://127.0.0.1:4021/events"
const RECONNECT_DELAY_MS = 1500
const MAX_LOG_LINES = 300

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "warning"

export function useAgentEvents() {
  const [state, setState] = React.useState<AgentEventState>(emptyAgentEventState)
  const [connectionStatus, setConnectionStatus] =
    React.useState<ConnectionStatus>("connecting")
  const [logLines, setLogLines] = React.useState<AgentLogLine[]>([])

  const appendLogs = React.useCallback((lines: AgentLogLine[]) => {
    if (!lines.length) return
    setLogLines((current) => [...current, ...lines].slice(-MAX_LOG_LINES))
  }, [])

  React.useEffect(() => {
    let socket: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let stopped = false

    const connect = () => {
      if (stopped) return
      setConnectionStatus("connecting")
      socket = new WebSocket(EVENTS_URL)

      socket.onopen = () => {
        setConnectionStatus("connected")
        appendLogs([createAgentLogLine("INFO", "websocket connected", "success")])
      }
      socket.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data) as DashboardEvent
          setState((current) => applyDashboardEvent(current, event))
          appendLogs(formatDashboardEvent(event))
        } catch {
          setConnectionStatus("warning")
          appendLogs([
            createAgentLogLine("WARN", "ignored malformed websocket message", "warning"),
          ])
        }
      }
      socket.onerror = () => {
        setConnectionStatus("warning")
        appendLogs([createAgentLogLine("ERROR", "websocket transport error", "error")])
      }
      socket.onclose = () => {
        if (stopped) return
        setConnectionStatus("disconnected")
        appendLogs([
          createAgentLogLine(
            "WARN",
            `websocket disconnected; retrying in ${RECONNECT_DELAY_MS}ms`,
            "warning",
          ),
        ])
        reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS)
      }
    }

    connect()
    return () => {
      stopped = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      socket?.close()
    }
  }, [appendLogs])

  const rows = React.useMemo(() => deriveActionRows(state), [state])
  const latestReceipt = React.useMemo(
    () =>
      Object.values(state.receipts)
        .filter((receipt) => receipt.settlement_transaction)
        .sort(
          (left, right) =>
            new Date(right.activated_at).getTime() -
            new Date(left.activated_at).getTime(),
        )[0] ?? null,
    [state.receipts],
  )
  const pendingSettlement = React.useMemo(() => {
    const confirmedQuoteIds = new Set(
      Object.values(state.receipts)
        .filter((receipt) => receipt.settlement_transaction)
        .map((receipt) => receipt.quote_id),
    )
    return (
      Object.values(state.quotes)
        .filter((quote) => !confirmedQuoteIds.has(quote.id))
        .sort(
          (left, right) =>
            new Date(right.expires_at).getTime() -
            new Date(left.expires_at).getTime(),
        )[0] ?? null
    )
  }, [state.quotes, state.receipts])

  return {
    state,
    rows,
    latestReceipt,
    pendingSettlement,
    connectionStatus,
    logLines,
  }
}
