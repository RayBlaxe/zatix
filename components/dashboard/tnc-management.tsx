"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, FileText, Edit, Trash2 } from "lucide-react"
import { tncApi, getToken } from "@/lib/api"
import { TNCItem } from "@/types/terms"

export function TNCManagement() {
  const router = useRouter()
  const [tncItems, setTncItems] = useState<TNCItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTNCItems()
  }, [])

  const loadTNCItems = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = getToken()
      if (!token) {
        throw new Error("No authentication token found")
      }
      
      const response = await tncApi.getTNCList(token)
      setTncItems(Array.isArray(response) ? response : [])
    } catch (err) {
      console.error("Failed to load TNC items:", err)
      setError(err instanceof Error ? err.message : "Failed to load TNC items")
      setTncItems([]) // Set empty array to prevent crashes
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const truncateContent = (content: string, maxLength: number = 200) => {
    const textContent = content.replace(/<[^>]*>/g, "")
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + "..." 
      : textContent
  }

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Terms and Conditions</h2>
          <Button disabled>
            <FileText className="mr-2 h-4 w-4" />
            Create New TNC
          </Button>
        </div>
        <Card>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading TNC items...</span>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Terms and Conditions</h2>
          <Button onClick={() => router.push("/dashboard/tnc/create")}>
            <FileText className="mr-2 h-4 w-4" />
            Create New TNC
          </Button>
        </div>
        <Card>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={loadTNCItems} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Terms and Conditions</h2>
        <Button onClick={() => router.push("/dashboard/tnc/create")}>
          <FileText className="mr-2 h-4 w-4" />
          Create New TNC
        </Button>
      </div>
      <Card>
      <CardContent>
        {tncItems.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No TNC items found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating your first terms and conditions.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-6" >
            {tncItems.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">TNC #{item.id}</h3>
                          <Badge variant={item.type === "event" ? "default" : "secondary"}>
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created: {formatDate(item.created_at)} | Updated: {formatDate(item.updated_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <div className="text-sm text-muted-foreground">
                      <div dangerouslySetInnerHTML={{ 
                        __html: truncateContent(item.content, 300) 
                      }} />
                    </div>
                  </ScrollArea>
                  <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                    View Full Content
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      </Card>
    </>
  )
}