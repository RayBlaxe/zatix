"use client"

import { useState } from "react"
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
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type CarouselItem = {
  id: string
  title: string
  description: string
  image: string
  cta: string
  link: string
  order: number
  active: boolean
}

export function CarouselManager() {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([
    {
      id: "1",
      title: "Create and Manage Events with Ease",
      description: "Our platform makes it simple to create, manage, and promote your events.",
      image: "/placeholder.svg?height=600&width=1200&text=Create+and+Manage+Events",
      cta: "Get Started",
      link: "/wizard",
      order: 1,
      active: true,
    },
    {
      id: "2",
      title: "Connect with Attendees",
      description: "Engage with your audience before, during, and after your events.",
      image: "/placeholder.svg?height=600&width=1200&text=Connect+with+Attendees",
      cta: "Learn More",
      link: "#",
      order: 2,
      active: true,
    },
  ])

  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    cta: "",
    link: "",
  })

  const handleCreate = () => {
    setEditingItem(null)
    setFormData({ title: "", description: "", image: "", cta: "", link: "" })
    setIsDialogOpen(true)
  }

  const handleEdit = (item: CarouselItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      image: item.image,
      cta: item.cta,
      link: item.link,
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingItem) {
      // Update existing item
      setCarouselItems((items) => items.map((item) => (item.id === editingItem.id ? { ...item, ...formData } : item)))
    } else {
      // Create new item
      const newItem: CarouselItem = {
        id: Date.now().toString(),
        ...formData,
        order: carouselItems.length + 1,
        active: true,
      }
      setCarouselItems((items) => [...items, newItem])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setCarouselItems((items) => items.filter((item) => item.id !== id))
  }

  const toggleActive = (id: string) => {
    setCarouselItems((items) => items.map((item) => (item.id === id ? { ...item, active: !item.active } : item)))
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
                <DialogTitle>{editingItem ? "Edit Slide" : "Add New Slide"}</DialogTitle>
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter slide description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="Enter image URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta">Call to Action Text</Label>
                  <Input
                    id="cta"
                    value={formData.cta}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cta: e.target.value }))}
                    placeholder="e.g., Get Started"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link">Link URL</Label>
                  <Input
                    id="link"
                    value={formData.link}
                    onChange={(e) => setFormData((prev) => ({ ...prev, link: e.target.value }))}
                    placeholder="Enter link URL"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSave}>
                  {editingItem ? "Update" : "Create"} Slide
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {carouselItems.length === 0 ? (
            <Alert>
              <AlertDescription>No carousel slides found. Create your first slide to get started.</AlertDescription>
            </Alert>
          ) : (
            carouselItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${item.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {item.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    CTA: {item.cta} → {item.link}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleActive(item.id)}>
                    <Eye className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
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
