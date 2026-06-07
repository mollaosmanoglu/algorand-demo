"use client"

import * as React from "react"

import {
  AgentEventState,
  applyDashboardEvent,
  DashboardEvent,
  deriveActionRows,
  emptyAgentEventState,
} from "@/lib/agent-events"

const EVENTS_URL = "ws://127.0.0.1:4021/events"
const RECONNECT_DELAY_MS = 1500

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "warning"

export function useAgentEvents() {
  const [state, setState] = React.useState<AgentEventState>(emptyAgentEventState)
  const [connectionStatus, setConnectionStatus] =
    React.useState<ConnectionStatus>("connecting")

  React.useEffect(() => {
    let socket: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let stopped = false

    const connect = () => {
      if (stopped) return
      setConnectionStatus("connecting")
      socket = new WebSocket(EVENTS_URL)

      socket.onopen = () => setConnectionStatus("connected")
      socket.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data) as DashboardEvent
          setState((current) => applyDashboardEvent(current, event))
        } catch {
          setConnectionStatus("warning")
        }
      }
      socket.onerror = () => setConnectionStatus("warning")
      socket.onclose = () => {
        if (stopped) return
        setConnectionStatus("disconnected")
        reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS)
      }
    }

    connect()
    return () => {
      stopped = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      socket?.close()
    }
  }, [])

  const rows = React.useMemo(() => deriveActionRows(state), [state])
  const latestReceipt = React.useMemo(
    () =>
      Object.values(state.receipts).sort(
        (left, right) =>
          new Date(right.activated_at).getTime() -
          new Date(left.activated_at).getTime(),
      )[0] ?? null,
    [state.receipts],
  )

  return { state, rows, latestReceipt, connectionStatus }
}
