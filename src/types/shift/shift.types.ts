export interface ShiftRow {
  id: string
  name: string
  start_time: string
  end_time: string
  check_in_start?: string
  check_in_end?: string
  check_out_start?: string
  check_out_end?: string
  late_tolerance_minutes: number
  is_trashed: boolean
}

export interface ShiftListResponse {
  total: number
  rows: ShiftRow[]
}

export interface CreateShiftPayload {
  name: string
  start_time: string
  end_time: string
  check_in_start?: string
  check_in_end?: string
  check_out_start?: string
  check_out_end?: string
  late_tolerance_minutes: number
}

export type UpdateShifthPayload = CreateShiftPayload

export interface CreateShiftResponse {
  success: boolean
  message: string
  data: ShiftRow
}

export type UpdateShiftResponse = CreateShiftResponse

export type BulkActionValue = "restore" | "delete" | "delete_permanent"

export interface ShiftFilterState {
  showAll: boolean
  showDeleted: boolean
}
