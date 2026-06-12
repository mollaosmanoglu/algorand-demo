import type {
  AgentEventState,
  CoverageReceipt,
  Evaluation,
  Quote,
  ToolAction,
  ToolOutcome,
} from "@/lib/agent-events"
import type { AgentLogLine } from "@/lib/agent-event-logs"

export type MockAgentDashboard = {
  state: AgentEventState
  logs: AgentLogLine[]
  objective: string
  policy: string
  wallet: string
  perCallLimit: string
}

export function deriveStateLogLines(state: AgentEventState): AgentLogLine[] {
  return Object.values(state.actions)
    .sort(
      (left, right) =>
        new Date(left.created_at).getTime() - new Date(right.created_at).getTime(),
    )
    .flatMap((action) => {
      const evaluation = state.evaluations[action.id]
      const quote = Object.values(state.quotes).find(
        (item) => item.action_id === action.id,
      )
      const receipt = Object.values(state.receipts).find(
        (item) => item.action_id === action.id,
      )
      const outcome = state.outcomes[action.id]
      const timestamp = new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date(action.created_at))
      const lines: AgentLogLine[] = [
        {
          id: `${action.id}-evaluation`,
          timestamp,
          label: evaluation?.decision === "deny" ? "DENY" : "EVAL",
          message: evaluation
            ? `${action.tool_name} decision=${evaluation.decision} risk=${evaluation.risk_level}`
            : `${action.tool_name} queued`,
          level: evaluation?.decision === "deny" ? "error" : "event",
        },
      ]

      if (quote) {
        lines.push({
          id: `${action.id}-quote`,
          timestamp,
          label: "QUOTE",
          message: `${action.tool_name} premium=$${quote.premium_usdc} limit=$${quote.coverage_limit_usdc}`,
          level: "warning",
        })
      }
      if (receipt) {
        lines.push({
          id: `${action.id}-receipt`,
          timestamp,
          label: "PAID",
          message: `${action.tool_name} receipt=${receipt.id}`,
          level: "success",
        })
      }
      if (outcome) {
        lines.push({
          id: `${action.id}-outcome`,
          timestamp,
          label: "RESULT",
          message: `${action.tool_name} state=${outcome.state}`,
          level: outcome.state === "succeeded" ? "success" : "warning",
        })
      }
      return lines
    })
}

type MockAction = {
  tool: string
  risk: Evaluation["risk_level"]
  status: ToolOutcome["state"]
  premium?: string
  limit?: string
  denied?: boolean
}

const NETWORK = "defter:testnet"
const ASSET = ""
const ACTION_DAY_OFFSETS = [
  0, 0, 0, 0, 0,
  1, 1, 1, 1,
  2, 2, 2,
  3, 3, 3,
  4, 4,
  5, 5,
  6,
] as const

const agentScenarios: Record<
  string,
  {
    objective: string
    policy: string
    wallet: string
    perCallLimit: string
    actions: MockAction[]
  }
> = {
  "invoice-parser": {
    objective: "Extract and validate invoice fields",
    policy: "Document Processing Cover",
    wallet: "$42.18",
    perCallLimit: "$250",
    actions: [
      { tool: "parse_invoice_pdf", risk: "low", status: "succeeded" },
      { tool: "store_invoice_record", risk: "medium", status: "succeeded", premium: "0.0012", limit: "180" },
      { tool: "flag_duplicate_invoice", risk: "low", status: "succeeded" },
    ],
  },
  "vendor-checker": {
    objective: "Verify vendors before payment approval",
    policy: "Vendor Verification Cover",
    wallet: "$31.64",
    perCallLimit: "$500",
    actions: [
      { tool: "lookup_vendor_registry", risk: "low", status: "succeeded" },
      { tool: "update_vendor_status", risk: "medium", status: "succeeded", premium: "0.0025", limit: "400" },
      { tool: "approve_unverified_vendor", risk: "high", status: "cancelled", denied: true },
    ],
  },
  "payment-reviewer": {
    objective: "Review outgoing payments before release",
    policy: "Payment Review Cover",
    wallet: "$58.92",
    perCallLimit: "$1,000",
    actions: [
      { tool: "review_payment_batch", risk: "medium", status: "succeeded" },
      { tool: "release_vendor_payment", risk: "high", status: "succeeded", premium: "0.0048", limit: "950" },
      { tool: "export_payment_report", risk: "low", status: "succeeded" },
    ],
  },
  "ticket-router": {
    objective: "Classify and route incoming support tickets",
    policy: "Support Operations Cover",
    wallet: "$24.75",
    perCallLimit: "$100",
    actions: [
      { tool: "classify_ticket", risk: "low", status: "succeeded" },
      { tool: "assign_support_queue", risk: "low", status: "succeeded" },
      { tool: "mark_ticket_urgent", risk: "medium", status: "succeeded", premium: "0.0008", limit: "75" },
    ],
  },
  "response-writer": {
    objective: "Draft accurate customer support responses",
    policy: "Customer Communications Cover",
    wallet: "$27.41",
    perCallLimit: "$150",
    actions: [
      { tool: "read_customer_history", risk: "low", status: "succeeded" },
      { tool: "send_customer_reply", risk: "medium", status: "succeeded", premium: "0.0015", limit: "120" },
      { tool: "publish_private_notes", risk: "high", status: "cancelled", denied: true },
    ],
  },
  "refund-reviewer": {
    objective: "Assess refund eligibility and exposure",
    policy: "Refund Decision Cover",
    wallet: "$36.09",
    perCallLimit: "$750",
    actions: [
      { tool: "inspect_refund_request", risk: "low", status: "succeeded" },
      { tool: "approve_customer_refund", risk: "high", status: "succeeded", premium: "0.0036", limit: "700" },
      { tool: "notify_finance_team", risk: "medium", status: "succeeded" },
    ],
  },
  "escalation-agent": {
    objective: "Escalate sensitive customer cases",
    policy: "Escalation Response Cover",
    wallet: "$29.83",
    perCallLimit: "$300",
    actions: [
      { tool: "score_escalation_risk", risk: "medium", status: "succeeded" },
      { tool: "page_incident_manager", risk: "medium", status: "succeeded", premium: "0.0018", limit: "260" },
      { tool: "close_active_escalation", risk: "high", status: "cancelled", denied: true },
    ],
  },
  "kyc-verifier": {
    objective: "Verify customer identity for onboarding",
    policy: "Identity Verification Cover",
    wallet: "$45.20",
    perCallLimit: "$600",
    actions: [
      { tool: "scan_passport", risk: "low", status: "succeeded" },
      { tool: "check_sanctions_db", risk: "medium", status: "succeeded", premium: "0.0031", limit: "500" },
      { tool: "approve_kyc_override", risk: "high", status: "cancelled", denied: true },
    ],
  },
}

