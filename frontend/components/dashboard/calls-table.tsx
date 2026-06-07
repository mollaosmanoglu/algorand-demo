"use client"

import * as React from "react"
import { Bot, Search, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { insuranceActions, type InsuranceAction } from "@/lib/mock-data"

const decisionStyles: Record<InsuranceAction["decision"], string> = {
  Allowed: "bg-[hsl(var(--info-success-bg))] text-[hsl(var(--info-success))] border-[hsl(var(--info-success-border))]",
  Quoted: "bg-accent text-foreground border-border",
  Covered: "bg-[hsl(var(--info-success-bg))] text-[hsl(var(--info-success))] border-[hsl(var(--info-success-border))]",
  Denied: "bg-[hsl(var(--info-error-bg))] text-[hsl(var(--info-error))] border-[hsl(var(--info-error-border))]",
  Recorded: "bg-secondary text-secondary-foreground border-transparent",
}

const riskStyles: Record<InsuranceAction["risk"], string> = {
  Low: "text-[hsl(var(--info-success))]",
  Medium: "text-foreground",
  High: "text-[hsl(var(--info-error))]",
}

const columns = [
  "Agent",
  "Current action",
  "Decision",
  "Risk",
  "Premium",
  "Coverage",
  "Settlement",
  "Last event",
]

interface CallsTableProps {
  limit?: number
}

export function CallsTable({ limit }: CallsTableProps) {
  const [globalFilter, setGlobalFilter] = React.useState("")
  const actions = limit ? insuranceActions.slice(0, limit) : insuranceActions
  const filteredActions = React.useMemo(() => {
    const query = globalFilter.trim().toLowerCase()

    if (!query) {
      return actions
    }

    return actions.filter((action) =>
      Object.values(action).some((value) => value.toLowerCase().includes(query))
    )
  }, [actions, globalFilter])

  return (
    <Card className="p-3 bg-card border-none shadow-none">
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-body font-semibold text-foreground">
            Active agent actions
          </h3>
          <p className="text-meta text-muted-foreground">
            Live coverage decisions, premiums, and settlement state.
          </p>
        </div>
        <InputGroup className="h-6 w-52 shrink-0 rounded-lg">
          <InputGroupAddon>
            <InputGroupText>
              <Search className="h-2.5 w-2.5" />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search actions..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="!text-caption placeholder:text-caption"
            style={{ fontSize: "8px" }}
          />
        </InputGroup>
      </div>

      <div className="-mx-3 -mt-2 overflow-x-auto px-3">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column}
                  className="h-6 py-2 text-caption font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActions.length ? (
              filteredActions.map((action) => (
                <TableRow
                  key={action.id}
                  className="border-b border-border/50 hover:bg-accent"
                >
                  <TableCell className="py-2.5 align-top">
                    <div className="flex min-w-0 items-center gap-2">
                      <Bot className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate text-meta font-medium text-foreground">
                        {action.agent}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 align-top">
                    <div className="w-[300px] whitespace-normal break-words text-meta text-muted-foreground">
                      {action.action}
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 align-top">
                    <Badge
                      variant="outline"
                      className={`h-5 px-1.5 text-caption font-medium ${decisionStyles[action.decision]}`}
                    >
                      {action.decision}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2.5 align-top">
                    <span className={`text-meta font-medium ${riskStyles[action.risk]}`}>
                      {action.risk}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 align-top">
                    <span className="text-meta text-muted-foreground">
                      {action.premium}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 align-top">
                    <span className="text-meta text-muted-foreground">
                      {action.coverage}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 align-top">
                    <span className="text-meta text-muted-foreground">
                      {action.settlement}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 align-top">
                    <span className="text-meta text-muted-foreground">
                      {action.lastEvent}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <ShieldCheck className="h-8 w-8" />
                      </EmptyMedia>
                      <EmptyTitle className="text-section">No actions found</EmptyTitle>
                      <EmptyDescription className="text-meta">
                        Try adjusting the action search.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
