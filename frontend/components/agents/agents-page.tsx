import { Bot } from "lucide-react"

import { Card } from "@/components/ui/card"

type AgentsPageProps = {
  agent: string
}

const agents = {
  research: {
    title: "Research Agent",
    role: "Searches sources, compares claims, and prepares cited briefs.",
    metrics: [
      { label: "Research runs", value: "24" },
      { label: "Covered actions", value: "18" },
      { label: "Risk level", value: "Medium" },
    ],
  },
  "e-commerce": {
    title: "E-commerce Agent",
    role: "Manages catalog checks, price comparisons, and order workflows.",
    metrics: [
      { label: "Tasks today", value: "12" },
      { label: "Covered actions", value: "9" },
      { label: "Risk level", value: "High" },
    ],
  },
  insurance: {
    title: "Insurance Agent",
    role: "Evaluates action risk and requests coverage before execution.",
    metrics: [
      { label: "Quotes issued", value: "31" },
      { label: "Covered actions", value: "27" },
      { label: "Risk level", value: "Medium" },
    ],
  },
}

export function AgentsPage({ agent }: AgentsPageProps) {
  const selectedAgent = agents[agent as keyof typeof agents] ?? agents.research

  return (
    <div className="px-12 pt-14 pb-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent text-foreground">
          <Bot className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <h1 className="text-display font-semibold text-foreground">
            {selectedAgent.title}
          </h1>
          <p className="text-body text-muted-foreground">
            {selectedAgent.role}
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {selectedAgent.metrics.map((item) => (
          <Card key={item.label} className="rounded-lg border-border/70 p-4 shadow-none">
            <p className="text-meta text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-display font-semibold text-foreground">
              {item.value}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
