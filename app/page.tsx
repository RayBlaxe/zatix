import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Carousel } from "@/components/carousel"
import { Header } from "@/components/header"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-6">
          <div className="container">
            <Carousel />
          </div>
        </section>

        <section className="py-12 bg-muted/40">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Upcoming Events</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover and join our upcoming events. From workshops to conferences, we have something for everyone.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="group relative overflow-hidden rounded-lg border bg-background p-2">
                  <div className="aspect-video overflow-hidden rounded-md bg-muted">
                    <img
                      src={`/placeholder.svg?height=300&width=500&text=Event+${i}`}
                      alt={`Event ${i}`}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold">Event {i}</h3>
                    <p className="text-sm text-muted-foreground mb-2">June {10 + i}, 2024 • Virtual</p>
                    <p className="line-clamp-2 text-sm">
                      Join us for this amazing event that will transform your perspective and provide valuable insights.
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <Link href={`/event/${i}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <span className="text-sm font-medium">Free</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/dashboard">
                <Button variant="outline" size="lg">
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
            © 2024 Event Platform. All rights reserved.
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
