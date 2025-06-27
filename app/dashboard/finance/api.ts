import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import html2canvas from "html2canvas"

// Mock data for finance dashboard
const mockData = {
  overview: {
    totalRevenue: 45231.89,
    ticketSales: 2350,
    activeEvents: 12,
    averageTicketPrice: 19.25,
    revenueChange: 20.1,
    salesChange: 180.1,
    eventsChange: 2,
    priceChange: 4.75,
  },
  recentSales: [
    {
      id: 1,
      customer: "John Doe",
      amount: 299.99,
      status: "completed",
      date: "2024-03-15",
    },
    {
      id: 2,
      customer: "Jane Smith",
      amount: 199.99,
      status: "completed",
      date: "2024-03-14",
    },
    {
      id: 3,
      customer: "Bob Johnson",
      amount: 399.99,
      status: "pending",
      date: "2024-03-14",
    },
    {
      id: 4,
      customer: "Alice Brown",
      amount: 149.99,
      status: "completed",
      date: "2024-03-13",
    },
    {
      id: 5,
      customer: "Charlie Wilson",
      amount: 249.99,
      status: "failed",
      date: "2024-03-13",
    },
  ],
  ticketSales: {
    daily: [
      { date: "2024-03-01", sales: 120 },
      { date: "2024-03-02", sales: 150 },
      { date: "2024-03-03", sales: 180 },
      { date: "2024-03-04", sales: 200 },
      { date: "2024-03-05", sales: 220 },
      { date: "2024-03-06", sales: 250 },
      { date: "2024-03-07", sales: 280 },
    ],
    byEvent: [
      { event: "Concert A", sales: 500 },
      { event: "Concert B", sales: 300 },
      { event: "Concert C", sales: 200 },
      { event: "Concert D", sales: 150 },
    ],
  },
  revenue: {
    monthly: [
      { month: "Jan", revenue: 30000 },
      { month: "Feb", revenue: 35000 },
      { month: "Mar", revenue: 40000 },
      { month: "Apr", revenue: 45000 },
      { month: "May", revenue: 50000 },
      { month: "Jun", revenue: 55000 },
    ],
    byCategory: [
      { category: "Tickets", revenue: 150000 },
      { category: "Merchandise", revenue: 50000 },
      { category: "Food & Beverage", revenue: 30000 },
      { category: "VIP Packages", revenue: 70000 },
    ],
  },
  cashFlow: {
    operating: 32150.00,
    investing: -5000.00,
    financing: 8000.00,
    net: 35150.00,
    monthly: [
      { month: "Jan", income: 4000, expenses: 2400, balance: 1600 },
      { month: "Feb", income: 3000, expenses: 1398, balance: 1602 },
      { month: "Mar", income: 2000, expenses: 9800, balance: -7800 },
      { month: "Apr", income: 2780, expenses: 3908, balance: -1128 },
      { month: "May", income: 1890, expenses: 4800, balance: -2910 },
      { month: "Jun", income: 2390, expenses: 3800, balance: -1410 },
      { month: "Jul", income: 3490, expenses: 4300, balance: -810 },
    ],
  },
  budget: {
    total: 120000.00,
    spent: 104000.00,
    remaining: 16000.00,
    health: "Good",
    categories: [
      { name: "Marketing", budget: 15000, spent: 12000, remaining: 3000 },
      { name: "Operations", budget: 25000, spent: 22000, remaining: 3000 },
      { name: "Development", budget: 35000, spent: 28000, remaining: 7000 },
      { name: "Events", budget: 45000, spent: 42000, remaining: 3000 },
    ],
  },
  tax: {
    totalIncome: 175000.00,
    totalTax: 35000.00,
    totalDeductions: 21700.00,
    netTaxableIncome: 153300.00,
    quarterly: [
      { quarter: "Q1", income: 40000, tax: 8000, deductions: 5000 },
      { quarter: "Q2", income: 45000, tax: 9000, deductions: 5500 },
      { quarter: "Q3", income: 42000, tax: 8400, deductions: 5200 },
      { quarter: "Q4", income: 48000, tax: 9600, deductions: 6000 },
    ],
    breakdown: {
      federal: 28000.00,
      state: 5250.00,
      local: 1750.00,
    },
  },
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

// Helper function to format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Mock API service
export const financeApi = {
  // Overview
  getOverview: async () => {
    await delay(500)
    return mockData.overview
  },

  // Recent Sales
  getRecentSales: async () => {
    await delay(500)
    return mockData.recentSales
  },

  // Ticket Sales
  getTicketSales: async () => {
    await delay(500)
    return mockData.ticketSales
  },

  // Revenue
  getRevenue: async () => {
    await delay(500)
    return mockData.revenue
  },

  // Cash Flow
  getCashFlow: async () => {
    await delay(500)
    return mockData.cashFlow
  },

  // Budget
  getBudget: async () => {
    await delay(500)
    return mockData.budget
  },

  // Tax
  getTax: async () => {
    await delay(500)
    return mockData.tax
  },

  // Export
  exportData: async (format: string, options?: {
    includeCharts?: boolean
    includeTables?: boolean
    dateRange?: string
  }) => {
    await delay(1000)

    const formatMap: Record<string, string> = {
      "pdf": "application/pdf",
      "pdf-summary": "application/pdf",
      "excel": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "excel-summary": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "csv": "text/csv",
      "png": "image/png",
      "svg": "image/svg+xml",
    }

    const mimeType = formatMap[format] || "application/octet-stream"
    const fileName = `finance-report-${new Date().toISOString().split("T")[0]}.${format.split("-")[0]}`

    let fileData: Blob

    if (format.startsWith("pdf")) {
      // Generate PDF
      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(20)
      doc.text("Finance Report", 14, 20)
      doc.setFontSize(12)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

      // Add overview section
      doc.setFontSize(16)
      doc.text("Overview", 14, 45)
      doc.setFontSize(12)
      autoTable(doc, {
        startY: 50,
        head: [["Metric", "Value", "Change"]],
        body: [
          ["Total Revenue", formatCurrency(mockData.overview.totalRevenue), `${mockData.overview.revenueChange}%`],
          ["Ticket Sales", mockData.overview.ticketSales.toString(), `${mockData.overview.salesChange}%`],
          ["Active Events", mockData.overview.activeEvents.toString(), `${mockData.overview.eventsChange}%`],
          ["Average Ticket Price", formatCurrency(mockData.overview.averageTicketPrice), `${mockData.overview.priceChange}%`],
        ],
      })

      // Add recent sales section
      doc.setFontSize(16)
      doc.text("Recent Sales", 14, (doc as any).lastAutoTable.finalY + 20)
      doc.setFontSize(12)
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 25,
        head: [["Customer", "Amount", "Status", "Date"]],
        body: mockData.recentSales.map(sale => [
          sale.customer,
          formatCurrency(sale.amount),
          sale.status,
          formatDate(sale.date),
        ]),
      })

      // Add revenue section
      doc.setFontSize(16)
      doc.text("Revenue by Category", 14, (doc as any).lastAutoTable.finalY + 20)
      doc.setFontSize(12)
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 25,
        head: [["Category", "Revenue"]],
        body: mockData.revenue.byCategory.map(cat => [
          cat.category,
          formatCurrency(cat.revenue),
        ]),
      })

      fileData = doc.output("blob")
    } else if (format.startsWith("excel")) {
      // Generate Excel
      const wb = XLSX.utils.book_new()
      
      // Overview sheet
      const overviewData = [
        ["Metric", "Value", "Change"],
        ["Total Revenue", mockData.overview.totalRevenue, mockData.overview.revenueChange],
        ["Ticket Sales", mockData.overview.ticketSales, mockData.overview.salesChange],
        ["Active Events", mockData.overview.activeEvents, mockData.overview.eventsChange],
        ["Average Ticket Price", mockData.overview.averageTicketPrice, mockData.overview.priceChange],
      ]
      const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData)
      XLSX.utils.book_append_sheet(wb, overviewSheet, "Overview")

      // Recent Sales sheet
      const salesData = [
        ["Customer", "Amount", "Status", "Date"],
        ...mockData.recentSales.map(sale => [
          sale.customer,
          sale.amount,
          sale.status,
          sale.date,
        ]),
      ]
      const salesSheet = XLSX.utils.aoa_to_sheet(salesData)
      XLSX.utils.book_append_sheet(wb, salesSheet, "Recent Sales")

      // Revenue sheet
      const revenueData = [
        ["Category", "Revenue"],
        ...mockData.revenue.byCategory.map(cat => [
          cat.category,
          cat.revenue,
        ]),
      ]
      const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData)
      XLSX.utils.book_append_sheet(wb, revenueSheet, "Revenue")

      // Convert to blob
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
      fileData = new Blob([excelBuffer], { type: mimeType })
    } else if (format === "csv") {
      // Generate CSV
      const csvData = [
        ["Date", "Category", "Amount", "Status"],
        ...mockData.recentSales.map(sale => [
          sale.date,
          "Ticket Sale",
          sale.amount,
          sale.status,
        ]),
        ...mockData.revenue.byCategory.map(cat => [
          new Date().toISOString().split("T")[0],
          cat.category,
          cat.revenue,
          "Completed",
        ]),
      ]
      
      const csvContent = csvData.map(row => row.join(",")).join("\n")
      fileData = new Blob([csvContent], { type: mimeType })
    } else if (format === "png" || format === "svg") {
      // For PNG/SVG, we would need to capture the actual chart elements
      // This is a placeholder - in a real implementation, you would:
      // 1. Get the chart element using document.querySelector
      // 2. Use html2canvas to capture it
      // 3. Convert to the desired format
      const canvas = document.createElement("canvas")
      canvas.width = 800
      canvas.height = 400
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Draw a placeholder chart
        ctx.fillStyle = "#f0f0f0"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "#000"
        ctx.font = "20px Arial"
        ctx.fillText("Chart Preview", 350, 200)
      }
      
      if (format === "png") {
        fileData = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
          }, "image/png")
        })
      } else {
        // For SVG, we would need to convert the canvas to SVG
        // This is a simplified version
        const svgContent = `<svg width="800" height="400">
          <rect width="800" height="400" fill="#f0f0f0"/>
          <text x="350" y="200" font-family="Arial" font-size="20">Chart Preview</text>
        </svg>`
        fileData = new Blob([svgContent], { type: mimeType })
      }
    } else {
      throw new Error(`Unsupported format: ${format}`)
    }

    return {
      success: true,
      message: `Data exported successfully in ${format} format`,
      data: fileData,
      fileName,
      mimeType,
      options: {
        includeCharts: options?.includeCharts ?? true,
        includeTables: options?.includeTables ?? true,
        dateRange: options?.dateRange ?? "last30days",
      },
    }
  },
} 