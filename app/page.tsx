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
        <section className="py-6">
          <div className="container">
            <Carousel />
          </div>
        </section>

        <section className="py-12" style={{ backgroundColor: '#002547' }}>
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">Upcoming Events</h2>
              <p className="text-white/80 max-w-2xl mx-auto">
                Discover and join our upcoming events. From workshops to conferences, we have something for everyone.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-lg border bg-white p-2">
                    <div className="aspect-video overflow-hidden rounded-md bg-gray-200 animate-pulse">
                    </div>
                    <div className="p-4">
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className="group relative overflow-hidden rounded-lg border bg-white p-2">
                    <div className="aspect-video overflow-hidden rounded-md bg-gray-100">
                      {event.poster ? (
                        <Image
                          src={getEventPosterUrl(event.poster)}
                          alt={event.name}
                          width={500}
                          height={300}
                          className="object-cover w-full h-full transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">{event.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {format(new Date(event.start_date), 'MMM dd, yyyy')} • {event.location}
                      </p>
                      <p className="line-clamp-2 text-sm text-gray-700">
                        {event.description}
                      </p>
                      <div className="mt-4 flex justify-between items-center">
                        <Link href={`/events/${event.id}`}>
                          <Button variant="outline" size="sm" className="text-gray-900 border-gray-300 hover:bg-gray-50">
                            View Details
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
                <div className="col-span-full text-center py-12">
                  <p className="text-white/80 text-lg">No upcoming events available at the moment.</p>
                  <p className="text-white/60 text-sm mt-2">Check back later for new events!</p>
                </div>
              )}
            </div>

            <div className="mt-10 text-center">
              <Link href="/events">
                <Button 
                  size="lg" 
                  className="bg-white text-[#002547] border-2 border-white hover:bg-white/90 hover:text-[#002547] font-semibold"
                >
                  View All Events
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <div className="bg-primary/5 rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to create your own event?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                It only takes a few minutes to create and publish your event. Get started today!
              </p>
              <Link href="/wizard">
                <Button size="lg">Create New Event</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 ZaTix. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">
              Terms
            </Link>
            <Link href="#" className="hover:underline">
              Privacy
            </Link>
            <Link href="#" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
