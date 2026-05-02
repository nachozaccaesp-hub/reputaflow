export interface Client {
  id: string
  name: string
  business_name: string
  whatsapp_number: string
  google_place_id: string
  google_access_token: string | null
  google_refresh_token: string | null
  tone_instructions: string
  plan: string
  active: boolean
  created_at: string
}

export interface Review {
  id: string
  client_id: string
  google_review_id: string
  author_name: string
  rating: number
  text: string | null
  published_at: string | null
  status: 'pending' | 'approved' | 'published' | 'ignored'
  created_at: string
}

export interface Response {
  id: string
  review_id: string
  draft: string | null
  final: string | null
  approved_at: string | null
  published_at: string | null
  twilio_message_sid: string | null
  created_at: string
}

export interface WeeklySummary {
  id: string
  client_id: string
  week_start: string
  reviews_received: number
  reviews_responded: number
  avg_rating: number | null
  sent_at: string | null
}
