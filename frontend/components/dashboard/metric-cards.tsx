"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { Check } from "lucide-react"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type {
  PortfolioChartPoint,
  PortfolioMetric,
} from "@/lib/portfolio-dashboard"

const chartConfigs = {
  actions: {
    actions: {
      label: "Actions",
      color: "hsl(var(--info-chart))",
    },
  },
  value: {
    value: {
      label: "Covered value",
      color: "hsl(var(--info-chart))",
    },
  },
  premium: {
    premium: {
      label: "Premium",
      color: "hsl(var(--info-chart))",
    },
  },
  settlements: {
    settlements: {
      label: "Settlements",
      color: "hsl(var(--info-chart))",
    },
  },
} satisfies Record<string, ChartConfig>

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function MetricCards({
  metrics,
  chartData,
}: {
  metrics: PortfolioMetric[]
  chartData: PortfolioChartPoint[]
}) {
  const [selectedMetric, setSelectedMetric] = useState(metrics[0]?.id ?? "")

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
                <div className="space-y-1">
                  <CardTitle className="text-section font-semibold text-foreground">
                    {metric.label}
                  </CardTitle>
                  <CardDescription className="text-body text-muted-foreground">
                    {metric.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-0 pb-3 pt-0">
              <ChartContainer
                config={chartConfigs[metric.chartKey]}
                className="h-[240px] w-full"
              >
                <LineChart
                  accessibilityLayer
                  data={chartData}
                  margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                  key={`line-${metric.chartKey}`}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 9 }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return DAY_NAMES[date.getDay()]
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
                    dataKey={metric.chartKey}
                    stroke={`var(--color-${metric.chartKey})`}
                    strokeWidth={1.5}
                    dot={{
                      fill: `var(--color-${metric.chartKey})`,
                      r: 2
                    }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )
}
