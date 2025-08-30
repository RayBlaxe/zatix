'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Plus, 
  Edit, 
  Trash2, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye,
  RefreshCw,
  Save,
  X,
  Music,
  Briefcase,
  Trophy,
  Palette,
  Laptop,
  UtensilsCrossed,
  Tag
} from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { categoryApi } from '@/lib/api'
import { EventCategory, CategoryCreateRequest, CategoryUpdateRequest, CategoryStatsResponse } from '@/types/category'
import { useToast } from '@/hooks/use-toast'

const iconOptions = [
  { value: 'Music', label: 'Music', icon: Music },
  { value: 'Briefcase', label: 'Business', icon: Briefcase },
  { value: 'Trophy', label: 'Sports', icon: Trophy },
  { value: 'Palette', label: 'Arts', icon: Palette },
  { value: 'Laptop', label: 'Technology', icon: Laptop },
  { value: 'UtensilsCrossed', label: 'Food & Drink', icon: UtensilsCrossed },
  { value: 'Tag', label: 'Other', icon: Tag }
]

const colorOptions = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#FF8A80', '#81C784', '#64B5F6', '#FFB74D', '#A1887F', '#90A4AE'
]

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [stats, setStats] = useState<CategoryStatsResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<EventCategory | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState<CategoryCreateRequest>({
    name: '',
    slug: '',
    description: '',
    icon: 'Tag',
    color: '#FF6B6B',
    parent_id: undefined,
    is_active: true
  })

  // Load categories and stats
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [categoriesResponse, statsResponse] = await Promise.all([
        categoryApi.getCategories(),
        categoryApi.getCategoryStats()
      ])

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data.categories)
      }

      if (statsResponse.success) {
        setStats(statsResponse.data)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load categories data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCategory) {
        // Update existing category
        const response = await categoryApi.updateCategory({
          ...formData,
          id: editingCategory.id
        })
        
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Category updated successfully'
          })
          loadData()
          closeDialog()
        }
      } else {
        // Create new category
        const response = await categoryApi.createCategory(formData)
        
        if (response.success) {
          toast({
            title: 'Success',
            description: 'Category created successfully'
          })
          loadData()
          closeDialog()
        }
      }
    } catch (error) {
      console.error('Failed to save category:', error)
      toast({
        title: 'Error',
        description: 'Failed to save category',
        variant: 'destructive'
      })
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!categoryToDelete) return

    try {
      const response = await categoryApi.deleteCategory(categoryToDelete.id)
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Category deleted successfully'
        })
        loadData()
        setDeleteDialogOpen(false)
        setCategoryToDelete(null)
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive'
      })
    }
  }

  // Open create dialog
  const openCreateDialog = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'Tag',
      color: '#FF6B6B',
      parent_id: undefined,
      is_active: true
    })
    setDialogOpen(true)
  }

  // Open edit dialog
  const openEditDialog = (category: EventCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || 'Tag',
      color: category.color || '#FF6B6B',
      parent_id: category.parent_id,
      is_active: category.is_active
    })
    setDialogOpen(true)
  }

  // Close dialog
  const closeDialog = () => {
    setDialogOpen(false)
    setEditingCategory(null)
  }

  // Open delete confirmation
  const openDeleteDialog = (category: EventCategory) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-gray-600">Manage event categories and view analytics</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Categories</p>
                  <p className="text-3xl font-bold">{stats.total_categories}</p>
                </div>
                <Tag className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Categories</p>
                  <p className="text-3xl font-bold">{stats.active_categories}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-3xl font-bold">{stats.total_events}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Popular Categories</p>
                  <p className="text-3xl font-bold">{stats.popular_categories.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Manage all event categories and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => {
              const IconComponent = iconOptions.find(opt => opt.value === category.icon)?.icon || Tag
              
              return (
                <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{category.event_count} events</Badge>
                        <Badge variant={category.is_active ? 'default' : 'secondary'}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(category)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? 'Update the category information below.'
                  : 'Create a new event category with the information below.'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setFormData({
                      ...formData,
                      name,
                      slug: generateSlug(name)
                    })
                  }}
                  placeholder="Enter category name"
                  required
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="category-url-slug"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this category..."
                />
              </div>

              {/* Icon and Color */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select 
                    value={formData.icon} 
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => {
                        const IconComponent = option.icon
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is-active">Active Status</Label>
                  <p className="text-sm text-gray-600">
                    Inactive categories won't appear in public listings
                  </p>
                </div>
                <Switch
                  id="is-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? 
              This action cannot be undone and will affect {categoryToDelete?.event_count} events.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
