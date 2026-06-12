export type Decision = "allow" | "deny"
export type RiskLevel = "low" | "medium" | "high"
export type OutcomeState = "succeeded" | "failed" | "cancelled"

export type ToolAction = {
  id: string
  agent_id: string
  tool_name: string
  arguments: Record<string, unknown>
  created_at: string
}

export type Evaluation = {
  action_id: string
  decision: Decision
  risk_level: RiskLevel
  rationale: string
  requires_coverage: boolean
  quote_id: string | null
  premium_usdc: string | null
  coverage_limit_usdc: string | null
  expires_at: string | null
}

export type Quote = {
  id: string
  action_id: string
  premium_usdc: string
  coverage_limit_usdc: string
  expires_at: string
  consumed_at: string | null
}

export type CoverageReceipt = {
  id: string
  action_id: string
  quote_id: string
  premium_usdc: string
  coverage_limit_usdc: string
  network: string
  asset: string
  activated_at: string
  payer: string | null
  settlement_transaction: string | null
}

export type ToolOutcome = {
  id: string
  action_id: string
  coverage_receipt_id: string | null
  state: OutcomeState
  result_summary: string | null
  recorded_at: string
}

export type DashboardSnapshot = {
  actions: ToolAction[]
  evaluations: Evaluation[]
  quotes: Quote[]
  receipts: CoverageReceipt[]
  outcomes: ToolOutcome[]
}

export type DashboardEvent = {
  type: "snapshot" | "evaluation" | "coverage" | "outcome" | "codex_activity"
  snapshot: DashboardSnapshot | null
  action: ToolAction | null
  evaluation: Evaluation | null
  quote: Quote | null
  receipt: CoverageReceipt | null
  outcome: ToolOutcome | null
}

export type AgentActionRow = {
  id: string
  time: string
  action: string
  trace: string
  decision: string
  risk: string
  premium: string
  status: string
  rationale: string | null
  pending: boolean
}

export type AgentEventState = {
  actions: Record<string, ToolAction>
  evaluations: Record<string, Evaluation>
  quotes: Record<string, Quote>
  receipts: Record<string, CoverageReceipt>
  outcomes: Record<string, ToolOutcome>
}

export const emptyAgentEventState: AgentEventState = {
  actions: {},
  evaluations: {},
  quotes: {},
  receipts: {},
  outcomes: {},
}

function indexBy<T>(items: T[], key: (item: T) => string): Record<string, T> {
  return Object.fromEntries(items.map((item) => [key(item), item]))
}

export function stateFromSnapshot(snapshot: DashboardSnapshot): AgentEventState {
  return {
    actions: indexBy(snapshot.actions, (item) => item.id),
    evaluations: indexBy(snapshot.evaluations, (item) => item.action_id),
    quotes: indexBy(snapshot.quotes, (item) => item.id),
    receipts: indexBy(snapshot.receipts, (item) => item.id),
    outcomes: indexBy(snapshot.outcomes, (item) => item.action_id),
  }
}

export function applyDashboardEvent(
  state: AgentEventState,
  event: DashboardEvent,
): AgentEventState {
  if (event.type === "snapshot" && event.snapshot) {
    return stateFromSnapshot(event.snapshot)
  }

  return {
    actions: event.action
      ? { ...state.actions, [event.action.id]: event.action }
      : state.actions,
    evaluations: event.evaluation
      ? { ...state.evaluations, [event.evaluation.action_id]: event.evaluation }
      : state.evaluations,
    quotes: event.quote
      ? { ...state.quotes, [event.quote.id]: event.quote }
      : state.quotes,
    receipts: event.receipt
      ? { ...state.receipts, [event.receipt.id]: event.receipt }
      : state.receipts,
    outcomes: event.outcome
      ? { ...state.outcomes, [event.outcome.action_id]: event.outcome }
      : state.outcomes,
  }
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function friendlyToolName(toolName: string): string {
  const rawName = toolName.split("__").at(-1) ?? toolName
  return rawName
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(value))
}

export function formatUsdc(value: string | null | undefined): string {
  if (!value) return "-"
  const amount = Number(value)
  if (!Number.isFinite(amount)) return `${value} USDC`
  return `${amount.toLocaleString(undefined, {
    maximumFractionDigits: 6,
  })} USDC`
}

export function friendlyNetwork(network: string): string {
  return network.startsWith("defter:") ? "Defter TestNet" : network
}

export function filterAgentEventState(
  state: AgentEventState,
  agentId: string,
): AgentEventState {
  if (!agentId) return emptyAgentEventState

  const actions = Object.fromEntries(
    Object.entries(state.actions).filter(([, action]) => action.agent_id === agentId),
  )
  const actionIds = new Set(Object.keys(actions))
  const quotes = Object.fromEntries(
    Object.entries(state.quotes).filter(([, quote]) =>
      actionIds.has(quote.action_id),
    ),
  )
  const quoteIds = new Set(Object.keys(quotes))

  return {
    actions,
    evaluations: Object.fromEntries(
      Object.entries(state.evaluations).filter(([actionId]) =>
        actionIds.has(actionId),
      ),
    ),
    quotes,
    receipts: Object.fromEntries(
      Object.entries(state.receipts).filter(
        ([, receipt]) =>
          actionIds.has(receipt.action_id) || quoteIds.has(receipt.quote_id),
      ),
    ),
    outcomes: Object.fromEntries(
      Object.entries(state.outcomes).filter(([actionId]) =>
        actionIds.has(actionId),
      ),
    ),
  }
}

export function deriveActionRows(state: AgentEventState): AgentActionRow[] {
  const quotesByAction = indexBy(Object.values(state.quotes), (item) => item.action_id)
  const receiptsByAction = indexBy(
    Object.values(state.receipts),
    (item) => item.action_id,
  )

  return Object.values(state.actions)
    .sort(
      (left, right) =>
        new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
    )
    .map((action) => {
      const evaluation = state.evaluations[action.id]
      const quote = quotesByAction[action.id]
      const receipt = receiptsByAction[action.id]
      const outcome = state.outcomes[action.id]

      let status = "Evaluating"
      if (evaluation?.decision === "deny") status = "Denied"
      else if (outcome) status = titleCase(outcome.state)
      else if (receipt) status = "Paid"
      else if (quote) status = "Quoted"
      else if (evaluation?.decision === "allow") status = "Allowed"

      const trace = [
        "evaluate",
        evaluation ? (evaluation.decision === "deny" ? "deny" : "allow") : null,
        quote ? "quote" : null,
        receipt ? "x402 settle" : null,
        outcome ? "outcome" : null,
      ]
        .filter(Boolean)
        .join(" -> ")

      const decision = receipt
        ? "Paid"
        : quote
          ? "Quoted"
          : evaluation
            ? titleCase(evaluation.decision === "allow" ? "allowed" : "denied")
            : "Pending"

      return {
        id: action.id,
        time: formatTime(action.created_at),
        action: friendlyToolName(action.tool_name),
        trace,
        decision,
        risk: evaluation ? titleCase(evaluation.risk_level) : "-",
        premium: formatUsdc(quote?.premium_usdc ?? evaluation?.premium_usdc),
        status,
        rationale: evaluation?.rationale ?? null,
        pending: !evaluation,
      }
    })
}
