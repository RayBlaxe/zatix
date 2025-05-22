"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const taxData = [
  {
    name: "Q1",
    income: 40000,
    tax: 8000,
    deductions: 5000,
  },
  {
    name: "Q2",
    income: 45000,
    tax: 9000,
    deductions: 5500,
  },
  {
    name: "Q3",
    income: 42000,
    tax: 8400,
    deductions: 5200,
  },
  {
    name: "Q4",
    income: 48000,
    tax: 9600,
    deductions: 6000,
  },
]

export function TaxSummary() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Total Income</div>
          <div className="text-2xl font-bold">$175,000.00</div>
          <div className="text-xs text-muted-foreground">Annual income</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Total Tax</div>
          <div className="text-2xl font-bold">$35,000.00</div>
          <div className="text-xs text-muted-foreground">20% tax rate</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Total Deductions</div>
          <div className="text-2xl font-bold">$21,700.00</div>
          <div className="text-xs text-muted-foreground">12.4% of income</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">Net Taxable Income</div>
          <div className="text-2xl font-bold">$153,300.00</div>
          <div className="text-xs text-muted-foreground">After deductions</div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium mb-4">Quarterly Tax Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taxData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#8884d8" name="Income" />
                <Bar dataKey="tax" fill="#82ca9d" name="Tax" />
                <Bar dataKey="deductions" fill="#ffc658" name="Deductions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-lg font-medium mb-4">Tax Breakdown</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Federal Tax</span>
                <span className="text-sm">$28,000.00</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: "80%" }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">State Tax</span>
                <span className="text-sm">$5,250.00</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-green-600" style={{ width: "15%" }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Local Tax</span>
                <span className="text-sm">$1,750.00</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-yellow-600" style={{ width: "5%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 