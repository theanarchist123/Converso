"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

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

interface LineChartProps {
  data?: any[];
}

export function LineChartComponent({ data = chartData }: LineChartProps) {
  // Use passed data or fallback to default
  const displayData = data && data.length > 0 ? data : chartData;
  
  return (
    <Card className="bg-black border-violet-600">
      <CardHeader>
        <CardTitle className="text-violet-300">Engagement Trends</CardTitle>
        <CardDescription className="text-violet-400">Sessions and interactions over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={displayData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} stroke="#4C1D95" strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: '#A78BFA', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#A78BFA', fontSize: 12 }}
            />
            <ChartTooltip 
              cursor={{ stroke: '#7C3AED', strokeWidth: 1 }}
              content={<ChartTooltipContent />}
              contentStyle={{
                backgroundColor: '#000000',
                border: '1px solid #7C3AED',
                borderRadius: '8px',
                color: '#FFFFFF'
              }}
            />
            <Line
              dataKey="sessions"
              type="monotone"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#8B5CF6' }}
            />
            <Line
              dataKey="interactions"
              type="monotone"
              stroke="#A855F7"
              strokeWidth={3}
              dot={{ fill: '#A855F7', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#A855F7' }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none text-violet-300">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-violet-400">
              Showing engagement data for the last {displayData.length} months
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}