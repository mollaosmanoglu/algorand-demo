"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, AreaChart, Area, CartesianGrid } from "recharts"
import { Check } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { hourlyChartData, weeklyChartData } from "@/lib/mock-data"

type MetricData = {
  id: string
  label: string
  value: string
  suffix: string
  chartData: any[]
}

const timeRanges = [
  { label: "This week", value: "7" },
  { label: "This month", value: "30" },
  { label: "This year", value: "365" },
]

const chartConfigs = {
  total_calls: {
    calls: {
      label: "Calls",
      color: "hsl(var(--info-chart))",
    },
  },
  today_calls: {
    calls: {
      label: "Calls",
      color: "hsl(var(--info-chart))",
    },
  },
  qualification_rate: {
    rate: {
      label: "Percentage",
      color: "hsl(var(--info-chart))",
    },
  },
  avg_duration: {
    minutes: {
      label: "Minuten",
      color: "hsl(var(--info-chart))",
    },
  },
} satisfies Record<string, ChartConfig>

// Constants for X-axis formatting
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function MetricCards() {
  const [selectedMetric, setSelectedMetric] = useState("total_calls")
  const [selectedRange, setSelectedRange] = useState("7")
  const metrics: MetricData[] = [
    {
      id: "total_calls",
      label: "Total calls",
      value: "86",
      suffix: "",
      chartData: weeklyChartData.map(d => ({
        day: d.day,  // Keep as ISO string (YYYY-MM-DD)
        calls: d.calls
      }))
    },
    {
      id: "today_calls",
      label: "Calls today",
      value: "11",
      suffix: "",
      chartData: hourlyChartData.map(d => ({
        hour: d.hour,
        calls: d.calls
      }))
    },
    {
      id: "qualification_rate",
      label: "Qualification rate",
      value: "74",
      suffix: "%",
      chartData: weeklyChartData.map(d => ({
        day: d.day,  // Keep as ISO string (YYYY-MM-DD)
        rate: d.rate
      }))
    },
    {
      id: "avg_duration",
      label: "Average duration",
      value: "3.7",
      suffix: "min",
      chartData: weeklyChartData.map(d => ({
        day: d.day,  // Keep as ISO string (YYYY-MM-DD)
        minutes: d.avgMinutes
      }))
    }
  ]

  return (
    <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-1">
      <TabsList className="w-full h-auto p-0 bg-transparent flex gap-2">
        {metrics.map((metric) => (
            <TabsTrigger
              key={metric.id}
              value={metric.id}
              className="flex-1 relative p-3 bg-card border border-border data-[state=active]:bg-accent hover:bg-accent/50 transition-colors cursor-pointer shadow-none rounded-lg text-left items-start justify-start"
            >
              <div className="w-full">
                <div className="space-y-0.5">
                  <p className="text-body text-muted-foreground font-normal text-left">{metric.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-display font-semibold text-foreground">{metric.value}</span>
                    {metric.suffix && (
                      <span className="text-body text-muted-foreground font-normal">{metric.suffix}</span>
                    )}
                  </div>
                </div>
              </div>
              {selectedMetric === metric.id && (
                <Check className="w-3 h-3 text-foreground absolute top-2 right-2" strokeWidth={2} />
              )}
            </TabsTrigger>
          ))}
      </TabsList>

      {metrics.map((metric) => (
        <TabsContent key={metric.id} value={metric.id} className="mt-2">
          <Card className="bg-card border-none shadow-none">
            <CardHeader className="px-3 pt-3 pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-body font-semibold text-foreground">
                    {metric.label}
                  </CardTitle>
                  <CardDescription className="text-caption">
                    {metric.id === "total_calls" && `Total call volume over the last ${selectedRange === "7" ? "week" : selectedRange === "30" ? "month" : "year"}`}
                    {metric.id === "today_calls" && "Calls distributed throughout the day"}
                    {metric.id === "qualification_rate" && `Qualified lead percentage over the last ${selectedRange === "7" ? "week" : selectedRange === "30" ? "month" : "year"}`}
                    {metric.id === "avg_duration" && `Average call duration over the last ${selectedRange === "7" ? "week" : selectedRange === "30" ? "month" : "year"}`}
                  </CardDescription>
                </div>
                {/* Hide filter for "Calls today" - it always shows today */}
                {metric.id !== "today_calls" && (
                  <Select value={selectedRange} onValueChange={setSelectedRange}>
                    <SelectTrigger
                      size="sm"
                      className="h-6 px-2.5 text-caption text-muted-foreground hover:text-foreground gap-1.5 font-normal w-auto cursor-pointer"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeRanges.map((range) => (
                        <SelectItem
                          key={range.value}
                          value={range.value}
                          className="text-meta"
                        >
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardHeader>

            <CardContent className="px-0 pb-3 pt-0">
              <ChartContainer
                config={chartConfigs[metric.id as keyof typeof chartConfigs]}
                className="h-[240px] w-full"
              >
                  {metric.id === "today_calls" ? (
                  <AreaChart
                    accessibilityLayer
                    data={metric.chartData}
                    margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                    key={`area-${metric.chartData.length}`}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="hour"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 9 }}
                    />
                    <YAxis
                      width={35}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 9 }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Area
                      type="monotone"
                      dataKey="calls"
                      stroke="var(--color-calls)"
                      fill="var(--color-calls)"
                      fillOpacity={0.05}
                      strokeWidth={1}
                    />
                  </AreaChart>
                ) : (
                  <LineChart
                    accessibilityLayer
                    data={metric.chartData}
                    margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                    key={`line-${selectedRange}-${metric.chartData.length}`}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 9 }}
                      tickFormatter={(value) => {
                        const days = parseInt(selectedRange)

                        if (days === 7) {
                          // Week view: show day names (value is YYYY-MM-DD)
                          const date = new Date(value)
                          return DAY_NAMES[date.getDay()]
                        } else if (days === 30) {
                          // Month view: show day number (value is YYYY-MM-DD)
                          const date = new Date(value)
                          return date.getDate().toString()
                        } else {
                          // Year view: show month abbreviation (value is YYYY-MM)
                          if (!value) return ''
                          const month = value.split('-')[1]
                          const monthIndex = parseInt(month) - 1
                          return MONTH_NAMES[monthIndex]
                        }
                      }}
                    />
                    <YAxis
                      width={35}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 9 }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Line
                      type="monotone"
                      dataKey={
                        metric.id === "avg_duration" ? "minutes" :
                        metric.id === "qualification_rate" ? "rate" :
                        "calls"
                      }
                      stroke={
                        metric.id === "avg_duration" ? "var(--color-minutes)" :
                        metric.id === "qualification_rate" ? "var(--color-rate)" :
                        "var(--color-calls)"
                      }
                      strokeWidth={1.5}
                      dot={{
                        fill: metric.id === "avg_duration" ? "var(--color-minutes)" :
                              metric.id === "qualification_rate" ? "var(--color-rate)" :
                              "var(--color-calls)",
                        r: 2
                      }}
                    />
                  </LineChart>
                )}
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )
}
