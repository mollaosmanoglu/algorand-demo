"use client"

import Image from "next/image"
import { Suspense } from "react"
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
        <Image
          src="/images/luphra-logo.png"
          alt="Luphra"
          width={168}
          height={48}
          priority
          className="fixed left-5 top-5 z-30 h-auto w-[100px]"
        />
        <Suspense fallback={null}>
          <DashboardSidebar />
        </Suspense>
        <SidebarInset className="bg-sidebar pl-2 flex flex-col">
          <DashboardHeader />
          <div className="bg-card rounded-tl-xl flex-1 overflow-auto relative">
            <span className="absolute inset-0 rounded-[inherit] ring-1 ring-white/60 mix-blend-overlay pointer-events-none z-10" />
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
