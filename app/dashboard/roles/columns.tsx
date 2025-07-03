"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Mail, User, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Staff } from "./types"

export const columns: ColumnDef<Staff>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        Staff Name
      </div>
    ),
    cell: ({ row }) => {
      const staff = row.original
      return (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">
              {staff.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium">{staff.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4" />
        Email
      </div>
    ),
    cell: ({ row }) => {
      const email = row.getValue("email") as string
      return <span className="text-muted-foreground">{email}</span>
    },
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const staff = row.original
      const roles = staff.roles || []
      
      if (roles.length === 0) {
        return <span className="text-muted-foreground text-sm">No roles assigned</span>
      }

      return (
        <div className="flex flex-wrap gap-1">
          {roles.map((role) => (
            <Badge key={role.id} variant="secondary" className="capitalize">
              {role.name}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: "email_verified_at",
    header: "Status",
    cell: ({ row }) => {
      const verifiedAt = row.getValue("email_verified_at") as string | null
      return (
        <Badge variant={verifiedAt ? "default" : "destructive"}>
          {verifiedAt ? "Verified" : "Unverified"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Created
      </div>
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("created_at") as string
      return (
        <span className="text-muted-foreground text-sm">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const staff = row.original
      const { onEdit } = table.options.meta as any

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(staff)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Staff
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 