"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { verificationApi } from "@/lib/api"
import { DocumentData, DocumentStatusUpdateRequest } from "@/types/verification"
import { useAuth } from "@/hooks/use-auth"
import { 
  FileText, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Building, 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Check,
  X,
  ExternalLink
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function DocumentReviewPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<DocumentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectionForm, setShowRejectionForm] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (params.id) {
      loadDocument()
    }
  }, [params.id])

  const loadDocument = async () => {
    try {
      const response = await verificationApi.getDocumentDetail(Number(params.id))
      if (response.success) {
        setDocument(response.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load document",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading document:", error)
      toast({
        title: "Error",
        description: "An error occurred while loading document",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!document) return
    
    setIsProcessing(true)
    try {
      const updateData: DocumentStatusUpdateRequest = {
        status: "approved",
        _method: "PUT"
      }

      const response = await verificationApi.updateDocumentStatus(document.id, updateData)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Document approved successfully",
        })
        setDocument(response.data)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to approve document",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error approving document:", error)
      toast({
        title: "Error",
        description: "An error occurred while approving document",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!document || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }
    
    setIsProcessing(true)
    try {
      const updateData: DocumentStatusUpdateRequest = {
        status: "rejected",
        reason: rejectionReason,
        _method: "PUT"
      }

      const response = await verificationApi.updateDocumentStatus(document.id, updateData)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Document rejected successfully",
        })
        setDocument(response.data)
        setShowRejectionForm(false)
        setRejectionReason("")
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to reject document",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rejecting document:", error)
      toast({
        title: "Error",
        description: "An error occurred while rejecting document",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", icon: Clock, className: "bg-yellow-100 text-yellow-800" },
      verified: { label: "Verified", icon: CheckCircle, className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", icon: AlertCircle, className: "bg-red-100 text-red-800" }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null

    const Icon = config.icon
    return (
      <Badge className={config.className}>
        <Icon className="h-4 w-4 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      ktp: "KTP (Identity Card)",
      nib: "NIB (Business Registration)",
      npwp: "NPWP (Tax ID)"
    }
    return labels[type as keyof typeof labels] || type.toUpperCase()
  }

  const getOrganizerTypeIcon = (type: string) => {
    return type === "company" ? <Building className="h-5 w-5" /> : <User className="h-5 w-5" />
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
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Document Not Found</CardTitle>
            <CardDescription>
              The document you're looking for doesn't exist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/verification">
              <Button>Back to Verification</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard/admin/verification">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Verification
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Document Review</h1>
            <p className="text-muted-foreground mt-2">
              Review and verify document details
            </p>
          </div>
          {getStatusBadge(document.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Document Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Document Type</Label>
                <p className="text-sm text-muted-foreground">{getDocumentTypeLabel(document.type)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Document Number</Label>
                <p className="text-sm text-muted-foreground">{document.number}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Name on Document</Label>
                <p className="text-sm text-muted-foreground">{document.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Address on Document</Label>
                <p className="text-sm text-muted-foreground">{document.address}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Upload Date</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(document.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {document.reason_rejected && (
                <div>
                  <Label className="text-sm font-medium">Rejection Reason</Label>
                  <p className="text-sm text-red-600">{document.reason_rejected}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Organization Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getOrganizerTypeIcon(document.documentable?.organizer_type || '')}
                Organization Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Organization Name</Label>
                <p className="text-sm text-muted-foreground">{document.documentable?.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Organization Type</Label>
                <p className="text-sm text-muted-foreground capitalize">
                  {document.documentable?.organizer_type}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">{document.documentable?.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </Label>
                  <p className="text-sm text-muted-foreground">{document.documentable?.email_eo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone
                  </Label>
                  <p className="text-sm text-muted-foreground">{document.documentable?.phone_no_eo}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Address
                </Label>
                <p className="text-sm text-muted-foreground">{document.documentable?.address_eo}</p>
              </div>
              <div>
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Registration Date
                </Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(document.documentable?.created_at || '').toLocaleDateString()}
                </p>
              </div>
              {document.documentable?.eo_owner && (
                <div>
                  <Label className="text-sm font-medium">Owner Information</Label>
                  <p className="text-sm text-muted-foreground">
                    {document.documentable.eo_owner.name} ({document.documentable.eo_owner.email})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Document Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(`https://api.zatix.id/project/public/storage/${document.file}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Document
                </Button>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {document.status === 'pending' && (
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={handleApprove}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Approve Document
                      </>
                    )}
                  </Button>

                  {!showRejectionForm ? (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setShowRejectionForm(true)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject Document
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Label htmlFor="rejection-reason">Rejection Reason</Label>
                      <Textarea
                        id="rejection-reason"
                        placeholder="Please provide a clear reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          onClick={handleReject}
                          disabled={isProcessing || !rejectionReason.trim()}
                          className="flex-1"
                        >
                          {isProcessing ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </div>
                          ) : (
                            <>
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowRejectionForm(false)
                            setRejectionReason("")
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {document.status === 'verified' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    This document has been verified and approved.
                  </AlertDescription>
                </Alert>
              )}

              {document.status === 'rejected' && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    This document has been rejected.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}