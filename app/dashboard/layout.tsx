"use client";
import type React from "react";
import { useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Ticket } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <ProtectedRoute requiredRoles={["eo-owner", "super-admin"]}>
      <div className="flex min-h-screen"> {/* Changed from h-screen overflow-hidden */}
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:h-screen">
          <DashboardSidebar />
        </div>
        
        <div className="flex flex-1 flex-col md:ml-64"> {/* Added md:ml-64 for sidebar offset */}
          {/* Mobile Header */}
          <div className="flex h-14 items-center border-b bg-background px-4 md:hidden">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <DashboardSidebar onNavigate={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/zatix-logo.png"
                alt="ZaTix Logo"
                width={0}
                height={0}
                sizes="100vw"
                className="h-6 w-auto"
              />
            </Link>
          </div>
          
          <main className="flex-1 bg-muted/20 p-4"> {/* Removed overflow-y-auto */}
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}