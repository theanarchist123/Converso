"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

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
  { month: "January", users: 186, revenue: 80 },
  { month: "February", users: 305, revenue: 200 },
  { month: "March", users: 237, revenue: 120 },
  { month: "April", users: 73, revenue: 190 },
  { month: "May", users: 209, revenue: 130 },
  { month: "June", users: 214, revenue: 140 },
]

const chartConfig = {
  users: {
    label: "Users",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface BarChartProps {
  data?: any[];
}

export function BarChartComponent({ data = chartData }: BarChartProps) {
  // Use passed data or fallback to default
  const displayData = data && data.length > 0 ? data : chartData;
  
  return (
    <Card className="w-full bg-black border-violet-600">
      <CardHeader>
        <CardTitle className="text-violet-300">User Growth</CardTitle>
        <CardDescription className="text-violet-400">Monthly user registration trends</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={displayData}>
            <CartesianGrid vertical={false} stroke="#4C1D95" strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fill: '#A78BFA', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#A78BFA', fontSize: 12 }}
            />
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
            <Bar dataKey="users" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
              <LabelList
                position="top"
                offset={12}
                className="fill-violet-300"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none text-violet-300">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-violet-400">
          Showing total users for the last {displayData.length} months
        </div>
      </CardFooter>
    </Card>
  )
}