export type ProjectAgent = {
  id: string
  name: string
  description: string
  live?: boolean
}

export type ProgrammingProject = {
  id: string
  name: string
  path: string
  agents: ProjectAgent[]
  live?: boolean
}

export const programmingProjects: ProgrammingProject[] = [
  {
    id: "invoice-ops",
    name: "invoice-ops",
    path: "~/programming/invoice-ops",
    agents: [
      {
        id: "invoice-parser",
        name: "Tokyo",
        description: "Extracts invoice fields",
      },
      {
        id: "vendor-checker",
        name: "Berlin",
        description: "Validates vendor records",
      },
      {
        id: "payment-reviewer",
        name: "Nairobi",
        description: "Reviews outgoing payments",
      },
    ],
  },
  {
    id: "support-pilot",
    name: "support-pilot",
    path: "~/programming/support-pilot",
    agents: [
      {
        id: "ticket-router",
        name: "Lisbon",
        description: "Classifies incoming tickets",
      },
      {
        id: "response-writer",
        name: "Seoul",
        description: "Drafts customer replies",
      },
      {
        id: "refund-reviewer",
        name: "Oslo",
        description: "Checks refund requests",
      },
      {
        id: "escalation-agent",
        name: "Vienna",
        description: "Routes sensitive cases",
      },
    ],
  },
  {
    id: "fintech-onboard",
    name: "fintech-onboard",
    path: "~/programming/fintech-onboard",
    agents: [
      {
        id: "kyc-verifier",
        name: "Lagos",
        description: "Verifies customer identity documents",
      },
    ],
  },
]

export function findProject(projectId?: string): ProgrammingProject {
  return (
    programmingProjects.find((project) => project.id === projectId) ??
    programmingProjects.find((project) => project.id === "fintech-onboard")!
  )
}

export function findStaticAgent(
  project: ProgrammingProject,
  agentId?: string,
): ProjectAgent | undefined {
  return (
    project.agents.find((agent) => agent.id === agentId) ?? project.agents[0]
  )
}
