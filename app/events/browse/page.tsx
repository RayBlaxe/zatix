'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Grid, 
  List, 
  TrendingUp, 
  Star, 
  Clock,
  Users,
  Filter as FilterIcon,
  Search,
  Sparkles
} from 'lucide-react'
import CategoryFilterComponent from '@/components/event/category-filter'
import FilteredEventsGrid from '@/components/event/filtered-events-grid'
import { CategoryFilters } from '@/types/category'

export default function BrowseEventsPage() {
  const [filters, setFilters] = useState<CategoryFilters>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'all' | 'recommended' | 'trending' | 'nearby'>('all')

  const handleFiltersChange = (newFilters: CategoryFilters) => {
    setFilters(newFilters)
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'recommended':
        return 'Recommended Events'
      case 'trending':
        return 'Trending Events'
      case 'nearby':
        return 'Events Near You'
      default:
        return 'Browse All Events'
    }
  }

  const getPageDescription = () => {
    switch (activeTab) {
      case 'recommended':
        return 'Personalized event recommendations based on your interests'
      case 'trending':
        return 'Popular events that are trending right now'
      case 'nearby':
        return 'Discover events happening in your area'
      default:
        return 'Discover amazing events happening around you'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {getPageTitle()}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {getPageDescription()}
        </p>
      </div>

      {/* Event Type Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="mb-8">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 mx-auto">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            All Events
          </TabsTrigger>
          <TabsTrigger value="recommended" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            For You
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="nearby" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Nearby
          </TabsTrigger>
        </TabsList>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">150+</div>
              <div className="text-sm text-gray-600">Active Events</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">25</div>
              <div className="text-sm text-gray-600">Categories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">10K+</div>
              <div className="text-sm text-gray-600">Monthly Attendees</div>
            </CardContent>
          </Card>
        </div>

        <TabsContent value="all" className="space-y-8">
          <AllEventsContent 
            filters={filters} 
            onFiltersChange={handleFiltersChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </TabsContent>

        <TabsContent value="recommended" className="space-y-8">
          <RecommendedEventsContent 
            filters={filters} 
            onFiltersChange={handleFiltersChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </TabsContent>

        <TabsContent value="trending" className="space-y-8">
          <TrendingEventsContent 
            filters={filters} 
            onFiltersChange={handleFiltersChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </TabsContent>

        <TabsContent value="nearby" className="space-y-8">
          <NearbyEventsContent 
            filters={filters} 
            onFiltersChange={handleFiltersChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// All Events Tab Content
function AllEventsContent({ 
  filters, 
  onFiltersChange, 
  viewMode, 
  onViewModeChange 
}: {
  filters: CategoryFilters
  onFiltersChange: (filters: CategoryFilters) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <CategoryFilterComponent 
          onFiltersChange={onFiltersChange}
          initialFilters={filters}
        />
      </div>

      {/* Events Content */}
      <div className="lg:col-span-3">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              {Object.keys(filters).length > 0 ? 'Filtered Results' : 'All Events'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <FilteredEventsGrid filters={filters} />
      </div>
    </div>
  )
}

// Recommended Events Tab Content
function RecommendedEventsContent({ 
  filters, 
  onFiltersChange, 
  viewMode, 
  onViewModeChange 
}: {
  filters: CategoryFilters
  onFiltersChange: (filters: CategoryFilters) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}) {
  // Add personalization logic here
  const personalizedFilters = {
    ...filters,
    // Add user preference-based filtering
  }

  return (
    <div className="space-y-6">
      {/* Personalization Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Personalized for You
          </CardTitle>
          <CardDescription>
            These recommendations are based on your interests, past events, and preferences.
          </CardDescription>
        </CardHeader>
      </Card>

      <AllEventsContent 
        filters={personalizedFilters}
        onFiltersChange={onFiltersChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />
    </div>
  )
}

// Trending Events Tab Content
function TrendingEventsContent({ 
  filters, 
  onFiltersChange, 
  viewMode, 
  onViewModeChange 
}: {
  filters: CategoryFilters
  onFiltersChange: (filters: CategoryFilters) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}) {
  const trendingFilters = {
    ...filters,
    sort_by: 'popularity' as const,
    sort_order: 'desc' as const
  }

  return (
    <div className="space-y-6">
      {/* Trending Info */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Trending Now
          </CardTitle>
          <CardDescription>
            The most popular events based on ticket sales and user interest.
          </CardDescription>
        </CardHeader>
      </Card>

      <AllEventsContent 
        filters={trendingFilters}
        onFiltersChange={onFiltersChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />
    </div>
  )
}

// Nearby Events Tab Content
function NearbyEventsContent({ 
  filters, 
  onFiltersChange, 
  viewMode, 
  onViewModeChange 
}: {
  filters: CategoryFilters
  onFiltersChange: (filters: CategoryFilters) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}) {
  const nearbyFilters = {
    ...filters,
    location: filters.location || 'Jakarta' // Default to user's location
  }

  return (
    <div className="space-y-6">
      {/* Location Info */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Events Near You
          </CardTitle>
          <CardDescription>
            Discover local events happening in Jakarta and surrounding areas.
          </CardDescription>
        </CardHeader>
      </Card>

      <AllEventsContent 
        filters={nearbyFilters}
        onFiltersChange={onFiltersChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />
    </div>
  )
}
