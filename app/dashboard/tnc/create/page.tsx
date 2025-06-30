"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Save, Bold, Italic, List, Type, Quote, Eye, Edit } from "lucide-react"
import { tncApi, getToken } from "@/lib/api"
import { toast } from "sonner"

const formSchema = z.object({
  content: z.string().min(10, {
    message: "Content must be at least 10 characters long.",
  }),
  type: z.enum(["general", "event"], {
    required_error: "Please select a type.",
  }),
})

export default function CreateTNCPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      type: undefined,
    },
  })

  const insertFormatting = (startTag: string, endTag: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    const textToInsert = selectedText || placeholder
    const formattedText = `${startTag}${textToInsert}${endTag}`
    
    const newContent = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end)
    
    form.setValue("content", newContent)
    
    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + startTag.length + textToInsert.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const formatBold = () => insertFormatting("<strong>", "</strong>", "Bold text")
  const formatItalic = () => insertFormatting("<em>", "</em>", "Italic text")
  const formatParagraph = () => insertFormatting("<p>", "</p>", "Your paragraph text here")
  const formatHeading = () => insertFormatting("<h3>", "</h3>", "Heading text")
  const formatBulletList = () => {
    const listContent = `<ul>
    <li>First item</li>
    <li>Second item</li>
    <li>Third item</li>
</ul>`
    insertFormatting("", "", listContent)
  }
  const formatNumberedList = () => {
    const listContent = `<ol>
    <li>First item</li>
    <li>Second item</li>
    <li>Third item</li>
</ol>`
    insertFormatting("", "", listContent)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)

    try {
      const token = getToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      await tncApi.createTNC(token, values)
      
      toast.success("TNC created successfully!")
      router.push("/dashboard/tnc")
    } catch (err) {
      console.error("Failed to create TNC:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create TNC"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="px-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Create New TNC</h2>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Terms and Conditions Details</CardTitle>
          <CardDescription>
            Create a new terms and conditions document for your platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select TNC type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    
                    {/* Formatting Toolbar */}
                    <div className="border rounded-t-md p-2 bg-muted/50">
                      <div className="flex flex-wrap gap-1 items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={formatBold}
                          className="h-8 px-2"
                          title="Bold"
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={formatItalic}
                          className="h-8 px-2"
                          title="Italic"
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={formatHeading}
                          className="h-8 px-2"
                          title="Heading"
                        >
                          <Type className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={formatParagraph}
                          className="h-8 px-2"
                          title="Paragraph"
                        >
                          <Quote className="h-4 w-4" />
                        </Button>
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={formatBulletList}
                          className="h-8 px-2"
                          title="Bullet List"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={formatNumberedList}
                          className="h-8 px-2 text-xs font-mono"
                          title="Numbered List"
                        >
                          1.
                        </Button>
                        </div>
                        
                        {/* Preview Toggle */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPreview(!showPreview)}
                          className="h-8 px-2"
                        >
                          {showPreview ? (
                            <>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <FormControl>
                      {showPreview ? (
                        <div className="border rounded-b-md border-t-0 min-h-[400px] p-4 bg-background">
                          <div className="prose max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: field.value || "<p>No content to preview</p>" }} />
                          </div>
                        </div>
                      ) : (
                        <Textarea
                          ref={textareaRef}
                          placeholder="Enter the terms and conditions content here. Use the formatting buttons above to add HTML formatting."
                          className="min-h-[400px] resize-y rounded-t-none border-t-0"
                          {...field}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">
                      Use the formatting buttons above to add bold text, lists, headings, and paragraphs. You can also type HTML tags directly.
                    </p>
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create TNC
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}