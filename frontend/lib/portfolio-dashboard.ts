import type { AgentEventState, RiskLevel } from "@/lib/agent-events"
import { formatUsdc } from "@/lib/agent-events"
import { mockAgentDashboards } from "@/lib/mock-agent-dashboards"
import { deriveLiveAgents, friendlyAgentName } from "@/lib/project-agents"
import { programmingProjects } from "@/lib/projects"

export type PortfolioMetric = {
  id: string
  label: string
  value: string
  suffix: string
  description: string
  chartKey: "actions" | "value" | "premium" | "settlements"
}

export type PortfolioChartPoint = {
  day: string
  actions: number
  value: number
  premium: number
  settlements: number
}

export type PortfolioAction = {
  id: string
  projectId: string
  agentId: string
  agent: string
  action: string
  decision: "Allowed" | "Quoted" | "Paid" | "Denied"
  risk: "Low" | "Medium" | "High"
  premium: string
  coverage: string
  settlement: string
  lastEvent: string
  createdAt: string
}

export type ProjectActivity = {
  id: string
  name: string
  agents: number
  actions: number
  paid: number
  denied: number
  coveredValue: string
  premiums: string
  lastActivity: string
}

function mergeStates(states: AgentEventState[]): AgentEventState {
  return states.reduce<AgentEventState>(
    (merged, state) => ({
      actions: { ...merged.actions, ...state.actions },
      evaluations: { ...merged.evaluations, ...state.evaluations },
      quotes: { ...merged.quotes, ...state.quotes },
      receipts: { ...merged.receipts, ...state.receipts },
      outcomes: { ...merged.outcomes, ...state.outcomes },
    }),
    { actions: {}, evaluations: {}, quotes: {}, receipts: {}, outcomes: {} },
  )
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function toolName(value: string): string {
  return (value.split("__").at(-1) ?? value)
    .replace(/_run_\d+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function relativeTime(value: string): string {
  const minutes = Math.max(
    0,
    Math.round((Date.now() - new Date(value).getTime()) / 60_000),
  )
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  return `${Math.round(hours / 24)} days ago`
}

export function derivePortfolioDashboard(liveState: AgentEventState) {
  const mockState = mergeStates(
    Object.values(mockAgentDashboards).map((dashboard) => dashboard.state),
  )
  const state = mergeStates([mockState, liveState])
  const liveNames = new Map(
    deriveLiveAgents(Object.values(liveState.actions)).map((agent) => [
      agent.id,
      agent.name,
    ]),
  )
  const mockAgentProject = new Map<string, string>()
  const mockAgentName = new Map<string, string>()

  for (const project of programmingProjects) {
    for (const agent of project.agents) {
      mockAgentProject.set(agent.id, project.id)
      mockAgentName.set(agent.id, agent.name)
    }
  }

  const quotesByAction = new Map(
    Object.values(state.quotes).map((quote) => [quote.action_id, quote]),
  )
  const receiptsByAction = new Map(
    Object.values(state.receipts).map((receipt) => [receipt.action_id, receipt]),
  )

  const actions: PortfolioAction[] = Object.values(state.actions)
    .sort(
      (left, right) =>
        new Date(right.created_at).getTime() -
        new Date(left.created_at).getTime(),
    )
    .map((action) => {
      const evaluation = state.evaluations[action.id]
      const quote = quotesByAction.get(action.id)
      const receipt = receiptsByAction.get(action.id)
      const projectId = mockAgentProject.get(action.agent_id) ?? "algorand-demo"
      const agent =
        mockAgentName.get(action.agent_id) ??
        liveNames.get(action.agent_id) ??
        friendlyAgentName(action.agent_id)

      return {
        id: action.id,
        projectId,
        agentId: action.agent_id,
        agent,
        action: toolName(action.tool_name),
        decision: receipt
          ? "Paid"
          : quote
            ? "Quoted"
            : evaluation?.decision === "deny"
              ? "Denied"
              : "Allowed",
        risk: titleCase(evaluation?.risk_level ?? "low") as Capitalize<RiskLevel>,
        premium: formatUsdc(quote?.premium_usdc ?? evaluation?.premium_usdc),
        coverage: formatUsdc(
          receipt?.coverage_limit_usdc ??
            quote?.coverage_limit_usdc ??
            evaluation?.coverage_limit_usdc,
        ),
        settlement: receipt ? "Settled" : quote ? "Awaiting payment" : "Not required",
        lastEvent: relativeTime(action.created_at),
        createdAt: action.created_at,
      }
    })

  const activeAgents = new Set(actions.map((action) => action.agentId)).size
  const coveredValue = Object.values(state.receipts).reduce(
    (total, receipt) => total + Number(receipt.coverage_limit_usdc),
    0,
  )
  const premiums = Object.values(state.receipts).reduce(
    (total, receipt) => total + Number(receipt.premium_usdc),
    0,
  )

  const metrics: PortfolioMetric[] = [
    {
      id: "active_agents",
      label: "Active agents",
      value: String(activeAgents),
      suffix: "",
      description: "Agents represented across mock projects and live Codex activity",
      chartKey: "actions",
    },
    {
      id: "actions_evaluated",
      label: "Actions evaluated",
      value: String(actions.length),
      suffix: "",
      description: "Combined portfolio tool actions evaluated by Luphra",
      chartKey: "actions",
    },
    {
      id: "covered_value",
      label: "Covered value",
      value: coveredValue.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      suffix: "USDC",
      description: "Coverage limits activated across paid actions",
      chartKey: "value",
    },
    {
      id: "premiums_collected",
      label: "Premiums settled",
      value: premiums.toLocaleString(undefined, { maximumFractionDigits: 6 }),
      suffix: "USDC",
      description: "Micro-premiums settled through x402 coverage receipts",
      chartKey: "premium",
    },
  ]

  const daily = new Map<string, PortfolioChartPoint>()
  for (const action of actions) {
    const day = action.createdAt.slice(0, 10)
    const point = daily.get(day) ?? {
      day,
      actions: 0,
      value: 0,
      premium: 0,
      settlements: 0,
    }
    point.actions += 1
    const receipt = receiptsByAction.get(action.id)
    if (receipt) {
      point.value += Number(receipt.coverage_limit_usdc)
      point.premium += Number(receipt.premium_usdc)
      point.settlements += 1
    }
    daily.set(day, point)
  }

  const projects: ProjectActivity[] = programmingProjects.map((project) => {
    const projectActions = actions.filter(
      (action) => action.projectId === project.id,
    )
    const actionIds = new Set(projectActions.map((action) => action.id))
    const receipts = Object.values(state.receipts).filter((receipt) =>
      actionIds.has(receipt.action_id),
    )
    const latest = projectActions[0]?.createdAt

    return {
      id: project.id,
      name: project.name,
      agents: new Set(projectActions.map((action) => action.agentId)).size,
      actions: projectActions.length,
      paid: projectActions.filter((action) => action.decision === "Paid").length,
      denied: projectActions.filter((action) => action.decision === "Denied")
        .length,
      coveredValue: formatUsdc(
        String(
          receipts.reduce(
            (total, receipt) => total + Number(receipt.coverage_limit_usdc),
            0,
          ),
        ),
      ),
      premiums: formatUsdc(
        String(
          receipts.reduce(
            (total, receipt) => total + Number(receipt.premium_usdc),
            0,
          ),
        ),
      ),
      lastActivity: latest ? relativeTime(latest) : "No activity",
    }
  })

  return {
    metrics,
    chartData: [...daily.values()].sort((a, b) => a.day.localeCompare(b.day)),
    actions: actions.slice(0, 20),
    projects,
  }
}
