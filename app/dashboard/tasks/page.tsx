"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Users,
  DollarSign,
  ShoppingCart
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface Task {
  id: number
  title: string
  description: string
  event_name: string
  event_id: number
  due_date: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  type: 'crew' | 'finance' | 'cashier'
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      // Mock data for now - replace with actual API call
      const mockTasks: Task[] = [
        {
          id: 1,
          title: "Setup event registration booth",
          description: "Prepare and setup registration booth for Workshop Fotografi event",
          event_name: "Workshop Fotografi: Teknik Dasar",
          event_id: 1,
          due_date: "2025-08-20T08:00:00",
          status: "pending",
          priority: "high",
          type: "crew"
        },
        {
          id: 2,
          title: "Process event payments",
          description: "Review and process all pending ticket payments",
          event_name: "Konser Amal Kemerdekaan 2025",
          event_id: 2,
          due_date: "2025-09-05T16:00:00",
          status: "in_progress",
          priority: "medium",
          type: "finance"
        }
      ]
      
      // Filter tasks based on user role
      const filteredTasks = user?.currentRole === "crew" 
        ? mockTasks.filter(task => task.type === "crew")
        : user?.currentRole === "finance"
        ? mockTasks.filter(task => task.type === "finance")
        : user?.currentRole === "cashier"
        ? mockTasks.filter(task => task.type === "cashier")
        : mockTasks
      
      setTasks(filteredTasks)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "crew":
        return <Users className="h-4 w-4" />
      case "finance":
        return <DollarSign className="h-4 w-4" />
      case "cashier":
        return <ShoppingCart className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getRoleTitle = () => {
    switch (user?.currentRole) {
      case "crew":
        return "Crew Tasks"
      case "finance":
        return "Finance Tasks"
      case "cashier":
        return "Cashier Tasks"
      default:
        return "My Tasks"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{getRoleTitle()}</h1>
        <p className="text-muted-foreground">
          Your assigned tasks and responsibilities
        </p>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No tasks assigned</h3>
            <p className="text-muted-foreground">
              You don't have any tasks assigned at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTaskIcon(task.type)}
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{task.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Event: {task.event_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Due: {new Date(task.due_date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  {task.status !== 'completed' && (
                    <Button size="sm">
                      Mark Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
