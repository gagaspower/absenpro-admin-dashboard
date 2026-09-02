export interface HolidayRow {
  id: string
  name: string
  start_date: string
  end_date: string
  description: string | null
  is_recurring: boolean
  is_trashed: boolean
}

export interface HolidayListResponse {
  total: number
  rows: HolidayRow[]
}

export interface CreateHolidayPayload {
  name: string
  start_date: string
  end_date: string
  description?: string
  is_recurring?: boolean
}

export type UpdateHolidayPayload = CreateHolidayPayload

export interface HolidayMutationResponse {
  success: boolean
  message: string
  data?: {
    id: string
    name: string
    start_date: string
    end_date: string
    is_recurring: boolean
    description: string | null
  }
}
