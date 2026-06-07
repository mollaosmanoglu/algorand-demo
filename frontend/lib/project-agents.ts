import type { ToolAction } from "@/lib/agent-events"
import type { ProjectAgent } from "@/lib/projects"

const CAPITAL_CITIES = [
  "Amsterdam",
  "Athens",
  "Bangkok",
  "Berlin",
  "Bern",
  "Bogota",
  "Brussels",
  "Cairo",
  "Canberra",
  "Copenhagen",
  "Dakar",
  "Dublin",
  "Helsinki",
  "Jakarta",
  "Lisbon",
  "London",
  "Madrid",
  "Nairobi",
  "Oslo",
  "Ottawa",
  "Paris",
  "Prague",
  "Reykjavik",
  "Rome",
  "Seoul",
  "Stockholm",
  "Tallinn",
  "Tokyo",
  "Vienna",
  "Warsaw",
] as const

function capitalIndex(agentId: string): number {
  let hash = 0
  for (const character of agentId) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }
  return hash % CAPITAL_CITIES.length
}

export function friendlyAgentName(agentId: string): string {
  return CAPITAL_CITIES[capitalIndex(agentId)]
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

  const usedNames = new Set<string>()

  return [...newestActionByAgent.values()]
    .sort(
      (left, right) =>
        new Date(right.created_at).getTime() -
        new Date(left.created_at).getTime(),
    )
    .map((action) => {
      const startIndex = capitalIndex(action.agent_id)
      let name: string = CAPITAL_CITIES[startIndex]

      for (
        let offset = 1;
        usedNames.has(name) && offset < CAPITAL_CITIES.length;
        offset += 1
      ) {
        name = CAPITAL_CITIES[(startIndex + offset) % CAPITAL_CITIES.length]
      }
      if (usedNames.has(name)) {
        name = `${name} ${usedNames.size + 1}`
      }
      usedNames.add(name)

      return {
        id: action.agent_id,
        name,
        description: "Live Codex agent",
        live: true,
      }
    })
}
