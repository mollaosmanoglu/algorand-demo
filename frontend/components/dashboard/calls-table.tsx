"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Search, Filter, ChevronDown, Phone } from 'lucide-react'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CallDetailSheet } from './call-detail-sheet'
import { Call, CallSummary } from '@/types/call'
import { formatRelativeDateTime, formatDuration, formatPhoneNumber } from '@/lib/utils'
import { mockCalls } from "@/lib/mock-data"

const columns: ColumnDef<CallSummary>[] = [
  {
    accessorKey: "created_at",
    header: "When",
    cell: ({ row }) => (
      <div className="font-medium text-foreground text-meta">{formatRelativeDateTime(row.getValue("created_at"))}</div>
    ),
  },
  {
    accessorKey: "contact_number",
    header: "From",
    cell: ({ row }) => (
      <div className="text-muted-foreground text-meta font-mono">{formatPhoneNumber(row.getValue("contact_number"))}</div>
    ),
  },
  {
    accessorKey: "duration_seconds",
    header: "Duration",
    cell: ({ row }) => (
      <div className="text-muted-foreground text-meta">{formatDuration(row.getValue("duration_seconds"))}</div>
    ),
  },
  {
    accessorKey: "summary",
    header: "Summary",
    cell: ({ row }) => (
      <div className="w-[400px] text-muted-foreground text-meta whitespace-normal break-words">
        {row.getValue("summary")}
      </div>
    ),
    size: 400,
  },
  {
    accessorKey: "case_qualified",
    header: "Lead Qualified",
    cell: ({ row }) => {
      const qualified = row.getValue("case_qualified") as boolean
      const displayValue = qualified ? "Yes" : "No"
      return (
        <Badge
          variant={qualified ? "default" : "secondary"}
          className={`text-caption h-4 px-1.5 font-medium ${qualified
            ? "bg-[hsl(var(--info-success-bg))] text-[hsl(var(--info-success))] border border-[hsl(var(--info-success-border))] hover:bg-[hsl(var(--info-success-hover))]"
            : "bg-[hsl(var(--info-error-bg))] text-[hsl(var(--info-error))] border border-[hsl(var(--info-error-border))] hover:bg-[hsl(var(--info-error-hover))]"
          }`}
        >
          {displayValue}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const qualified = row.getValue(id) as boolean
      const displayValue = qualified ? "Yes" : "No"
      return value.includes(displayValue)
    },
  },
  {
    accessorKey: "accident_type",
    header: "Case Type",
    cell: ({ row }) => {
      const value = row.getValue("accident_type") as string | null
      const capitalized = value ? value.charAt(0).toUpperCase() + value.slice(1) : "-"
      return (
        <div className="text-muted-foreground text-meta">{capitalized}</div>
      )
    },
  },
]

interface CallsTableProps {
  limit?: number
}

export function CallsTable({ limit }: CallsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [showQualified, setShowQualified] = React.useState(true)
  const [showNotQualified, setShowNotQualified] = React.useState(true)
  const [selectedCall, setSelectedCall] = React.useState<Call | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const calls: CallSummary[] = limit ? mockCalls.slice(0, limit) : mockCalls

  const handleRowClick = (call: CallSummary) => {
    setSelectedCall(mockCalls.find((item) => item.id === call.id) ?? null)
    setSheetOpen(true)
  }

  // Filter data based on checkbox selections
  const filteredData = React.useMemo(() => {
    return calls.filter(call => {
      if (showQualified && showNotQualified) return true
      if (showQualified && call.case_qualified === true) return true
      if (showNotQualified && call.case_qualified === false) return true
      return false
    })
  }, [calls, showQualified, showNotQualified])

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  })

  return (
    <Card className="p-3 bg-card border-none shadow-none">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-body font-semibold text-foreground">Recent Calls</h3>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2.5 text-caption text-muted-foreground hover:text-foreground hover:bg-transparent gap-1.5 font-normal cursor-pointer"
                  >
                    <Filter className="w-3 h-3" />
                    Filter
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter calls</p>
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-40 border-none shadow-sm">
              <DropdownMenuCheckboxItem
                checked={showQualified}
                onCheckedChange={setShowQualified}
                className="text-meta"
              >
                Qualified
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showNotQualified}
                onCheckedChange={setShowNotQualified}
                className="text-meta"
              >
                Not Qualified
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <InputGroup className="h-6 w-44 rounded-lg">
            <InputGroupAddon>
              <InputGroupText>
                <Search className="w-2.5 h-2.5" />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search all columns..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="!text-caption placeholder:text-caption"
              style={{ fontSize: '8px' }}
            />
          </InputGroup>
        </div>
      </div>

      <div className="overflow-x-auto -mx-3 px-3 -mt-2">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-muted-foreground font-medium text-caption uppercase tracking-wide h-6 py-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-accent border-b border-border/50 cursor-pointer"
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48">
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Phone className="w-8 h-8" />
                      </EmptyMedia>
                      <EmptyTitle className="text-section">No calls found</EmptyTitle>
                      <EmptyDescription className="text-meta">
                        {globalFilter
                          ? "Try adjusting your search or changing filters"
                          : "No calls have been recorded yet"}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CallDetailSheet
        call={selectedCall}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </Card>
  )
}
