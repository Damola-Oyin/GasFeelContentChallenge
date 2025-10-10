export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'csr' | 'public'
  is_active: boolean
  auth_user_id: string | null
  created_at: string
  updated_at: string
}

export interface Contest {
  id: string
  name: string
  start_at: string
  end_at: string
  status: 'live' | 'verification' | 'final'
  last_published_at?: string
  freeze_public_display: boolean
  rules_url?: string
  created_at: string
  updated_at: string
}

export interface Contestant {
  id: string
  external_id: string // GF-XXXXXX format
  phone_whatsapp: string
  first_name: string
  department?: string
  student_email?: string
  current_points: number
  first_reached_current_points_at: string
  created_at: string
  updated_at: string
}

export interface AiSubmission {
  id: string
  contestant_ID: string // Actual DB column name (capital letters)
  delta: number
  server_received_at: string
  status: 'pending' | 'approved' | 'rejected' | 'ineligible_late'
  decided_by_user_id?: string
  decided_at?: string
  created_at: string
  updated_at: string
}

export interface PointTransaction {
  id: string
  contestant_id: string
  source: 'csr' | 'ai_submission_approval' | 'ai_submission_bulk_approval'
  source_ref_id?: string
  delta: number
  created_at: string
  applied_by_user_id: string
  previous_points: number
  new_points: number
}

// Legacy interface for backward compatibility (if needed)
export interface ScoreChange extends PointTransaction {}

// For leaderboard display
export interface LeaderboardEntry {
  rank: number
  external_id: string
  current_points: number
  first_reached_current_points_at: string
}

// For search results
export interface ContestantSearchResult {
  external_id: string
  rank: number
  current_points: number
  is_in_top_100: boolean
  neighbors?: LeaderboardEntry[]
}
