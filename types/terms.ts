export type TermsAndConditions = {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export type TNCItem = {
  id: number
  content: string
  type: "event" | "general"
  created_at: string | null
  updated_at: string | null
}

export type TNCListResponse = TNCItem[]

export type TNCEventResponse = {
  success: boolean
  message: string
  data: {
    [key: string]: TNCItem | boolean
    already_accepted: boolean
  }
}

export type TNCAcceptResponse = {
  success: boolean
  message: string
  data: any[]
}