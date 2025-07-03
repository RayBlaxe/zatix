export interface CarouselItem {
  id: number
  image: string
  title: string
  caption: string
  link_url: string | null
  link_target: "_self" | "_blank"
  order: string
  is_active: number
  created_at: string
  updated_at: string
  image_url: string
}

export interface CarouselResponse {
  success: boolean
  message: string
  data: CarouselItem[]
}