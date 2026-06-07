import type { ToolAction } from "@/lib/agent-events"
import type { ProjectAgent } from "@/lib/projects"

export function friendlyAgentName(agentId: string): string {
  return agentId
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function deriveLiveAgents(actions: ToolAction[]): ProjectAgent[] {
  const newestActionByAgent = new Map<string, ToolAction>()

  for (const action of actions) {
    const agentId = action.agent_id.trim()
    if (!agentId) continue

    const existing = newestActionByAgent.get(agentId)
    if (
      !existing ||
      new Date(action.created_at).getTime() > new Date(existing.created_at).getTime()
    ) {
      newestActionByAgent.set(agentId, action)
    }
  }

  return [...newestActionByAgent.values()]
    .sort(
      (left, right) =>
        new Date(right.created_at).getTime() -
        new Date(left.created_at).getTime(),
    )
    .map((action) => ({
      id: action.agent_id,
      name: friendlyAgentName(action.agent_id),
      description: "Live Codex agent",
      live: true,
    }))
}
