"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, Table, BarChart, Settings } from "lucide-react"
import { financeApi } from "../api"
import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ExportOptions {
  includeCharts: boolean
  includeTables: boolean
  dateRange: string
  format: string
}

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeCharts: true,
    includeTables: true,
    dateRange: "last30days",
    format: "pdf",
  })

  const handleExport = async (format: string) => {
    try {
      setIsExporting(true)
      const result = await financeApi.exportData(format, {
        includeCharts: exportOptions.includeCharts,
        includeTables: exportOptions.includeTables,
        dateRange: exportOptions.dateRange,
      })
      if (result.success) {
        // Create a download link
        const url = window.URL.createObjectURL(result.data)
        const a = document.createElement("a")
        a.href = url
        a.download = result.fileName
        document.body.appendChild(a)
        a.click()
        
        // Clean up
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success(result.message)
      }
    } catch (error) {
      toast.error("Failed to export data")
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FileText className="mr-2 h-4 w-4" />
              <span>Export as PDF</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                Full Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf-summary")}>
                Summary Only
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Table className="mr-2 h-4 w-4" />
              <span>Export as Excel</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                All Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel-summary")}>
                Summary Tables
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <BarChart className="mr-2 h-4 w-4" />
              <span>Export Charts</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleExport("png")}>
                PNG Images
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("svg")}>
                SVG Files
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <Dialog>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e: React.MouseEvent) => e.preventDefault()}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Export Settings</span>
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Settings</DialogTitle>
                <DialogDescription>
                  Customize your export options
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-charts">Include Charts</Label>
                  <Switch
                    id="include-charts"
                    checked={exportOptions.includeCharts}
                    onCheckedChange={(checked: boolean) => handleOptionChange("includeCharts", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-tables">Include Tables</Label>
                  <Switch
                    id="include-tables"
                    checked={exportOptions.includeTables}
                    onCheckedChange={(checked: boolean) => handleOptionChange("includeTables", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select
                    value={exportOptions.dateRange}
                    onValueChange={(value: string) => handleOptionChange("dateRange", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last7days">Last 7 Days</SelectItem>
                      <SelectItem value="last30days">Last 30 Days</SelectItem>
                      <SelectItem value="last90days">Last 90 Days</SelectItem>
                      <SelectItem value="thisYear">This Year</SelectItem>
                      <SelectItem value="allTime">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select
                    value={exportOptions.format}
                    onValueChange={(value: string) => handleOptionChange("format", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
} 