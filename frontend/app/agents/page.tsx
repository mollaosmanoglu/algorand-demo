import { AgentsPage } from "@/components/agents/agents-page"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

type AgentsRouteProps = {
  searchParams: Promise<{
    agent?: string
  }>
}

export default async function AgentsRoute({ searchParams }: AgentsRouteProps) {
  const { agent = "research" } = await searchParams

  return (
    <DashboardShell>
      <AgentsPage agent={agent} />
    </DashboardShell>
  )
}
