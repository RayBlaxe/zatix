"use client"

import { useEffect, useState } from "react"
import { financeApi } from "../api"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

export function TicketSales() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketData = await financeApi.getTicketSales()
        setData(ticketData)
      } catch (error) {
        console.error("Error fetching ticket sales:", error)
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
      <div className="h-[400px]">
        <h3 className="text-lg font-medium mb-4">Daily Ticket Sales</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.daily}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-[400px]">
        <h3 className="text-lg font-medium mb-4">Sales by Event</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.byEvent}>
            <XAxis dataKey="event" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 