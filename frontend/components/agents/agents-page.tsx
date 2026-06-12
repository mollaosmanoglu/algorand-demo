"use client"

import Image from "next/image"
import * as React from "react"
import { AnimatePresence, motion, MotionConfig } from "motion/react"
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Clock3,
  PanelRightClose,
  PanelRightOpen,
  Plus,
} from "lucide-react"

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
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAgentEvents } from "@/hooks/use-agent-events"
import {
  deriveActionRows,
  filterAgentEventState,
  formatUsdc,
  friendlyNetwork,
} from "@/lib/agent-events"
import {
  deriveStateLogLines,
  mockAgentDashboards,
} from "@/lib/mock-agent-dashboards"
import { AgentEventTerminal } from "@/components/agents/agent-event-terminal"

type AgentsPageProps = {
  agent: string
  agentName: string
  projectId: string
  live: boolean
  projectName: string
  workspaceName: string
}

const rightPanelTabClass =
  "relative h-8 px-3 text-body shadow-none data-[state=active]:bg-transparent data-[state=active]:text-sidebar-accent-foreground data-[state=active]:shadow-none"

function statusStyle(status: string) {
  if (["Evaluating", "Quoted", "Paid"].includes(status)) {
    return "text-[hsl(var(--info-chart))]"
  }
  if (status === "Succeeded") return "text-[hsl(var(--info-success))]"
  if (["Denied", "Failed"].includes(status)) {
    return "text-[hsl(var(--info-error))]"
  }
  return "text-muted-foreground"
}

const revealTransition = { duration: 0.2, ease: "easeOut" as const }

