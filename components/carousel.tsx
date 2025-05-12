"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

const slides = [
  {
    id: 1,
    title: "Create and Manage Events with Ease",
    description: "Our platform makes it simple to create, manage, and promote your events.",
    image: "/placeholder.svg?height=600&width=1200&text=Create+and+Manage+Events",
    cta: "Get Started",
    link: "/wizard",
  },
  {
    id: 2,
    title: "Connect with Attendees",
    description: "Engage with your audience before, during, and after your events.",
    image: "/placeholder.svg?height=600&width=1200&text=Connect+with+Attendees",
    cta: "Learn More",
    link: "#",
  },
  {
    id: 3,
    title: "Analyze Event Performance",
    description: "Get insights into your event performance with detailed analytics.",
    image: "/placeholder.svg?height=600&width=1200&text=Analyze+Event+Performance",
    cta: "View Dashboard",
    link: "/dashboard",
  },
]

export function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="relative min-w-full">
            <div className="aspect-[21/9] w-full overflow-hidden rounded-xl">
              <img src={slide.image || "/placeholder.svg"} alt={slide.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
              <h2 className="text-2xl md:text-4xl font-bold mb-2">{slide.title}</h2>
              <p className="text-sm md:text-lg mb-4 max-w-xl">{slide.description}</p>
              <Link href={slide.link}>
                <Button variant="default" size="lg">
                  {slide.cta}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full ${currentSlide === index ? "bg-primary" : "bg-primary/30"}`}
            onClick={() => setCurrentSlide(index)}
          >
            <span className="sr-only">Go to slide {index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
