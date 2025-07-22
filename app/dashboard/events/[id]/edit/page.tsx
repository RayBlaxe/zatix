"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  CalendarIcon, 
  Loader2, 
  Plus, 
  Trash2, 
  Upload,
  Clock,
  MapPin,
  Users,
  DollarSign,
  AlertCircle,
  ArrowLeft,
  Save
} from "lucide-react"
import { cn } from "@/lib/utils"
import { eventApi, facilityApi, tncApi, getToken } from "@/lib/api"
import { Event, EventFormData, Facility } from "@/types/events"
import { TNCItem } from "@/types/terms"
import { toast } from "@/components/ui/use-toast"

// Form validation schema
const eventFormSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  start_date: z.date({ required_error: "Start date is required" }),
  start_time: z.string().min(1, "Start time is required"),
  end_date: z.date({ required_error: "End date is required" }),
  end_time: z.string().min(1, "End time is required"),
  location: z.string().min(5, "Location must be at least 5 characters"),
  contact_phone: z.string().min(10, "Contact phone must be at least 10 characters"),
  tnc_id: z.number().min(1, "Please select terms and conditions"),
  facilities: z.array(z.number()).min(1, "Please select at least one facility"),
  tickets: z.array(z.object({
    name: z.string().min(1, "Ticket name is required"),
    price: z.number().min(0, "Price must be non-negative"),
    stock: z.number().min(1, "Stock must be at least 1"),
    limit: z.number().min(1, "Limit must be at least 1"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    ticket_type_id: z.number().min(1, "Ticket type is required")
  })).min(1, "At least one ticket type is required"),
  poster: z.instanceof(File).optional()
})

type EventFormValues = z.infer<typeof eventFormSchema>