function buildDashboard(agentId: string): MockAgentDashboard {
  const scenario = agentScenarios[agentId]
  const actions: Record<string, ToolAction> = {}
  const evaluations: Record<string, Evaluation> = {}
  const quotes: Record<string, Quote> = {}
  const receipts: Record<string, CoverageReceipt> = {}
  const outcomes: Record<string, ToolOutcome> = {}
  const logs: AgentLogLine[] = []

  const demoActions = Array.from({ length: 20 }, (_, index) => {
    const template = scenario.actions[index % scenario.actions.length]
    const run = Math.floor(index / scenario.actions.length) + 1
    const premium = template.premium
      ? (Number(template.premium) + run * 0.0001).toFixed(4)
      : undefined

    return {
      ...template,
      tool: `${template.tool}_run_${run}`,
      premium,
      status:
        !template.denied && index > 0 && index % 11 === 0
          ? ("failed" as const)
          : template.status,
    }
  })

  demoActions.forEach((item, index) => {
    const actionId = `mock_${agentId}_${index + 1}`
    const quoteId = `quote_${agentId}_${index + 1}`
    const receiptId = `receipt_${agentId}_${index + 1}`
    const dayOffset = ACTION_DAY_OFFSETS[index]
    const sequenceOnDay = ACTION_DAY_OFFSETS
      .slice(0, index)
      .filter((offset) => offset === dayOffset).length
    const createdAt = new Date(
      Date.UTC(
        2026,
        5,
        7 - dayOffset,
        15 - sequenceOnDay,
        (index * 17) % 60,
        (index * 11) % 60,
      ),
    )
    const timestamp = createdAt.toISOString()
    const covered = Boolean(item.premium && !item.denied)

    actions[actionId] = {
      id: actionId,
      agent_id: agentId,
      tool_name: item.tool,
      arguments: {},
      created_at: timestamp,
    }
    evaluations[actionId] = {
      action_id: actionId,
      decision: item.denied ? "deny" : "allow",
      risk_level: item.risk,
      rationale: item.denied
        ? "Policy denied this high-impact action."
        : covered
          ? "Action allowed after micro-coverage."
          : "Action is within the configured policy.",
      requires_coverage: covered,
      quote_id: covered ? quoteId : null,
      premium_usdc: item.premium ?? null,
      coverage_limit_usdc: item.limit ?? null,
      expires_at: covered
        ? new Date(createdAt.getTime() + 5 * 60_000).toISOString()
        : null,
    }

    if (covered) {
      quotes[quoteId] = {
        id: quoteId,
        action_id: actionId,
        premium_usdc: item.premium!,
        coverage_limit_usdc: item.limit!,
        expires_at: new Date(createdAt.getTime() + 5 * 60_000).toISOString(),
        consumed_at: timestamp,
      }
      receipts[receiptId] = {
        id: receiptId,
        action_id: actionId,
        quote_id: quoteId,
        premium_usdc: item.premium!,
        coverage_limit_usdc: item.limit!,
        network: NETWORK,
        asset: ASSET,
        activated_at: new Date(createdAt.getTime() + 12_000).toISOString(),
        payer: "MOCKPAYER",
        settlement_transaction: `MOCK${agentId.replaceAll("-", "").toUpperCase()}${index + 1}`,
      }
    }

    if (!item.denied) {
      outcomes[actionId] = {
        id: `outcome_${agentId}_${index + 1}`,
        action_id: actionId,
        coverage_receipt_id: covered ? receiptId : null,
        state: item.status,
        result_summary:
          item.status === "failed"
            ? `${item.tool.replaceAll("_", " ")} failed during execution`
            : `${item.tool.replaceAll("_", " ")} completed`,
        recorded_at: new Date(createdAt.getTime() + 20_000).toISOString(),
      }
    }

    logs.push({
      id: `${actionId}-log`,
      timestamp,
      label: item.denied ? "DENY" : covered ? "PAID" : "ALLOW",
      message: `${item.tool} ${
        item.denied
          ? "blocked by policy"
          : item.status === "failed"
            ? "failed during execution"
            : covered
              ? `settled premium=$${item.premium}`
              : "completed"
      }`,
      level:
        item.denied || item.status === "failed"
          ? "error"
          : covered
            ? "success"
            : "info",
    })
  })

  return {
    state: { actions, evaluations, quotes, receipts, outcomes },
    logs,
    objective: scenario.objective,
    policy: scenario.policy,
    wallet: scenario.wallet,
    perCallLimit: scenario.perCallLimit,
  }
}

export const mockAgentDashboards = Object.fromEntries(
  Object.keys(agentScenarios).map((agentId) => [agentId, buildDashboard(agentId)]),
) as Record<string, MockAgentDashboard>
