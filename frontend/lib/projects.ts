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
        name: "Invoice Parser",
        description: "Extracts invoice fields",
      },
      {
        id: "vendor-checker",
        name: "Vendor Checker",
        description: "Validates vendor records",
      },
      {
        id: "payment-reviewer",
        name: "Payment Reviewer",
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
        name: "Ticket Router",
        description: "Classifies incoming tickets",
      },
      {
        id: "response-writer",
        name: "Response Writer",
        description: "Drafts customer replies",
      },
      {
        id: "refund-reviewer",
        name: "Refund Reviewer",
        description: "Checks refund requests",
      },
      {
        id: "escalation-agent",
        name: "Escalation Agent",
        description: "Routes sensitive cases",
      },
    ],
  },
  {
    id: "algorand-demo",
    name: "algorand-demo",
    path: "~/programming/algorand-demo",
    agents: [],
    live: true,
  },
]

export function findProject(projectId?: string): ProgrammingProject {
  return (
    programmingProjects.find((project) => project.id === projectId) ??
    programmingProjects.find((project) => project.id === "algorand-demo")!
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
