"use client"

import * as React from "react"
import {
  Bot,
  Check,
  Clock3,
  Code2,
  PanelRightClose,
  PanelRightOpen,
  Eye,
  FileText,
  Play,
  Plus,
  Terminal,
  Wrench,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type AgentsPageProps = {
  agent: string
  projectName: string
  workspaceName: string
}

const agentNames = {
  research: "Research Agent",
  "e-commerce": "E-commerce Agent",
  insurance: "Insurance Agent",
}

const traceEvents = [
  {
    icon: Terminal,
    label: "Shell",
    title: "git status --short --branch",
    detail: "Checked workspace state before editing.",
    time: "12s",
  },
  {
    icon: FileText,
    label: "Read",
    title: "frontend/app/globals.css",
    detail: "Loaded neutral tokens, typography scale, and sidebar variables.",
    time: "18s",
  },
  {
    icon: Wrench,
    label: "Tool",
    title: "evaluate_action",
    detail: "Requested coverage for a bounded frontend update.",
    time: "24s",
  },
  {
    icon: Code2,
    label: "Edit",
    title: "components/agents/agents-page.tsx",
    detail: "Prepared live trace workspace layout using shadcn primitives.",
    time: "31s",
  },
  {
    icon: Check,
    label: "Verify",
    title: "eslint scoped check",
    detail: "Queued lint verification for changed UI components.",
    time: "46s",
  },
]

const reviewFiles = [
  { path: "frontend/app/agents/page.tsx", delta: "+18" },
  { path: "frontend/app/page.tsx", delta: "+16 -32" },
  { path: "frontend/components/agents/agents-page.tsx", delta: "+92 -3" },
  { path: "frontend/components/dashboard/sidebar.tsx", delta: "+72 -23" },
  { path: "frontend/components/dashboard/dashboard-shell.tsx", delta: "+33" },
]

export function AgentsPage({
  agent,
  projectName,
  workspaceName,
}: AgentsPageProps) {
  const [rightPanelOpen, setRightPanelOpen] = React.useState(true)
  const agentName = agentNames[agent as keyof typeof agentNames] ?? agentNames.research

  return (
    <Collapsible
      open={rightPanelOpen}
      onOpenChange={setRightPanelOpen}
      className="flex h-full min-h-0 flex-col bg-card text-foreground"
    >
      <header className="shrink-0 border-b border-border bg-card">
        <div className="flex h-12 min-w-0 items-center justify-between gap-3 px-5">
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap gap-1.5 overflow-hidden text-title sm:gap-2">
              <BreadcrumbItem className="min-w-0 shrink">
                <BreadcrumbPage className="truncate font-semibold text-muted-foreground">
                  {projectName}
                </BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="shrink-0" />
              <BreadcrumbItem className="min-w-0 shrink">
                <BreadcrumbPage className="truncate font-semibold text-muted-foreground">
                  {workspaceName}
                </BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="shrink-0" />
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate font-semibold">
                  {agentName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <span className="shrink-0 text-caption text-muted-foreground">
            Live traces
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <section className="flex min-w-0 flex-1 flex-col border-r border-border">
          <div className="flex h-12 shrink-0 min-w-0 items-stretch justify-between gap-3 border-b border-border px-5">
            <div className="flex min-w-0 items-stretch">
              <Tabs value={agent} className="min-w-0 gap-0">
                <TabsList className="h-full min-w-0 items-stretch rounded-none bg-transparent p-0">
                  <TabsTrigger
                    value={agent}
                    className="relative h-full min-w-0 max-w-[52vw] justify-start rounded-none border-0 bg-transparent px-4 text-title shadow-none after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:max-w-72"
                  >
                    <Bot className="h-3.5 w-3.5" />
                    <span className="truncate">{agentName}</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Add agent tab"
                className="my-auto ml-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button variant="ghost" size="icon-sm" aria-label="Trace history">
                <Clock3 className="h-4 w-4" />
              </Button>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={rightPanelOpen ? "Collapse right panel" : "Expand right panel"}
                >
                  {rightPanelOpen ? (
                    <PanelRightClose className="h-4 w-4" />
                  ) : (
                    <PanelRightOpen className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-8 py-8">
              <div className="flex justify-end">
                <Card className="max-w-xl rounded-lg border-none bg-sidebar-accent px-5 py-4 shadow-none">
                  <p className="text-title font-medium">
                    Run this agent and stream tool calls, file edits, and checks.
                  </p>
                </Card>
              </div>

              <div className="space-y-3">
                {traceEvents.map((event) => (
                  <div key={`${event.label}-${event.title}`} className="group flex gap-3">
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                      <event.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1 rounded-md px-2 py-1.5 group-hover:bg-sidebar-accent">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-title font-medium">{event.title}</p>
                        <Badge variant="outline" className="rounded-md text-caption">
                          {event.label}
                        </Badge>
                        <span className="ml-auto text-caption text-muted-foreground">
                          {event.time}
                        </span>
                      </div>
                      <p className="mt-1 text-section text-muted-foreground">
                        {event.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </section>

        <CollapsibleContent asChild forceMount>
          <aside className="hidden w-[min(46vw,560px)] min-w-[430px] shrink-0 flex-col bg-card data-[state=closed]:lg:hidden lg:flex">
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex h-12 items-center justify-between border-b border-border px-4">
                <Tabs defaultValue="changes" className="gap-0">
                  <TabsList className="h-8 rounded-md bg-transparent p-0">
                    <TabsTrigger value="all" className="h-8 px-3 text-body shadow-none">
                      All traces
                    </TabsTrigger>
                    <TabsTrigger value="changes" className="h-8 px-3 text-body shadow-none">
                      Changes
                    </TabsTrigger>
                    <TabsTrigger value="checks" className="h-8 px-3 text-body shadow-none">
                      Checks
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="ghost" size="icon-sm" aria-label="Review traces">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-1 px-4 py-5">
                  {reviewFiles.map((file) => (
                    <div
                      key={file.path}
                      className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-sidebar-accent"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate text-title">{file.path}</span>
                      <span className="shrink-0 text-section font-medium text-muted-foreground">
                        {file.delta}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex h-12 items-center justify-between border-b border-border px-4">
                <Tabs defaultValue="run" className="gap-0">
                  <TabsList className="h-8 rounded-md bg-transparent p-0">
                    <TabsTrigger value="setup" className="h-8 px-3 text-body shadow-none">
                      Setup
                    </TabsTrigger>
                    <TabsTrigger value="run" className="h-8 px-3 text-body shadow-none">
                      Run
                    </TabsTrigger>
                    <TabsTrigger value="terminal" className="h-8 px-3 text-body shadow-none">
                      Terminal
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button variant="ghost" size="icon-sm" aria-label="Add run trace">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex min-h-0 flex-1 items-center justify-center p-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <Button variant="outline" size="lg" className="h-11 px-5">
                    <Play className="h-4 w-4" />
                    Run workspace
                  </Button>
                  <p className="text-section text-muted-foreground">
                    Test your live traces here.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
