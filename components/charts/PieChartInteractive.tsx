"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const defaultData = [
  { month: "january", users: 2100, fill: "var(--color-january)" },
  { month: "february", users: 2200, fill: "var(--color-february)" },
  { month: "march", users: 2180, fill: "var(--color-march)" },
  { month: "april", users: 2250, fill: "var(--color-april)" },
  { month: "may", users: 2341, fill: "var(--color-may)" },
]

const chartConfig = {
  users: {
    label: "Users",
  },
  active: {
    label: "Active",
    color: "#8B5CF6",
  },
  inactive: {
    label: "Inactive",
    color: "#7C3AED",
  },
  new: {
    label: "New",
    color: "#A855F7",
  },
  january: {
    label: "January",
    color: "#8B5CF6",
  },
  february: {
    label: "February",
    color: "#7C3AED",
  },
  march: {
    label: "March",
    color: "#6D28D9",
  },
  april: {
    label: "April",
    color: "#5B21B6",
  },
  may: {
    label: "May",
    color: "#A855F7",
  },
  june: {
    label: "June",
    color: "#8B5CF6",
  },
  july: {
    label: "July",
    color: "#7C3AED",
  },
  august: {
    label: "August",
    color: "#6D28D9",
  },
  september: {
    label: "September",
    color: "#5B21B6",
  },
  october: {
    label: "October",
    color: "#A855F7",
  },
  november: {
    label: "November",
    color: "#8B5CF6",
  },
  december: {
    label: "December",
    color: "#7C3AED",
  },
} satisfies ChartConfig

interface PieChartInteractiveProps {
  data?: any[];
}

export function PieChartInteractive({ data }: PieChartInteractiveProps) {
  const id = "pie-interactive"
  
  // Transform data to match the format needed - ENSURE ALL 12 MONTHS
  const chartData = React.useMemo(() => {
    // Define all 12 months structure
    const allMonths = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ]
    
    if (data && data.length > 0) {
      // Check if data has the new structure with month and nested data array
      if (data[0]?.month && data[0]?.data) {
        console.log('🥧 PieChartInteractive received data for', data.length, 'months')
        console.log('🥧 Received months:', data.map(d => d.month).join(', '))
        
        // Create a map of month data
        const monthDataMap = new Map(
          data.map((monthData) => [monthData.month.toLowerCase(), monthData])
        )
        
        // Return all 12 months, using received data or empty data
        return allMonths.map((monthKey) => {
          const monthData = monthDataMap.get(monthKey)
          
          if (monthData) {
            const totalUsers = monthData.data.reduce((sum: number, d: any) => sum + (d.users || 0), 0)
            console.log(`📊 ${monthKey}: ${totalUsers} total users (from data)`)
            
            return {
              month: monthKey,
              data: monthData.data,
              fill: `var(--color-${monthKey})`,
            }
          } else {
            // No data for this month, use empty data
            console.log(`📊 ${monthKey}: No data, using empty`)
            return {
              month: monthKey,
              data: [
                { name: 'Active', users: 0, fill: '#8B5CF6' },
                { name: 'Inactive', users: 0, fill: '#7C3AED' },
                { name: 'New', users: 0, fill: '#A855F7' }
              ],
              fill: `var(--color-${monthKey})`,
            }
          }
        })
      }
    }
    
    console.log('⚠️ No valid data received, using all 12 months with empty data')
    return allMonths.map((monthKey) => ({
      month: monthKey,
      data: [
        { name: 'Active', users: 0, fill: '#8B5CF6' },
        { name: 'Inactive', users: 0, fill: '#7C3AED' },
        { name: 'New', users: 0, fill: '#A855F7' }
      ],
      fill: `var(--color-${monthKey})`,
    }))
  }, [data])

  // Default to current month (October 2025)
  const defaultMonth = React.useMemo(() => {
    const currentDate = new Date()
    const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate).toLowerCase()
    
    console.log(`🎯 Defaulting to current month: ${currentMonthName}`)
    return currentMonthName
  }, [])

  const [activeMonth, setActiveMonth] = React.useState(defaultMonth)

  // Update active month when data changes
  React.useEffect(() => {
    setActiveMonth(defaultMonth)
  }, [defaultMonth])

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.month === activeMonth),
    [activeMonth, chartData]
  )
  
  const months = React.useMemo(() => chartData.map((item) => item.month), [chartData])
  
  // Get the active month's data for the pie chart
  const activeData = React.useMemo(() => {
    const monthData = chartData[activeIndex]
    if (monthData?.data && Array.isArray(monthData.data)) {
      console.log(`🥧 Active month: ${activeMonth}, data:`, monthData.data)
      return monthData.data
    }
    console.log(`⚠️ No data for month: ${activeMonth}`)
    return []
  }, [chartData, activeIndex, activeMonth])

  return (
    <Card data-chart={id} className="flex flex-col bg-black border-violet-600">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="text-violet-300">User Status Distribution</CardTitle>
          <CardDescription className="text-violet-400">Current user status breakdown</CardDescription>
        </div>
        <Select value={activeMonth} onValueChange={setActiveMonth}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5 bg-black border-violet-600 text-violet-300"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl bg-black border-violet-600">
            {months.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig]
              
              // Calculate total users for this month
              const monthData = chartData.find(item => item.month === key)
              const totalUsers = monthData?.data?.reduce((sum: number, d: any) => sum + (d.users || 0), 0) || 0
              const hasData = totalUsers > 0

              if (!config) {
                console.warn(`⚠️ No config found for month: ${key}`)
                return null
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex text-violet-300 hover:bg-violet-950/20 focus:bg-violet-950/20"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    <span>{config?.label}</span>
                    {!hasData && <span className="text-gray-500 ml-1">(No data)</span>}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        {activeData.length > 0 ? (
          <ChartContainer
            id={id}
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
                contentStyle={{
                  backgroundColor: '#000000',
                  border: '1px solid #7C3AED',
                  borderRadius: '8px',
                  color: '#FFFFFF'
                }}
              />
              <Pie
                data={activeData}
                dataKey="users"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
                stroke="#000000"
                activeShape={({
                  outerRadius = 0,
                  ...props
                }: PieSectorDataItem) => (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 10} />
                    <Sector
                      {...props}
                      outerRadius={outerRadius + 25}
                      innerRadius={outerRadius + 12}
                    />
                  </g>
                )}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const totalUsers = activeData.reduce((sum: number, item: any) => sum + (item.users || 0), 0)
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-white text-3xl font-bold"
                          >
                            {totalUsers.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-violet-400"
                          >
                            Users
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-violet-400">
            <p>No data available for {activeMonth.charAt(0).toUpperCase() + activeMonth.slice(1)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