function AnimatedValue({
  value,
  pending,
  className,
  skeletonClassName = "h-3 w-16",
}: {
  value: React.ReactNode
  pending: boolean
  className?: string
  skeletonClassName?: string
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {pending ? (
        <motion.span
          key="pending"
          className="block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={revealTransition}
        >
          <Skeleton className={skeletonClassName} />
        </motion.span>
      ) : (
        <motion.span
          key={String(value)}
          className={className}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={revealTransition}
        >
          {value}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

export function AgentsPage({
  agent,
  agentName,
  projectId,
  live,
  projectName,
  workspaceName,
}: AgentsPageProps) {
  const [rightPanelOpen, setRightPanelOpen] = React.useState(true)
  const [settlementsOpen, setSettlementsOpen] = React.useState(true)
  const [profileTab, setProfileTab] = React.useState("profile")
  const [settlementTab, setSettlementTab] = React.useState("settlements")
  const liveEvents = useAgentEvents()
  const mockDashboard = live ? undefined : mockAgentDashboards[agent]
  const selectedState = React.useMemo(
    () =>
      mockDashboard?.state ??
      filterAgentEventState(liveEvents.state, agent),
    [agent, liveEvents.state, mockDashboard],
  )
  const rows = React.useMemo(() => deriveActionRows(selectedState), [selectedState])
  const latestReceipt = React.useMemo(
    () =>
      Object.values(selectedState.receipts).sort(
        (left, right) =>
          new Date(right.activated_at).getTime() -
          new Date(left.activated_at).getTime(),
      )[0] ?? null,
    [selectedState.receipts],
  )
  const pendingSettlement = React.useMemo(() => {
    const confirmedQuoteIds = new Set(
      Object.values(selectedState.receipts).map((receipt) => receipt.quote_id),
    )
    return (
      Object.values(selectedState.quotes)
        .filter((quote) => !confirmedQuoteIds.has(quote.id))
        .sort(
          (left, right) =>
            new Date(right.expires_at).getTime() -
            new Date(left.expires_at).getTime(),
        )[0] ?? null
    )
  }, [selectedState.quotes, selectedState.receipts])
  const logLines = React.useMemo(
    () => mockDashboard?.logs ?? deriveStateLogLines(selectedState),
    [mockDashboard, selectedState],
  )
  const connectionStatus = live ? liveEvents.connectionStatus : "connected"
  const agentProfileStats = [
    {
      label: "Status",
      value: connectionStatus === "connected" ? "Running" : "Reconnecting",
    },
    {
      label: "Objective",
      value: mockDashboard?.objective ?? "Protect consequential tool calls",
    },
    {
      label: "Policy",
      value: mockDashboard?.policy ?? "Luphra MicroCover",
    },
    { label: "Wallet", value: mockDashboard?.wallet ?? "19.98 USDC" },
    {
      label: "Per-call limit",
      value: mockDashboard?.perCallLimit ?? "5,000 USDC",
    },
    {
      label: "Last premium",
      value: formatUsdc(latestReceipt?.premium_usdc),
    },
  ]
  const settlementStats = latestReceipt
    ? [
        { label: "x402", value: "Paid" },
        { label: "Network", value: friendlyNetwork(latestReceipt.network) },
        { label: "Asset", value: latestReceipt.asset },
        { label: "Premium", value: formatUsdc(latestReceipt.premium_usdc) },
        {
          label: "Coverage",
          value: formatUsdc(latestReceipt.coverage_limit_usdc),
        },
        {
          label: "Transaction",
          value: latestReceipt.settlement_transaction ?? "Confirmed on TestNet",
          href: live && latestReceipt.settlement_transaction
            ? `https://lora.algokit.io/testnet/transaction/${latestReceipt.settlement_transaction}`
            : undefined,
        },
        { label: "Status", value: "Active" },
        { label: "Receipt", value: latestReceipt.id },
      ]
    : []

  return (
    <MotionConfig reducedMotion="user">
      <Collapsible
        open={rightPanelOpen}
        onOpenChange={setRightPanelOpen}
        className="flex h-full min-h-0 flex-col bg-card text-foreground"
      >
      <header className="shrink-0 border-b border-border bg-card">
        <div className="flex h-12 min-w-0 items-center px-5">
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
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-border">
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
            <div className="flex w-full flex-col px-3 pt-3">
              <Card className="p-0 bg-card border-none shadow-none">
                <div className="w-full overflow-x-auto">
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-border">
                        <TableHead className="w-[11%] text-muted-foreground font-medium text-caption uppercase tracking-wide h-6 py-2">
                          Time
                        </TableHead>
                        <TableHead className="w-[22%] text-muted-foreground font-medium text-caption uppercase tracking-wide h-6 py-2">
                          Action
                        </TableHead>
                        <TableHead className="w-[27%] text-muted-foreground font-medium text-caption uppercase tracking-wide h-6 py-2">
                          Trace
                        </TableHead>
                        <TableHead className="w-[13%] text-muted-foreground font-medium text-caption uppercase tracking-wide h-6 py-2">
                          Decision
                        </TableHead>
                        <TableHead className="w-[9%] text-muted-foreground font-medium text-caption uppercase tracking-wide h-6 py-2">
                          Risk
                        </TableHead>
                        <TableHead className="w-[9%] text-muted-foreground font-medium text-caption uppercase tracking-wide h-6 py-2">
                          Premium
                        </TableHead>
                        <TableHead className="w-[9%] text-muted-foreground font-medium text-caption uppercase tracking-wide h-6 py-2">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence initial={false}>
                      {rows.map((event) => (
                        <motion.tr
                          key={event.id}
                          title={event.rationale ?? undefined}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={revealTransition}
                          className="border-b border-border/50 cursor-pointer transition-colors hover:bg-accent"
                        >
                          <TableCell className="py-2.5 align-top">
                            <span className="text-meta font-medium text-foreground">
                              {event.time}
                            </span>
                          </TableCell>
                          <TableCell className="py-2.5 align-top">
                            <div className="text-meta font-medium text-foreground whitespace-normal break-words">
                              {event.action}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 align-top">
                            <AnimatedValue
                              value={event.trace}
                              pending={event.pending}
                              className="block text-meta text-muted-foreground whitespace-normal break-words"
                              skeletonClassName="h-3 w-28"
                            />
                          </TableCell>
                          <TableCell className="py-2.5 align-top">
                            <AnimatedValue
                              value={event.decision}
                              pending={event.pending}
                              className="text-meta text-muted-foreground"
                            />
                          </TableCell>
                          <TableCell className="py-2.5 align-top">
                            <AnimatedValue
                              value={event.risk}
                              pending={event.pending}
                              className="text-meta text-muted-foreground"
                              skeletonClassName="h-3 w-10"
                            />
                          </TableCell>
                          <TableCell className="py-2.5 align-top">
                            <AnimatedValue
                              value={event.premium}
                              pending={event.pending}
                              className="text-meta text-muted-foreground"
                              skeletonClassName="h-3 w-14"
                            />
                          </TableCell>
                          <TableCell className="py-2.5 align-top">
                            <AnimatedValue
                              value={event.status}
                              pending={false}
                              className={`text-meta font-medium ${statusStyle(event.status)}`}
                              skeletonClassName="h-3 w-14"
                            />
                          </TableCell>
                        </motion.tr>
                      ))}
                      </AnimatePresence>
                      {rows.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="h-28 text-center text-meta text-muted-foreground"
                          >
                            {connectionStatus === "connected"
                              ? live
                                ? "No actions for this agent yet."
                                : `No demo actions for ${projectId}.`
                              : "Connecting to the Luphra event stream..."}
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          </ScrollArea>
        </section>

        <CollapsibleContent asChild forceMount>
          <aside className="hidden w-[min(46vw,560px)] min-w-[430px] shrink-0 flex-col bg-card data-[state=closed]:lg:hidden lg:flex">
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex h-12 items-center justify-between border-b border-border px-4">
                <Tabs value={profileTab} onValueChange={setProfileTab} className="gap-0">
                  <TabsList className="h-8 rounded-md bg-transparent p-0">
                    {["profile", "policy", "checks"].map((tab) => (
                      <TabsTrigger key={tab} value={tab} className={rightPanelTabClass}>
                        {profileTab === tab ? (
                          <motion.span
                            layoutId="profile-tab-background"
                            className="absolute inset-0 rounded-md bg-sidebar-accent"
                            transition={{ type: "spring", bounce: 0.1, duration: 0.3 }}
                          />
                        ) : null}
                        <span className="relative z-10 capitalize">{tab}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <Button variant="ghost" size="icon-sm" aria-label="Add profile trace">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="min-h-0 flex-1">
                <div className="px-6 py-5">
                  <div className="grid aspect-[3/1] w-full place-items-center overflow-hidden rounded-md border border-border bg-muted">
                    <Image
                      src="/images/onizuka-banner.png"
                      alt="Onizuka agent banner"
                      width={2172}
                      height={724}
                      priority
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="mt-6 min-w-0">
                    <div className="mb-5 min-w-0">
                      <p className="truncate text-title font-semibold text-foreground">
                        {agentName}
                      </p>
                      <p className="mt-1 truncate text-caption uppercase text-muted-foreground">
                        Luphra MicroCover
                      </p>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-12 gap-y-5 text-body">
                      {agentProfileStats.map((stat) => (
                        <div key={stat.label} className="min-w-0">
                          <dt className="truncate text-muted-foreground">{stat.label}</dt>
                          <dd className="mt-0.5 truncate text-foreground">{stat.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </ScrollArea>
            </div>

            <Separator />

            <div
              className={
                settlementsOpen
                  ? "flex min-h-0 flex-1 flex-col"
                  : "flex min-h-0 flex-none flex-col"
              }
            >
              <div className="flex h-12 items-center justify-between border-b border-border px-4">
                <div className="flex min-w-0 items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={settlementsOpen ? "Collapse settlements" : "Expand settlements"}
                    className="shrink-0"
                    onClick={() => setSettlementsOpen((open) => !open)}
                  >
                    {settlementsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                  <Tabs
                    value={settlementTab}
                    onValueChange={setSettlementTab}
                    className="min-w-0 gap-0"
                  >
                    <TabsList className="h-8 rounded-md bg-transparent p-0">
                      {["settlements", "logs"].map((tab) => (
                        <TabsTrigger key={tab} value={tab} className={rightPanelTabClass}>
                          {settlementTab === tab ? (
                            <motion.span
                              layoutId="settlement-tab-background"
                              className="absolute inset-0 rounded-md bg-sidebar-accent"
                              transition={{ type: "spring", bounce: 0.1, duration: 0.3 }}
                            />
                          ) : null}
                          <span className="relative z-10 capitalize">{tab}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
                <Button variant="ghost" size="icon-sm" aria-label="Add settlement">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {settlementsOpen ? (
                settlementTab === "logs" ? (
                  <AgentEventTerminal lines={logLines} />
                ) : (
                <ScrollArea className="min-h-0 flex-1">
                  <div className="px-6 py-5">
                    <div className="mb-5 min-w-0">
                      <p className="truncate text-title font-semibold text-foreground">
                        {pendingSettlement
                          ? "Settlement pending"
                          : latestReceipt
                            ? "Latest settlement"
                            : "No settlements yet"}
                      </p>
                      <p className="mt-1 truncate text-caption uppercase text-muted-foreground">
                        {pendingSettlement
                          ? "Waiting for x402 confirmation"
                          : latestReceipt
                          ? "Coverage activated after payment"
                          : "Covered tool calls will appear here"}
                      </p>
                    </div>
                    {pendingSettlement ? (
                      <motion.dl
                        key={pendingSettlement.id}
                        className="grid grid-cols-2 gap-x-12 gap-y-5 text-body"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={revealTransition}
                      >
                        {[
                          ["x402", "w-10"],
                          ["Network", "w-24"],
                          ["Asset", "w-12"],
                          ["Premium", "w-20"],
                          ["Coverage", "w-16"],
                          ["Transaction", "w-28"],
                          ["Status", "w-14"],
                          ["Receipt", "w-24"],
                        ].map(([label, width]) => (
                          <div key={label} className="min-w-0">
                            <dt className="truncate text-muted-foreground">{label}</dt>
                            <dd className="mt-1">
                              <Skeleton className={`h-3 ${width}`} />
                            </dd>
                          </div>
                        ))}
                      </motion.dl>
                    ) : latestReceipt ? (
                      <dl className="grid grid-cols-2 gap-x-12 gap-y-5 text-body">
                        {settlementStats.map((stat) => (
                          <motion.div
                            key={`${latestReceipt.id}-${stat.label}`}
                            className="min-w-0"
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              ...revealTransition,
                              delay: settlementStats.indexOf(stat) * 0.025,
                            }}
                          >
                            <dt className="truncate text-muted-foreground">{stat.label}</dt>
                            <dd className="mt-0.5 truncate text-foreground">
                              {stat.href ? (
                                <a
                                  href={stat.href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline underline-offset-2 hover:text-primary"
                                  title={stat.value}
                                >
                                  {stat.value}
                                </a>
                              ) : (
                                stat.value
                              )}
                            </dd>
                          </motion.div>
                        ))}
                      </dl>
                    ) : (
                      <p className="text-body text-muted-foreground">
                        No x402 coverage receipt has been issued in this backend session.
                      </p>
                    )}
                  </div>
                </ScrollArea>
                )
              ) : null}
            </div>
          </aside>
        </CollapsibleContent>
      </div>
      </Collapsible>
    </MotionConfig>
  )
}
