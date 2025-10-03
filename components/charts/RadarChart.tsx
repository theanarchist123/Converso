"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface RadarChartProps {
  data?: any[];
}

export function RadarChartComponent({ data = chartData }: RadarChartProps) {
  // Use passed data or fallback to default
  const displayData = data && data.length > 0 ? data : chartData;
  
  return (
    <Card className="bg-black border-violet-600">
      <CardHeader className="items-center pb-4">
        <CardTitle className="text-violet-300">Performance Metrics</CardTitle>
        <CardDescription className="text-violet-400">
          System performance overview
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={displayData}>
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent />}
              contentStyle={{
                backgroundColor: '#000000',
                border: '1px solid #7C3AED',
                borderRadius: '8px',
                color: '#FFFFFF'
              }}
            />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#A78BFA', fontSize: 11 }} />
            <PolarGrid stroke="#4C1D95" strokeDasharray="3 3" />
            <Radar
              dataKey="value"
              fill="#8B5CF6"
              fillOpacity={0.5}
              stroke="#8B5CF6"
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none text-violet-300">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-violet-400">
          Comparing current vs previous period performance
        </div>
      </CardFooter>
    </Card>
  )
}