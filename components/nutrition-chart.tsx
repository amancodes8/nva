'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const weeklyData = [
  { day: 'Mon', calories: 1800, protein: 120, carbs: 200, fat: 70 },
  { day: 'Tue', calories: 2100, protein: 140, carbs: 250, fat: 85 },
  { day: 'Wed', calories: 1950, protein: 130, carbs: 220, fat: 75 },
  { day: 'Thu', calories: 2200, protein: 150, carbs: 280, fat: 90 },
  { day: 'Fri', calories: 1750, protein: 110, carbs: 180, fat: 65 },
  { day: 'Sat', calories: 2300, protein: 160, carbs: 300, fat: 95 },
  { day: 'Sun', calories: 1900, protein: 125, carbs: 210, fat: 80 },
]

const macroData = [
  { name: 'Protein', value: 85, color: '#10B981' },
  { name: 'Carbs', value: 180, color: '#F59E0B' },
  { name: 'Fat', value: 65, color: '#8B5CF6' },
]

const chartConfig = {
  calories: {
    label: "Calories",
    color: "#0066CC",
  },
  protein: {
    label: "Protein",
    color: "#10B981",
  },
  carbs: {
    label: "Carbs", 
    color: "#F59E0B",
  },
  fat: {
    label: "Fat",
    color: "#8B5CF6",
  },
}

export function NutritionChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Calorie Trend</CardTitle>
          <CardDescription>
            Your daily calorie intake over the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="calories" 
                  stroke={chartConfig.calories.color}
                  strokeWidth={2}
                  dot={{ fill: chartConfig.calories.color }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Macros</CardTitle>
          <CardDescription>
            Breakdown of your macronutrient intake
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="flex justify-center space-x-4 mt-4">
            {macroData.map((macro) => (
              <div key={macro.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: macro.color }}
                />
                <span className="text-sm">
                  {macro.name}: {macro.value}g
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
