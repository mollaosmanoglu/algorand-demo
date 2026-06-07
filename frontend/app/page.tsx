"use client"

import { useState } from "react"
import { MetricCards } from "@/components/dashboard/metric-cards"
import { CallsTable } from "@/components/dashboard/calls-table"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Tabs } from "@/components/ui/tabs"
import { AnimatedTabsList, AnimatedTabsTrigger } from "@/components/ui/animated-tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useAgentEvents } from "@/hooks/use-agent-events"
import { derivePortfolioDashboard } from "@/lib/portfolio-dashboard"

function AnalysisTabs({
  value,
  onValueChange,
}: {
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <AnimatedTabsList className="inline-flex gap-0 bg-transparent border-none p-0">
        <AnimatedTabsTrigger
          value="coverage"
          isActive={value === "coverage"}
          className="flex-none border-t-0 border-x-0 border-b-2 border-transparent rounded-none px-2 py-1 text-body shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none cursor-pointer"
        >
          Activity
        </AnimatedTabsTrigger>
        <AnimatedTabsTrigger
          value="settlements"
          isActive={value === "settlements"}
          className="flex-none border-t-0 border-x-0 border-b-2 border-transparent rounded-none px-2 py-1 text-body shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none cursor-pointer"
        >
          Settlements
        </AnimatedTabsTrigger>
      </AnimatedTabsList>
    </Tabs>
  )
}

export default function DashboardPage() {
  const [analyticsType, setAnalyticsType] = useState("coverage")
  const { state } = useAgentEvents()
  const dashboard = derivePortfolioDashboard(state)
  const projects =
    analyticsType === "settlements"
      ? dashboard.projects.filter((project) => project.paid > 0)
      : dashboard.projects

  return (
    <DashboardShell>
      <header className="shrink-0 border-b border-border bg-card">
        <div className="flex h-12 min-w-0 items-center px-5">
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap gap-1.5 overflow-hidden text-title sm:gap-2">
              <BreadcrumbItem className="min-w-0 shrink">
                <BreadcrumbPage className="truncate font-semibold text-muted-foreground">
                  Projects
                </BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="shrink-0" />
              <BreadcrumbItem className="min-w-0 shrink">
                <BreadcrumbPage className="truncate font-semibold text-muted-foreground">
                  Overview
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="px-12 pt-5 pb-3 space-y-3">
        <div className="space-y-2">
          <div className="pb-4 pt-4">
            <h2 className="text-hero font-semibold text-foreground">
              Good Morning, Faruk
            </h2>
          </div>

          {/* Analytics Type Tabs */}
          <AnalysisTabs value={analyticsType} onValueChange={setAnalyticsType} />
          <div className="mt-5 space-y-2">
            <MetricCards metrics={dashboard.metrics} chartData={dashboard.chartData} />
          </div>
          <CallsTable projects={projects} />
        </div>
      </div>
    </DashboardShell>
  )
}
