"use client"

import { useEffect, useState } from "react"
import { financeApi } from "../api"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function RevenueMetrics() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const revenueData = await financeApi.getRevenue()
        setData(revenueData)
      } catch (error) {
        console.error("Error fetching revenue metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Total Revenue</div>
          <div className="text-2xl font-bold">
            ${data.byCategory.reduce((acc: number, curr: any) => acc + curr.revenue, 0).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">All time</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Average Monthly Revenue</div>
          <div className="text-2xl font-bold">
            ${(data.monthly.reduce((acc: number, curr: any) => acc + curr.revenue, 0) / data.monthly.length).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Last 6 months</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Highest Revenue Category</div>
          <div className="text-2xl font-bold">
            {data.byCategory.reduce((max: any, curr: any) => curr.revenue > max.revenue ? curr : max).category}
          </div>
          <div className="text-xs text-muted-foreground">By category</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Revenue Growth</div>
          <div className="text-2xl font-bold text-green-600">+15.2%</div>
          <div className="text-xs text-muted-foreground">vs last month</div>
        </div>
      </div>
      <div className="h-[400px]">
        <h3 className="text-lg font-medium mb-4">Revenue by Category</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.byCategory}
              dataKey="revenue"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={150}
              label
            >
              {data.byCategory.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 