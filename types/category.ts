// Event Category Filtering System Types
export interface EventCategory {
  id: number
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  parent_id?: number
  is_active: boolean
  event_count?: number
  created_at: string
  updated_at: string
}

export interface CategoryHierarchy extends EventCategory {
  children?: CategoryHierarchy[]
  parent?: EventCategory
}

export interface CategoryFilters {
  categories?: number[]
  search?: string
  location?: string
  date_from?: string
  date_to?: string
  price_min?: number
  price_max?: number
  sort_by?: 'name' | 'date' | 'price' | 'popularity'
  sort_order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

export interface CategoryEventResponse {
  success: boolean
  data: {
    events: Event[]
    categories: EventCategory[]
    filters: CategoryFilters
    meta: {
      total: number
      per_page: number
      current_page: number
      last_page: number
      from: number
      to: number
    }
  }
  message: string
}

export interface CategoryCreateRequest {
  name: string
  slug?: string
  description?: string
  icon?: string
  color?: string
  parent_id?: number
  is_active?: boolean
}

export interface CategoryUpdateRequest extends Partial<CategoryCreateRequest> {
  id: number
}

export interface CategoryStatsResponse {
  success: boolean
  data: {
    total_categories: number
    active_categories: number
    total_events: number
    popular_categories: Array<{
      category: EventCategory
      event_count: number
      recent_events: number
    }>
    category_distribution: Array<{
      category_name: string
      event_count: number
      percentage: number
    }>
  }
  message: string
}

export interface UserCategoryPreferences {
  user_id: number
  preferred_categories: number[]
  blocked_categories: number[]
  updated_at: string
}

export interface CategoryRecommendationRequest {
  user_id?: number
  location?: string
  interests?: string[]
  limit?: number
}

export interface CategoryRecommendationResponse {
  success: boolean
  data: {
    recommended_events: Event[]
    recommended_categories: EventCategory[]
    recommendation_reasons: Array<{
      event_id: number
      reasons: string[]
      confidence_score: number
    }>
  }
  message: string
}
