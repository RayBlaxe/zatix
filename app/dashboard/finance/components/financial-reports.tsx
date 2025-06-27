"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, FileText, TrendingUp, TrendingDown } from "lucide-react"

interface Report {
  id: string
  title: string
  description: string
  period: string
  status: "ready" | "processing" | "scheduled"
  lastGenerated: string
  size: string
}

export function FinancialReports() {
  const reports: Report[] = [
    {
      id: "1",
      title: "Monthly Revenue Report",
      description: "Comprehensive breakdown of revenue streams and performance metrics",
      period: "January 2024",
      status: "ready",
      lastGenerated: "2024-02-01",
      size: "2.4 MB"
    },
    {
      id: "2", 
      title: "Quarterly Financial Summary",
      description: "High-level financial overview with key performance indicators",
      period: "Q4 2023",
      status: "ready",
      lastGenerated: "2024-01-15",
      size: "3.1 MB"
    },
    {
      id: "3",
      title: "Annual Tax Report",
      description: "Complete tax documentation and compliance report",
      period: "2023",
      status: "processing",
      lastGenerated: "2024-01-31",
      size: "5.2 MB"
    },
    {
      id: "4",
      title: "Event Performance Analysis",
      description: "Detailed analysis of individual event financial performance",
      period: "December 2023",
      status: "scheduled",
      lastGenerated: "2023-12-31",
      size: "1.8 MB"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Financial Reports</h3>
          <p className="text-sm text-muted-foreground">
            Generate and download comprehensive financial reports
          </p>
        </div>
        <Button>
          <FileText className="mr-2 size-4" />
          Generate New Report
        </Button>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>{report.period}</span>
                  </div>
                </div>
                {getStatusBadge(report.status)}
              </div>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p>Last generated: {formatDate(report.lastGenerated)}</p>
                  <p>File size: {report.size}</p>
                </div>
                <div className="flex gap-2">
                  {report.status === "ready" && (
                    <>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 size-4" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </>
                  )}
                  {report.status === "processing" && (
                    <Button variant="outline" size="sm" disabled>
                      Processing...
                    </Button>
                  )}
                  {report.status === "scheduled" && (
                    <Button variant="outline" size="sm">
                      View Schedule
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="size-3 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Generation Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2m</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="size-3 mr-1" />
              -5% faster than last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">847 MB</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="size-3 mr-1" />
              15.2% of 5GB limit
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}