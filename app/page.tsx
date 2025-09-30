"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Carousel } from "@/components/carousel"
import { Header } from "@/components/header"
import { useEffect, useState } from "react"
import { eventApi, getEventPosterUrl } from "@/lib/api"
import { Event } from "@/types/events"
import { format } from "date-fns"
import Image from "next/image"

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await eventApi.getPublicEvents(1, {})
        if (response.success) {
          setEvents(response.data.data)
        }
      } catch (error) {
        console.error("Failed to fetch events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="pt-4 sm:pt-6">
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3" style={{ color: '#002547' }}>
                Hi, what event do you want to join?
              </h1>
              <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: '#002547' }}>
                ZaTix - Providing all your ticketing needs
              </p>
            </div>
          </div>
        </section>

        <section className="py-4 sm:py-8">
          <div className="container px-4 sm:px-6">
            <div className="mx-auto">
              <Carousel />
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-8 sm:py-12 bg-gray-50">
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: '#002547' }}>
                Browse by Category
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
                Find events that match your interests
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {[
                { name: 'Music', icon: '🎵', count: 45, color: 'bg-red-100 text-red-700' },
                { name: 'Business', icon: '💼', count: 32, color: 'bg-blue-100 text-blue-700' },
                { name: 'Sports', icon: '🏆', count: 28, color: 'bg-green-100 text-green-700' },
                { name: 'Arts', icon: '🎨', count: 21, color: 'bg-purple-100 text-purple-700' },
                { name: 'Tech', icon: '💻', count: 19, color: 'bg-yellow-100 text-yellow-700' },
                { name: 'Food', icon: '🍽️', count: 16, color: 'bg-pink-100 text-pink-700' }
              ].map((category) => (
                <Link key={category.name} href={`/events?category=${category.name.toLowerCase()}`}>
                  <div className="group p-4 rounded-lg bg-white border hover:shadow-md transition-all cursor-pointer">
                    <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center mx-auto mb-3`}>
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{category.count} events</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Hot Events Section */}
        <section className="py-8 sm:py-12" style={{ backgroundColor: '#002547' }}>
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                🔥 Hot Events
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-white">Trending Now</h2>
              <p className="text-white/80 max-w-2xl mx-auto text-sm sm:text-base">
                Don't miss out on these popular events that everyone's talking about
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-lg border bg-white p-2">
                    <div className="aspect-video overflow-hidden rounded-md bg-gray-200 animate-pulse">
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 sm:h-8 w-20 sm:w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 sm:h-4 w-10 sm:w-12 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : events.length > 0 ? (
                events.slice(0, 4).map((event) => (
                  <div key={event.id} className="group relative overflow-hidden rounded-lg border bg-white p-2">
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        🔥 Trending
                      </span>
                    </div>
                    <div className="aspect-video overflow-hidden rounded-md bg-gray-100">
                      <Image
                        src={getEventPosterUrl(event.poster)}
                        alt={event.name}
                        width={500}
                        height={300}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 line-clamp-1">{event.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        {format(new Date(event.start_date), 'MMM dd, yyyy')} • {event.location}
                      </p>
                      <p className="line-clamp-2 text-xs sm:text-sm text-gray-700">
                        {event.description}
                      </p>
                      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                        <Link href={`/events/${event.id}`}>
                          <Button variant="outline" size="sm" className="text-gray-900 border-gray-300 hover:bg-gray-50 w-full sm:w-auto">
                            View Details
                          </Button>
                        </Link>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 text-center sm:text-right">
                          {event.tickets.length > 0 && Number(event.tickets[0].price) > 0 
                            ? `Rp ${Number(event.tickets[0].price).toLocaleString()}`
                            : 'Free'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 sm:py-12">
                  <p className="text-white/80 text-base sm:text-lg">No trending events available at the moment.</p>
                  <p className="text-white/60 text-xs sm:text-sm mt-2">Check back later for new events!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Featured Events Section */}
        <section className="py-8 sm:py-12 bg-white">
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                ⭐ Featured
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: '#002547' }}>
                Featured Events
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
                Handpicked events that we think you'll love
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 2 }, (_, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                    <div className="w-full sm:w-48 h-32 bg-gray-200 rounded-md animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                      <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : events.length > 0 ? (
                events.slice(3, 5).map((event) => (
                  <div key={event.id} className="group flex flex-col sm:flex-row gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="w-full sm:w-48 h-32 sm:h-24 overflow-hidden rounded-md bg-gray-100">
                      <Image
                        src={getEventPosterUrl(event.poster)}
                        alt={event.name}
                        width={200}
                        height={120}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {format(new Date(event.start_date), 'MMM dd, yyyy')} • {event.location}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Link href={`/events/${event.id}`}>
                          <Button size="sm" className="bg-[#002547] hover:bg-[#002547]/90">
                            Learn More
                          </Button>
                        </Link>
                        <span className="text-sm font-medium text-gray-900">
                          {event.tickets.length > 0 && Number(event.tickets[0].price) > 0 
                            ? `Rp ${Number(event.tickets[0].price).toLocaleString()}`
                            : 'Free'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 sm:py-12">
                  <p className="text-gray-600 text-base sm:text-lg">No featured events available at the moment.</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-2">Check back later for new events!</p>
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <Link href="/events">
                <Button 
                  size="lg" 
                  className="bg-[#002547] hover:bg-[#002547]/90 font-semibold w-full sm:w-auto"
                >
                  View All Events
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="container px-4 sm:px-6">
            <div className="bg-primary/5 rounded-xl p-6 sm:p-8 text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Ready to create your own event?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-6 text-sm sm:text-base">
                It only takes a few minutes to create and publish your event. Get started today!
              </p>
              <Link href="/wizard">
                <Button size="lg" className="w-full sm:w-auto">Create New Event</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 sm:px-6">
          <p className="text-center text-xs sm:text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 ZaTix. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
