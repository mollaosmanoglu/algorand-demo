export type CallSummary = {
  id: string
  caller_name: string | null
  contact_number: string | null
  created_at: string | null // ISO datetime string
  case_qualified: boolean
  case_priority: number
  duration_seconds: number
  summary: string
  accident_type: string | null
}

export type Call = {
  id: string
  room_name: string
  room_sid: string
  created_at: string | null // ISO datetime string
  finished_at: string // ISO datetime string
  duration_seconds: number
  caller_name: string | null
  contact_number: string | null
  case_qualified: boolean
  case_priority: number
  qualification_reasoning: string
  summary: string
  lawyer_email: string
  lawyer_name: string
  recording_url: string | null
  appointment_date: string | null // ISO datetime
  appointment_url: string | null
  accident_type: string | null // "verkeersongeval" | "arbeidsongeval" | "medische fout" | "overig"
  transcript: any | null // Full conversation history from LiveKit session.history.to_dict()
}

export type CallsResponse = {
  calls: CallSummary[]
  count: number
  skip: number
  limit: number
}

export type StatsResponse = {
  period_days: number
  total_calls: number
  total_calls_today: number
  qualified_calls: number
  qualification_rate: number
  average_duration_seconds: number
  average_duration_minutes: number
}
