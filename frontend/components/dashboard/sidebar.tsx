"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  ChevronDown,
  Folder,
  FolderOpen,
  LayoutDashboard,
  Moon,
  Settings,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAgentEvents } from "@/hooks/use-agent-events";
import { deriveLiveAgents } from "@/lib/project-agents";
import { programmingProjects } from "@/lib/projects";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DashboardSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navItems = [{ icon: LayoutDashboard, label: "Overview", href: "/" }];

  const selectedProject = searchParams.get("project") ?? "fintech-onboard";
  const selectedAgent = searchParams.get("agent");
  const { state, connectionStatus } = useAgentEvents();
  const liveAgents = React.useMemo(
    () => deriveLiveAgents(Object.values(state.actions)),
    [state.actions],
  );
  const initializedAgents = React.useRef(false);
  const knownAgentIds = React.useRef(new Set<string>());
  const [revealingAgentIds, setRevealingAgentIds] = React.useState<Set<string>>(
    new Set(),
  );

  React.useEffect(() => {
    if (connectionStatus !== "connected") return;

    const currentIds = liveAgents.map((agent) => agent.id);
    if (!initializedAgents.current) {
      currentIds.forEach((id) => knownAgentIds.current.add(id));
      initializedAgents.current = true;
      return;
    }

    const newIds = currentIds.filter((id) => !knownAgentIds.current.has(id));
    if (!newIds.length) return;

    newIds.forEach((id) => knownAgentIds.current.add(id));
    setRevealingAgentIds((current) => new Set([...current, ...newIds]));
    const timer = window.setTimeout(() => {
      setRevealingAgentIds((current) => {
        const next = new Set(current);
        newIds.forEach((id) => next.delete(id));
        return next;
      });
    }, 650);

    return () => window.clearTimeout(timer);
  }, [connectionStatus, liveAgents]);

  const projects = programmingProjects.map((project) =>
    project.live ? { ...project, agents: liveAgents } : project,
  );

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
      <SidebarContent className="px-3 pt-20 pb-2">
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
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 overflow-hidden rounded flex items-center justify-center shrink-0 bg-muted">
                  <img
                    src="/images/algorand-logo.webp"
                    alt=""
                    className="h-7 w-7 object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-foreground font-semibold text-body truncate">
                    Algorand Hack
                  </div>
                  <div className="text-muted-foreground text-meta truncate">
                    Agent insurance
                  </div>
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
              <Collapsible defaultOpen asChild className="group/projects">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      size="sm"
                      tooltip="Projects"
                      className="gap-2 h-8"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span className="text-body">Projects</span>
                      <ChevronDown className="ml-auto w-3.5 h-3.5 transition-transform duration-[var(--duration-quick)] ease-[var(--ease-smooth-out)] group-data-[state=open]/projects:rotate-180 group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="sidebar-collapsible-content">
                    <SidebarMenuSub className="mt-1.5 ml-3.5 mr-0 gap-1 px-0">
                      {projects.map((project) => (
                        <Collapsible
                          key={project.id}
                          defaultOpen={project.id === selectedProject}
                          asChild
                          className="group/project"
                        >
                          <SidebarMenuSubItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuSubButton
                                size="sm"
                                className="h-8 w-full translate-x-0 pl-4 pr-2 text-body data-[size=sm]:text-body"
                              >
                                <Folder className="w-3.5 h-3.5" />
                                <span className="truncate">{project.name}</span>
                                <ChevronDown className="ml-auto w-3 h-3 transition-transform duration-[var(--duration-quick)] ease-[var(--ease-smooth-out)] group-data-[state=open]/project:rotate-180" />
                              </SidebarMenuSubButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="sidebar-collapsible-content">
                              <div className="ml-4 border-l border-sidebar-border pl-2">
                                {project.agents.map((agent) => {
                                  const revealing = revealingAgentIds.has(agent.id);
                                  return (
                                    <AnimatePresence
                                      key={`${project.id}:${agent.id}`}
                                      mode="wait"
                                      initial={false}
                                    >
                                      {revealing ? (
                                        <motion.div
                                          key="loading"
                                          className="flex h-8 items-center gap-2 px-2"
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                        >
                                          <Skeleton className="h-3.5 w-3.5 rounded-sm" />
                                          <Skeleton className="h-3 w-24" />
                                        </motion.div>
                                      ) : (
                                        <motion.div
                                          key="agent"
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                        >
                                          <SidebarMenuSubButton
                                            asChild
                                            size="sm"
                                            isActive={
                                              pathname === "/agents" &&
                                              selectedProject === project.id &&
                                              selectedAgent === agent.id
                                            }
                                            className="h-8 w-full translate-x-0 px-2 text-body data-[size=sm]:text-body"
                                          >
                                            <Link
                                              href={`/agents?project=${project.id}&agent=${encodeURIComponent(agent.id)}`}
                                            >
                                              <Bot className="w-3.5 h-3.5" />
                                              <span className="truncate">{agent.name}</span>
                                            </Link>
                                          </SidebarMenuSubButton>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  );
                                })}
                                {project.live &&
                                  project.agents.length === 0 &&
                                  (connectionStatus === "connecting" ? (
                                    <div className="flex h-8 items-center gap-2 px-2">
                                      <Skeleton className="h-3.5 w-3.5 rounded-sm" />
                                      <Skeleton className="h-3 w-24" />
                                    </div>
                                  ) : (
                                    <div className="flex h-8 items-center px-2 text-meta text-muted-foreground">
                                      No active agents
                                    </div>
                                  ))}
                              </div>
                            </CollapsibleContent>
                          </SidebarMenuSubItem>
                        </Collapsible>
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
