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

type EventCategory = {
  id: string
  name: string
  description: string
  icon: string
  color: string
  active: boolean
  eventCount: number
}

export function EventCategoriesManager() {
  const [categories, setCategories] = useState<EventCategory[]>([
    {
      id: "1",
      name: "Technology",
      description: "Tech conferences, workshops, and meetups",
      icon: "💻",
      color: "#3B82F6",
      active: true,
      eventCount: 12,
    },
    {
      id: "2",
      name: "Design",
      description: "Design workshops, UI/UX events, and creative sessions",
      icon: "🎨",
      color: "#8B5CF6",
      active: true,
      eventCount: 8,
    },
    {
      id: "3",
      name: "Business",
      description: "Business conferences, networking events, and seminars",
      icon: "💼",
      color: "#10B981",
      active: true,
      eventCount: 15,
    },
  ])

  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "#3B82F6",
  })

  const handleCreate = () => {
    setEditingCategory(null)
    setFormData({ name: "", description: "", icon: "", color: "#3B82F6" })
    setIsDialogOpen(true)
  }

  const handleEdit = (category: EventCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingCategory) {
      setCategories((cats) => cats.map((cat) => (cat.id === editingCategory.id ? { ...cat, ...formData } : cat)))
    } else {
      const newCategory: EventCategory = {
        id: Date.now().toString(),
        ...formData,
        active: true,
        eventCount: 0,
      }
      setCategories((cats) => [...cats, newCategory])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setCategories((cats) => cats.filter((cat) => cat.id !== id))
  }

  const toggleActive = (id: string) => {
    setCategories((cats) => cats.map((cat) => (cat.id === id ? { ...cat, active: !cat.active } : cat)))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Event Categories Management</CardTitle>
            <CardDescription>Manage event categories for better organization</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="me-2 size-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                <DialogDescription>
                  {editingCategory ? "Update the category details." : "Create a new event category."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter category description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon (Emoji)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                      placeholder="e.g., 💻"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSave}>
                  {editingCategory ? "Update" : "Create"} Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.length === 0 ? (
            <div className="col-span-full">
              <Alert>
                <AlertDescription>No categories found. Create your first category to get started.</AlertDescription>
              </Alert>
            </div>
          ) : (
            categories.map((category) => (
              <Card key={category.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${category.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                        >
                          {category.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                  <div className="text-xs text-muted-foreground mb-3">{category.eventCount} events</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleActive(category.id)}>
                      <Eye className="size-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                      <Edit className="size-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(category.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
