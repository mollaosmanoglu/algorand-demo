"use client"

import * as React from "react"
import { Folder, Search, ShieldCheck } from "lucide-react"
import Link from "next/link"

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
import type { ProjectActivity } from "@/lib/portfolio-dashboard"
import { programmingProjects } from "@/lib/projects"

const columns = [
  "Project",
  "Agents",
  "Actions",
  "Paid",
  "Denied",
  "Covered value",
  "Premiums",
  "Last activity",
]

export function CallsTable({ projects }: { projects: ProjectActivity[] }) {
  const [globalFilter, setGlobalFilter] = React.useState("")
  const filteredProjects = React.useMemo(() => {
    const query = globalFilter.trim().toLowerCase()
    if (!query) return projects

    return projects.filter((project) =>
      Object.values(project).some((value) =>
        String(value).toLowerCase().includes(query),
      ),
    )
  }, [globalFilter, projects])

  function projectHref(projectId: string): string {
    const project = programmingProjects.find((item) => item.id === projectId)
    const firstAgent = project?.agents[0]
    return firstAgent
      ? `/agents?project=${projectId}&agent=${encodeURIComponent(firstAgent.id)}`
      : `/agents?project=${projectId}`
  }

  return (
    <Card className="p-3 bg-card border-none shadow-none">
      <div className="mb-1 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-body font-semibold text-foreground">
            Project activity
          </h3>
          <p className="text-meta text-muted-foreground">
            Aggregated agent activity, coverage, and settlement totals by project.
          </p>
        </div>
        <InputGroup className="h-6 w-52 shrink-0 rounded-lg">
          <InputGroupAddon>
            <InputGroupText>
              <Search className="h-2.5 w-2.5" />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search projects..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="!text-caption placeholder:text-caption"
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
            {filteredProjects.length ? (
              filteredProjects.map((project) => (
                <TableRow
                  key={project.id}
                  className="border-b border-border/50 hover:bg-accent"
                >
                  <TableCell className="py-3 align-top">
                    <Link
                      href={projectHref(project.id)}
                      className="flex min-w-0 items-center gap-2 hover:underline"
                    >
                      <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate text-meta font-medium text-foreground">
                        {project.name}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="py-3 text-meta text-muted-foreground">
                    {project.agents}
                  </TableCell>
                  <TableCell className="py-3 text-meta text-muted-foreground">
                    {project.actions}
                  </TableCell>
                  <TableCell className="py-3 text-meta text-[hsl(var(--info-chart))]">
                    {project.paid}
                  </TableCell>
                  <TableCell className="py-3 text-meta text-[hsl(var(--info-error))]">
                    {project.denied}
                  </TableCell>
                  <TableCell className="py-3 text-meta text-muted-foreground">
                    {project.coveredValue}
                  </TableCell>
                  <TableCell className="py-3 text-meta text-muted-foreground">
                    {project.premiums}
                  </TableCell>
                  <TableCell className="py-3 text-meta text-muted-foreground">
                    {project.lastActivity}
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
                      <EmptyTitle className="text-section">
                        No projects found
                      </EmptyTitle>
                      <EmptyDescription className="text-meta">
                        Try adjusting the project search.
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
