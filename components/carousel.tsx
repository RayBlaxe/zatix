"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { carouselApi } from "@/lib/api"
import { CarouselItem } from "@/types/carousel"

export function Carousel() {
  const [slides, setSlides] = useState<CarouselItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  useEffect(() => {
    const fetchCarousels = async () => {
      try {
        setLoading(true)
        const response = await carouselApi.getCarousels()
        if (response.success) {
          // Filter only active carousels and sort by order
          const activeSlides = response.data
            .filter((slide: CarouselItem) => slide.is_active === 1)
            .sort((a: CarouselItem, b: CarouselItem) => parseInt(a.order) - parseInt(b.order))
          setSlides(activeSlides)
        } else {
          setError("Failed to load carousel data")
        }
      } catch (err) {
        setError("Failed to load carousel data")
        console.error("Error fetching carousel data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCarousels()
  }, [])

  useEffect(() => {
    if (slides.length > 0) {
      const interval = setInterval(() => {
        nextSlide()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [slides.length])

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-xl">
        <div className="aspect-[3/1] sm:aspect-[4/1] w-full flex items-center justify-center bg-muted">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading carousel...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || slides.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl">
        <div className="aspect-[3/1] sm:aspect-[4/1] w-full flex items-center justify-center bg-muted">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {error || "No carousel data available"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="relative min-w-full">
            <div className="aspect-[3/1] sm:aspect-[4/1] w-full overflow-hidden rounded-xl">
              <img 
                src={slide.image_url || "/placeholder.svg"} 
                alt={slide.title} 
                className="h-full w-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10 pl-12 sm:pl-16 md:pl-20 text-white">
              <h2 className="text-lg sm:text-2xl md:text-4xl font-bold mb-1 sm:mb-2">{slide.title}</h2>
              <p className="text-xs sm:text-sm md:text-lg mb-2 sm:mb-4 max-w-xl line-clamp-2 sm:line-clamp-none">{slide.caption}</p>
              {slide.link_url && (
                <Link href={slide.link_url} target={slide.link_target}>
                  <Button variant="default" size="sm" className="sm:size-lg">
                    Learn More
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 border-0 h-8 w-8 sm:h-10 sm:w-10 text-white hover:text-white transition-all duration-300 opacity-0 hover:opacity-100"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="sr-only">Previous slide</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 border-0 h-8 w-8 sm:h-10 sm:w-10 text-white hover:text-white transition-all duration-300 opacity-0 hover:opacity-100"
            onClick={nextSlide}
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="sr-only">Next slide</span>
          </Button>

          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-colors ${currentSlide === index ? "bg-white" : "bg-white/40"}`}
                onClick={() => setCurrentSlide(index)}
              >
                <span className="sr-only">Go to slide {index + 1}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
