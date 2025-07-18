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
import { EOProfileCreateRequest, EOProfileData, OrganizerType } from "@/types/verification"
import { Upload, Building, User, Check } from "lucide-react"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  email_eo: z.string().email("Invalid email address"),
  phone_no_eo: z.string().min(10, "Phone number must be at least 10 digits"),
  address_eo: z.string().min(5, "Address must be at least 5 characters"),
  organization_type: z.enum(["company", "individual"] as const),
  logo: z.instanceof(FileList).optional()
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [existingProfile, setExistingProfile] = useState<EOProfileData | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
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
      const response = await verificationApi.getEOProfile()
      if (response.success) {
        setExistingProfile(response.data)
        form.reset({
          name: response.data.name,
          description: response.data.description,
          email_eo: response.data.email_eo,
          phone_no_eo: response.data.phone_no_eo,
          address_eo: response.data.address_eo,
          organization_type: response.data.organizer_type,
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      const formData: EOProfileCreateRequest = {
        name: data.name,
        description: data.description,
        email_eo: data.email_eo,
        phone_no_eo: data.phone_no_eo,
        address_eo: data.address_eo,
        organization_type: data.organization_type,
        logo: data.logo?.[0]
      }

      const response = await verificationApi.createEOProfile(formData)
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        })
        loadExistingProfile()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating profile:", error)
      toast({
        title: "Error",
        description: "An error occurred while creating profile",
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormLabel>Description</FormLabel>
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
                      <FormLabel>Business Email</FormLabel>
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
                      <FormLabel>Phone Number</FormLabel>
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
                    <FormLabel>Business Address</FormLabel>
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
                          accept="image/*"
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
                      Upload your organization logo (JPG, PNG, max 2MB)
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
    </div>
  )
}