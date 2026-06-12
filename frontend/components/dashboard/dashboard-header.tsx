"use client"

import * as React from "react"
import { Bot, LayoutDashboard, LogOut, Search, Settings } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardHeader() {
  const [open, setOpen] = React.useState(false)

  const handleDemoAction = () => {
    toast.info("Visual demo", {
      description: "This action is not connected to a backend.",
    })
  }

  return (
    <>
      <div className="flex items-center justify-between pl-12 pr-6 py-4">
        <div className="w-8" />
        <Button
          variant="ghost"
          onClick={() => setOpen(true)}
          className="relative w-full max-w-sm h-9 bg-sidebar-accent border-none text-caption text-muted-foreground/70 rounded-xl flex items-center justify-center gap-1.5 hover:bg-sidebar-accent/80 transition-colors px-3"
        >
          <Search className="w-3 h-3 shrink-0" />
          <span className="whitespace-nowrap">Search...</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-6 w-6 cursor-pointer">
              <AvatarFallback className="bg-foreground text-primary-foreground text-caption">
                D
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 border-none shadow-sm">
            <DropdownMenuLabel className="text-meta font-normal text-muted-foreground">
              My account
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="text-meta text-muted-foreground cursor-pointer"
              onClick={handleDemoAction}
            >
              <Settings className="w-3 h-3 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-meta text-muted-foreground cursor-pointer"
              onClick={handleDemoAction}
            >
              <LogOut className="w-3 h-3 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search agents, settings..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => setOpen(false)}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Overview</span>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              <Bot className="mr-2 h-4 w-4" />
              <span>Agents</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Account">
            <CommandItem onSelect={handleDemoAction}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
            <CommandItem onSelect={handleDemoAction}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
