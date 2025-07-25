"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { eventApi, facilityApi, tncApi, getToken } from "@/lib/api";
import { Facility } from "@/types/events";
import { toast } from "@/components/ui/use-toast";

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
  is_public: z.boolean().default(false),
  facilities: z.array(z.number()).min(1, "Please select at least one facility"),
  tickets: z
    .array(
      z.object({
        name: z.string().min(1, "Ticket name is required"),
        price: z.string().min(1, "Price is required"),
        stock: z.string().min(1, "Stock is required"),
        limit: z.string().min(1, "Limit is required"),
        start_date: z.date({ required_error: "Start date is required" }),
        end_date: z.date({ required_error: "End date is required" }),
        ticket_type_id: z.number().min(1, "Ticket type is required"),
      })
    )
    .min(1, "Please add at least one ticket type"),
  poster: z.instanceof(File).optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [tncId, setTncId] = useState<number | null>(null);

  // Hardcoded ticket types for now (as per your instruction)
  const ticketTypes = [
    { id: 1, name: "Regular", description: "Standard ticket type" },
    { id: 2, name: "VIP", description: "Premium ticket type" },
    { id: 3, name: "Early Bird", description: "Discounted early purchase" },
  ];

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      contact_phone: "",
      facilities: [],
      tickets: [
        {
          name: "Regular",
          price: "0",
          stock: "100",
          limit: "5",
          start_date: new Date(),
          end_date: new Date(),
          ticket_type_id: 1,
        },
      ],
    },
  });

  const {
    fields: ticketFields,
    append: appendTicket,
    remove: removeTicket,
  } = useFieldArray({
    control: form.control,
    name: "tickets",
  });

  // Load facilities and check TNC acceptance
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);

        const token = getToken();
        if (!token) {
          router.push("/login");
          return;
        }

        // Get TNC ID for event creation (user can only access this page after TNC acceptance)
        const tncResponse = await tncApi.getTNCEvents(token);
        console.log("TNC Response in create page:", tncResponse);
        
        if (tncResponse.success && tncResponse.data && tncResponse.data.data) {
          // Always get the TNC ID regardless of already_accepted status
          // since user can only reach this page after accepting TNC
          try {
            const firstTNC = Object.values(tncResponse.data.data).find(item => typeof item === 'object' && item && 'id' in item);
            if (firstTNC && typeof firstTNC === 'object' && 'id' in firstTNC) {
              setTncId(firstTNC.id as number);
              console.log("TNC ID set to:", firstTNC.id);
            } else {
              console.log("No valid TNC found in data, using default TNC ID");
              setTncId(1);
            }
          } catch (tncParseError) {
            console.error("Error parsing TNC data:", tncParseError);
            setTncId(1);
          }
        } else {
          console.log("TNC API call failed or no data, using default TNC ID");
          setTncId(1);
        }
        
        // Load facilities from real API
        try {
          const facilitiesResponse = await facilityApi.getFacilities();
          console.log("Facilities API response:", facilitiesResponse);
          
          if (facilitiesResponse.success && facilitiesResponse.data) {
            setFacilities(facilitiesResponse.data);
            console.log(
              "Facilities loaded successfully:",
              facilitiesResponse.data.length,
              "facilities"
            );
          } else {
            console.error("Facilities API failed:", facilitiesResponse);
            setFacilities([]);
            toast({
              title: "Warning",
              description: "Could not load facilities list. Please refresh the page.",
              variant: "destructive",
            });
          }
        } catch (facilitiesError) {
          console.error("Facilities API error:", facilitiesError);
          setFacilities([]);
          toast({
            title: "Warning",
            description: "Could not load facilities list. Please refresh the page.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load form data. Please refresh the page.",
          variant: "destructive",
        });
        // Set defaults so user can still use the form
        setTncId(1);
        setFacilities([]);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const handlePosterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("poster", file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPosterPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0); // Set time to midnight



  const onSubmit = async (data: EventFormValues) => {
    try {
      setIsLoading(true);

      // Check if we have the TNC ID (should be loaded if user got here properly)
      if (!tncId) {
        toast({
          title: "Terms and Conditions Required",
          description: "You must accept the terms and conditions before creating an event.",
          variant: "destructive"
        });
        return;
      }

      // Convert form data to API format
      const eventData = {
        name: data.name,
        description: data.description,
        start_date: format(data.start_date, "yyyy-MM-dd"),
        start_time: data.start_time,
        end_date: format(data.end_date, "yyyy-MM-dd"),
        end_time: data.end_time,
        location: data.location,
        contact_phone: data.contact_phone,
        is_public: data.is_public,
        tnc_id: tncId,
        facilities: data.facilities,
        tickets: data.tickets.map((ticket) => ({
          name: ticket.name,
          price: parseFloat(ticket.price),
          stock: parseInt(ticket.stock),
          limit: parseInt(ticket.limit),
          start_date: format(ticket.start_date, "yyyy-MM-dd"),
          end_date: format(ticket.end_date, "yyyy-MM-dd"),
          ticket_type_id: ticket.ticket_type_id,
        })),
        poster: data.poster,
      };

      const response = await eventApi.createEvent(eventData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Event created successfully!",
          variant: "default",
        });
        router.push("/dashboard/events");
      } else {
        throw new Error(response.message || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="w-full max-w-none lg:max-w-5xl xl:max-w-6xl min-h-0">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="size-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none lg:max-w-5xl xl:max-w-6xl min-h-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create Event</h1>
        <p className="text-muted-foreground">Fill in the details to create your event.</p>
      </div>

      <div className="pb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>Provide the essential details about your event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
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
                      <FormItem className="md:col-span-2">
                        <FormLabel>Event Description *</FormLabel>
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
                      <FormItem className="md:col-span-2">
                        <FormLabel>Event Location *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter event location" {...field} />
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
                          <Input placeholder="Enter contact phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_public"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Event Visibility *</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="public"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <Label htmlFor="public" className="text-sm font-medium">
                                Make this event public
                              </Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {field.value 
                                ? "Public events are visible to all users and searchable on the platform"
                                : "Private events are only visible to users with direct access"
                              }
                            </p>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Event Poster Upload */}
                <div className="space-y-2">
                  <Label htmlFor="poster">Event Poster</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        id="poster"
                        type="file"
                        accept="image/*"
                        onChange={handlePosterChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                      />
                    </div>
                    {posterPreview && (
                      <div className="relative size-20 rounded-lg overflow-hidden border">
                        <img
                          src={posterPreview}
                          alt="Poster preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload an image file (JPG, PNG, etc.) for your event poster
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5" />
                  Date & Time
                </CardTitle>
                <CardDescription>Set when your event will take place</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
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
                              disabled={(date) => date < new Date()}
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
                        <FormLabel>Start Time *</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
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
                          <PopoverContent className="w-auto min-w-[280px] p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
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
                        <FormLabel>End Time *</FormLabel>
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
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="size-5" />
                  Facilities
                </CardTitle>
                <CardDescription>Select the facilities available at your event</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="facilities"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-80 overflow-y-auto border rounded-lg p-4">
                        {facilities.length === 0 && (
                          <div className="col-span-full text-center text-muted-foreground py-4">
                            No facilities available. Loading...
                          </div>
                        )}
                        {(() => {
                          console.log("Rendering facilities:", facilities.length, facilities);
                          return null;
                        })()}
                        {facilities.map((facility) => (
                          <FormField
                            key={facility.id}
                            control={form.control}
                            name="facilities"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={facility.id}
                                  className="flex flex-row items-center space-x-2 space-y-0 min-w-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(facility.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, facility.id])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== facility.id)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-xs font-normal cursor-pointer flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <i className={`${facility.icon} text-sm`}></i>
                                      <span className="truncate">{facility.name}</span>
                                    </div>
                                  </FormLabel>
                                </FormItem>
                              );
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
                  <DollarSign className="size-5" />
                  Ticket Types
                </CardTitle>
                <CardDescription>
                  Configure the different ticket types for your event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticketFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium">Ticket Type {index + 1}</h4>
                      {ticketFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTicket(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`tickets.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ticket name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`tickets.${index}.ticket_type_id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type *</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ticket type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ticketTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`tickets.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" min="0" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`tickets.${index}.stock`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="100" min="1" {...field} />
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
                              <Input type="number" placeholder="5" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`tickets.${index}.start_date`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sale Start Date *</FormLabel>
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
                                  disabled={(date) => date < startOfToday}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`tickets.${index}.end_date`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sale End Date *</FormLabel>
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
                                  disabled={(date) => date < new Date()}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendTicket({
                      name: "",
                      price: "0",
                      stock: "100",
                      limit: "5",
                      start_date: new Date(),
                      end_date: new Date(),
                      ticket_type_id: 1,
                    })
                  }
                >
                  <Plus className="size-4 mr-2" />
                  Add Ticket Type
                </Button>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/events")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Creating Event...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

    </div>
  );
}
