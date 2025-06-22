"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { tncApi, getToken } from "@/lib/api"
import { TNCEventResponse } from "@/types/terms"

interface TNCAcceptanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: () => void
}

export function TNCAcceptanceModal({ open, onOpenChange, onAccept }: TNCAcceptanceModalProps) {
  const [tncData, setTncData] = useState<TNCEventResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      loadTNCData()
    }
  }, [open])

  const loadTNCData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = getToken()
      if (!token) {
        throw new Error("No authentication token found")
      }
      
      const response = await tncApi.getTNCEvents(token)
      setTncData(response)
      setAccepted(response.data.already_accepted)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load terms and conditions")
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!accepted) return
    
    setAccepting(true)
    setError(null)
    
    try {
      const token = getToken()
      if (!token) {
        throw new Error("No authentication token found")
      }
      
      await tncApi.acceptTNCEvents(token)
      onAccept()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept terms and conditions")
    } finally {
      setAccepting(false)
    }
  }

  const getTNCContent = () => {
    if (!tncData?.data) return ""
    
    const firstTNC = Object.values(tncData.data).find(item => item.id !== undefined)
    return firstTNC?.content || ""
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
          <DialogDescription>
            Please read and accept the terms and conditions before creating an event.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading terms and conditions...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <>
            <ScrollArea className="flex-1 max-h-96 border rounded-md p-4">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: getTNCContent() }}
              />
            </ScrollArea>

            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id="accept-tnc"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
                disabled={tncData?.data.already_accepted}
              />
              <label 
                htmlFor="accept-tnc" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and accept the terms and conditions
              </label>
            </div>

            {tncData?.data.already_accepted && (
              <Alert>
                <AlertDescription>
                  You have already accepted these terms and conditions.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAccept} 
            disabled={!accepted || accepting || tncData?.data.already_accepted}
          >
            {accepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : tncData?.data.already_accepted ? (
              "Already Accepted"
            ) : (
              "Accept & Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}