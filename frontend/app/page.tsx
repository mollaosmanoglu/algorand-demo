"use client"

import { useState } from "react"
import { MetricCards } from "@/components/dashboard/metric-cards"
import { CallsTable } from "@/components/dashboard/calls-table"
import { Tabs } from "@/components/ui/tabs"
import { AnimatedTabsList, AnimatedTabsTrigger } from "@/components/ui/animated-tabs"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

function AnalysisTabs() {
  const [analyticsType, setAnalyticsType] = useState("call")

  return (
    <Tabs value={analyticsType} onValueChange={setAnalyticsType}>
      <AnimatedTabsList className="inline-flex gap-0 bg-transparent border-none p-0">
        <AnimatedTabsTrigger
          value="call"
          isActive={analyticsType === "call"}
          className="flex-none border-t-0 border-x-0 border-b-2 border-transparent rounded-none px-2 py-1 text-body shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none cursor-pointer"
        >
          Call analysis
        </AnimatedTabsTrigger>
        <AnimatedTabsTrigger
          value="text"
          isActive={analyticsType === "text"}
          className="flex-none border-t-0 border-x-0 border-b-2 border-transparent rounded-none px-2 py-1 text-body shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus-visible:outline-none cursor-pointer"
        >
          Text analysis
        </AnimatedTabsTrigger>
      </AnimatedTabsList>
    </Tabs>
  )
}

export default function DashboardPage() {
  return (
    <SidebarProvider
      defaultOpen
      style={{
        "--sidebar-width": "160px",
        "--sidebar-width-icon": "44px",
      } as React.CSSProperties}
    >
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <DashboardSidebar />
        <SidebarInset className="bg-sidebar pl-2 flex flex-col">
          <DashboardHeader />
          <div className="bg-card rounded-tl-xl flex-1 overflow-auto relative">
            <div className="px-12 pt-14 pb-3 space-y-3">
              <div className="space-y-2">
                <div className="pb-4 pt-2">
                  <h2 className="text-hero font-semibold text-foreground">
                    Good morning Faruk
                  </h2>
                </div>

                {/* Analytics Type Tabs */}
                <AnalysisTabs />
                <div className="mt-5 space-y-2">
                  <MetricCards />
                </div>
                <CallsTable limit={3} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
