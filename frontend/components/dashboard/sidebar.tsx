"use client"

import { Bot, ChevronDown, LayoutDashboard } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function DashboardSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLogoHovered, setIsLogoHovered] = useState(false)

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/" },
  ]

  const agentItems = [
    { label: "Research Agent", slug: "research" },
    { label: "E-commerce Agent", slug: "e-commerce" },
    { label: "Insurance Agent", slug: "insurance" },
  ]
  const selectedAgent = searchParams.get("agent") ?? agentItems[0].slug

  return (
    <Sidebar collapsible="icon" className="border-r-0" style={{ '--sidebar-width': '240px', '--sidebar-width-icon': '52px' } as React.CSSProperties}>
      <SidebarHeader className="px-3 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - shown when sidebar is open */}
          <Image
            src="/images/logo.svg"
            alt="Logo"
            width={104}
            height={30}
            className="w-[104px] h-auto group-data-[collapsible=icon]:hidden"
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
                  <SidebarTrigger className={`h-6 w-6 absolute transition-opacity duration-200 cursor-pointer ${isLogoHovered ? 'opacity-100' : 'opacity-0'}`} />
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
              <SidebarTrigger className="h-6 w-6 group-data-[collapsible=icon]:hidden cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Collapse menu</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 pt-0 pb-2 space-y-5 group-data-[collapsible=icon]:space-y-0 group-data-[collapsible=icon]:-mt-1">
        {/* ACCOUNT Section */}
        <div className="space-y-2 group-data-[collapsible=icon]:hidden">
          <h2 className="text-caption font-semibold text-muted-foreground uppercase tracking-wide px-1">
            Account
          </h2>
          <Card className="p-3 border-none shadow-sm bg-card">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-foreground rounded flex items-center justify-center shrink-0">
                <span className="text-background font-bold text-caption">D</span>
              </div>
              <div className="min-w-0">
                <div className="text-foreground font-semibold text-body truncate">Downtown Legal</div>
                <div className="text-muted-foreground text-caption truncate">AI Secretary</div>
              </div>
            </div>
          </Card>
        </div>

        {/* GENERAL Section */}
        <div className="space-y-2 group-data-[collapsible=icon]:space-y-0">
          <h2 className="text-caption font-semibold text-muted-foreground uppercase tracking-wide px-1 group-data-[collapsible=icon]:hidden">
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
                  <Link href={item.href} className="gap-2 h-8">
                    <item.icon className="w-3.5 h-3.5" />
                    <span className="text-body">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <Collapsible defaultOpen asChild className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    isActive={pathname.startsWith("/agents")}
                    size="sm"
                    tooltip="Agents"
                    className="gap-2 h-8"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span className="text-body">Agents</span>
                    <ChevronDown className="ml-auto w-3.5 h-3.5 transition-transform group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="mt-1.5 gap-1.5 px-3">
                    {agentItems.map((item) => (
                      <SidebarMenuSubItem key={item.slug}>
                        <SidebarMenuSubButton
                          asChild
                          size="sm"
                          isActive={pathname === "/agents" && selectedAgent === item.slug}
                          className="h-7 text-body"
                        >
                          <Link href={`/agents?agent=${item.slug}`}>
                            <Bot className="w-3.5 h-3.5" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
