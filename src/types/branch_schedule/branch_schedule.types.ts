// src/types/branch_schedule/branch_schedule.types.ts

// ==================================================
// COMMON
// ==================================================

export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

// ==================================================
// DAY — LIST RESPONSE
// ==================================================

export interface BranchScheduleDay {
  weekday: Weekday
  weekday_alias: string
  is_working_day: boolean

  start_time: string | null
  end_time: string | null

  check_in_start: string | null
  check_in_end: string | null

  check_out_start: string | null
  check_out_end: string | null

  late_tolerance_minutes: number
}

// ==================================================
// SCHEDULE — LIST RESPONSE
// ==================================================

export interface BranchSchedule {
  id: string
  name: string
  branch_name: string

  effective_from: string
  effective_until: string | null

  is_trashed: boolean

  days: BranchScheduleDay[]
}

// ==================================================
// LIST RESPONSE
// ==================================================

export interface BranchScheduleResponse {
  total: number
  rows: BranchSchedule[]
}

// ==================================================
// DAY — CREATE / UPDATE PAYLOAD
// ==================================================

export interface BranchScheduleDayPayload {
  weekday: Weekday
  is_working_day: boolean

  start_time: string | null
  end_time: string | null

  check_in_start: string | null
  check_in_end: string | null

  check_out_start: string | null
  check_out_end: string | null

  late_tolerance_minutes: number
}

// ==================================================
// CREATE / UPDATE PAYLOAD
// ==================================================

export interface BranchSchedulePayload {
  branch_id: string
  name: string

  effective_from: string
  effective_until: string | null

  days: BranchScheduleDayPayload[]
}

// ==================================================
// DAY — CREATE / UPDATE RESPONSE
// ==================================================

export interface BranchScheduleDayResponse {
  id: string
  branch_schedule_id: string

  weekday: Weekday
  is_working_day: 0 | 1

  start_time: string | null
  end_time: string | null

  check_in_start: string | null
  check_in_end: string | null

  check_out_start: string | null
  check_out_end: string | null

  late_tolerance_minutes: number
}

// ==================================================
// CREATE / UPDATE RESPONSE DATA
// ==================================================

export interface BranchScheduleMutationData {
  id: string
  name: string
  branch_id: string

  effective_from: string
  effective_until: string | null

  days: BranchScheduleDayResponse[]
}

// ==================================================
// CREATE / UPDATE RESPONSE
// ==================================================

export interface BranchScheduleMutationResponse {
  success: boolean
  message: string
  data: BranchScheduleMutationData
}
