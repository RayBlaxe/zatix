'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Music, 
  Briefcase, 
  Trophy, 
  Palette, 
  Laptop, 
  UtensilsCrossed,
  MapPin,
  Calendar,
  DollarSign,
  X,
  RefreshCw
} from 'lucide-react'
import { categoryApi } from '@/lib/api'
import { EventCategory, CategoryFilters } from '@/types/category'

interface CategoryFilterComponentProps {
  onFiltersChange: (filters: CategoryFilters) => void
  initialFilters?: CategoryFilters
}

const iconMap: Record<string, React.ReactNode> = {
  Music: <Music className="h-4 w-4" />,
  Briefcase: <Briefcase className="h-4 w-4" />,
  Trophy: <Trophy className="h-4 w-4" />,
  Palette: <Palette className="h-4 w-4" />,
  Laptop: <Laptop className="h-4 w-4" />,
  UtensilsCrossed: <UtensilsCrossed className="h-4 w-4" />
}

export default function CategoryFilterComponent({ onFiltersChange, initialFilters = {} }: CategoryFilterComponentProps) {
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<CategoryFilters>({
    search: '',
    categories: [],
    location: '',
    date_from: '',
    date_to: '',
    price_min: 0,
    price_max: 1000000,
    sort_by: 'date',
    sort_order: 'asc',
    ...initialFilters
  })

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryApi.getCategories({ active_only: true })
        if (response.success) {
          setCategories(response.data.categories)
        }
      } catch (error) {
        console.error('Failed to load categories:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  // Update filters and notify parent
  const updateFilters = (newFilters: Partial<CategoryFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  // Toggle category selection
  const toggleCategory = (categoryId: number) => {
    const currentCategories = filters.categories || []
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId]
    
    updateFilters({ categories: newCategories })
  }

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters: CategoryFilters = {
      search: '',
      categories: [],
      location: '',
      date_from: '',
      date_to: '',
      price_min: 0,
      price_max: 1000000,
      sort_by: 'date',
      sort_order: 'asc'
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const selectedCategoriesCount = filters.categories?.length || 0
  const hasActiveFilters = selectedCategoriesCount > 0 || 
    filters.search || 
    filters.location || 
    filters.date_from || 
    filters.date_to ||
    (filters.price_min && filters.price_min > 0) ||
    (filters.price_max && filters.price_max < 1000000)

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Category Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Category Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {selectedCategoriesCount + (filters.search ? 1 : 0) + (filters.location ? 1 : 0)} active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Filter events by categories, location, price, and more
            </CardDescription>
          </div>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Events</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by event name or description..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-3">
          <Label>Event Categories</Label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={filters.categories?.includes(category.id) || false}
                  onCheckedChange={() => toggleCategory(category.id)}
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="flex items-center gap-2 text-sm font-normal cursor-pointer"
                >
                  {category.icon && iconMap[category.icon]}
                  <span style={{ color: category.color }}>{category.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {category.event_count}
                  </Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="location"
              placeholder="Enter city or venue..."
              value={filters.location}
              onChange={(e) => updateFilters({ location: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-600 hover:text-blue-700"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-from">From Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="date-from"
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => updateFilters({ date_from: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to">To Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="date-to"
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => updateFilters({ date_to: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Price Range
              </Label>
              <div className="px-2">
                <Slider
                  value={[filters.price_min || 0, filters.price_max || 1000000]}
                  onValueChange={([min, max]) => updateFilters({ price_min: min, price_max: max })}
                  min={0}
                  max={1000000}
                  step={50000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>Rp {(filters.price_min || 0).toLocaleString('id-ID')}</span>
                  <span>Rp {(filters.price_max || 1000000).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select 
                  value={filters.sort_by} 
                  onValueChange={(value: any) => updateFilters({ sort_by: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Event Date</SelectItem>
                    <SelectItem value="name">Event Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="popularity">Popularity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Select 
                  value={filters.sort_order} 
                  onValueChange={(value: any) => updateFilters({ sort_order: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
