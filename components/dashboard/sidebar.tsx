"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Users,
  FileText,
  DollarSign,
  Shield,
  UserCheck,
  CheckCircle,
  Tag,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps = {}) {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Define routes based on user role - clean and simple
  const getRoutesForRole = () => {
    if (hasRole("super-admin")) {
      return [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "/dashboard",
          active: pathname === "/dashboard",
        },
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
          label: "Finance",
          icon: DollarSign,
          href: "/dashboard/finance",
          active: pathname.startsWith("/dashboard/finance"),
        },
        {
          label: "Content Management",
          icon: FileText,
          href: "/dashboard/content/home",
          active: pathname.startsWith("/dashboard/content"),
        },
        {
          label: "Terms & Conditions",
          icon: Shield,
          href: "/dashboard/tnc",
          active: pathname === "/dashboard/tnc",
        },
      ]
    }

    if (hasRole("eo-owner")) {
      return [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "/dashboard",
          active: pathname === "/dashboard",
        },
        {
          label: "Events",
          icon: CalendarDays,
          href: "/dashboard/events",
          active: pathname === "/dashboard/events" || pathname.startsWith("/dashboard/events/"),
        },
        {
          label: "Finance",
          icon: DollarSign,
          href: "/dashboard/finance",
          active: pathname.startsWith("/dashboard/finance"),
        },
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
      ]
    }

    if (hasRole("event-pic")) {
      return [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "/dashboard",
          active: pathname === "/dashboard",
        },
        {
          label: "My Events",
          icon: CalendarDays,
          href: "/dashboard/events/assigned",
          active: pathname === "/dashboard/events/assigned" || pathname.startsWith("/dashboard/events/"),
        },
        {
          label: "Event Staff",
          icon: Users,
          href: "/dashboard/staff",
          active: pathname === "/dashboard/staff",
        },
        {
          label: "Finance",
          icon: DollarSign,
          href: "/dashboard/finance",
          active: pathname.startsWith("/dashboard/finance"),
        },
        {
          label: "Profile",
          icon: UserCheck,
          href: "/dashboard/profile",
          active: pathname === "/dashboard/profile" || pathname.startsWith("/dashboard/profile/"),
        },
      ]
    }

    if (hasRole("finance")) {
      return [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "/dashboard",
          active: pathname === "/dashboard",
        },
        {
          label: "Finance",
          icon: DollarSign,
          href: "/dashboard/finance",
          active: pathname.startsWith("/dashboard/finance"),
        },
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
      ]
    }

    if (hasRole("crew") || hasRole("cashier")) {
      return [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "/dashboard",
          active: pathname === "/dashboard",
        },
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
      ]
    }

    // Default customer routes (shouldn't reach here but safety fallback)
    return [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        active: pathname === "/dashboard",
      },
    ]
  }

  const routes = getRoutesForRole()

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
