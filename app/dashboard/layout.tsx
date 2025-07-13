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
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <DashboardSidebar />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
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
                width={80}
                height={80}
                className="h-30 w-30"
              />
            </Link>
          </div>

          <main className="flex-1 overflow-y-auto bg-muted/20 p-4">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
