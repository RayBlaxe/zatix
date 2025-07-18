"use client"

import { useState } from "react"
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
import { 
  DocumentType, 
  DocumentUploadRequest, 
  DocumentData, 
  OrganizerType,
  DOCUMENT_LABELS,
  DOCUMENT_RULES,
  FILE_VALIDATION 
} from "@/types/verification"
import { Upload, FileText, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const documentSchema = z.object({
  type: z.enum(["ktp", "nib", "npwp"] as const),
  file: z.instanceof(FileList).refine(
    (files) => files?.length > 0,
    "Please select a file"
  ).refine(
    (files) => files?.[0]?.size <= FILE_VALIDATION.maxSize,
    `File size must be less than ${FILE_VALIDATION.maxSize / 1024 / 1024}MB`
  ).refine(
    (files) => FILE_VALIDATION.allowedTypes.includes(files?.[0]?.type as string),
    "Only JPG, PNG, and PDF files are allowed"
  ),
  number: z.string().min(5, "Document number is required"),
  name: z.string().min(2, "Name is required"),
  address: z.string().min(5, "Address is required"),
})

type DocumentFormData = z.infer<typeof documentSchema>

interface DocumentUploadProps {
  organizerType: OrganizerType
  existingDocuments: DocumentData[]
  onUploadSuccess?: (document: DocumentData) => void
  onUploadError?: (error: string) => void
}

export default function DocumentUpload({
  organizerType,
  existingDocuments,
  onUploadSuccess,
  onUploadError
}: DocumentUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      type: "ktp",
      number: "",
      name: "",
      address: "",
    },
  })

  const requiredDocuments = DOCUMENT_RULES[organizerType].required
  const optionalDocuments = DOCUMENT_RULES[organizerType].optional

  const getDocumentStatus = (type: DocumentType) => {
    const doc = existingDocuments.find(d => d.type === type)
    return doc?.status || null
  }

  const getStatusBadge = (status: string | null) => {
    if (!status) return null
    
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
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const onSubmit = async (data: DocumentFormData) => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const uploadData: DocumentUploadRequest = {
        type: data.type,
        file: selectedFile,
        number: data.number,
        name: data.name,
        address: data.address,
      }

      const response = await verificationApi.uploadDocument(uploadData)
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        })
        
        // Reset form
        form.reset()
        setSelectedFile(null)
        
        // Callback
        if (onUploadSuccess) {
          onUploadSuccess(response.data)
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to upload document",
          variant: "destructive",
        })
        
        if (onUploadError) {
          onUploadError(response.message || "Failed to upload document")
        }
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Error",
        description: "An error occurred while uploading document",
        variant: "destructive",
      })
      
      if (onUploadError) {
        onUploadError("An error occurred while uploading document")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Document Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Document Requirements</CardTitle>
          <CardDescription>
            Based on your organization type: {organizerType === "company" ? "Company" : "Individual"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Required Documents</h4>
              <div className="space-y-2">
                {requiredDocuments.map((type) => (
                  <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{DOCUMENT_LABELS[type]}</p>
                        <p className="text-sm text-muted-foreground">
                          {type === "ktp" && "Identity card for verification"}
                          {type === "nib" && "Business registration number"}
                          {type === "npwp" && "Tax identification number"}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(getDocumentStatus(type))}
                  </div>
                ))}
              </div>
            </div>

            {optionalDocuments.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Optional Documents</h4>
                <div className="space-y-2">
                  {optionalDocuments.map((type) => (
                    <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{DOCUMENT_LABELS[type]}</p>
                          <p className="text-sm text-muted-foreground">
                            {type === "npwp" && "Tax identification number (optional for individual)"}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(getDocumentStatus(type))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Upload your legal documents for verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {requiredDocuments.map((type) => (
                            <SelectItem key={type} value={type}>
                              {DOCUMENT_LABELS[type]}
                            </SelectItem>
                          ))}
                          {optionalDocuments.map((type) => (
                            <SelectItem key={type} value={type}>
                              {DOCUMENT_LABELS[type]} (Optional)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter document number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Official number on the document
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name on Document</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name as shown on document" {...field} />
                      </FormControl>
                      <FormDescription>
                        Name exactly as it appears on the document
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address on Document</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter address as shown on document"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Address exactly as it appears on the document
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document File</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => {
                            handleFileChange(e)
                            field.onChange(e.target.files)
                          }}
                          className="cursor-pointer"
                        />
                        {selectedFile && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>{selectedFile.name}</span>
                            <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload JPG, PNG, or PDF file (max 10MB). Make sure the document is clear and readable.
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
                      Uploading...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Document
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}