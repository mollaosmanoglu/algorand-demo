"use client"

import type * as React from "react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

type DashboardShellProps = {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <SidebarProvider
      defaultOpen
      style={{
        "--sidebar-width": "240px",
        "--sidebar-width-icon": "52px",
      } as React.CSSProperties}
    >
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <DashboardSidebar />
        <SidebarInset className="bg-sidebar pl-2 flex flex-col">
          <DashboardHeader />
          <div className="bg-card rounded-tl-xl flex-1 overflow-auto relative">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
