"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Users,
  ChevronDown,
  ChevronRight,
  FileText,
  Home,
  DollarSign,
  Ticket,
  Shield,
  UserCheck,
  CheckCircle,
  PlusCircle,
  ShoppingCart,
  Tag,
  Receipt,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Image from "next/image";

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps = {}) {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();
  const router = useRouter();
  const [contentManagementOpen, setContentManagementOpen] = useState(
    pathname.startsWith("/dashboard/content")
  );
  const [financeOpen, setFinanceOpen] = useState(
    pathname.startsWith("/dashboard/finance")
  );

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const baseRoutes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    // Events route - exclude for super-admin
    ...(hasRole("super-admin") ? [] : [
      {
        label: "Events",
        icon: CalendarDays,
        href: "/dashboard/events",
        active: pathname === "/dashboard/events" || pathname.startsWith("/dashboard/events/"),
      },
    ]),
  ];

  const eoRoutes = [
    {
      label: "Profile",
      icon: UserCheck,
      href: "/dashboard/profile",
      active: pathname === "/dashboard/profile" || pathname.startsWith("/dashboard/profile/"),
    },
    {
      label: "Roles & Permissions",
      icon: Users,
      href: "/dashboard/roles",
      active: pathname === "/dashboard/roles",
    },
  ];

  // Event PIC specific routes - focused on assigned event management
  const eventPICRoutes = [
    {
      label: "My Assigned Events",
      icon: CalendarDays,
      href: "/dashboard/events/assigned",
      active: pathname === "/dashboard/events/assigned" || pathname.startsWith("/dashboard/events/assigned/"),
    },
    {
      label: "Event Staff",
      icon: Users,
      href: "/dashboard/staff",
      active: pathname === "/dashboard/staff",
    },
    {
      label: "Event Finance",
      icon: DollarSign,
      href: "/dashboard/finance/event",
      active: pathname === "/dashboard/finance/event",
    },
    {
      label: "Profile",
      icon: UserCheck,
      href: "/dashboard/profile",
      active: pathname === "/dashboard/profile" || pathname.startsWith("/dashboard/profile/"),
    },
  ];

  // Staff routes - for crew, finance, cashier (more limited access)
  const staffRoutes = [
    {
      label: "My Tasks",
      icon: CalendarDays,
      href: "/dashboard/tasks",
      active: pathname === "/dashboard/tasks",
    },
    {
      label: "Profile",
      icon: UserCheck,
      href: "/dashboard/profile",
      active: pathname === "/dashboard/profile" || pathname.startsWith("/dashboard/profile/"),
    },
  ];

  const adminRoutes = [
    {
      label: "Document Verification",
      icon: CheckCircle,
      href: "/dashboard/admin/verification",
      active: pathname === "/dashboard/admin/verification" || pathname.startsWith("/dashboard/admin/verification/"),
    },
    {
      label: "Category Management",
      icon: Tag,
      href: "/dashboard/admin/categories",
      active: pathname === "/dashboard/admin/categories",
    },
    {
      label: "Terms & Conditions",
      icon: Shield,
      href: "/dashboard/tnc",
      active: pathname === "/dashboard/tnc",
    },
  ];

  // Finance routes - available for finance staff, EO owners, and super-admin
  const financeRoutes = [
    {
      label: "Overview",
      icon: BarChart3,
      href: "/dashboard/finance",
      active: pathname === "/dashboard/finance" && !pathname.includes("/transactions"),
    },
    {
      label: "Transactions",
      icon: Receipt,
      href: "/dashboard/finance/transactions",
      active: pathname === "/dashboard/finance/transactions",
    },
  ];

  // Filter routes based on user role
  const routes = [
    ...baseRoutes,
    ...(hasRole("eo-owner") ? eoRoutes : []),
    ...(hasRole("event-pic") ? eventPICRoutes : []),
    ...(hasRole("crew") || hasRole("finance") || hasRole("cashier") ? staffRoutes : []),
    ...(hasRole("super-admin") ? adminRoutes : []),
  ];

  const contentManagementRoutes = [
    {
      label: "Home",
      icon: Home,
      href: "/dashboard/content/home",
      active: pathname === "/dashboard/content/home",
    }
  ];

  // Show finance section for finance staff, Event PICs (for their events), EO owners, and super-admin
  const showFinance = hasRole("finance") || hasRole("event-pic") || hasRole("eo-owner") || hasRole("super-admin");

  return (
    <div className="flex h-full flex-col border-r" style={{ backgroundColor: '#002547' }}>
      <div className="flex h-14 items-center border-b border-white/20 px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/zatix-putih.png"
            alt="ZaTix Logo"
            width={60}
            height={60}
            className="h-20 w-20"
          />
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 gap-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-white/10 hover:text-white",
                route.active ? "bg-white/20 text-white" : "transparent"
              )}
            >
              <route.icon className="size-4" />
              {route.label}
            </Link>
          ))}

          {/* Finance Management - for finance staff, EO owners, and super-admin */}
          {showFinance && (
            <Collapsible open={financeOpen} onOpenChange={setFinanceOpen}>
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-white/10 hover:text-white",
                    pathname.startsWith("/dashboard/finance")
                      ? "bg-white/20 text-white"
                      : "transparent"
                  )}
                >
                  <DollarSign className="size-4" />
                  Finance
                  {financeOpen ? (
                    <ChevronDown className="ml-auto size-4" />
                  ) : (
                    <ChevronRight className="ml-auto size-4" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                {financeRoutes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 ml-4 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white",
                      route.active ? "bg-white/20 text-white" : "transparent"
                    )}
                  >
                    <route.icon className="size-3" />
                    {route.label}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Content Management - Only for super-admin */}
          {hasRole("super-admin") && (
            <Collapsible open={contentManagementOpen} onOpenChange={setContentManagementOpen}>
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-white/10 hover:text-white",
                    pathname.startsWith("/dashboard/content")
                      ? "bg-white/20 text-white"
                      : "transparent"
                  )}
                >
                  <FileText className="size-4" />
                  Content Management
                  {contentManagementOpen ? (
                    <ChevronDown className="ml-auto size-4" />
                  ) : (
                    <ChevronRight className="ml-auto size-4" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                {contentManagementRoutes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 ml-4 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white",
                      route.active ? "bg-white/20 text-white" : "transparent"
                    )}
                  >
                    <route.icon className="size-3" />
                    {route.label}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </nav>
      </div>
      <div className="mt-auto border-t border-white/20 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Avatar className="size-8">
            <AvatarFallback className="bg-white/20 text-white">{user?.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none text-white">{user?.name}</p>
            <p className="text-xs text-white/70">{user?.email}</p>
            <p className="text-xs text-white/70">
              {user?.currentRole === "eo-owner"
                ? "Event Organizer"
                : user?.currentRole === "super-admin"
                  ? "Super Admin"
                  : user?.currentRole === "event-pic"
                    ? "Event PIC"
                    : user?.currentRole === "crew"
                      ? "Crew"
                      : user?.currentRole === "finance"
                        ? "Finance"
                        : user?.currentRole === "cashier"
                          ? "Cashier"
                          : "Customer"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <Button variant="outline" size="sm" onClick={handleLogout} className="!text-red-100 border-red-300/50 bg-red-900/30 hover:bg-red-600/50 hover:!text-white hover:border-red-200 ">
            <LogOut className="mr-2 size-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
