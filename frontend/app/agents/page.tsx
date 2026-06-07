import { AgentsPage } from "@/components/agents/agents-page"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { friendlyAgentName } from "@/lib/project-agents"
import { findProject, findStaticAgent } from "@/lib/projects"

type AgentsRouteProps = {
  searchParams: Promise<{
    project?: string
    agent?: string
  }>
}

export default async function AgentsRoute({ searchParams }: AgentsRouteProps) {
  const { project: projectId, agent: agentId } = await searchParams
  const project = findProject(projectId)
  const staticAgent = project.live
    ? undefined
    : findStaticAgent(project, agentId)
  const selectedAgentId = staticAgent?.id ?? agentId ?? ""
  const agentName = staticAgent?.name ??
    (selectedAgentId ? friendlyAgentName(selectedAgentId) : "Waiting for agent")

  return (
    <DashboardShell>
      <AgentsPage
        agent={selectedAgentId}
        agentName={agentName}
        projectName={project.name}
        workspaceName="programming"
      />
    </DashboardShell>
  )
}
