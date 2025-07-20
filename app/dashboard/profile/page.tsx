"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { verificationApi } from "@/lib/api"
import { EOProfileCreateRequest, EOProfileData, OrganizerType, DocumentData, DocumentType, DOCUMENT_RULES, DOCUMENT_LABELS, STATUS_LABELS } from "@/types/verification"
import { Upload, Building, User, Check, FileText, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react"

const profileSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  description: z.string().optional(),
  email_eo: z.string().optional(),
  phone_no_eo: z.string().optional(),
  address_eo: z.string().optional(),
  organization_type: z.enum(["company", "individual"] as const),
  logo: z.instanceof(FileList).optional().refine((files) => {
    if (!files || files.length === 0) return true // Optional field
    const file = files[0]
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    const maxSize = 2 * 1024 * 1024 // 2MB
    
    if (!allowedTypes.includes(file.type)) {
      return false
    }
    if (file.size > maxSize) {
      return false
    }
    return true
  }, {
    message: "Logo must be JPG, JPEG, or PNG format and under 2MB"
  })
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [existingProfile, setExistingProfile] = useState<EOProfileData | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [documents, setDocuments] = useState<DocumentData[]>([])
  const [isDocumentUploading, setIsDocumentUploading] = useState(false)
  const { toast } = useToast()

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      description: "",
      email_eo: "",
      phone_no_eo: "",
      address_eo: "",
      organization_type: "individual",
    },
  })

  useEffect(() => {
    loadExistingProfile()
  }, [])

  const loadExistingProfile = async () => {
    try {
      console.log('[PROFILE] Loading profile...')
      const response = await verificationApi.getEOProfile()
      console.log('[PROFILE] API Response:', response)
      if (response.success) {
        console.log('[PROFILE] Setting existing profile:', response.data)
        console.log('[PROFILE] Organizer type from API:', response.data.organizer_type)
        setExistingProfile(response.data)
        setDocuments(response.data.documents || [])
        const formData = {
          name: response.data.name,
          description: response.data.description,
          email_eo: response.data.email_eo,
          phone_no_eo: response.data.phone_no_eo,
          address_eo: response.data.address_eo,
          organization_type: response.data.organizer_type,
        }
        console.log('[PROFILE] Form data to reset:', formData)
        form.reset(formData)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      const maxSize = 2 * 1024 * 1024 // 2MB
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload only JPG, JPEG, or PNG files",
          variant: "destructive",
        })
        e.target.value = '' // Clear the input
        return
      }
      
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Logo must be under 2MB",
          variant: "destructive",
        })
        e.target.value = '' // Clear the input
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getRequiredDocuments = (organizationType: OrganizerType): DocumentType[] => {
    return DOCUMENT_RULES[organizationType].required
  }

  const getDocumentStatus = (documentType: DocumentType) => {
    // Get all documents of this type and find the latest one (for "replaced" status)
    const docsOfType = documents.filter(d => d.type === documentType)
    if (docsOfType.length === 0) return null
    
    // Sort by created_at desc to get the latest document
    const latestDoc = docsOfType.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
    
    return latestDoc.status
  }

  const getLatestDocument = (documentType: DocumentType): DocumentData | undefined => {
    // Get all documents of this type and find the latest one
    const docsOfType = documents.filter(d => d.type === documentType)
    if (docsOfType.length === 0) return undefined
    
    // Sort by created_at desc to get the latest document
    return docsOfType.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'replaced':
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'replaced':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const handleDocumentUpload = async (documentType: DocumentType, file: File, formData: { number: string; name: string; address: string }, isUpdate: boolean = false, documentId?: number) => {
    if (!existingProfile) {
      toast({
        title: "Error",
        description: "Please complete your profile first before uploading documents",
        variant: "destructive",
      })
      return
    }

    setIsDocumentUploading(true)
    try {
      const uploadData = {
        type: documentType,
        file: file,
        number: formData.number,
        name: formData.name,
        address: formData.address
      }

      const response = isUpdate && documentId 
        ? await verificationApi.updateDocument(documentId, uploadData)
        : await verificationApi.uploadDocument(uploadData)

      if (response.success) {
        toast({
          title: "Success",
          description: isUpdate ? "Document updated successfully" : "Document uploaded successfully",
        })
        // Refresh profile and documents
        await loadExistingProfile()
      } else {
        toast({
          title: "Error",
          description: response.message || `Failed to ${isUpdate ? 'update' : 'upload'} document`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error ${isUpdate ? 'updating' : 'uploading'} document:`, error)
      toast({
        title: "Error",
        description: `An error occurred while ${isUpdate ? 'updating' : 'uploading'} document`,
        variant: "destructive",
      })
    } finally {
      setIsDocumentUploading(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      const formData: EOProfileCreateRequest = {
        name: data.name,
        description: data.description || "",
        email_eo: data.email_eo || "",
        phone_no_eo: data.phone_no_eo || "",
        address_eo: data.address_eo || "",
        organization_type: data.organization_type,
        logo: data.logo?.[0]
      }

      const response = existingProfile 
        ? await verificationApi.updateEOProfile(existingProfile.id, formData)
        : await verificationApi.createEOProfile(formData)
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        })
        loadExistingProfile()
      } else {
        toast({
          title: "Error",
          description: response.message || `Failed to ${existingProfile ? 'update' : 'create'} profile`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error ${existingProfile ? 'updating' : 'creating'} profile:`, error)
      toast({
        title: "Error",
        description: `An error occurred while ${existingProfile ? 'updating' : 'creating'} profile`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Event Organizer Profile</h1>
        <p className="text-muted-foreground mt-2">
          Complete your profile to start organizing events
        </p>
      </div>

      {existingProfile && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Check className="h-5 w-5" />
              Profile Completed
            </CardTitle>
            <CardDescription className="text-green-700">
              Your profile has been created successfully. You can update it using the form below.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Please provide accurate information about your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="organization_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="individual">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Individual
                            </div>
                          </SelectItem>
                          <SelectItem value="company">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              Company
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose Individual if you're organizing personally, or Company if you represent a business
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter organization name" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your organization or business name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about your organization and what kind of events you organize..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief description of your organization and event focus
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email_eo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="business@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Official contact email for your organization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone_no_eo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+62123456789" {...field} />
                      </FormControl>
                      <FormDescription>
                        Business phone number with country code
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address_eo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Address (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your complete business address..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Complete address including city, state, and postal code
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Logo (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                          onChange={(e) => {
                            handleLogoChange(e)
                            field.onChange(e.target.files)
                          }}
                          className="cursor-pointer"
                        />
                        {logoPreview && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border">
                            <img 
                              src={logoPreview} 
                              alt="Logo preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {existingProfile?.logo && !logoPreview && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden border">
                            <img 
                              src={`https://api.zatix.id/project/public/storage/${existingProfile.logo}`}
                              alt="Current logo" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload your organization logo (JPG, JPEG, PNG only, max 2MB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {existingProfile ? "Updating..." : "Creating..."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      {existingProfile ? "Update Profile" : "Create Profile"}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Legal Documents Section */}
      {existingProfile && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Legal Documents
            </CardTitle>
            <CardDescription>
              Upload required legal documents for verification. Required documents depend on your organization type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Required Documents */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
                <div className="grid gap-4">
                  {getRequiredDocuments(existingProfile.organizer_type).map((docType) => {
                    const status = getDocumentStatus(docType)
                    const document = getLatestDocument(docType)
                    
                    return (
                      <DocumentCard
                        key={docType}
                        documentType={docType}
                        status={status}
                        document={document}
                        onUpload={handleDocumentUpload}
                        isUploading={isDocumentUploading}
                        getStatusIcon={getStatusIcon}
                        getStatusColor={getStatusColor}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Optional Documents */}
              {DOCUMENT_RULES[existingProfile.organizer_type].optional.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Optional Documents</h3>
                  <div className="grid gap-4">
                    {DOCUMENT_RULES[existingProfile.organizer_type].optional.map((docType) => {
                      const status = getDocumentStatus(docType)
                      const document = getLatestDocument(docType)
                      
                      return (
                        <DocumentCard
                          key={docType}
                          documentType={docType}
                          status={status}
                          document={document}
                          onUpload={handleDocumentUpload}
                          isUploading={isDocumentUploading}
                          getStatusIcon={getStatusIcon}
                          getStatusColor={getStatusColor}
                          optional={true}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Overall Verification Status */}
              <div className={`p-4 rounded-lg border ${existingProfile.is_verified 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center gap-2">
                  {existingProfile.is_verified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className={`font-semibold ${existingProfile.is_verified 
                    ? 'text-green-800' 
                    : 'text-yellow-800'
                  }`}>
                    {existingProfile.is_verified ? 'Account Verified' : 'Verification Pending'}
                  </span>
                </div>
                <p className={`mt-1 text-sm ${existingProfile.is_verified 
                  ? 'text-green-700' 
                  : 'text-yellow-700'
                }`}>
                  {existingProfile.is_verified 
                    ? 'Your account has been verified and you can start creating events.'
                    : 'Upload all required documents to complete the verification process.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Document Card Component
interface DocumentCardProps {
  documentType: DocumentType
  status: string | null
  document?: DocumentData
  onUpload: (documentType: DocumentType, file: File, formData: { number: string; name: string; address: string }, isUpdate?: boolean, documentId?: number) => void
  isUploading: boolean
  getStatusIcon: (status: string | null) => React.ReactNode
  getStatusColor: (status: string | null) => string
  optional?: boolean
}

function DocumentCard({ 
  documentType, 
  status, 
  document, 
  onUpload, 
  isUploading, 
  getStatusIcon, 
  getStatusColor,
  optional = false 
}: DocumentCardProps) {
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    address: '',
    file: null as File | null
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, file }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.file || !formData.number || !formData.name || !formData.address) {
      return
    }
    
    // Determine if this is an update (for rejected documents) or new upload
    const isUpdate = document && (document.status === 'rejected')
    
    onUpload(documentType, formData.file, {
      number: formData.number,
      name: formData.name,
      address: formData.address
    }, isUpdate, document?.id)
    
    setShowUploadForm(false)
    setFormData({ number: '', name: '', address: '', file: null })
  }

  return (
    <div className={`p-4 border rounded-lg ${getStatusColor(status)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <span className="font-medium">
            {DOCUMENT_LABELS[documentType]}
            {optional && <span className="text-sm text-gray-500 ml-1">(Optional)</span>}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {status ? STATUS_LABELS[status as keyof typeof STATUS_LABELS] : 'Not Uploaded'}
          </span>
          {(!status || status === 'rejected') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowUploadForm(!showUploadForm)}
              disabled={isUploading}
            >
              {status === 'rejected' ? 'Re-upload' : 'Upload'}
            </Button>
          )}
        </div>
      </div>

      {document && (
        <div className="text-sm text-gray-600 mb-2">
          <p>Number: {document.number}</p>
          <p>Name: {document.name}</p>
          <p>Uploaded: {new Date(document.created_at).toLocaleDateString()}</p>
          {document.reason_rejected && (
            <p className="text-red-600 mt-1">Reason: {document.reason_rejected}</p>
          )}
        </div>
      )}

      {showUploadForm && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Document Number</label>
              <Input
                placeholder="Enter document number"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input
                placeholder="Full name as in document"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Textarea
              placeholder="Address as in document"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="min-h-[60px]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Document File</label>
            <Input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: JPG, PNG, PDF (max 10MB)
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowUploadForm(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !formData.file || !formData.number || !formData.name || !formData.address}
            >
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}