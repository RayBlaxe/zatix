"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  CreditCard,
  ArrowUpDown,
  MoreHorizontal,
  RefreshCw
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { financialApi } from "@/lib/api"
import { cn } from "@/lib/utils"

interface TransactionManagementProps {
  eventId?: number
}

export function TransactionManagement({ eventId }: TransactionManagementProps) {
  const { hasRole } = useAuth()
  const { toast } = useToast()
  
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    type: "all",
    dateFrom: "",
    dateTo: "",
    page: 1,
    per_page: 20
  })
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc"
  })

  useEffect(() => {
    loadTransactions()
  }, [filters, eventId])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: filters.page,
        per_page: filters.per_page
      }

      if (eventId) params.event_id = eventId
      if (filters.search) params.search = filters.search
      if (filters.status !== "all") params.status = filters.status
      if (filters.type !== "all") params.type = filters.type
      if (filters.dateFrom) params.date_from = filters.dateFrom
      if (filters.dateTo) params.date_to = filters.dateTo

      const response = await financialApi.getTransactions(params)
      setTransactions(response.data.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const viewTransactionDetails = async (transactionId: number) => {
    try {
      const response = await financialApi.getPaymentDetails(transactionId)
      setSelectedTransaction(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transaction details",
        variant: "destructive",
      })
    }
  }

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }))
  }

  const exportTransactions = () => {
    toast({
      title: "Export Started",
      description: "Transaction data export will be available for download shortly",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "success":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPaymentMethodIcon = (type: string) => {
    return <CreditCard className="h-4 w-4" />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transaction Management</h2>
          <p className="text-muted-foreground">
            {eventId ? "Event-specific transactions" : "All platform transactions"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadTransactions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Order ID, user name..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Payment Type</Label>
              <Select 
                value={filters.type} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="ewallet">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={loadTransactions} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {transactions.length} transactions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort("order_id")}
                  >
                    <div className="flex items-center gap-2">
                      Order ID
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort("user.name")}
                  >
                    <div className="flex items-center gap-2">
                      Customer
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort("grand_amount")}
                  >
                    <div className="flex items-center gap-2">
                      Amount
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <div className="animate-pulse h-4 bg-gray-300 rounded"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.order_id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.user?.name}</div>
                          <div className="text-sm text-muted-foreground">{transaction.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{transaction.event?.name}</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.grand_amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(transaction.type)}
                          <span className="capitalize">{transaction.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          <Badge variant={getStatusBadgeVariant(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(transaction.created_at)}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => viewTransactionDetails(transaction.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Transaction Details</DialogTitle>
                              <DialogDescription>
                                Complete information about this transaction
                              </DialogDescription>
                            </DialogHeader>
                            {selectedTransaction && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Order ID</Label>
                                    <p className="text-sm">{selectedTransaction.order_id}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>
                                      {selectedTransaction.status}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Customer</Label>
                                    <p className="text-sm">{selectedTransaction.user?.name}</p>
                                    <p className="text-xs text-muted-foreground">{selectedTransaction.user?.email}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Event</Label>
                                    <p className="text-sm">{selectedTransaction.event?.name}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Amount</Label>
                                    <p className="text-sm font-medium">{formatCurrency(selectedTransaction.grand_amount)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Payment Method</Label>
                                    <p className="text-sm capitalize">{selectedTransaction.type}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Transaction Date</Label>
                                    <p className="text-sm">{formatDateTime(selectedTransaction.created_at)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Platform Fee</Label>
                                    <p className="text-sm">{formatCurrency(selectedTransaction.platform_fee || 0)}</p>
                                  </div>
                                </div>
                                
                                {selectedTransaction.tickets && (
                                  <div>
                                    <Label className="text-sm font-medium">Tickets</Label>
                                    <div className="mt-2 space-y-2">
                                      {selectedTransaction.tickets.map((ticket: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                                          <span className="text-sm">{ticket.name}</span>
                                          <span className="text-sm font-medium">
                                            {ticket.quantity} × {formatCurrency(ticket.price)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {selectedTransaction.midtrans_data && (
                                  <div>
                                    <Label className="text-sm font-medium">Payment Gateway Info</Label>
                                    <div className="mt-2 p-3 bg-muted rounded text-xs">
                                      <pre>{JSON.stringify(selectedTransaction.midtrans_data, null, 2)}</pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
