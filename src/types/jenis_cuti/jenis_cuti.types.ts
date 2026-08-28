export type KategoriCuti = "cuti" | "izin"
export type UnitCuti = "day" | "hour"

export interface JenisCutiRow {
  id: string
  name: string
  code: string
  category: KategoriCuti
  unit: UnitCuti
  is_paid: boolean
  deduct_quota: boolean
  requires_attachment: boolean
  max_days_per_year: number | null
  min_days_notice: number | null
  is_trashed: boolean
}

export interface JenisCutiListResponse {
  total: number
  rows: JenisCutiRow[]
}

export interface JenisCutiAllResponse {
  success: boolean
  message: string
  data: JenisCutiRow[]
}

export interface CreateJenisCutiPayload {
  name: string
  code: string
  category: KategoriCuti
  unit: UnitCuti
  is_paid: boolean
  deduct_quota: boolean
  requires_attachment: boolean
  max_days_per_year: number | null
  min_days_notice: number | null
}

export type UpdateJenisCutiPayload = CreateJenisCutiPayload

export interface JenisCutiMutationResponse {
  success: boolean
  message: string
  data?: JenisCutiRow
}

export interface LevelApprovalFilterState {
  departmentId: string
  leaveTypeId: string
}

export const DEFAULT_LEVEL_APPROVAL_FILTER: LevelApprovalFilterState = {
  departmentId: "all",
  leaveTypeId: "all",
}
