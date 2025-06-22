"use client"

import { useEffect, useState } from "react"
import { financeApi } from "../api"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function RecentSales() {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await financeApi.getRecentSales()
        setSales(data)
      } catch (error) {
        console.error("Error fetching recent sales:", error)
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
      {sales.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {sale.customer
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.customer}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(sale.date).toLocaleDateString()}
            </p>
          </div>
          <div className="ml-auto font-medium">
            ${sale.amount.toFixed(2)}
          </div>
          <Badge
            variant={
              sale.status === "completed"
                ? "success"
                : sale.status === "pending"
                ? "warning"
                : "destructive"
            }
            className="ml-4"
          >
            {sale.status}
          </Badge>
        </div>
      ))}
    </div>
  )
} 