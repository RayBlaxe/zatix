"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const budgetData = [
  {
    name: "Marketing",
    budget: 15000,
    spent: 12000,
    remaining: 3000,
  },
  {
    name: "Operations",
    budget: 25000,
    spent: 22000,
    remaining: 3000,
  },
  {
    name: "Development",
    budget: 35000,
    spent: 28000,
    remaining: 7000,
  },
  {
    name: "Events",
    budget: 45000,
    spent: 42000,
    remaining: 3000,
  },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function BudgetAnalysis() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Total Budget</div>
          <div className="text-2xl font-bold">$120,000.00</div>
          <div className="text-xs text-muted-foreground">Annual budget</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Total Spent</div>
          <div className="text-2xl font-bold">$104,000.00</div>
          <div className="text-xs text-muted-foreground">86.7% of budget</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Remaining</div>
          <div className="text-2xl font-bold">$16,000.00</div>
          <div className="text-xs text-muted-foreground">13.3% of budget</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Budget Health</div>
          <div className="text-2xl font-bold text-green-600">Good</div>
          <div className="text-xs text-muted-foreground">On track</div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium mb-4">Budget Allocation</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetData}
                  dataKey="budget"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {budgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium mb-4">Budget vs Spent</h3>
          <div className="space-y-4">
            {budgetData.map((item, index) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ${item.spent.toLocaleString()} / ${item.budget.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(item.spent / item.budget) * 100}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 