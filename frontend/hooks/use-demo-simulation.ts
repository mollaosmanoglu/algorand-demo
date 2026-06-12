"use client"

import { useState, useEffect, useRef } from "react"
import type {
  AgentEventState,
  CoverageReceipt,
  Evaluation,
  Quote,
  ToolAction,
  ToolOutcome,
} from "@/lib/agent-events"

type DemoStep = {
  tool: string
  risk: Evaluation["risk_level"]
  denied?: boolean
  premium?: string
  limit?: string
  status?: ToolOutcome["state"]
  /** ms before this action appears (pending) */
  delay: number
  /** ms after appearing before it resolves */
  resolveDelay: number
}

const DEMO_SCRIPT: DemoStep[] = [
  { tool: "fetch_customer_email", risk: "low", delay: 600, resolveDelay: 500 },
  { tool: "scan_passport", risk: "low", delay: 900, resolveDelay: 600 },
  { tool: "verify_home_address", risk: "low", delay: 800, resolveDelay: 500 },
  { tool: "check_sanctions_db", risk: "medium", premium: "0.0028", limit: "500", delay: 1000, resolveDelay: 800 },
  { tool: "pull_credit_report", risk: "medium", premium: "0.0035", limit: "450", delay: 900, resolveDelay: 700 },
  { tool: "validate_bank_account", risk: "medium", premium: "0.0022", limit: "380", delay: 800, resolveDelay: 600 },
  { tool: "run_fraud_model", risk: "medium", premium: "0.0041", limit: "520", delay: 1000, resolveDelay: 900 },
  { tool: "send_verification_sms", risk: "low", delay: 700, resolveDelay: 400 },
  { tool: "approve_kyc_override", risk: "high", denied: true, delay: 1200, resolveDelay: 700 },
  { tool: "log_compliance_event", risk: "low", delay: 800, resolveDelay: 400 },
  { tool: "notify_compliance_team", risk: "low", delay: 700, resolveDelay: 500 },
  { tool: "issue_account_credentials", risk: "medium", premium: "0.0019", limit: "300", delay: 900, resolveDelay: 600 },
]

const NETWORK = "algorand:testnet"
const ASSET = "USDC"

/** Each step has two phases: "pending" (action only) and "resolved" (full data) */
type PhaseEntry = { stepIndex: number; resolved: boolean }

function buildState(agentId: string, phases: PhaseEntry[]): AgentEventState {
  const actions: Record<string, ToolAction> = {}
  const evaluations: Record<string, Evaluation> = {}
  const quotes: Record<string, Quote> = {}
  const receipts: Record<string, CoverageReceipt> = {}
  const outcomes: Record<string, ToolOutcome> = {}

  const now = Date.now()

  phases.forEach(({ stepIndex, resolved }) => {
    const step = DEMO_SCRIPT[stepIndex]
    const actionId = `demo_${agentId}_${stepIndex}`
    const quoteId = `quote_${agentId}_${stepIndex}`
    const receiptId = `receipt_${agentId}_${stepIndex}`
    const createdAt = new Date(now - (DEMO_SCRIPT.length - stepIndex) * 60_000).toISOString()
    const covered = Boolean(step.premium && !step.denied)

    // Phase 1: action always visible
    actions[actionId] = {
      id: actionId,
      agent_id: agentId,
      tool_name: step.tool,
      arguments: {},
      created_at: createdAt,
    }

    // Phase 2: evaluation + quote + receipt + outcome
    if (!resolved) return

    evaluations[actionId] = {
      action_id: actionId,
      decision: step.denied ? "deny" : "allow",
      risk_level: step.risk,
      rationale: step.denied
        ? "Policy blocked this high-risk action."
        : covered
          ? "Allowed with micro-coverage."
          : "Within policy bounds.",
      requires_coverage: covered,
      quote_id: covered ? quoteId : null,
      premium_usdc: step.premium ?? null,
      coverage_limit_usdc: step.limit ?? null,
      expires_at: covered
        ? new Date(Date.parse(createdAt) + 5 * 60_000).toISOString()
        : null,
    }

    if (covered) {
      quotes[quoteId] = {
        id: quoteId,
        action_id: actionId,
        premium_usdc: step.premium!,
        coverage_limit_usdc: step.limit!,
        expires_at: new Date(Date.parse(createdAt) + 5 * 60_000).toISOString(),
        consumed_at: createdAt,
      }
      receipts[receiptId] = {
        id: receiptId,
        action_id: actionId,
        quote_id: quoteId,
        premium_usdc: step.premium!,
        coverage_limit_usdc: step.limit!,
        network: NETWORK,
        asset: ASSET,
        activated_at: new Date(Date.parse(createdAt) + 12_000).toISOString(),
        payer: "MOCKPAYER",
        settlement_transaction: `DEMO${agentId.toUpperCase().replace("-", "")}${stepIndex}`,
      }
    }

    if (!step.denied) {
      outcomes[actionId] = {
        id: `outcome_${agentId}_${stepIndex}`,
        action_id: actionId,
        coverage_receipt_id: covered ? receiptId : null,
        state: step.status ?? "succeeded",
        result_summary: `${step.tool.replaceAll("_", " ")} completed`,
        recorded_at: new Date(Date.parse(createdAt) + 20_000).toISOString(),
      }
    }
  })

  return { actions, evaluations, quotes, receipts, outcomes }
}

export function useDemoSimulation(agentId: string, enabled: boolean) {
  const [phases, setPhases] = useState<PhaseEntry[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!enabled) return
    if (startedRef.current) return
    startedRef.current = true

    let step = 0
    const timers: ReturnType<typeof setTimeout>[] = []

    const scheduleNext = () => {
      if (step >= DEMO_SCRIPT.length) return
      const currentStep = step
      const script = DEMO_SCRIPT[currentStep]

      // Phase 1: show pending row
      timers.push(setTimeout(() => {
        setPhases((prev) => [...prev, { stepIndex: currentStep, resolved: false }])

        // Phase 2: resolve after resolveDelay
        timers.push(setTimeout(() => {
          setPhases((prev) =>
            prev.map((p) =>
              p.stepIndex === currentStep ? { ...p, resolved: true } : p
            )
          )
        }, script.resolveDelay))
      }, script.delay))

      step++
      // Schedule the next step after delay + a small buffer
      timerRef.current = setTimeout(() => {
        scheduleNext()
      }, script.delay + 200)
    }

    scheduleNext()

    return () => {
      timers.forEach(clearTimeout)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [enabled])

  const state = buildState(agentId, phases)
  const isRunning = phases.length < DEMO_SCRIPT.length || phases.some((p) => !p.resolved)

  return { state, isRunning }
}
