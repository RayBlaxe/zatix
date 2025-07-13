"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ticket, Users, Calendar, Shield, Heart, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { BlurFade } from "@/components/ui/blur-fade"
import { DotPattern } from "@/components/ui/dot-pattern"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"
import { cn } from "@/lib/utils"

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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-secondary/5 to-background overflow-hidden">
          <DotPattern
            className={cn(
              "opacity-30",
              "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
            )}
          />
          <div className="container mx-auto text-center relative z-10">
            <BlurFade delay={0.25} inView>
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Ticket className="size-16 text-primary" />
                </div>
              </div>
            </BlurFade>
            <BlurFade delay={0.5} inView>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                About <span className="text-primary">ZaTix</span>
              </h1>
            </BlurFade>
            <BlurFade delay={0.75} inView>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Indonesia's premier event ticketing platform connecting event organizers with audiences. 
                We make discovering, booking, and managing events simple and enjoyable.
              </p>
            </BlurFade>
            <BlurFade delay={1} inView>
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
            </BlurFade>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto">
            <BlurFade delay={0.25} inView>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <BlurFade key={index} delay={0.5 + index * 0.1} inView>
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                        {stat.number}
                      </div>
                      <div className="text-muted-foreground">{stat.label}</div>
                    </div>
                  </BlurFade>
                ))}
              </div>
            </BlurFade>
          </div>
        </section>

        {/* Mission Section */}
        <section className="relative py-20 bg-muted/30 overflow-hidden">
          <AnimatedGridPattern
            numSquares={30}
            maxOpacity={0.1}
            duration={3}
            repeatDelay={1}
            className={cn(
              "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
              "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
            )}
          />
          <div className="container mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <BlurFade delay={0.25} inView>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              </BlurFade>
              <BlurFade delay={0.5} inView>
                <p className="text-lg text-muted-foreground mb-8">
                  At ZaTix, we believe that great events bring people together and create lasting memories. 
                  Our mission is to democratize event access and empower organizers with the tools they need 
                  to create extraordinary experiences.
                </p>
              </BlurFade>
              <div className="grid md:grid-cols-3 gap-8">
                {values.map((value, index) => (
                  <BlurFade key={index} delay={0.75 + index * 0.2} inView>
                    <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
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
                  </BlurFade>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <BlurFade delay={0.25} inView>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose ZaTix?</h2>
              </BlurFade>
              <BlurFade delay={0.5} inView>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  We provide comprehensive solutions for both event organizers and attendees, 
                  making event management and ticket booking effortless.
                </p>
              </BlurFade>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <BlurFade key={index} delay={0.75 + index * 0.1} inView>
                  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
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
                </BlurFade>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <BlurFade delay={0.25} inView>
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Story</h2>
              </BlurFade>
              <div className="space-y-8">
                <div className="text-lg text-muted-foreground">
                  <BlurFade delay={0.5} inView>
                    <p className="mb-6">
                      ZaTix was founded in 2023 with a simple vision: to make event discovery and booking 
                      accessible to everyone in Indonesia. We saw the challenges faced by both event organizers 
                      and attendees in the fragmented ticketing landscape.
                    </p>
                  </BlurFade>
                  <BlurFade delay={0.75} inView>
                    <p className="mb-6">
                      Starting as a small team of passionate developers and event enthusiasts, we built ZaTix 
                      to address the gaps in the market. Our platform focuses on user experience, security, 
                      and providing tools that actually work for Indonesian event organizers.
                    </p>
                  </BlurFade>
                  <BlurFade delay={1} inView>
                    <p>
                      Today, we're proud to serve thousands of event organizers and hundreds of thousands of 
                      event-goers across Indonesia. From intimate workshops to large-scale festivals, ZaTix 
                      continues to be the trusted platform for event success.
                    </p>
                  </BlurFade>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 bg-primary/5 overflow-hidden">
          <DotPattern
            className={cn(
              "opacity-20",
              "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
            )}
          />
          <div className="container mx-auto text-center relative z-10">
            <BlurFade delay={0.25} inView>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
            </BlurFade>
            <BlurFade delay={0.5} inView>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of event organizers and attendees who trust ZaTix for their event needs.
              </p>
            </BlurFade>
            <BlurFade delay={0.75} inView>
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
            </BlurFade>
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