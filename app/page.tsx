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
  Zap,
  Award,
  BookOpen,
  Heart,
  Filter,
  ChevronDown,
  Flame,
  GraduationCap,
  Building2
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function HomePage() {
  // State with immediate hardcoded data to show the sections
  const [events, setEvents] = useState<Event[]>([])
  const [topSellingEvents, setTopSellingEvents] = useState<Event[]>([
    {
      id: 1,
      eo_id: 1,
      name: "Indonesia Music Festival 2025",
      description: "The biggest music festival in Southeast Asia featuring international and local artists.",
      poster: "/placeholder.svg",
      start_date: "2025-01-15",
      start_time: "18:00:00",
      end_date: "2025-01-17",
      end_time: "23:00:00",
      location: "Jakarta International Expo, Kemayoran",
      status: "active",
      is_published: true,
      is_public: true,
      contact_phone: "+62-21-555-0001",
      tnc_id: 1,
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-01T10:00:00Z",
      facilities: [],
      tickets: [{ 
        id: 1, 
        event_id: 1,
        ticket_type_id: 1,
        name: "General Admission", 
        price: "350000", 
        description: "3-day festival pass",
        stock: 1000,
        limit: 5,
        start_date: "2025-01-01",
        end_date: "2025-01-15",
        created_at: "2024-12-01T10:00:00Z",
        updated_at: "2024-12-01T10:00:00Z"
      }],
      sold_count: 2847,
    },
    {
      id: 2,
      eo_id: 1,
      name: "Tech Innovation Summit 2025",
      description: "Join industry leaders for insightful talks about the future of technology.",
      poster: "/placeholder.svg",
      start_date: "2025-01-20",
      start_time: "09:00:00",
      end_date: "2025-01-20",
      end_time: "17:00:00",
      location: "Grand Ballroom, Hotel Indonesia Kempinski",
      status: "active",
      is_published: true,
      is_public: true,
      contact_phone: "+62-21-555-0002",
      tnc_id: 1,
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-01T10:00:00Z",
      facilities: [],
      tickets: [{ 
        id: 2, 
        event_id: 2,
        ticket_type_id: 1,
        name: "Standard Ticket", 
        price: "500000", 
        description: "Full day access",
        stock: 500,
        limit: 3,
        start_date: "2025-01-01",
        end_date: "2025-01-20",
        created_at: "2024-12-01T10:00:00Z",
        updated_at: "2024-12-01T10:00:00Z"
      }],
      sold_count: 1923,
    },
    {
      id: 3,
      eo_id: 1,
      name: "Business Networking Gala",
      description: "An exclusive evening for business professionals to network and build connections.",
      poster: "/placeholder.svg",
      start_date: "2025-02-14",
      start_time: "19:00:00",
      end_date: "2025-02-14",
      end_time: "23:00:00",
      location: "Shangri-La Hotel Jakarta",
      status: "active",
      is_published: true,
      is_public: true,
      contact_phone: "+62-21-555-0003",
      tnc_id: 1,
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-01T10:00:00Z",
      facilities: [],
      tickets: [{ 
        id: 3, 
        event_id: 3,
        ticket_type_id: 1,
        name: "VIP Access", 
        price: "750000", 
        description: "Includes dinner",
        stock: 200,
        limit: 2,
        start_date: "2025-01-01",
        end_date: "2025-02-14",
        created_at: "2024-12-01T10:00:00Z",
        updated_at: "2024-12-01T10:00:00Z"
      }],
      sold_count: 1456,
    },
    {
      id: 4,
      eo_id: 1,
      name: "Marathon Jakarta 2025",
      description: "Challenge yourself in Jakarta's premier running event.",
      poster: "/placeholder.svg",
      start_date: "2025-02-10",
      start_time: "05:00:00",
      end_date: "2025-02-10",
      end_time: "12:00:00",
      location: "Monas (National Monument) Area",
      status: "active",
      is_published: true,
      is_public: true,
      contact_phone: "+62-21-555-0004",
      tnc_id: 1,
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-01T10:00:00Z",
      facilities: [],
      tickets: [{ 
        id: 4, 
        event_id: 4,
        ticket_type_id: 1,
        name: "Full Marathon", 
        price: "200000", 
        description: "42.2 KM race",
        stock: 2000,
        limit: 1,
        start_date: "2025-01-01",
        end_date: "2025-02-10",
        created_at: "2024-12-01T10:00:00Z",
        updated_at: "2024-12-01T10:00:00Z"
      }],
      sold_count: 1089,
    }
  ])
  const [workshopEvents, setWorkshopEvents] = useState<Event[]>([
    {
      id: 5,
      eo_id: 1,
      name: "Web Development Bootcamp",
      description: "Master modern web development with hands-on training in React, Node.js, and full-stack development.",
      poster: "/placeholder.svg",
      start_date: "2025-01-25",
      start_time: "09:00:00",
      end_date: "2025-01-25",
      end_time: "17:00:00",
      location: "Jakarta Tech Hub, Kuningan",
      status: "active",
      is_published: true,
      is_public: true,
      contact_phone: "+62-21-555-0005",
      tnc_id: 1,
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-01T10:00:00Z",
      facilities: [],
      tickets: [{ 
        id: 5, 
        event_id: 5,
        ticket_type_id: 1,
        name: "Workshop Ticket", 
        price: "450000", 
        description: "Full day workshop",
        stock: 50,
        limit: 1,
        start_date: "2025-01-01",
        end_date: "2025-01-25",
        created_at: "2024-12-01T10:00:00Z",
        updated_at: "2024-12-01T10:00:00Z"
      }],
    },
    {
      id: 6,
      eo_id: 1,
      name: "Digital Marketing Masterclass",
      description: "Learn advanced digital marketing strategies including SEO, social media marketing, and conversion optimization.",
      poster: "/placeholder.svg",
      start_date: "2025-01-28",
      start_time: "10:00:00",
      end_date: "2025-01-28",
      end_time: "16:00:00",
      location: "Menara BCA, Thamrin",
      status: "active",
      is_published: true,
      is_public: true,
      contact_phone: "+62-21-555-0006",
      tnc_id: 1,
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-01T10:00:00Z",
      facilities: [],
      tickets: [{ 
        id: 6, 
        event_id: 6,
        ticket_type_id: 1,
        name: "Workshop Ticket", 
        price: "300000", 
        description: "6-hour intensive workshop",
        stock: 40,
        limit: 1,
        start_date: "2025-01-01",
        end_date: "2025-01-28",
        created_at: "2024-12-01T10:00:00Z",
        updated_at: "2024-12-01T10:00:00Z"
      }],
    },
    {
      id: 7,
      eo_id: 1,
      name: "Photography Workshop",
      description: "Enhance your photography skills with professional techniques for portrait and landscape photography.",
      poster: "/placeholder.svg",
      start_date: "2025-02-01",
      start_time: "08:00:00",
      end_date: "2025-02-01",
      end_time: "15:00:00",
      location: "Taman Suropati, Menteng",
      status: "active",
      is_published: true,
      is_public: true,
      contact_phone: "+62-21-555-0007",
      tnc_id: 1,
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-01T10:00:00Z",
      facilities: [],
      tickets: [{ 
        id: 7, 
        event_id: 7,
        ticket_type_id: 1,
        name: "Workshop Ticket", 
        price: "250000", 
        description: "Outdoor photography session",
        stock: 30,
        limit: 1,
        start_date: "2025-01-01",
        end_date: "2025-02-01",
        created_at: "2024-12-01T10:00:00Z",
        updated_at: "2024-12-01T10:00:00Z"
      }],
    }
  ])
  const [favoriteEOs, setFavoriteEOs] = useState<any[]>([
    {
      id: 1,
      name: "Jakarta Events Pro",
      description: "Professional event organizing company specializing in corporate events and large-scale festivals",
      logo: "/placeholder.svg",
      average_rating: 4.8,
      total_events: 45,
      events_count: 45,
      recent_events: [
        { id: 1, name: "Music Festival", poster: "/placeholder.svg" },
        { id: 2, name: "Tech Summit", poster: "/placeholder.svg" }
      ]
    },
    {
      id: 2,
      name: "Tech Event Solutions",
      description: "Leading organizer of technology conferences, startup events, and innovation summits",
      logo: "/placeholder.svg",
      average_rating: 4.7,
      total_events: 32,
      events_count: 32,
      recent_events: [
        { id: 3, name: "AI Conference", poster: "/placeholder.svg" },
        { id: 4, name: "Startup Pitch", poster: "/placeholder.svg" }
      ]
    },
    {
      id: 3,
      name: "Creative Arts Collective",
      description: "Curating amazing arts and culture events, exhibitions, and creative workshops",
      logo: "/placeholder.svg",
      average_rating: 4.9,
      total_events: 28,
      events_count: 28,
      recent_events: [
        { id: 5, name: "Art Exhibition", poster: "/placeholder.svg" },
        { id: 6, name: "Design Workshop", poster: "/placeholder.svg" }
      ]
    },
    {
      id: 4,
      name: "Sports & Fitness Hub",
      description: "Organizing marathons, fitness challenges, and sports events across Indonesia",
      logo: "/placeholder.svg",
      average_rating: 4.6,
      total_events: 22,
      events_count: 22,
      recent_events: [
        { id: 7, name: "Marathon 2025", poster: "/placeholder.svg" },
        { id: 8, name: "Yoga Fest", poster: "/placeholder.svg" }
      ]
    },
    {
      id: 5,
      name: "Culinary Experience Co",
      description: "Creating unforgettable food festivals, cooking classes, and culinary experiences",
      logo: "/placeholder.svg",
      average_rating: 4.8,
      total_events: 19,
      events_count: 19,
      recent_events: [
        { id: 9, name: "Food Festival", poster: "/placeholder.svg" },
        { id: 10, name: "Chef Workshop", poster: "/placeholder.svg" }
      ]
    },
    {
      id: 6,
      name: "Business Network Events",
      description: "Facilitating professional networking events, seminars, and business conferences",
      logo: "/placeholder.svg",
      average_rating: 4.7,
      total_events: 35,
      events_count: 35,
      recent_events: [
        { id: 11, name: "Business Summit", poster: "/placeholder.svg" },
        { id: 12, name: "Networking Gala", poster: "/placeholder.svg" }
      ]
    }
  ])
  const [timeFilteredEvents, setTimeFilteredEvents] = useState<Event[]>([
    {
      id: 8,
      eo_id: 1,
      name: "Weekend Music Concert",
      description: "Amazing live music performance featuring local and international artists this weekend.",
      poster: "/placeholder.svg",
      start_date: "2025-01-18",
      start_time: "19:00:00",
      end_date: "2025-01-18",
      end_time: "23:00:00",
      location: "Jakarta Convention Center",
      status: "active",
      is_published: true,
      is_public: true,
      contact_phone: "+62-21-555-0008",
      tnc_id: 1,
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-01T10:00:00Z",
      facilities: [],
      tickets: [{ 
        id: 8, 
        event_id: 8,
        ticket_type_id: 1,
        name: "Concert Ticket", 
        price: "250000", 
        description: "Standing zone",
        stock: 500,
        limit: 4,
        start_date: "2025-01-01",
        end_date: "2025-01-18",
        created_at: "2024-12-01T10:00:00Z",
        updated_at: "2024-12-01T10:00:00Z"
      }],
    },
    {
      id: 9,
      eo_id: 1,
      name: "Tech Meetup Jakarta",
      description: "Join fellow tech enthusiasts for networking and knowledge sharing this week.",
      poster: "/placeholder.svg",
      start_date: "2025-01-16",
      start_time: "18:00:00",
      end_date: "2025-01-16",
      end_time: "21:00:00",
      location: "GoWork Menara Rajawali",
      status: "active",
      is_published: true,
      is_public: true,
      contact_phone: "+62-21-555-0009",
      tnc_id: 1,
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-01T10:00:00Z",
      facilities: [],
      tickets: [{ 
        id: 9, 
        event_id: 9,
        ticket_type_id: 1,
        name: "Free Entry", 
        price: "0", 
        description: "RSVP required",
        stock: 100,
        limit: 1,
        start_date: "2025-01-01",
        end_date: "2025-01-16",
        created_at: "2024-12-01T10:00:00Z",
        updated_at: "2024-12-01T10:00:00Z"
      }],
    },
    {
      id: 10,
      eo_id: 1,
      name: "Art Exhibition Opening",
      description: "Grand opening of contemporary art exhibition featuring emerging Indonesian artists.",
      poster: "/placeholder.svg",
      start_date: "2025-01-19",
      start_time: "17:00:00",
      end_date: "2025-01-19",
      end_time: "20:00:00",
      location: "National Gallery Indonesia",
      status: "active",
      is_published: true,
      is_public: true,
      contact_phone: "+62-21-555-0010",
      tnc_id: 1,
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-01T10:00:00Z",
      facilities: [],
      tickets: [{ 
        id: 10, 
        event_id: 10,
        ticket_type_id: 1,
        name: "Exhibition Pass", 
        price: "50000", 
        description: "Single entry",
        stock: 200,
        limit: 2,
        start_date: "2025-01-01",
        end_date: "2025-01-19",
        created_at: "2024-12-01T10:00:00Z",
        updated_at: "2024-12-01T10:00:00Z"
      }],
    }
  ])
  const [locationFilteredEvents, setLocationFilteredEvents] = useState<Event[]>([
    {
      id: 11,
      eo_id: 1,
      name: "Jakarta Food Festival",
      description: "Explore the best culinary delights from across Jakarta in one amazing food festival.",
      poster: "/placeholder.svg",
      start_date: "2025-01-22",
      start_time: "10:00:00",
      end_date: "2025-01-24",
      end_time: "22:00:00",
      location: "Gelora Bung Karno, Jakarta",
      status: "active",
      is_published: true,
      is_public: true,
      contact_phone: "+62-21-555-0011",
      tnc_id: 1,
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-01T10:00:00Z",
      facilities: [],
      tickets: [{ 
        id: 11, 
        event_id: 11,
        ticket_type_id: 1,
        name: "Festival Pass", 
        price: "100000", 
        description: "3-day access",
        stock: 1000,
        limit: 5,
        start_date: "2025-01-01",
        end_date: "2025-01-22",
        created_at: "2024-12-01T10:00:00Z",
        updated_at: "2024-12-01T10:00:00Z"
      }],
    },
    {
      id: 12,
      eo_id: 1,
      name: "Jakarta Startup Summit",
      description: "Connect with investors, mentors, and fellow entrepreneurs at Jakarta's biggest startup event.",
      poster: "/placeholder.svg",
      start_date: "2025-01-25",
      start_time: "09:00:00",
      end_date: "2025-01-25",
      end_time: "18:00:00",
      location: "The Ritz-Carlton Jakarta",
      status: "active",
      is_published: true,
      is_public: true,
      contact_phone: "+62-21-555-0012",
      tnc_id: 1,
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-01T10:00:00Z",
      facilities: [],
      tickets: [{ 
        id: 12, 
        event_id: 12,
        ticket_type_id: 1,
        name: "Summit Ticket", 
        price: "500000", 
        description: "Full day access + lunch",
        stock: 300,
        limit: 2,
        start_date: "2025-01-01",
        end_date: "2025-01-25",
        created_at: "2024-12-01T10:00:00Z",
        updated_at: "2024-12-01T10:00:00Z"
      }],
    },
    {
      id: 13,
      eo_id: 1,
      name: "Jakarta Night Market",
      description: "Experience the vibrant night market culture with local food, crafts, and entertainment.",
      poster: "/placeholder.svg",
      start_date: "2025-01-26",
      start_time: "18:00:00",
      end_date: "2025-01-26",
      end_time: "23:00:00",
      location: "Lapangan Banteng, Jakarta",
      status: "active",
      is_published: true,
      is_public: true,
      contact_phone: "+62-21-555-0013",
      tnc_id: 1,
      created_at: "2024-12-01T10:00:00Z",
      updated_at: "2024-12-01T10:00:00Z",
      facilities: [],
      tickets: [{ 
        id: 13, 
        event_id: 13,
        ticket_type_id: 1,
        name: "Free Entry", 
        price: "0", 
        description: "Open to public",
        stock: 0,
        limit: 10,
        start_date: "2025-01-01",
        end_date: "2025-01-26",
        created_at: "2024-12-01T10:00:00Z",
        updated_at: "2024-12-01T10:00:00Z"
      }],
    }
  ])
  const [locations, setLocations] = useState<string[]>(['Jakarta', 'Bandung', 'Bekasi', 'Surabaya'])
  const [loading, setLoading] = useState(false) // Set to false so hardcoded data shows immediately
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'today' | 'week' | 'month' | 'year'>('week')
  const [selectedLocation, setSelectedLocation] = useState<string>('jakarta')

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        console.log('=== HOMEPAGE DATA FETCH START ===')
        console.log('Environment NEXT_PUBLIC_USE_MOCKS:', process.env.NEXT_PUBLIC_USE_MOCKS)
        
        // Fetch events data first
        console.log('Fetching events...')
        const eventsResponse = await eventApi.getPublicEvents(1, {})
        console.log('Events response:', eventsResponse)
        if (eventsResponse.success) {
          setEvents(eventsResponse.data?.data || [])
        }
        
        // Fetch top selling events
        console.log('Fetching top selling events...')
        const topSellingResponse = await eventApi.getTopSellingEvents(4)
        console.log('Top selling response:', topSellingResponse)
        if (topSellingResponse.success && topSellingResponse.data?.data?.length > 0) {
          console.log('Setting top selling events:', topSellingResponse.data?.data)
          setTopSellingEvents(topSellingResponse.data?.data)
        }
        // Don't clear hardcoded data if API fails
        
        // Fetch workshop events
        console.log('Fetching workshop events...')
        const workshopResponse = await eventApi.getWorkshopEvents(6)
        console.log('Workshop response:', workshopResponse)
        if (workshopResponse.success && workshopResponse.data?.data?.length > 0) {
          setWorkshopEvents(workshopResponse.data?.data)
        }
        // Don't clear hardcoded data if API fails
        
        // Fetch favorite EO owners
        console.log('Fetching favorite EOs...')
        const favoriteEOResponse = await eventApi.getFavoriteEOOwners(6)
        console.log('Favorite EO response:', favoriteEOResponse)
        if (favoriteEOResponse.success && favoriteEOResponse.data?.length > 0) {
          setFavoriteEOs(favoriteEOResponse.data)
        }
        // Don't clear hardcoded data if API fails
        
        // Fetch time filtered events
        console.log('Fetching time filtered events...')
        const timeEventsResponse = await eventApi.getEventsByTimePeriod(selectedTimePeriod, 6)
        console.log('Time events response:', timeEventsResponse)
        if (timeEventsResponse.success) {
          setTimeFilteredEvents(timeEventsResponse.data?.data || [])
        } else {
          setTimeFilteredEvents([])
        }
        
        // Fetch location filtered events
        console.log('Fetching location filtered events...')
        const locationEventsResponse = await eventApi.getEventsByLocation(selectedLocation, 6)
        console.log('Location events response:', locationEventsResponse)
        if (locationEventsResponse.success) {
          setLocationFilteredEvents(locationEventsResponse.data?.data || [])
        } else {
          setLocationFilteredEvents([])
        }
        
        // Fetch locations
        console.log('Fetching locations...')
        const locationsResponse = await eventApi.getEventLocations()
        console.log('Locations response:', locationsResponse)
        if (locationsResponse.success) {
          setLocations(locationsResponse.data || ['Jakarta', 'Bandung', 'Bekasi', 'Surabaya'])
        } else {
          setLocations(['Jakarta', 'Bandung', 'Bekasi', 'Surabaya'])
        }
        
        console.log('=== HOMEPAGE DATA FETCH COMPLETE ===')
        
      } catch (error) {
        console.error("Failed to fetch homepage data:", error)
        // DON'T clear the hardcoded initial data - just keep what we have
        setLocations(['Jakarta', 'Bandung', 'Bekasi', 'Surabaya'])
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [selectedTimePeriod, selectedLocation])

  const handleTimePeriodChange = async (period: 'today' | 'week' | 'month' | 'year') => {
    setSelectedTimePeriod(period)
    try {
      const response = await eventApi.getEventsByTimePeriod(period, 6)
      if (response.success) {
        setTimeFilteredEvents(response.data.data)
      }
    } catch (error) {
      console.error("Failed to fetch time filtered events:", error)
    }
  }

  const handleLocationChange = async (location: string) => {
    setSelectedLocation(location)
    try {
      const response = await eventApi.getEventsByLocation(location, 6)
      if (response.success) {
        setLocationFilteredEvents(response.data.data)
      }
    } catch (error) {
      console.error("Failed to fetch location filtered events:", error)
    }
  }
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
                { name: 'Music', icon: Music, count: 45 },
                { name: 'Business', icon: Briefcase, count: 32 },
                { name: 'Sports', icon: Trophy, count: 28 },
                { name: 'Arts', icon: Palette, count: 21 },
                { name: 'Tech', icon: Monitor, count: 19 },
                { name: 'Food', icon: UtensilsCrossed, count: 16 }
              ].map((category) => (
                <Link key={category.name} href={`/events?category=${category.name.toLowerCase()}`}>
                  <div className="group p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-[#002547] hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-[#002547]/10 flex items-center justify-center mb-4 group-hover:bg-[#002547]/20 transition-colors duration-300">
                        <category.icon className="h-8 w-8 text-[#002547]" />
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

        {/* Top Selling Events Section - Ranking Board Style */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-[#002547] text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Award className="h-4 w-4" />
                Top Selling Events
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-[#002547]">
                Sales Leaderboard
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
                Most popular events ranked by ticket sales
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {loading ? (
                Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="flex items-center gap-6 p-6 mb-4 bg-gray-50 rounded-xl animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="w-24 h-20 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-8 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))
              ) : topSellingEvents && topSellingEvents.length > 0 ? (
                topSellingEvents.map((event, index) => (
                  <div key={event.id} className="group flex items-center gap-6 p-6 mb-4 bg-gray-50 hover:bg-[#002547]/5 rounded-xl border border-gray-200 hover:border-[#002547]/20 transition-all duration-300">
                    {/* Ranking Badge */}
                    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-gradient-to-br from-[#002547] to-[#003868]'
                    }`}>
                      {index + 1}
                      {index === 0 && <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white fill-white" />
                      </div>}
                    </div>

                    {/* Event Image */}
                    <div className="w-24 h-20 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={getEventPosterUrl(event.poster)}
                        alt={event.name}
                        width={96}
                        height={80}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Event Details */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#002547] transition-colors">
                        {event.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(event.start_date + 'T' + (event.start_time || '00:00:00')), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>

                    {/* Sales Stats & Price */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#002547] mb-1">
                        {(event as any).sold_count?.toLocaleString() || '1,250'} sold
                      </div>
                      <div className="text-lg font-semibold text-gray-600 mb-3">
                        {event.tickets && event.tickets && event.tickets.length > 0 && Number(event.tickets[0].price) > 0 
                          ? `Rp ${Number(event.tickets[0].price).toLocaleString()}`
                          : 'Free'
                        }
                      </div>
                      <Link href={`/events/${event.id}`}>
                        <Button size="sm" className="bg-[#002547] hover:bg-[#002547]/90">
                          View Event
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No top selling events available at the moment.</p>
                  <p className="text-gray-500 text-sm">Check back later for popular events!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Workshop Events Section */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <GraduationCap className="h-4 w-4" />
                Learning & Development
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-[#002547]">
                Workshop Events
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
                Enhance your skills with hands-on workshops and professional training sessions
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-xl border bg-white p-6">
                    <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : workshopEvents && workshopEvents.length > 0 ? (
                workshopEvents.map((event) => (
                  <div key={event.id} className="group relative overflow-hidden rounded-xl border bg-white p-6 hover:shadow-lg transition-all duration-300">
                    <div className="w-full h-48 overflow-hidden rounded-lg bg-gray-100 mb-4">
                      <Image
                        src={getEventPosterUrl(event.poster)}
                        alt={event.name}
                        width={400}
                        height={200}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105 duration-300"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-medium">
                          Workshop
                        </span>
                        {(event as any).workshop_type && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            {(event as any).workshop_type}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{event.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(event.start_date), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Link href={`/events/${event.id}`}>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Register Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                        <span className="text-sm font-medium text-gray-900">
                          {event.tickets && event.tickets.length > 0 && Number(event.tickets[0].price) > 0 
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
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No workshop events available at the moment.</p>
                  <p className="text-gray-500 text-sm">Check back later for learning opportunities!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Favorite EO Owners Section */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Heart className="h-4 w-4" />
                Top Event Organizers
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-[#002547]">
                Favorite Event Creators
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
                Discover amazing events from our most loved event organizers
              </p>
            </div>

            {/* Horizontal scrollable container for favorite EOs */}
            <div className="relative">
              <div className="overflow-x-auto scrollbar-hide pb-4">
                <div className="flex gap-6 min-w-max">
                  {loading ? (
                    Array.from({ length: 6 }, (_, i) => (
                      <div key={i} className="group p-6 bg-white border rounded-xl w-80 flex-shrink-0">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                        <div className="flex gap-2 mb-4">
                          <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))
                  ) : favoriteEOs && favoriteEOs.length > 0 ? (
                    favoriteEOs.map((eo) => (
                      <div key={eo.id} className="group p-6 bg-white border rounded-xl hover:shadow-lg transition-all duration-300 w-80 flex-shrink-0">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 overflow-hidden rounded-full bg-gray-100">
                            <Image
                              src={eo.logo || "/placeholder.svg"}
                              alt={eo.name}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{eo.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span>{eo.average_rating}</span>
                              <span>•</span>
                              <span>{eo.total_events} events</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{eo.description}</p>
                        <div className="flex -space-x-2 mb-4">
                          {eo.recent_events?.slice(0, 3).map((event: any, idx: number) => (
                            <div key={event.id} className="w-12 h-12 overflow-hidden rounded-lg border-2 border-white">
                              <Image
                                src={getEventPosterUrl(event.poster)}
                                alt={event.name}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ))}
                          {eo.events_count > 3 && (
                            <div className="w-12 h-12 bg-gray-100 border-2 border-white rounded-lg flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">+{eo.events_count - 3}</span>
                            </div>
                          )}
                        </div>
                        <Link href={`/events?organizer=${eo.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            View Events
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 w-full">
                      <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No favorite organizers available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Time-based Events Section */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Calendar className="h-4 w-4" />
                Events by Time
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-[#002547]">
                Happening Soon
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg mb-8">
                Discover events happening in your preferred timeframe
              </p>
              
              <div className="flex justify-center mb-8">
                <Select value={selectedTimePeriod} onValueChange={handleTimePeriodChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-xl border bg-white p-4">
                    <div className="w-full h-40 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                    <div className="h-5 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : timeFilteredEvents && timeFilteredEvents.length > 0 ? (
                timeFilteredEvents.map((event) => (
                  <div key={event.id} className="group relative overflow-hidden rounded-xl border bg-white p-4 hover:shadow-lg transition-all duration-300">
                    <div className="w-full h-40 overflow-hidden rounded-lg bg-gray-100 mb-4">
                      <Image
                        src={getEventPosterUrl(event.poster)}
                        alt={event.name}
                        width={300}
                        height={160}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105 duration-300"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{event.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(event.start_date), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline" size="sm">
                          View Event
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                      <span className="text-sm font-medium text-gray-900">
                        {event.tickets && event.tickets.length > 0 && Number(event.tickets[0].price) > 0 
                          ? `Rp ${Number(event.tickets[0].price).toLocaleString()}`
                          : 'Free'
                        }
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No events found for the selected time period.</p>
                  <p className="text-gray-500 text-sm">Try selecting a different time period.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Location-based Events Section */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <MapPin className="h-4 w-4" />
                Events by Location
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4 text-[#002547]">
                Events Near You
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg mb-8">
                Find exciting events in your city or explore what's happening elsewhere
              </p>
              
              <div className="flex justify-center mb-8">
                <Select value={selectedLocation} onValueChange={handleLocationChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations && locations.length > 0 ? locations.map((location) => (
                      <SelectItem key={location.toLowerCase()} value={location.toLowerCase()}>
                        {location}
                      </SelectItem>
                    )) : (
                      ['Jakarta', 'Bandung', 'Bekasi', 'Surabaya'].map((location) => (
                        <SelectItem key={location.toLowerCase()} value={location.toLowerCase()}>
                          {location}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="group relative overflow-hidden rounded-xl border bg-white p-4">
                    <div className="w-full h-40 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                    <div className="h-5 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : locationFilteredEvents && locationFilteredEvents.length > 0 ? (
                locationFilteredEvents.map((event) => (
                  <div key={event.id} className="group relative overflow-hidden rounded-xl border bg-white p-4 hover:shadow-lg transition-all duration-300">
                    <div className="w-full h-40 overflow-hidden rounded-lg bg-gray-100 mb-4">
                      <Image
                        src={getEventPosterUrl(event.poster)}
                        alt={event.name}
                        width={300}
                        height={160}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105 duration-300"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{event.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(event.start_date), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-1 text-indigo-500" />
                      <span className="line-clamp-1 font-medium">{event.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline" size="sm">
                          View Event
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                      <span className="text-sm font-medium text-gray-900">
                        {event.tickets && event.tickets.length > 0 && Number(event.tickets[0].price) > 0 
                          ? `Rp ${Number(event.tickets[0].price).toLocaleString()}`
                          : 'Free'
                        }
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No events found in {selectedLocation}.</p>
                  <p className="text-gray-500 text-sm">Try selecting a different location.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Hot Events Section - Keep as Trending Events but update position */}
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
              ) : events && events.length > 0 ? (
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
                          {event.tickets && event.tickets.length > 0 && Number(event.tickets[0].price) > 0 
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
