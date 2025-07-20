"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { verificationApi } from "@/lib/api"
import { DocumentData, DocumentListResponse } from "@/types/verification"
import { useAuth } from "@/hooks/use-auth"
import { 
  FileText, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Building, 
  User,
  Search,
  Filter
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function AdminVerificationPage() {
  const [documents, setDocuments] = useState<DocumentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    loadDocuments()
  }, [currentPage])

  const loadDocuments = async () => {
    try {
      const response = await verificationApi.getAllDocuments(currentPage)
      if (response.success) {
        setDocuments(response.data.data)
        setTotalPages(response.data.last_page)
      } else {
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading documents:", error)
      toast({
        title: "Error",
        description: "An error occurred while loading documents",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", icon: Clock, className: "bg-yellow-100 text-yellow-800" },
      verified: { label: "Verified", icon: CheckCircle, className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", icon: AlertCircle, className: "bg-red-100 text-red-800" },
      replaced: { label: "Replaced", icon: Clock, className: "bg-blue-100 text-blue-800" }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null

    const Icon = config.icon
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getOrganizerTypeIcon = (type: string) => {
    return type === "company" ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentable?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      ktp: "KTP (Identity Card)",
      nib: "NIB (Business Registration)",
      npwp: "NPWP (Tax ID)"
    }
    return labels[type as keyof typeof labels] || type.toUpperCase()
  }

  // Check if user has super-admin role
  const hasAdminAccess = user?.roles?.includes('super-admin')

  if (!hasAdminAccess) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Document Verification</h1>
        <p className="text-muted-foreground mt-2">
          Review and verify Event Organizer documents
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {documents.filter(d => d.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {documents.filter(d => d.status === 'verified').length}
                </p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {documents.filter(d => d.status === 'rejected').length}
                </p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, organization, or document type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="replaced">Replaced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents for Review</CardTitle>
          <CardDescription>
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No documents found</p>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "No documents have been uploaded yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{getDocumentTypeLabel(doc.type)}</h3>
                          {getStatusBadge(doc.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Document Number: {doc.number}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {getOrganizerTypeIcon(doc.documentable?.organizer_type || '')}
                          <span>{doc.documentable?.name}</span>
                          <span>•</span>
                          <span>{doc.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                        {doc.reason_rejected && (
                          <p className="text-xs text-red-600 mt-1">
                            Rejection reason: {doc.reason_rejected}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://api.zatix.id/project/public/storage/${doc.file}`, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Link href={`/dashboard/admin/verification/${doc.id}`}>
                        <Button size="sm">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}