"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ticket, Users, Calendar, Shield, Heart, Star, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const features = [
    {
      icon: <Ticket className="size-6" />,
      title: "Easy Ticket Booking",
      description: "Book tickets for your favorite events with just a few clicks. Our streamlined process makes it simple and secure."
    },
    {
      icon: <Users className="size-6" />,
      title: "Event Management",
      description: "Comprehensive tools for event organizers to create, manage, and promote their events effectively."
    },
    {
      icon: <Calendar className="size-6" />,
      title: "Event Discovery",
      description: "Discover amazing events happening around you. Filter by category, date, and location to find what interests you."
    },
    {
      icon: <Shield className="size-6" />,
      title: "Secure Payments",
      description: "Your payments are protected with industry-standard security measures and encryption."
    }
  ]

  const stats = [
    { number: "10,000+", label: "Events Hosted" },
    { number: "500,000+", label: "Tickets Sold" },
    { number: "50,000+", label: "Happy Customers" },
    { number: "1,000+", label: "Event Organizers" }
  ]

  const values = [
    {
      icon: <Heart className="size-5" />,
      title: "Customer First",
      description: "We prioritize our customers' experience in everything we do"
    },
    {
      icon: <Star className="size-5" />,
      title: "Excellence",
      description: "We strive for excellence in our platform and service quality"
    },
    {
      icon: <Users className="size-5" />,
      title: "Community",
      description: "Building connections between event organizers and attendees"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-primary/10 rounded-full">
              <Ticket className="size-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About <span className="text-primary">ZaTix</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Indonesia's premier event ticketing platform connecting event organizers with audiences. 
            We make discovering, booking, and managing events simple and enjoyable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/events">
                Explore Events
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">
                Join ZaTix
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-8">
              At ZaTix, we believe that great events bring people together and create lasting memories. 
              Our mission is to democratize event access and empower organizers with the tools they need 
              to create extraordinary experiences.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        {value.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose ZaTix?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide comprehensive solutions for both event organizers and attendees, 
              making event management and ticket booking effortless.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl text-center">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Story</h2>
            <div className="space-y-8">
              <div className="text-lg text-muted-foreground">
                <p className="mb-6">
                  ZaTix was founded in 2023 with a simple vision: to make event discovery and booking 
                  accessible to everyone in Indonesia. We saw the challenges faced by both event organizers 
                  and attendees in the fragmented ticketing landscape.
                </p>
                <p className="mb-6">
                  Starting as a small team of passionate developers and event enthusiasts, we built ZaTix 
                  to address the gaps in the market. Our platform focuses on user experience, security, 
                  and providing tools that actually work for Indonesian event organizers.
                </p>
                <p>
                  Today, we're proud to serve thousands of event organizers and hundreds of thousands of 
                  event-goers across Indonesia. From intimate workshops to large-scale festivals, ZaTix 
                  continues to be the trusted platform for event success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers and attendees who trust ZaTix for their event needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">
                Create Account
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/events">
                Browse Events
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}