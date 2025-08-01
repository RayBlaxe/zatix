"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { getToken } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, ExternalLink, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from "next/image"

const API_BASE_URL = "https://api.zatix.id/api"

type CarouselItem = {
  id: number
  image: string
  title: string
  caption: string
  link_url: string | null
  link_target: string
  order: string
  is_active: number
  created_at: string
  updated_at: string
  image_url: string
}

export function CarouselManager() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    caption: "",
    link_url: "",
    link_target: "_self",
    is_active: 1,
  })

  // Fetch all carousel items
  useEffect(() => {
    if (user) {
      fetchCarouselItems()
    }
  }, [user])

  const fetchCarouselItems = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(`${API_BASE_URL}/carousels/all-carousel-list`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setCarouselItems(data.data)
      } else {
        throw new Error(data.message || "Failed to fetch carousel items")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch carousel items",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    setSelectedFile(null)
    setFormData({
      title: "",
      caption: "",
      link_url: "",
      link_target: "_self",
      is_active: 1,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = async (id: number) => {
    try {
      setIsLoading(true)
      const token = getToken()
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(`${API_BASE_URL}/carousels/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        const item = data.data
        setEditingItem(item)
        setFormData({
          title: item.title,
          caption: item.caption,
          link_url: item.link_url || "",
          link_target: item.link_target,
          is_active: item.is_active,
        })
        setSelectedFile(null)
        setIsDialogOpen(true)
      } else {
        throw new Error(data.message || "Failed to fetch carousel item")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch carousel item",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      const token = getToken()
      if (!token) {
        throw new Error("Authentication token not found")
      }
      
      const formDataToSend = new FormData()
      
      // Add form data fields
      formDataToSend.append("title", formData.title)
      formDataToSend.append("caption", formData.caption)
      if (formData.link_url) {
        formDataToSend.append("link_url", formData.link_url)
      }
      formDataToSend.append("link_target", formData.link_target)
      formDataToSend.append("is_active", formData.is_active.toString())

      // Add file if selected
      if (selectedFile) {
        formDataToSend.append("image", selectedFile)
      }
      
      // Add method: PUT for updates
      if (editingItem) {
        formDataToSend.append("method", "PUT")
      }

      const url = editingItem 
        ? `${API_BASE_URL}/carousels/${editingItem.id}` 
        : `${API_BASE_URL}/carousels/create`
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          // Don't set Content-Type for multipart/form-data
        },
        body: formDataToSend,
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingItem 
            ? "Carousel item updated successfully" 
            : "Carousel item created successfully",
        })
        setIsDialogOpen(false)
        fetchCarouselItems()
      } else {
        throw new Error(data.message || "Operation failed")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save carousel item",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this carousel item?")) {
      return
    }
    
    try {
      setIsLoading(true)
      const token = getToken()
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(`${API_BASE_URL}/carousels/${id}/destroy`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Carousel item deleted successfully",
        })
        fetchCarouselItems()
      } else {
        throw new Error(data.message || "Failed to delete carousel item")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete carousel item",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  // Show loading if user is not authenticated yet
  if (!user) {
    return (
      <Card>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Carousel Management</CardTitle>
            <CardDescription>Manage homepage carousel slides</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 size-4" />
                Add Slide
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Carousel Slide" : "Add New Carousel Slide"}</DialogTitle>
                <DialogDescription>
                  {editingItem ? "Update the carousel slide details." : "Create a new carousel slide for the homepage."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter slide title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caption">Caption</Label>
                  <Textarea
                    id="caption"
                    value={formData.caption}
                    onChange={(e) => setFormData((prev) => ({ ...prev, caption: e.target.value }))}
                    placeholder="Enter slide caption"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {editingItem && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Current image:</p>
                      <div className="relative h-24 w-48 mt-1 rounded overflow-hidden">
                        <Image 
                          src={editingItem.image_url}
                          alt={editingItem.title}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link_url">Link URL (optional)</Label>
                  <Input
                    id="link_url"
                    value={formData.link_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, link_url: e.target.value }))}
                    placeholder="Enter link URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link_target">Link Target</Label>
                  <Select 
                    value={formData.link_target} 
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, link_target: value }))}
                  >
                    <SelectTrigger id="link_target">
                      <SelectValue placeholder="Select link target" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_self">Same window (_self)</SelectItem>
                      <SelectItem value="_blank">New window (_blank)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="is_active">Status</Label>
                  <Select 
                    value={formData.is_active.toString()} 
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, is_active: parseInt(value) }))}
                  >
                    <SelectTrigger id="is_active">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="0">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingItem ? "Update" : "Create"} Slide
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : carouselItems.length === 0 ? (
            <Alert>
              <AlertDescription>No carousel slides found. Create your first slide to get started.</AlertDescription>
            </Alert>
          ) : (
            carouselItems.map((item) => (
              <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg gap-4">
                <div className="relative h-20 w-32 rounded overflow-hidden flex-shrink-0">
                  <Image 
                    src={item.image_url}
                    alt={item.title}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${item.is_active === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {item.is_active === 1 ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.caption}</p>
                  {item.link_url && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <ExternalLink className="size-3" />
                      {item.link_url} ({item.link_target})
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item.id)}>
                    <Edit className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
