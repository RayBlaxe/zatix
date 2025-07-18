"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { verificationApi } from "@/lib/api"
import { DocumentData, EOProfileData } from "@/types/verification"
import DocumentUpload from "@/components/verification/document-upload"
import { ArrowLeft, FileText, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function DocumentsPage() {
  const [profile, setProfile] = useState<EOProfileData | null>(null)
  const [documents, setDocuments] = useState<DocumentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      const response = await verificationApi.getEOProfile()
      if (response.success) {
        setProfile(response.data)
        setDocuments(response.data.documents || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "Error",
        description: "An error occurred while loading profile data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadSuccess = (document: DocumentData) => {
    setDocuments(prev => [...prev, document])
    toast({
      title: "Success",
      description: "Document uploaded successfully",
    })
  }

  const handleUploadError = (error: string) => {
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending Review", icon: Clock, className: "bg-yellow-100 text-yellow-800" },
      verified: { label: "Verified", icon: CheckCircle, className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", icon: AlertCircle, className: "bg-red-100 text-red-800" }
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Required</CardTitle>
            <CardDescription>
              You need to complete your profile before uploading documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/profile">
              <Button>Complete Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard/profile">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Document Verification</h1>
        <p className="text-muted-foreground mt-2">
          Upload your legal documents for verification
        </p>
      </div>

      {/* Current Documents */}
      {documents.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
            <CardDescription>
              Your uploaded documents and their verification status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.type.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.name} • {doc.number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(doc.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://api.zatix.id/project/public/storage/${doc.file}`, '_blank')}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Form */}
      <DocumentUpload
        organizerType={profile.organizer_type}
        existingDocuments={documents}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />

      {/* Verification Status */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>
            Current status of your profile verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {profile.is_verified ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Profile Verified</p>
                  <p className="text-sm text-green-700">
                    Your profile has been verified and you can now publish events
                  </p>
                </div>
              </>
            ) : (
              <>
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Verification Pending</p>
                  <p className="text-sm text-yellow-700">
                    Your documents are being reviewed by our team
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}