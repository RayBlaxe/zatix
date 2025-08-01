"use client"
import { CarouselManager } from "@/components/content/carousel-manager"

export default function HomeContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Carousel Management</h1>
        <p className="text-muted-foreground">
          Manage carousel slides for your homepage.
        </p>
      </div>

      <CarouselManager />
    </div>
  )
}
