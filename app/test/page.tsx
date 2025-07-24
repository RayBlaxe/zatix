"use client"
import { Calendar } from "@/components/ui/calendar";

export default function TestPage() {
  return (
    <div className="p-20 bg-background text-foreground h-screen">
      <h1 className="text-2xl font-bold mb-4">Calendar Test Page</h1>
      <p className="mb-4">This is a minimal calendar with no extra props.</p>
      <Calendar />
    </div>
  );
}