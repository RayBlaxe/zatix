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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type FeaturedEvent = {
  id: string
  title: string
  description: string
  image: string
  date: string
  location: string
  price: string
  category: string
  featured: boolean
  order: number
}

export function FeaturedEventsManager() {
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([
    {
      id: "1",
      title: "Tech Conference 2024",
      description: "Join us for this amazing tech conference that will transform your perspective.",
      image: "/placeholder.svg?height=300&width=500&text=Tech+Conference",
      date: "2024-06-15",
      location: "Virtual",
      price: "Free",
      category: "Technology",
      featured: true,
      order: 1,
    },
    {
      id: "2",
      title: "Design Workshop",
      description: "Learn the latest design trends and techniques from industry experts.",
      image: "/placeholder.svg?height=300&width=500&text=Design+Workshop",
      date: "2024-06-20",
      location: "New York",
      price: "$99",
      category: "Design",
      featured: true,
      order: 2,
    },
  ])

  const [editingEvent, setEditingEvent] = useState<FeaturedEvent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    date: "",
    location: "",
    price: "",
    category: "",
  })

  const categories = ["Technology", "Design", "Business", "Marketing", "Education", "Health", "Entertainment"]

  const handleCreate = () => {
    setEditingEvent(null)
    setFormData({ title: "", description: "", image: "", date: "", location: "", price: "", category: "" })
    setIsDialogOpen(true)
  }

  const handleEdit = (event: FeaturedEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      image: event.image,
      date: event.date,
      location: event.location,
      price: event.price,
      category: event.category,
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingEvent) {
      setFeaturedEvents((events) =>
        events.map((event) => (event.id === editingEvent.id ? { ...event, ...formData } : event)),
      )
    } else {
      const newEvent: FeaturedEvent = {
        id: Date.now().toString(),
        ...formData,
        featured: true,
        order: featuredEvents.length + 1,
      }
      setFeaturedEvents((events) => [...events, newEvent])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setFeaturedEvents((events) => events.filter((event) => event.id !== id))
  }

  const toggleFeatured = (id: string) => {
    setFeaturedEvents((events) =>
      events.map((event) => (event.id === id ? { ...event, featured: !event.featured } : event)),
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Featured Events Management</CardTitle>
            <CardDescription>Manage featured events displayed on the homepage</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 size-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Edit Featured Event" : "Add New Featured Event"}</DialogTitle>
                <DialogDescription>
                  {editingEvent
                    ? "Update the featured event details."
                    : "Create a new featured event for the homepage."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter event description"
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Event Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g., Free, $99"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter event location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSave}>
                  {editingEvent ? "Update" : "Create"} Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {featuredEvents.length === 0 ? (
            <Alert>
              <AlertDescription>
                No featured events found. Create your first featured event to get started.
              </AlertDescription>
            </Alert>
          ) : (
            featuredEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{event.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${event.featured ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {event.featured ? "Featured" : "Not Featured"}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{event.category}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span>📅 {event.date}</span>
                    <span>📍 {event.location}</span>
                    <span>💰 {event.price}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleFeatured(event.id)}>
                    <Eye className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                    <Edit className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)}>
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
