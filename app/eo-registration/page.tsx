"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/header"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload } from "lucide-react"

export default function EORegistrationPage() {
  const router = useRouter()
  const { updateEODetails, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    description: "",
    email: user?.email || "",
    phone: "",
    address: "",
    legalType: "individual", // 'individual' or 'badan_hukum'
    ktpFile: null,
    npwpFile: null,
    nibFile: null,
    nomorKtp: "",
    namaKtp: "",
    alamatKtp: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).files?.[0] || null }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate form
      if (!formData.name || !formData.description || !formData.email || !formData.phone || !formData.address) {
        throw new Error("Please fill in all required fields")
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update user role and EO details
      updateEODetails({
        name: formData.name,
        logo: formData.logo,
        description: formData.description,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      })

      router.push("/dashboard")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Redirect if user is already an event organizer
  if (user?.role === "event_organizer") {
    router.push("/dashboard")
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Event Organizer Registration</CardTitle>
                <CardDescription>
                  Please provide information about your organization to become an event organizer
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your organization name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo">Organization Logo</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="logo"
                        name="logo"
                        value={formData.logo}
                        onChange={handleChange}
                        placeholder="Upload your logo or provide a URL"
                      />
                      <Button type="button" variant="outline" size="icon">
                        <Upload className="size-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Optional: Upload your organization logo or provide a URL
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Organization Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your organization"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Business Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your business email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your business address"
                      required
                    />
                  </div>

                  {/* Legal Section */}
                  <div className="space-y-2">
                    <Label>Legal Type *</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="legalType"
                          value="individual"
                          checked={formData.legalType === "individual"}
                          onChange={handleChange}
                        />
                        Individual
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="legalType"
                          value="badan_hukum"
                          checked={formData.legalType === "badan_hukum"}
                          onChange={handleChange}
                        />
                        Badan Hukum
                      </label>
                    </div>
                  </div>

                  {/* Legal Details */}
                  {formData.legalType === "individual" ? (
                    <div className="space-y-2 border rounded-md p-4">
                      <Label>KTP File *</Label>
                      <Input type="file" name="ktpFile" accept="image/*,.pdf" onChange={handleChange} required />
                      <Label>NPWP File *</Label>
                      <Input type="file" name="npwpFile" accept="image/*,.pdf" onChange={handleChange} required />
                      <Label htmlFor="nomorKtp">Nomor KTP *</Label>
                      <Input id="nomorKtp" name="nomorKtp" value={formData.nomorKtp} onChange={handleChange} required />
                      <Label htmlFor="namaKtp">Nama KTP *</Label>
                      <Input id="namaKtp" name="namaKtp" value={formData.namaKtp} onChange={handleChange} required />
                      <Label htmlFor="alamatKtp">Alamat KTP *</Label>
                      <Textarea id="alamatKtp" name="alamatKtp" value={formData.alamatKtp} onChange={handleChange} required />
                    </div>
                  ) : (
                    <div className="space-y-2 border rounded-md p-4">
                      <Label>NPWP File *</Label>
                      <Input type="file" name="npwpFile" accept="image/*,.pdf" onChange={handleChange} required />
                      <Label>NIB File *</Label>
                      <Input type="file" name="nibFile" accept="image/*,.pdf" onChange={handleChange} required />
                      <Label htmlFor="nomorKtp">Nomor KTP *</Label>
                      <Input id="nomorKtp" name="nomorKtp" value={formData.nomorKtp} onChange={handleChange} required />
                      <Label htmlFor="namaKtp">Nama KTP *</Label>
                      <Input id="namaKtp" name="namaKtp" value={formData.namaKtp} onChange={handleChange} required />
                      <Label htmlFor="alamatKtp">Alamat KTP *</Label>
                      <Textarea id="alamatKtp" name="alamatKtp" value={formData.alamatKtp} onChange={handleChange} required />
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="flex w-full justify-between">
                    <Button variant="outline" type="button" onClick={() => router.push("/")}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" /> Please wait
                        </>
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
