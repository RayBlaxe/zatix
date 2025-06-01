"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CarouselManager } from "@/components/content/carousel-manager"
import { FeaturedEventsManager } from "@/components/content/featured-events-manager"
import { EventCategoriesManager } from "@/components/content/event-categories-manager"

export default function HomeContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Home Content Management</h1>
        <p className="text-muted-foreground">
          Manage carousel items, featured events, and event categories for your homepage.
        </p>
      </div>

      <Tabs defaultValue="carousel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="carousel">Carousel</TabsTrigger>
          <TabsTrigger value="featured">Featured Events</TabsTrigger>
          <TabsTrigger value="categories">Event Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="carousel">
          <CarouselManager />
        </TabsContent>

        <TabsContent value="featured">
          <FeaturedEventsManager />
        </TabsContent>

        <TabsContent value="categories">
          <EventCategoriesManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
