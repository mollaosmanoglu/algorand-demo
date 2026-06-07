"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bot,
  ChevronDown,
  LayoutDashboard,
  Moon,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DashboardSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navItems = [{ icon: LayoutDashboard, label: "Overview", href: "/" }];

  const agentItems = [
    { label: "Research Agent", slug: "research" },
    { label: "E-commerce Agent", slug: "e-commerce" },
    { label: "Insurance Agent", slug: "insurance" },
    { label: "Procurement Agent", slug: "procurement" },
    { label: "Risk Analyst Agent", slug: "risk-analyst" },
    { label: "Settlement Agent", slug: "settlement" },
  ];
  const selectedAgent = searchParams.get("agent") ?? agentItems[0].slug;

  return (
    <Sidebar
      collapsible="icon"
      className="relative border-r-0"
      style={
        {
          "--sidebar-width": "240px",
          "--sidebar-width-icon": "52px",
        } as React.CSSProperties
      }
    >
      <SidebarContent className="px-3 pt-14 pb-2">
        <div className="space-y-5 group-data-[collapsible=icon]:space-y-2">
          {/* ACCOUNT Section */}
          <div className="space-y-2">
            <div className="flex h-8 items-center justify-between px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger className="h-7 w-7 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Toggle menu</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Go back"
                      onClick={() => window.history.back()}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Back</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Go forward"
                      onClick={() => window.history.forward()}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Forward</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <Separator className="-mx-3 w-[calc(100%+1.5rem)] group-data-[collapsible=icon]:hidden" />
            <Card className="p-3 border-none shadow-sm bg-card group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-foreground rounded flex items-center justify-center shrink-0">
                  <span className="text-background font-bold text-body">D</span>
                </div>
                <div className="min-w-0">
                  <div className="text-foreground font-semibold text-title truncate">
                    Downtown Legal
                  </div>
                  <div className="text-muted-foreground text-section truncate">
                    AI Secretary
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* GENERAL Section */}
          <div className="space-y-2 group-data-[collapsible=icon]:space-y-0">
            <h2 className="text-body font-semibold text-muted-foreground uppercase tracking-wide px-1 group-data-[collapsible=icon]:hidden">
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
                      <span className="text-title">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <Collapsible defaultOpen asChild className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      size="sm"
                      tooltip="Agents"
                      className="gap-2 h-8"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span className="text-title">Agents</span>
                      <ChevronDown className="ml-auto w-3.5 h-3.5 transition-transform group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="mt-1.5 ml-3.5 mr-0 gap-1.5 px-0">
                      {agentItems.map((item) => (
                        <SidebarMenuSubItem key={item.slug}>
                          <SidebarMenuSubButton
                            asChild
                            size="sm"
                            isActive={
                              pathname === "/agents" &&
                              selectedAgent === item.slug
                            }
                            className="h-8 w-full translate-x-0 pl-5 pr-2 text-title data-[size=sm]:text-title"
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
        </div>
      </SidebarContent>
      <SidebarFooter className="gap-3 p-0 group-data-[collapsible=icon]:hidden">
        <Separator />
        <div className="flex items-center justify-end gap-1 px-4 pb-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Toggle dark mode"
                onClick={() =>
                  document.documentElement.classList.toggle("dark")
                }
              >
                <Moon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Theme</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Settings">
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
