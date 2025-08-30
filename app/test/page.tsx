"use client"

import { EventStaffManagement } from "@/components/dashboard/event-staff-management";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestPage() {
  return (
    <div className="p-6 min-h-screen bg-background">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Event Staff Management Component Test</CardTitle>
          <CardDescription>
            Testing the new Event Staff Management component with mock data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page demonstrates the Event Staff Management component that allows 
            Event PICs and EO Owners to manage staff assignments for specific events.
          </p>
        </CardContent>
      </Card>
      
      <EventStaffManagement 
        eventId={1}
        eventTitle="Sample Event - Music Festival 2024"
        isEventPIC={true}
        isEOOwner={false}
      />
    </div>
  );
}