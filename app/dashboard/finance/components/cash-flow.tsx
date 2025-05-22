"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const cashFlowData = [
  {
    name: "Jan",
    income: 4000,
    expenses: 2400,
    balance: 1600,
  },
  {
    name: "Feb",
    income: 3000,
    expenses: 1398,
    balance: 1602,
  },
  {
    name: "Mar",
    income: 2000,
    expenses: 9800,
    balance: -7800,
  },
  {
    name: "Apr",
    income: 2780,
    expenses: 3908,
    balance: -1128,
  },
  {
    name: "May",
    income: 1890,
    expenses: 4800,
    balance: -2910,
  },
  {
    name: "Jun",
    income: 2390,
    expenses: 3800,
    balance: -1410,
  },
  {
    name: "Jul",
    income: 3490,
    expenses: 4300,
    balance: -810,
  },
]

export function CashFlow() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Operating Cash Flow</div>
          <div className="text-2xl font-bold">$32,150.00</div>
          <div className="text-xs text-muted-foreground">+15.2% from last month</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Investing Cash Flow</div>
          <div className="text-2xl font-bold">-$5,000.00</div>
          <div className="text-xs text-muted-foreground">-2.1% from last month</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Financing Cash Flow</div>
          <div className="text-2xl font-bold">$8,000.00</div>
          <div className="text-xs text-muted-foreground">+5.4% from last month</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Net Cash Flow</div>
          <div className="text-2xl font-bold">$35,150.00</div>
          <div className="text-xs text-muted-foreground">+18.5% from last month</div>
        </div>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cashFlowData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="income"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stackId="1"
              stroke="#82ca9d"
              fill="#82ca9d"
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#ffc658"
              fill="#ffc658"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 