export default function EventEditPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = parseInt(params.id as string)

  const [event, setEvent] = useState<Event | null>(null)
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [tncItems, setTncItems] = useState<TNCItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      description: "",
      start_date: new Date(),
      start_time: "",
      end_date: new Date(),
      end_time: "",
      location: "",
      contact_phone: "",
      tnc_id: 0,
      facilities: [],
      tickets: [
        {
          name: "Regular Ticket",
          price: 0,
          stock: 100,
          limit: 5,
          start_date: format(new Date(), "yyyy-MM-dd"),
          end_date: format(new Date(), "yyyy-MM-dd"),
          ticket_type_id: 1
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tickets"
  })

  useEffect(() => {
    if (eventId) {
      Promise.all([
        fetchEventDetail(),
        fetchFacilities(),
        fetchTNCItems()
      ])
    }
  }, [eventId])

  const fetchEventDetail = async () => {
    try {
      console.log("Fetching event detail for ID:", eventId)
      const response = await eventApi.getMyEvent(eventId)
      console.log("API Response:", response)
      
      if (response.success) {
        const eventData = response.data
        setEvent(eventData)
        
        // Business rule: only draft events can be edited
        if (eventData.status !== 'draft') {
          setError("Only draft events can be edited. This event cannot be modified.")
          return
        }
        
        // Populate form with existing event data
        form.reset({
          name: eventData.name,
          description: eventData.description,
          start_date: new Date(eventData.start_date),
          start_time: eventData.start_time,
          end_date: new Date(eventData.end_date),
          end_time: eventData.end_time,
          location: eventData.location,
          contact_phone: eventData.contact_phone,
          tnc_id: eventData.tnc_id,
          facilities: eventData.facilities?.map(f => f.id) || [],
          tickets: eventData.tickets?.map(ticket => ({
            name: ticket.name,
            price: parseFloat(ticket.price),
            stock: ticket.stock,
            limit: ticket.limit,
            start_date: ticket.start_date,
            end_date: ticket.end_date,
            ticket_type_id: ticket.ticket_type_id
          })) || []
        })
      } else {
        const errorMessage = response.message || "Failed to fetch event details"
        console.error("API Error:", errorMessage)
        setError(errorMessage)
      }
    } catch (err: any) {
      const errorMessage = err?.response?.status === 401 
        ? "Session expired. Please login again." 
        : "An error occurred while fetching event details"
      setError(errorMessage)
      console.error("Error fetching event details:", err)
    }
  }

  const fetchFacilities = async () => {
    try {
      const response = await facilityApi.getFacilities()
      if (response.success) {
        setFacilities(response.data)
      }
    } catch (err) {
      console.error("Error fetching facilities:", err)
    }
  }

  const fetchTNCItems = async () => {
    try {
      const token = getToken()
      if (token) {
        const response = await tncApi.getTNCEvents(token)
        if (response.success) {
          setTncItems([response.data.tnc])
        }
      }
    } catch (err) {
      console.error("Error fetching TNC items:", err)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: EventFormValues) => {
    try {
      setSaving(true)
      setError(null)

      const eventData = {
        name: data.name,
        description: data.description,
        start_date: format(data.start_date, "yyyy-MM-dd"),
        start_time: data.start_time,
        end_date: format(data.end_date, "yyyy-MM-dd"),
        end_time: data.end_time,
        location: data.location,
        contact_phone: data.contact_phone,
        tnc_id: data.tnc_id,
        facilities: data.facilities,
        tickets: data.tickets,
        poster: data.poster
      }

      const response = await eventApi.updateEvent(eventId, eventData)

      if (response.success) {
        toast({
          title: "Success",
          description: "Event updated successfully"
        })
        router.push(`/dashboard/events/${eventId}`)
      } else {
        setError(response.message || "Failed to update event")
      }
    } catch (err) {
      setError("An error occurred while updating the event")
      console.error("Error updating event:", err)
    } finally {
      setSaving(false)
    }
  }

  const addTicket = () => {
    append({
      name: "New Ticket",
      price: 0,
      stock: 100,
      limit: 5,
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: format(new Date(), "yyyy-MM-dd"),
      ticket_type_id: 1
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Event</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Event not found or you don't have permission to edit it."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Event</h1>
            <p className="text-muted-foreground">Update your event details</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the basic details of your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your event" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Location *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Event location or venue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="Contact phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Date and Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date & Time
              </CardTitle>
              <CardDescription>
                Set the event schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Start Time *
                      </FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        End Time *
                      </FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Facilities */}
          <Card>
            <CardHeader>
              <CardTitle>Facilities</CardTitle>
              <CardDescription>
                Select the facilities available at your event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="facilities"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {facilities.map((facility) => (
                        <FormField
                          key={facility.id}
                          control={form.control}
                          name="facilities"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={facility.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(facility.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, facility.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== facility.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal flex items-center gap-2">
                                  <i className={facility.icon} aria-hidden="true"></i>
                                  {facility.name}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Ticket Types
              </CardTitle>
              <CardDescription>
                Configure different ticket types for your event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Ticket Type {index + 1}</h3>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`tickets.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ticket Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Regular, VIP, Early Bird" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`tickets.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            Price (IDR) *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`tickets.${index}.stock`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available Stock *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="100" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`tickets.${index}.limit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limit per Person *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`tickets.${index}.start_date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sales Start Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`tickets.${index}.end_date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sales End Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addTicket}>
                <Plus className="h-4 w-4 mr-2" />
                Add Another Ticket Type
              </Button>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Terms and Conditions</CardTitle>
              <CardDescription>
                Select the terms and conditions for your event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="tnc_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Terms and Conditions *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose terms and conditions" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tncItems.map((tnc) => (
                          <SelectItem key={tnc.id} value={tnc.id.toString()}>
                            {tnc.type === "event" ? "Event Terms" : "General Terms"} (ID: {tnc.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Event Poster */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Event Poster
              </CardTitle>
              <CardDescription>
                Upload a poster for your event (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="poster"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Poster Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          onChange(file)
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" disabled={saving} className="flex items-center gap-2">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating Event...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Event
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}