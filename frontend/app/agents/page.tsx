import { AgentsPage } from "@/components/agents/agents-page"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import path from "node:path"

type AgentsRouteProps = {
  searchParams: Promise<{
    agent?: string
  }>
}

export default async function AgentsRoute({ searchParams }: AgentsRouteProps) {
  const { agent = "research" } = await searchParams
  const workspaceName = path.basename(process.cwd())
  const projectName = path.basename(path.dirname(process.cwd()))

  return (
    <DashboardShell>
      <AgentsPage
        agent={agent}
        projectName={projectName}
        workspaceName={workspaceName}
      />
    </DashboardShell>
  )
}
