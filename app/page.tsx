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
import { 
  Music, 
  Briefcase, 
  Trophy, 
  Palette, 
  Monitor, 
  UtensilsCrossed,
  TrendingUp,
  Star,
  Calendar,
  MapPin,
  Users,
  Ticket,
  ArrowRight,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react"

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
        {/* Hero Section */}
        <section className="pt-8 pb-4">
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-[#002547]">
                Discover Amazing Events
              </h1>
              <p className="text-lg sm:text-xl max-w-2xl mx-auto text-gray-600 mb-8">
                ZaTix - Your gateway to unforgettable experiences and seamless ticketing
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/events">
                  <Button size="lg" className="bg-[#002547] hover:bg-[#002547]/90 w-full sm:w-auto">
                    <Ticket className="mr-2 h-5 w-5" />
                    Browse Events
                  </Button>
                </Link>
                <Link href="/wizard">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <Zap className="mr-2 h-5 w-5" />
                    Create Event
                  </Button>
                </Link>
              </div>
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
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-[#002547]">
                Browse by Category
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
                Find events that match your interests and discover new experiences
              </p>
            </div>

            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {[
                { name: 'Music', icon: Music, count: 45, color: 'bg-red-50 text-red-600 border-red-200', hoverColor: 'hover:bg-red-100' },
                { name: 'Business', icon: Briefcase, count: 32, color: 'bg-blue-50 text-blue-600 border-blue-200', hoverColor: 'hover:bg-blue-100' },
                { name: 'Sports', icon: Trophy, count: 28, color: 'bg-green-50 text-green-600 border-green-200', hoverColor: 'hover:bg-green-100' },
                { name: 'Arts', icon: Palette, count: 21, color: 'bg-purple-50 text-purple-600 border-purple-200', hoverColor: 'hover:bg-purple-100' },
                { name: 'Tech', icon: Monitor, count: 19, color: 'bg-yellow-50 text-yellow-600 border-yellow-200', hoverColor: 'hover:bg-yellow-100' },
                { name: 'Food', icon: UtensilsCrossed, count: 16, color: 'bg-pink-50 text-pink-600 border-pink-200', hoverColor: 'hover:bg-pink-100' }
              ].map((category) => (
                <Link key={category.name} href={`/events?category=${category.name.toLowerCase()}`}>
                  <div className={`group p-6 rounded-xl bg-white border-2 ${category.color} ${category.hoverColor} hover:shadow-lg transition-all duration-300 cursor-pointer`}>
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-full ${category.color.replace('text-', 'bg-').replace('-600', '-100')} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <category.icon className="h-8 w-8" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{category.name}</h3>
                      <p className="text-xs text-gray-500">{category.count} events</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Hot Events Section */}
        <section className="py-12 sm:py-16" style={{ backgroundColor: '#002547' }}>
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <TrendingUp className="h-4 w-4" />
                Trending Events
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-white">
                Popular Right Now
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto text-base sm:text-lg">
                Don't miss out on these popular events that everyone's talking about
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-xl border bg-white p-3">
                    <div className="aspect-video overflow-hidden rounded-lg bg-gray-200 animate-pulse">
                    </div>
                    <div className="p-4">
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : events.length > 0 ? (
                events.slice(0, 4).map((event) => (
                  <div key={event.id} className="group relative overflow-hidden rounded-xl border bg-white p-3 hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-6 left-6 z-10">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Trending
                      </span>
                    </div>
                    <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={getEventPosterUrl(event.poster)}
                        alt={event.name}
                        width={500}
                        height={300}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105 duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-2">{event.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(event.start_date), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                      <p className="line-clamp-2 text-sm text-gray-700 mb-4">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Link href={`/events/${event.id}`}>
                          <Button variant="outline" size="sm" className="text-gray-900 border-gray-300 hover:bg-gray-50">
                            View Details
                            <ArrowRight className="ml-1 h-3 w-3" />
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
                  <Clock className="h-12 w-12 text-white/60 mx-auto mb-4" />
                  <p className="text-white/80 text-lg mb-2">No trending events available at the moment.</p>
                  <p className="text-white/60 text-sm">Check back later for new events!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Featured Events Section */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="h-4 w-4" />
                Featured Events
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-[#002547]">
                Handpicked for You
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
                Curated events that we think you'll love, selected by our team
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 2 }, (_, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-6 p-6 border rounded-xl">
                    <div className="w-full sm:w-48 h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                      <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : events.length > 0 ? (
                events.slice(3, 5).map((event) => (
                  <div key={event.id} className="group flex flex-col sm:flex-row gap-6 p-6 border rounded-xl hover:shadow-lg transition-all duration-300">
                    <div className="w-full sm:w-48 h-32 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={getEventPosterUrl(event.poster)}
                        alt={event.name}
                        width={200}
                        height={120}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105 duration-300"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{event.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(event.start_date), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Link href={`/events/${event.id}`}>
                          <Button size="sm" className="bg-[#002547] hover:bg-[#002547]/90">
                            Learn More
                            <ArrowRight className="ml-2 h-4 w-4" />
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
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No featured events available at the moment.</p>
                  <p className="text-gray-500 text-sm">Check back later for new events!</p>
                </div>
              )}
            </div>

            <div className="mt-12 text-center">
              <Link href="/events">
                <Button 
                  size="lg" 
                  className="bg-[#002547] hover:bg-[#002547]/90 font-semibold w-full sm:w-auto"
                >
                  View All Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-[#002547]">
                Why Choose ZaTix?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
                Experience seamless event management and ticketing with our comprehensive platform
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: CheckCircle,
                  title: 'Easy Event Creation',
                  description: 'Create and publish events in minutes with our intuitive wizard',
                  color: 'text-green-600'
                },
                {
                  icon: Users,
                  title: 'Reach More People',
                  description: 'Connect with your audience and grow your event attendance',
                  color: 'text-blue-600'
                },
                {
                  icon: Ticket,
                  title: 'Seamless Ticketing',
                  description: 'Secure payment processing and instant ticket delivery',
                  color: 'text-purple-600'
                },
                {
                  icon: TrendingUp,
                  title: 'Real-time Analytics',
                  description: 'Track your event performance with detailed insights',
                  color: 'text-red-600'
                },
                {
                  icon: Zap,
                  title: 'Fast & Reliable',
                  description: 'Lightning-fast platform built for high-volume events',
                  color: 'text-yellow-600'
                },
                {
                  icon: Clock,
                  title: '24/7 Support',
                  description: 'Get help whenever you need it with our dedicated support team',
                  color: 'text-indigo-600'
                }
              ].map((feature, index) => (
                <div key={index} className="group p-6 bg-white rounded-xl border hover:shadow-lg transition-all duration-300">
                  <div className={`w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16">
          <div className="container px-4 sm:px-6">
            <div className="bg-gradient-to-r from-[#002547] to-[#003868] rounded-2xl p-8 sm:p-12 text-center text-white">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to create your own event?</h2>
              <p className="text-white/90 max-w-2xl mx-auto mb-8 text-base sm:text-lg">
                Join thousands of event organizers who trust ZaTix to manage their events. 
                Get started today and see the difference!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/wizard">
                  <Button size="lg" className="bg-white text-[#002547] hover:bg-gray-100 w-full sm:w-auto">
                    <Zap className="mr-2 h-5 w-5" />
                    Create New Event
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                    <Users className="mr-2 h-5 w-5" />
                    Join ZaTix
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-white">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start">
              <p className="text-sm text-gray-600 mb-2">
                © 2025 ZaTix. All rights reserved.
              </p>
              <p className="text-xs text-gray-500">
                Empowering events, connecting communities.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/terms" className="hover:text-[#002547] transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-[#002547] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/contact" className="hover:text-[#002547] transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
