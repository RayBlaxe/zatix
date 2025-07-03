"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { columns as staffColumns } from "./columns"
import { StaffDialog } from "./staff-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Staff, StaffResponse, StaffCreateRequest, StaffUpdateRequest } from "./types"
import { staffApi } from "@/lib/api"

export default function StaffPage() {
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | undefined>()
  const [staff, setStaff] = useState<Staff[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalStaff, setTotalStaff] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (page = 1) => {
    try {
      setIsLoading(true)
      const response = await staffApi.getStaff(page) as StaffResponse
      
      if (response.success && response.data) {
        setStaff(response.data.data || [])
        setCurrentPage(response.data.current_page || 1)
        setTotalPages(response.data.last_page || 1)
        setTotalStaff(response.data.total || 0)
      } else {
        // Fallback for mock data that might not have the full structure
        const staffData = Array.isArray(response) ? response : []
        setStaff(staffData)
      }
    } catch (error) {
      console.error("Failed to load staff data:", error)
      toast({
        title: "Error",
        description: "Failed to load staff data. Please try again.",
        variant: "destructive",
      })
      setStaff([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    loadData(page)
  }

  const handleCreateStaff = async (data: StaffCreateRequest | StaffUpdateRequest) => {
    try {
      const response = await staffApi.createStaff(data as StaffCreateRequest)
      await loadData(currentPage) // Reload current page to show updated data
      toast({
        title: "Staff created",
        description: "The staff member has been created successfully.",
      })
      setIsStaffDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create staff member. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditStaff = async (data: StaffCreateRequest | StaffUpdateRequest) => {
    if (!selectedStaff) return

    try {
      const response = await staffApi.updateStaff(selectedStaff.id.toString(), data as StaffUpdateRequest)
      await loadData(currentPage) // Reload current page to show updated data
      toast({
        title: "Staff updated",
        description: "The staff member has been updated successfully.",
      })
      setIsStaffDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update staff member. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
        <p className="text-muted-foreground">Manage staff members and their roles for your organization.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Members
            {totalStaff > 0 && (
              <span className="text-sm text-muted-foreground">({totalStaff} total)</span>
            )}
          </CardTitle>
          <Button onClick={() => {
            setSelectedStaff(undefined)
            setIsStaffDialogOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Staff Member
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={staffColumns}
            data={staff}
            onEdit={(staffMember) => {
              setSelectedStaff(staffMember)
              setIsStaffDialogOpen(true)
            }}
          />
          
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <StaffDialog
        open={isStaffDialogOpen}
        onOpenChange={setIsStaffDialogOpen}
        staff={selectedStaff}
        onSubmit={selectedStaff ? handleEditStaff : handleCreateStaff}
      />
    </div>
  )
}
