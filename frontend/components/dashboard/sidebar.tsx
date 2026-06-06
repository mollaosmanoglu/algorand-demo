"use client"

import { LayoutDashboard, Phone } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isLogoHovered, setIsLogoHovered] = useState(false)

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/" },
    { icon: Phone, label: "Calls", href: "/calls" },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r-0" style={{ '--sidebar-width': '160px', '--sidebar-width-icon': '44px' } as React.CSSProperties}>
      <SidebarHeader className="px-2 py-2.5">
        <div className="flex items-center justify-between">
          {/* Logo - shown when sidebar is open */}
          <Image
            src="/images/logo.svg"
            alt="Logo"
            width={80}
            height={30}
            className="w-[80px] h-auto group-data-[collapsible=icon]:hidden"
          />

          {/* Collapsed logo with hover effect - shows expand icon on hover */}
          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="relative w-8 h-8 flex items-center justify-center cursor-pointer"
                  onMouseEnter={() => setIsLogoHovered(true)}
                  onMouseLeave={() => setIsLogoHovered(false)}
                >
                  <Image
                    src="/images/logo-single.svg"
                    alt="Logo"
                    width={24}
                    height={24}
                    className={`absolute transition-opacity duration-200 ${isLogoHovered ? 'opacity-0' : 'opacity-100'}`}
                  />
                  <SidebarTrigger className={`h-5 w-5 absolute transition-opacity duration-200 cursor-pointer ${isLogoHovered ? 'opacity-100' : 'opacity-0'}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Expand menu</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Trigger button - shown when sidebar is open */}
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger className="h-5 w-5 group-data-[collapsible=icon]:hidden cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Collapse menu</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-0 pb-1 space-y-4 group-data-[collapsible=icon]:space-y-0 group-data-[collapsible=icon]:-mt-1">
        {/* ACCOUNT Section */}
        <div className="space-y-1.5 group-data-[collapsible=icon]:hidden">
          <h2 className="text-micro font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Account
          </h2>
          <Card className="p-2 border-none shadow-sm bg-card">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 bg-foreground rounded flex items-center justify-center shrink-0">
                <span className="text-background font-bold text-micro">D</span>
              </div>
              <div className="min-w-0">
                <div className="text-foreground font-semibold text-meta truncate">Downtown Legal</div>
                <div className="text-muted-foreground text-micro truncate">AI Secretary</div>
              </div>
            </div>
          </Card>
        </div>

        {/* GENERAL Section */}
        <div className="space-y-1.5 group-data-[collapsible=icon]:space-y-0">
          <h2 className="text-micro font-semibold text-muted-foreground uppercase tracking-wider px-1 group-data-[collapsible=icon]:hidden">
            General
          </h2>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  size="sm"
                  tooltip={item.label}
                >
                  <Link href={item.href} className="gap-1.5 h-7">
                    <item.icon className="w-3 h-3" />
                    <span className="text-meta">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
