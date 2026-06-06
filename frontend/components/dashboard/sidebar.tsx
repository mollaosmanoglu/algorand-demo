"use client"

import { LayoutDashboard, Phone } from 'lucide-react'
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

export function DashboardSidebar() {
  const pathname = usePathname()

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/" },
    { icon: Phone, label: "Calls", href: "/calls" },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r-0" style={{ '--sidebar-width': '160px', '--sidebar-width-icon': '44px' } as React.CSSProperties}>
      <SidebarContent className="px-2 pt-14 pb-1 space-y-4 group-data-[collapsible=icon]:space-y-0">
        {/* GENERAL Section */}
        <div className="space-y-1.5 group-data-[collapsible=icon]:space-y-0">
          <h2 className="text-caption font-semibold text-muted-foreground uppercase tracking-wider px-1 group-data-[collapsible=icon]:hidden">
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
                    <item.icon className="w-3.5 h-3.5" />
                    <span className="text-body">{item.label}</span>
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
