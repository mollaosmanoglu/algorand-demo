"use client"

import * as React from "react"

import type { AgentLogLine, AgentLogLevel } from "@/lib/agent-event-logs"
import { cn } from "@/lib/utils"

const levelClass: Record<AgentLogLevel, string> = {
  info: "text-zinc-400",
  event: "text-sky-400",
  success: "text-emerald-400",
  warning: "text-amber-400",
  error: "text-red-400",
}

export function AgentEventTerminal({ lines }: { lines: AgentLogLine[] }) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const shouldFollowRef = React.useRef(true)

  const handleScroll = React.useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const distanceFromBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight
    shouldFollowRef.current = distanceFromBottom < 32
  }, [])

  React.useEffect(() => {
    const viewport = viewportRef.current
    if (viewport && shouldFollowRef.current) {
      viewport.scrollTop = viewport.scrollHeight
    }
  }, [lines])

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#09090b] text-zinc-300">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/10 px-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[10px] text-zinc-500">
          luphra:event-stream
        </span>
      </div>
      <div
        ref={viewportRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-3 font-mono text-[11px] leading-5"
      >
        {lines.length ? (
          lines.map((line) => (
            <div key={line.id} className="flex min-w-0 gap-2">
              <span className="shrink-0 text-zinc-600">{line.timestamp}</span>
              <span className={cn("w-12 shrink-0", levelClass[line.level])}>
                {line.label}
              </span>
              <span className="min-w-0 break-words text-zinc-300">{line.message}</span>
            </div>
          ))
        ) : (
          <div className="text-zinc-500">Waiting for agent events...</div>
        )}
        <div className="mt-1 flex items-center gap-2 text-zinc-500">
          <span>&gt;</span>
          <span className="h-3.5 w-1.5 animate-pulse bg-zinc-400" />
        </div>
      </div>
    </div>
  )
}
