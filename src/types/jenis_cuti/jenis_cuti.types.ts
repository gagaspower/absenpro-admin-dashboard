export interface JenisCutiRow {
  id: string
  name: string
  code: string
  category: string
  unit: string
  is_paid: boolean
  deduct_quota: boolean
  requires_attachment: boolean
  max_days_per_year: number
  min_days_notice: number
  is_trashed: boolean
}

export interface JenisCutiListResponse {
  total: number
  rows: JenisCutiRow[]
}

export interface CreateJenisCutiPayload {
  name: string
  code: string
  category: string
  unit: string
  is_paid: boolean
  deduct_quota: boolean
  requires_attachment: boolean
  max_days_per_year: number
  min_days_notice: number
}

export type UpdateJenisCutiPayload = CreateJenisCutiPayload

export interface JenisCutiMutationResponse {
  success: boolean
  message: string
  data?: {
    id: string
    name: string
    code: string
    category: string
    unit: string
    is_paid: boolean
    deduct_quota: boolean
    requires_attachment: boolean
    max_days_per_year: number
    min_days_notice: number
    is_trashed: boolean
  }
}
