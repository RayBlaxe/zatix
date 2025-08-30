'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  Clock,
  Heart,
  Share2,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { categoryApi } from '@/lib/api'
import { CategoryFilters, EventCategory } from '@/types/category'
import { getEventPosterUrl } from '@/lib/api'

interface EventCardData {
  id: number
  name: string
  poster: string | null
  description: string
  start_date: string
  location: string
  price: string
  category_id?: number
}

interface FilteredEventsGridProps {
  filters: CategoryFilters
  className?: string
}

export default function FilteredEventsGrid({ filters, className = '' }: FilteredEventsGridProps) {
  const [events, setEvents] = useState<EventCardData[]>([])
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalEvents, setTotalEvents] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  // Load events based on filters
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await categoryApi.getEventsByCategory({
          ...filters,
          page: currentPage,
          per_page: 12
        })
        
        if (response.success) {
          setEvents(response.data.events as any)
          setTotalEvents(response.data.meta.total)
          
          // Also load categories if not already loaded
          if (categories.length === 0) {
            const categoriesResponse = await categoryApi.getCategories({ active_only: true })
            if (categoriesResponse.success) {
              setCategories(categoriesResponse.data.categories)
            }
          }
        } else {
          setError('Failed to load events')
        }
      } catch (error) {
        console.error('Error loading events:', error)
        setError('Failed to load events. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [filters, currentPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Get category information for an event
  const getEventCategory = (categoryId?: number) => {
    if (!categoryId) return null
    return categories.find(cat => cat.id === categoryId)
  }

  // Format event date
  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return {
        day: date.getDate(),
        month: date.toLocaleDateString('id-ID', { month: 'short' }),
        year: date.getFullYear()
      }
    } catch {
      return { day: '', month: '', year: '' }
    }
  }

  // Format price
  const formatPrice = (price: string) => {
    const numPrice = parseInt(price)
    if (numPrice === 0) return 'FREE'
    return `Rp ${numPrice.toLocaleString('id-ID')}`
  }

  // Loading state
  if (loading && events.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Events</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  // No results state
  if (!loading && events.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search terms to find more events.
          </p>
          <Button variant="outline" onClick={() => setCurrentPage(1)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Results Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Events</h2>
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${totalEvents} events found`}
          </p>
        </div>
        {loading && events.length > 0 && (
          <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const category = getEventCategory(event.category_id)
          const eventDate = formatEventDate(event.start_date)
          
          return (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              {/* Event Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={getEventPosterUrl(event.poster)}
                  alt={event.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Category Badge */}
                {category && (
                  <Badge 
                    className="absolute top-3 left-3"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.name}
                  </Badge>
                )}
                
                {/* Date Badge */}
                <div className="absolute top-3 right-3 bg-white rounded-lg p-2 text-center shadow-sm">
                  <div className="text-xs text-gray-600 font-medium">{eventDate.month}</div>
                  <div className="text-lg font-bold text-gray-900">{eventDate.day}</div>
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="secondary" className="p-2">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="secondary" className="p-2">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Event Content */}
              <CardHeader className="pb-3">
                <h3 className="font-bold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {event.name}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {event.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0 space-y-2">
                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(event.start_date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-bold text-green-600">
                    {formatPrice(event.price)}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="pt-3">
                <Link href={`/events/${event.id}`} className="w-full">
                  <Button className="w-full group/btn">
                    View Details
                    <ExternalLink className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {totalEvents > 12 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.ceil(totalEvents / 12) }).map((_, index) => {
              const page = index + 1
              if (page === currentPage) {
                return (
                  <Button key={page} size="sm">
                    {page}
                  </Button>
                )
              }
              
              if (Math.abs(page - currentPage) <= 2 || page === 1 || page === Math.ceil(totalEvents / 12)) {
                return (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              }
              
              if (Math.abs(page - currentPage) === 3) {
                return <span key={page} className="px-2">...</span>
              }
              
              return null
            })}
          </div>

          <Button
            variant="outline"
            disabled={currentPage === Math.ceil(totalEvents / 12)}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
